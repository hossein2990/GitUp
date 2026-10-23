import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { requireAdmin } from '../auth.js';
import { readSettings, writeSettings } from './content.js';
import { mapOrder } from './orders.js';
import {
  asyncRoute,
  badRequest,
  notFoundError,
  optionalBoolean,
  optionalNumber,
  optionalString,
  requiredString,
} from '../http.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

/* -------------------------------------------------------------------- stats */

adminRouter.get(
  '/stats',
  asyncRoute(async (_req, res) => {
    const row = await queryOne<Record<string, number>>(
      `SELECT
         (SELECT COUNT(*)::int FROM products WHERE is_active) AS active_products,
         (SELECT COUNT(*)::int FROM products) AS total_products,
         (SELECT COUNT(*)::int FROM product_variants WHERE stock = 0) AS out_of_stock_variants,
         (SELECT COUNT(*)::int FROM orders) AS total_orders,
         (SELECT COUNT(*)::int FROM orders WHERE status = 'pending') AS pending_orders,
         (SELECT COALESCE(SUM(total), 0)::float FROM orders WHERE status <> 'cancelled') AS revenue,
         (SELECT COUNT(*)::int FROM appointments WHERE status = 'requested') AS new_appointments,
         (SELECT COUNT(*)::int FROM contact_messages WHERE status = 'new') AS new_messages,
         (SELECT COUNT(*)::int FROM customers) AS customers`,
    );
    const recent = await query<Record<string, unknown>>(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5',
    );
    res.json({
      totals: {
        activeProducts: row?.active_products ?? 0,
        totalProducts: row?.total_products ?? 0,
        outOfStockVariants: row?.out_of_stock_variants ?? 0,
        totalOrders: row?.total_orders ?? 0,
        pendingOrders: row?.pending_orders ?? 0,
        revenue: row?.revenue ?? 0,
        newAppointments: row?.new_appointments ?? 0,
        newMessages: row?.new_messages ?? 0,
        customers: row?.customers ?? 0,
      },
      recentOrders: recent.map((entry) => mapOrder(entry)),
    });
  }),
);

/* ----------------------------------------------------------------- products */

const mapAdminProduct = (row: Record<string, unknown>) => ({
  id: Number(row.id),
  slug: String(row.slug),
  sku: String(row.sku),
  nameEn: String(row.name_en),
  nameFa: String(row.name_fa),
  categorySlug: (row.category_slug as string | null) ?? null,
  categoryNameFa: (row.category_name_fa as string | null) ?? null,
  brandSlug: (row.brand_slug as string | null) ?? null,
  brandName: (row.brand_name as string | null) ?? null,
  price: Number(row.price),
  salePrice: row.sale_price === null ? null : Number(row.sale_price),
  currency: String(row.currency),
  isActive: Boolean(row.is_active),
  isFeatured: Boolean(row.is_featured),
  isNew: Boolean(row.is_new),
  stock: Number(row.stock ?? 0),
  variantCount: Number(row.variant_count ?? 0),
  createdAt: new Date(String(row.created_at)).toISOString(),
});

