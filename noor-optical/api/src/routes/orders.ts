import { Router } from 'express';
import { query, queryOne, withTransaction } from '../db.js';
import { readSettings } from './content.js';
import {
  asyncRoute,
  badRequest,
  forbidden,
  notFoundError,
  optionalString,
  requiredEmail,
  requiredPhone,
  requiredString,
} from '../http.js';
import { requireAuth } from '../auth.js';

export const ordersRouter = Router();

type OrderRow = Record<string, unknown>;

const PRESCRIPTION_STATUSES = ['uploaded', 'later', 'not_required'] as const;
const DELIVERY_METHODS = ['delivery', 'pickup'] as const;

const mapOrderItem = (row: Record<string, unknown>) => ({
  id: Number(row.id),
  productId: row.product_id === null ? null : Number(row.product_id),
  variantId: row.variant_id === null ? null : Number(row.variant_id),
  slug: (row.slug as string | null) ?? null,
  nameEn: String(row.name_en),
  nameFa: String(row.name_fa),
  brandName: (row.brand_name as string | null) ?? null,
  colorNameEn: (row.color_name_en as string | null) ?? null,
  colorNameFa: (row.color_name_fa as string | null) ?? null,
  imageUrl: (row.image_url as string | null) ?? null,
  sku: (row.sku as string | null) ?? null,
  unitPrice: Number(row.unit_price),
  quantity: Number(row.quantity),
  lineTotal: Number(row.line_total),
});

export const mapOrder = (row: OrderRow, items: Record<string, unknown>[] = []) => ({
  orderNumber: String(row.order_number),
  status: String(row.status),
  prescriptionStatus: String(row.prescription_status),
  deliveryMethod: String(row.delivery_method),
  subtotal: Number(row.subtotal),
  shipping: Number(row.shipping),
  total: Number(row.total),
  currency: String(row.currency),
  note: (row.note as string | null) ?? null,
  customerName: String(row.full_name),
  customerEmail: String(row.email),
  customerPhone: String(row.phone),
  address: (row.address as string | null) ?? null,
  city: (row.city as string | null) ?? null,
  postalCode: (row.postal_code as string | null) ?? null,
  createdAt: new Date(String(row.created_at)).toISOString(),
  items: items.map(mapOrderItem),
});