adminRouter.get(
  '/products',
  asyncRoute(async (req, res) => {
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const page = Math.max(1, Number(req.query.page) || 1);
    const perPage = Math.min(50, Math.max(5, Number(req.query.per_page) || 20));
    const like = `%${search}%`;

    const rows = await query<Record<string, unknown>>(
      `SELECT p.id, p.slug, p.sku, p.name_en, p.name_fa, p.price, p.sale_price, p.currency,
              p.is_active, p.is_featured, p.is_new, p.created_at,
              c.slug AS category_slug, c.name_fa AS category_name_fa,
              b.slug AS brand_slug, b.name AS brand_name,
              COALESCE(SUM(v.stock), 0)::int AS stock,
              COUNT(v.id)::int AS variant_count
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN product_variants v ON v.product_id = p.id
       WHERE ($1 = '' OR p.name_en ILIKE $2 OR p.name_fa ILIKE $2 OR p.sku ILIKE $2)
       GROUP BY p.id, c.slug, c.name_fa, b.slug, b.name
       ORDER BY p.created_at DESC
       LIMIT $3 OFFSET $4`,
      [search, like, perPage, (page - 1) * perPage],
    );

    const countRow = await queryOne<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM products p
       WHERE ($1 = '' OR p.name_en ILIKE $2 OR p.name_fa ILIKE $2 OR p.sku ILIKE $2)`,
      [search, like],
    );

    res.json({
      items: rows.map(mapAdminProduct),
      total: countRow?.total ?? 0,
      page,
      perPage,
    });
  }),
);

adminRouter.get(
  '/products/:id',
  asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const row = await queryOne<Record<string, unknown>>(
      `SELECT p.*, c.slug AS category_slug, c.name_fa AS category_name_fa,
              b.slug AS brand_slug, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.id = $1`,
      [id],
    );
    if (!row) throw notFoundError('Product not found');

    const variants = await query<Record<string, unknown>>(
      'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY sort_order, id',
      [id],
    );

    res.json({
      product: mapAdminProduct({ ...row, stock: variants.reduce((t, v) => t + Number(v.stock), 0) }),
      detail: {
        summaryEn: row.summary_en,
        summaryFa: row.summary_fa,
        descriptionEn: row.description_en,
        descriptionFa: row.description_fa,
        shape: row.shape,
        material: row.material,
        frameSize: row.frame_size,
        gender: row.gender,
        lensColor: row.lens_color,
        uvProtection: row.uv_protection,
        polarized: row.polarized,
        prescriptionCompatible: row.prescription_compatible,
        specs: row.specs,
        images: row.images,
      },
      variants: variants.map((variant) => ({
        id: Number(variant.id),
        sku: String(variant.sku),
        colorNameEn: String(variant.color_name_en),
        colorNameFa: String(variant.color_name_fa),
        colorHex: variant.color_hex,
        price: variant.price === null ? null : Number(variant.price),
        salePrice: variant.sale_price === null ? null : Number(variant.sale_price),
        stock: Number(variant.stock),
      })),
    });
  }),
);

const PRODUCT_PATCHABLE: Array<{ field: string; column: string }> = [
  { field: 'nameEn', column: 'name_en' },
  { field: 'nameFa', column: 'name_fa' },
  { field: 'summaryEn', column: 'summary_en' },
  { field: 'summaryFa', column: 'summary_fa' },
  { field: 'descriptionEn', column: 'description_en' },
  { field: 'descriptionFa', column: 'description_fa' },
  { field: 'shape', column: 'shape' },
  { field: 'material', column: 'material' },
  { field: 'gender', column: 'gender' },
  { field: 'frameSize', column: 'frame_size' },
  { field: 'lensColor', column: 'lens_color' },
  { field: 'uvProtection', column: 'uv_protection' },
];

adminRouter.patch(
  '/products/:id',
  asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const assignments: string[] = [];
    const values: unknown[] = [id];

    for (const { field, column } of PRODUCT_PATCHABLE) {
      if (!(field in body)) continue;
      values.push(optionalString(body[field], field));
      assignments.push(`${column} = $${values.length}`);
    }

    if ('price' in body) {
      const price = optionalNumber(body.price, 'price');
      if (price === null || price < 0) throw badRequest('Price must be a positive number');
      values.push(price);
      assignments.push(`price = $${values.length}`);
    }
    if ('salePrice' in body) {
      values.push(optionalNumber(body.salePrice, 'salePrice'));
      assignments.push(`sale_price = $${values.length}`);
    }
    for (const [field, column] of [
      ['isActive', 'is_active'],
      ['isFeatured', 'is_featured'],
      ['isNew', 'is_new'],
      ['polarized', 'polarized'],
      ['prescriptionCompatible', 'prescription_compatible'],
    ] as const) {
      const parsed = optionalBoolean(body[field]);
      if (parsed === null) continue;
      values.push(parsed);
      assignments.push(`${column} = $${values.length}`);
    }
    if ('specs' in body && body.specs && typeof body.specs === 'object') {
      values.push(JSON.stringify(body.specs));
      assignments.push(`specs = $${values.length}::jsonb`);
    }
    if ('images' in body && Array.isArray(body.images)) {
      values.push(JSON.stringify(body.images));
      assignments.push(`images = $${values.length}::jsonb`);
    }

    if (!assignments.length) throw badRequest('Nothing to update');
    assignments.push('updated_at = NOW()');

    const row = await queryOne<Record<string, unknown>>(
      `UPDATE products SET ${assignments.join(', ')} WHERE id = $1 RETURNING id`,
      values as never[],
    );
    if (!row) throw notFoundError('Product not found');
    res.json({ ok: true });
  }),
);

adminRouter.patch(
  '/variants/:id',
  asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const assignments: string[] = [];
    const values: unknown[] = [id];

    if ('price' in body) {
      values.push(optionalNumber(body.price, 'price'));
      assignments.push(`price = $${values.length}`);
    }
    if ('salePrice' in body) {
      values.push(optionalNumber(body.salePrice, 'salePrice'));
      assignments.push(`sale_price = $${values.length}`);
    }
    if ('stock' in body) {
      const stock = optionalNumber(body.stock, 'stock');
      if (stock === null || stock < 0) throw badRequest('Stock must be zero or greater');
      values.push(Math.floor(stock));
      assignments.push(`stock = $${values.length}`);
    }
    if ('colorNameEn' in body) {
      values.push(requiredString(body.colorNameEn, 'colorNameEn', { max: 80 }));
      assignments.push(`color_name_en = $${values.length}`);
    }
    if ('colorNameFa' in body) {
      values.push(requiredString(body.colorNameFa, 'colorNameFa', { max: 80 }));
      assignments.push(`color_name_fa = $${values.length}`);
    }
    if (!assignments.length) throw badRequest('Nothing to update');

    const row = await queryOne<{ id: number }>(
      `UPDATE product_variants SET ${assignments.join(', ')} WHERE id = $1 RETURNING id`,
      values as never[],
    );
    if (!row) throw notFoundError('Variant not found');
    res.json({ ok: true });
  }),
);

/* ------------------------------------------------------------------- orders */

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

adminRouter.get(
  '/orders',
  asyncRoute(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const page = Math.max(1, Number(req.query.page) || 1);
    const perPage = Math.min(50, Math.max(5, Number(req.query.per_page) || 20));

    const rows = await query<Record<string, unknown>>(
      `SELECT * FROM orders WHERE ($1 = '' OR status = $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [status, perPage, (page - 1) * perPage],
    );
    const countRow = await queryOne<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM orders WHERE ($1 = '' OR status = $1)`,
      [status],
    );

    let itemsByOrder = new Map<number, Record<string, unknown>[]>();
    if (rows.length) {
      const itemRows = await query<Record<string, unknown>>(
        `SELECT * FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id`,
        [rows.map((row) => Number(row.id))],
      );
      itemsByOrder = itemRows.reduce((map, row) => {
        const orderId = Number(row.order_id);
        map.set(orderId, [...(map.get(orderId) ?? []), row]);
        return map;
      }, new Map<number, Record<string, unknown>[]>());
    }

    res.json({
      items: rows.map((row) => ({
        ...mapOrder(row, itemsByOrder.get(Number(row.id)) ?? []),
        id: Number(row.id),
      })),
      total: countRow?.total ?? 0,
      statuses: ORDER_STATUSES,
    });
  }),
);

adminRouter.patch(
  '/orders/:id',
  asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const status = requiredString((req.body as Record<string, unknown>)?.status, 'status', { max: 30 });
    if (!ORDER_STATUSES.includes(status)) throw badRequest('Unknown order status');
    const row = await queryOne<{ id: number }>(
      'UPDATE orders SET status = $2 WHERE id = $1 RETURNING id',
      [id, status],
    );
    if (!row) throw notFoundError('Order not found');
    res.json({ ok: true, status });
  }),
);

/* ------------------------------------------------------- appointments & inbox */

adminRouter.get(
  '/appointments',
  asyncRoute(async (_req, res) => {
    const rows = await query<Record<string, unknown>>(
      'SELECT * FROM appointments ORDER BY created_at DESC LIMIT 200',
    );
    res.json({
      items: rows.map((row) => ({
        id: Number(row.id),
        fullName: String(row.full_name),
        phone: String(row.phone),
        email: (row.email as string | null) ?? null,
        serviceSlug: (row.service_slug as string | null) ?? null,
        serviceName: (row.service_name as string | null) ?? null,
        preferredDate: row.preferred_date === null ? null : String(row.preferred_date),
        preferredTime: (row.preferred_time as string | null) ?? null,
        notes: (row.notes as string | null) ?? null,
        status: String(row.status),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    });
  }),
);

adminRouter.patch(
  '/appointments/:id',
  asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const status = requiredString((req.body as Record<string, unknown>)?.status, 'status', { max: 30 });
    const row = await queryOne<{ id: number }>(
      'UPDATE appointments SET status = $2 WHERE id = $1 RETURNING id',
      [id, status],
    );
    if (!row) throw notFoundError('Appointment not found');
    res.json({ ok: true });
  }),
);

adminRouter.get(
  '/messages',
  asyncRoute(async (_req, res) => {
    const rows = await query<Record<string, unknown>>(
      'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200',
    );
    res.json({
      items: rows.map((row) => ({
        id: Number(row.id),
        fullName: String(row.full_name),
        email: String(row.email),
        phone: (row.phone as string | null) ?? null,
        subject: (row.subject as string | null) ?? null,
        message: String(row.message),
        status: String(row.status),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    });
  }),
);

adminRouter.patch(
  '/messages/:id',
  asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const status = requiredString((req.body as Record<string, unknown>)?.status, 'status', { max: 30 });
    const row = await queryOne<{ id: number }>(
      'UPDATE contact_messages SET status = $2 WHERE id = $1 RETURNING id',
      [id, status],
    );
    if (!row) throw notFoundError('Message not found');
    res.json({ ok: true });
  }),
);

/* -------------------------------------------------- settings, services, users */

adminRouter.get(
  '/settings',
  asyncRoute(async (_req, res) => {
    res.json(await readSettings());
  }),
);

adminRouter.put(
  '/settings',
  asyncRoute(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    res.json(await writeSettings(body));
  }),
);

adminRouter.get(
  '/services',
  asyncRoute(async (_req, res) => {
    const rows = await query<Record<string, unknown>>('SELECT * FROM services ORDER BY sort_order, id');
    res.json({
      items: rows.map((row) => ({
        id: Number(row.id),
        slug: String(row.slug),
        nameEn: String(row.name_en),
        nameFa: String(row.name_fa),
        summaryEn: (row.summary_en as string | null) ?? null,
        summaryFa: (row.summary_fa as string | null) ?? null,
        priceFrom: row.price_from === null ? null : Number(row.price_from),
        durationFa: (row.duration_fa as string | null) ?? null,
        isActive: Boolean(row.is_active),
      })),
    });
  }),
);

adminRouter.patch(
  '/services/:id',
  asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const assignments: string[] = [];
    const values: unknown[] = [id];

    for (const [field, column] of [
      ['nameEn', 'name_en'],
      ['nameFa', 'name_fa'],
      ['summaryEn', 'summary_en'],
      ['summaryFa', 'summary_fa'],
      ['descriptionEn', 'description_en'],
      ['descriptionFa', 'description_fa'],
      ['durationEn', 'duration_en'],
      ['durationFa', 'duration_fa'],
    ] as const) {
      if (!(field in body)) continue;
      values.push(optionalString(body[field], field));
      assignments.push(`${column} = $${values.length}`);
    }
    if ('priceFrom' in body) {
      values.push(optionalNumber(body.priceFrom, 'priceFrom'));
      assignments.push(`price_from = $${values.length}`);
    }
    const isActive = optionalBoolean(body.isActive);
    if (isActive !== null) {
      values.push(isActive);
      assignments.push(`is_active = $${values.length}`);
    }
    if (!assignments.length) throw badRequest('Nothing to update');

    const row = await queryOne<{ id: number }>(
      `UPDATE services SET ${assignments.join(', ')} WHERE id = $1 RETURNING id`,
      values as never[],
    );
    if (!row) throw notFoundError('Service not found');
    res.json({ ok: true });
  }),
);

adminRouter.get(
  '/customers',
  asyncRoute(async (_req, res) => {
    const rows = await query<Record<string, unknown>>(
      `SELECT c.id, c.email, c.full_name, c.phone, c.created_at,
              COUNT(o.id)::int AS order_count,
              COALESCE(SUM(o.total), 0)::float AS lifetime_value
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id AND o.status <> 'cancelled'
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT 200`,
    );
    res.json({
      items: rows.map((row) => ({
        id: Number(row.id),
        email: String(row.email),
        fullName: (row.full_name as string | null) ?? null,
        phone: (row.phone as string | null) ?? null,
        orderCount: Number(row.order_count ?? 0),
        lifetimeValue: Number(row.lifetime_value ?? 0),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    });
  }),
);