const loadOrderItems = async (orderIds: number[]) => {
  if (!orderIds.length) return new Map<number, Record<string, unknown>[]>();
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id`,
    [orderIds],
  );
  const map = new Map<number, Record<string, unknown>[]>();
  for (const row of rows) {
    const orderId = Number(row.order_id);
    const list = map.get(orderId) ?? [];
    list.push(row);
    map.set(orderId, list);
  }
  return map;
};

const generateOrderNumber = (): string => {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `NO-${stamp}-${random}`;
};

type IncomingItem = { productId?: unknown; variantId?: unknown; quantity?: unknown };

/**
 * Checkout. Prices, availability and totals are always taken from the database —
 * the browser only sends what it wants to buy.
 */
ordersRouter.post(
  '/orders',
  asyncRoute(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
    if (!rawItems.length) throw badRequest('Your bag is empty');

    const fullName = requiredString(body.fullName, 'fullName', { max: 160 });
    const email = requiredEmail(body.email);
    const phone = requiredPhone(body.phone);
    const address = optionalString(body.address, 'address', 400);
    const city = optionalString(body.city, 'city', 120);
    const postalCode = optionalString(body.postalCode, 'postalCode', 24);
    const note = optionalString(body.note, 'note', 1000);

    const prescriptionStatus = PRESCRIPTION_STATUSES.includes(body.prescriptionStatus as never)
      ? (body.prescriptionStatus as (typeof PRESCRIPTION_STATUSES)[number])
      : 'later';
    const deliveryMethod = DELIVERY_METHODS.includes(body.deliveryMethod as never)
      ? (body.deliveryMethod as (typeof DELIVERY_METHODS)[number])
      : 'delivery';

    if (deliveryMethod === 'delivery' && (!address || !city)) {
      throw badRequest('A delivery address and city are required', { field: 'address' });
    }

    const settings = await readSettings();

    const resolved: Array<{
      productId: number;
      variantId: number | null;
      slug: string;
      nameEn: string;
      nameFa: string;
      brandName: string | null;
      colorNameEn: string | null;
      colorNameFa: string | null;
      imageUrl: string | null;
      sku: string | null;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }> = [];

    for (const item of rawItems) {
      const productId = Number(item.productId);
      const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1));
      if (!Number.isFinite(productId)) throw badRequest('Invalid product in bag');

      const product = await queryOne<Record<string, unknown>>(
        `SELECT p.id, p.slug, p.sku, p.name_en, p.name_fa, p.price, p.sale_price, p.images,
                b.name AS brand_name
         FROM products p LEFT JOIN brands b ON b.id = p.brand_id
         WHERE p.id = $1 AND p.is_active = TRUE`,
        [productId],
      );
      if (!product) throw badRequest('A product in your bag is no longer available');

      const variantId = Number(item.variantId);
      let variant: Record<string, unknown> | null = null;
      if (Number.isFinite(variantId)) {
        variant = await queryOne<Record<string, unknown>>(
          `SELECT * FROM product_variants WHERE id = $1 AND product_id = $2`,
          [variantId, productId],
        );
        if (!variant) throw badRequest('A selected colour is no longer available');
        if (Number(variant.stock) < quantity) {
          throw badRequest('The requested quantity is no longer available');
        }
      }

      const basePrice = Number(product.price);
      const baseSale = product.sale_price === null ? null : Number(product.sale_price);
      const unitPrice =
        variant && variant.price !== null
          ? variant.sale_price !== null && variant.sale_price !== undefined
            ? Number(variant.sale_price)
            : Number(variant.price)
          : baseSale !== null && baseSale < basePrice
            ? baseSale
            : basePrice;

      const images = Array.isArray(variant?.images) && (variant?.images as unknown[]).length
        ? (variant?.images as Array<{ url?: string }>)
        : (Array.isArray(product.images) ? (product.images as Array<{ url?: string }>) : []);

      resolved.push({
        productId,
        variantId: variant ? Number(variant.id) : null,
        slug: String(product.slug),
        nameEn: String(product.name_en),
        nameFa: String(product.name_fa),
        brandName: (product.brand_name as string | null) ?? null,
        colorNameEn: variant ? String(variant.color_name_en) : null,
        colorNameFa: variant ? String(variant.color_name_fa) : null,
        imageUrl: images[0]?.url ?? null,
        sku: variant ? String(variant.sku) : String(product.sku),
        unitPrice,
        quantity,
        lineTotal: unitPrice * quantity,
      });
    }

    const subtotal = resolved.reduce((total, item) => total + item.lineTotal, 0);
    const shipping =
      deliveryMethod === 'pickup' ||
      (settings.commerce.freeShippingThreshold !== null && subtotal >= settings.commerce.freeShippingThreshold)
        ? 0
        : settings.commerce.shippingFlat;
    const total = subtotal + shipping;

    const orderNumber = await withTransaction(async (client) => {
      const number = generateOrderNumber();
      const orderResult = await client.query(
        `INSERT INTO orders
           (order_number, customer_id, full_name, email, phone, address, city, postal_code,
            delivery_method, prescription_status, note, subtotal, shipping, total, currency, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending')
         RETURNING id`,
        [
          number,
          req.user?.id ?? null,
          fullName,
          email,
          phone,
          address,
          city,
          postalCode,
          deliveryMethod,
          prescriptionStatus,
          note,
          subtotal,
          shipping,
          total,
          settings.commerce.currency,
        ],
      );
      const orderId = Number(orderResult.rows[0].id);

      for (const item of resolved) {
        await client.query(
          `INSERT INTO order_items
             (order_id, product_id, variant_id, slug, name_en, name_fa, brand_name,
              color_name_en, color_name_fa, image_url, sku, unit_price, quantity, line_total)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [
            orderId,
            item.productId,
            item.variantId,
            item.slug,
            item.nameEn,
            item.nameFa,
            item.brandName,
            item.colorNameEn,
            item.colorNameFa,
            item.imageUrl,
            item.sku,
            item.unitPrice,
            item.quantity,
            item.lineTotal,
          ],
        );

        if (item.variantId !== null) {
          await client.query(
            `UPDATE product_variants SET stock = GREATEST(stock - $2, 0) WHERE id = $1`,
            [item.variantId, item.quantity],
          );
        }
      }

      return number;
    });

    const row = await queryOne<Record<string, unknown>>(
      'SELECT * FROM orders WHERE order_number = $1',
      [orderNumber],
    );
    const items = await loadOrderItems([Number(row?.id)]);
    res.status(201).json(mapOrder(row ?? {}, items.get(Number(row?.id)) ?? []));
  }),
);

/** Order tracking: number plus the email used at checkout. */
ordersRouter.get(
  '/orders/:orderNumber',
  asyncRoute(async (req, res) => {
    const orderNumber = requiredString(req.params.orderNumber, 'orderNumber', { max: 40 });
    const row = await queryOne<Record<string, unknown>>(
      'SELECT * FROM orders WHERE order_number = $1',
      [orderNumber.toUpperCase()],
    );
    if (!row) throw notFoundError('Order not found');

    const isOwner =
      req.user !== undefined &&
      (req.user.role === 'admin' || String(row.email).toLowerCase() === req.user.email.toLowerCase());
    if (!isOwner) {
      const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
      if (!email || email !== String(row.email).toLowerCase()) {
        throw forbidden('Enter the email address used for this order to view it');
      }
    }

    const items = await loadOrderItems([Number(row.id)]);
    res.json(mapOrder(row, items.get(Number(row.id)) ?? []));
  }),
);

ordersRouter.get(
  '/account/orders',
  requireAuth,
  asyncRoute(async (req, res) => {
    const rows = await query<Record<string, unknown>>(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.id],
    );
    const items = await loadOrderItems(rows.map((row) => Number(row.id)));
    res.json({ items: rows.map((row) => mapOrder(row, items.get(Number(row.id)) ?? [])) });
  }),
);
