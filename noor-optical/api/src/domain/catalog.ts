import { query, queryOne } from '../db.js';
import {
  buildRules,
  buildWhere,
  normalizeSort,
  parseList,
  sortClause,
  type QueryInput,
} from './filters.js';

export type ImageView = 'front' | 'side' | 'detail' | 'worn' | 'scene';

export type ImageRef = { url: string; view?: ImageView };

export type VariantDto = {
  id: number;
  colorNameEn: string;
  colorNameFa: string;
  colorHex: string | null;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  inStock: boolean;
  images: ImageRef[];
};

export type BrandDto = {
  slug: string;
  name: string;
  nameFa: string | null;
  country: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  imageUrl: string | null;
};

export type CategoryDto = {
  slug: string;
  family: string;
  nameEn: string;
  nameFa: string;
  taglineEn: string | null;
  taglineFa: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  imageUrl: string | null;
};

export type ProductDto = {
  id: number;
  slug: string;
  sku: string;
  nameEn: string;
  nameFa: string;
  summaryEn: string | null;
  summaryFa: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  brand: BrandDto | null;
  category: { slug: string; family: string; nameEn: string; nameFa: string } | null;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  currency: string;
  gender: string | null;
  shape: string | null;
  material: string | null;
  frameSize: string | null;
  lensColor: string | null;
  uvProtection: string | null;
  polarized: boolean;
  prescriptionCompatible: boolean;
  specs: Record<string, string>;
  images: ImageRef[];
  includedAccessories: string[];
  warrantyEn: string | null;
  warrantyFa: string | null;
  isFeatured: boolean;
  isNew: boolean;
  stock: number;
  inStock: boolean;
  createdAt: string;
  variants: VariantDto[];
};

const numeric = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const optionalNumeric = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asImages = (value: unknown): ImageRef[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return { url: entry };
      if (entry && typeof entry === 'object' && typeof (entry as ImageRef).url === 'string') {
        return { url: (entry as ImageRef).url, view: (entry as ImageRef).view };
      }
      return null;
    })
    .filter((entry): entry is ImageRef => entry !== null);
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

const asSpecs = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object') return {};
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (accumulator, [key, entry]) => {
      if (entry === null || entry === undefined) return accumulator;
      accumulator[key] = String(entry);
      return accumulator;
    },
    {},
  );
};

type ProductRow = Record<string, unknown>;

const PRODUCT_COLUMNS = `
  p.id, p.slug, p.sku, p.name_en, p.name_fa, p.summary_en, p.summary_fa,
  p.description_en, p.description_fa, p.price, p.sale_price, p.currency,
  p.gender, p.shape, p.material, p.frame_size, p.lens_color, p.uv_protection,
  p.polarized, p.prescription_compatible, p.specs, p.images, p.included_accessories,
  p.warranty_en, p.warranty_fa, p.is_featured, p.is_new, p.created_at,
  b.slug AS brand_slug, b.name AS brand_name, b.name_fa AS brand_name_fa,
  b.country AS brand_country, b.description_en AS brand_description_en,
  b.description_fa AS brand_description_fa, b.image_url AS brand_image_url,
  c.slug AS category_slug, c.family AS category_family, c.name_en AS category_name_en,
  c.name_fa AS category_name_fa
`;

export const PRODUCT_JOINS = `
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN categories c ON c.id = p.category_id
`;

const mapVariant = (row: Record<string, unknown>): VariantDto => {
  const stock = numeric(row.stock);
  return {
    id: numeric(row.id),
    colorNameEn: String(row.color_name_en ?? ''),
    colorNameFa: String(row.color_name_fa ?? row.color_name_en ?? ''),
    colorHex: (row.color_hex as string | null) ?? null,
    sku: String(row.sku ?? ''),
    price: numeric(row.price),
    salePrice: optionalNumeric(row.sale_price),
    stock,
    inStock: stock > 0,
    images: asImages(row.images),
  };
};

export const mapProduct = (row: ProductRow, variants: VariantDto[] = []): ProductDto => {
  const price = numeric(row.price);
  const salePrice = optionalNumeric(row.sale_price);
  const stock = variants.reduce((total, variant) => total + variant.stock, 0);
  const brandSlug = row.brand_slug as string | null;

  return {
    id: numeric(row.id),
    slug: String(row.slug),
    sku: String(row.sku),
    nameEn: String(row.name_en),
    nameFa: String(row.name_fa),
    summaryEn: (row.summary_en as string | null) ?? null,
    summaryFa: (row.summary_fa as string | null) ?? null,
    descriptionEn: (row.description_en as string | null) ?? null,
    descriptionFa: (row.description_fa as string | null) ?? null,
    brand: brandSlug
      ? {
          slug: brandSlug,
          name: String(row.brand_name ?? brandSlug),
          nameFa: (row.brand_name_fa as string | null) ?? null,
          country: (row.brand_country as string | null) ?? null,
          descriptionEn: (row.brand_description_en as string | null) ?? null,
          descriptionFa: (row.brand_description_fa as string | null) ?? null,
          imageUrl: (row.brand_image_url as string | null) ?? null,
        }
      : null,
    category: row.category_slug
      ? {
          slug: String(row.category_slug),
          family: String(row.category_family ?? 'frames'),
          nameEn: String(row.category_name_en ?? ''),
          nameFa: String(row.category_name_fa ?? ''),
        }
      : null,
    price,
    salePrice,
    effectivePrice: salePrice !== null && salePrice < price ? salePrice : price,
    currency: String(row.currency ?? 'IRT'),
    gender: (row.gender as string | null) ?? null,
    shape: (row.shape as string | null) ?? null,
    material: (row.material as string | null) ?? null,
    frameSize: (row.frame_size as string | null) ?? null,
    lensColor: (row.lens_color as string | null) ?? null,
    uvProtection: (row.uv_protection as string | null) ?? null,
    polarized: Boolean(row.polarized),
    prescriptionCompatible: Boolean(row.prescription_compatible),
    specs: asSpecs(row.specs),
    images: asImages(row.images),
    includedAccessories: asStringArray(row.included_accessories),
    warrantyEn: (row.warranty_en as string | null) ?? null,
    warrantyFa: (row.warranty_fa as string | null) ?? null,
    isFeatured: Boolean(row.is_featured),
    isNew: Boolean(row.is_new),
    stock,
    inStock: stock > 0,
    createdAt: new Date(String(row.created_at)).toISOString(),
    variants,
  };
};

const loadVariants = async (productIds: number[]): Promise<Map<number, VariantDto[]>> => {
  const map = new Map<number, VariantDto[]>();
  if (!productIds.length) return map;
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM product_variants WHERE product_id = ANY($1::int[]) ORDER BY sort_order, id`,
    [productIds],
  );
  for (const row of rows) {
    const productId = numeric(row.product_id);
    const list = map.get(productId) ?? [];
    list.push(mapVariant(row));
    map.set(productId, list);
  }
  return map;
};

export type ListInput = QueryInput & { page?: unknown; per_page?: unknown; sort?: unknown };

export type ProductListResult = {
  items: ProductDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export const listProducts = async (input: ListInput): Promise<ProductListResult> => {
  const rules = buildRules(input);
  const where = buildWhere(rules);
  const sort = normalizeSort(input.sort);

  const page = Math.max(1, Number(input.page) || 1);
  const perPage = Math.min(48, Math.max(1, Number(input.per_page) || 12));
  const offset = (page - 1) * perPage;

  const countRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*)::int AS total ${PRODUCT_JOINS} ${where.sql}`,
    where.params,
  );
  const total = countRow?.total ?? 0;

  const rows = await query<Record<string, unknown>>(
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCT_JOINS} ${where.sql}
     ORDER BY ${sortClause(sort)}
     LIMIT ${perPage} OFFSET ${offset}`,
    where.params,
  );

  const variants = await loadVariants(rows.map((row) => numeric(row.id)));
  const items = rows.map((row) => mapProduct(row, variants.get(numeric(row.id)) ?? []));

  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
};

export const getProductBySlug = async (slug: string): Promise<ProductDto | null> => {
  const row = await queryOne<Record<string, unknown>>(
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCT_JOINS} WHERE p.slug = $1 AND p.is_active = TRUE`,
    [slug],
  );
  if (!row) return null;
  const variants = await loadVariants([numeric(row.id)]);
  return mapProduct(row, variants.get(numeric(row.id)) ?? []);
};

export const getRelatedProducts = async (product: ProductDto, limit = 4): Promise<ProductDto[]> => {
  const rows = await query<Record<string, unknown>>(
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCT_JOINS}
     WHERE p.is_active = TRUE AND p.id <> $1
       AND (c.family = $2 OR b.id = (SELECT brand_id FROM products WHERE id = $1))
     ORDER BY p.is_featured DESC, p.created_at DESC
     LIMIT $3`,
    [product.id, product.category?.family ?? 'frames', limit],
  );
  const variants = await loadVariants(rows.map((row) => numeric(row.id)));
  return rows.map((row) => mapProduct(row, variants.get(numeric(row.id)) ?? []));
};

/* -------------------------------------------------------------------- facets */

type FacetOption = { value: string; label: string; count: number };
type FacetGroup =
  | { key: string; type: 'list'; options: FacetOption[] }
  | { key: 'price'; type: 'range'; min: number; max: number };

type FacetDefinition = {
  key: string;
  valueExpr: string;
  labelExpr?: string;
  labelFaExpr?: string;
  families: string[];
};

const FACET_DEFINITIONS: FacetDefinition[] = [
  { key: 'brand', valueExpr: 'LOWER(b.slug)', labelExpr: 'b.name', labelFaExpr: 'b.name_fa', families: ['*'] },
  { key: 'shape', valueExpr: 'LOWER(p.shape)', labelExpr: 'p.shape', families: ['frames'] },
  { key: 'material', valueExpr: 'LOWER(p.material)', labelExpr: 'p.material', families: ['frames'] },
  { key: 'gender', valueExpr: 'LOWER(p.gender)', labelExpr: 'p.gender', families: ['frames'] },
  {
    key: 'color',
    valueExpr: 'LOWER(v.color_name_en)',
    labelExpr: 'v.color_name_en',
    labelFaExpr: 'v.color_name_fa',
    families: ['frames'],
  },
  { key: 'frame_size', valueExpr: 'LOWER(p.frame_size)', labelExpr: 'p.frame_size', families: ['frames'] },
  { key: 'lens_color', valueExpr: 'LOWER(p.lens_color)', labelExpr: 'p.lens_color', families: ['frames'] },
  { key: 'uv_protection', valueExpr: 'LOWER(p.uv_protection)', labelExpr: 'p.uv_protection', families: ['frames'] },
  { key: 'lens_type', valueExpr: "LOWER(p.specs->>'lens_type')", labelExpr: "p.specs->>'lens_type'", families: ['lenses', 'contacts'] },
  { key: 'lens_material', valueExpr: "LOWER(p.specs->>'lens_material')", labelExpr: "p.specs->>'lens_material'", families: ['lenses'] },
  { key: 'refractive_index', valueExpr: "LOWER(p.specs->>'refractive_index')", labelExpr: "p.specs->>'refractive_index'", families: ['lenses'] },
  { key: 'coating', valueExpr: "LOWER(p.specs->>'coating')", labelExpr: "p.specs->>'coating'", families: ['lenses'] },
  { key: 'vision_type', valueExpr: "LOWER(p.specs->>'vision_type')", labelExpr: "p.specs->>'vision_type'", families: ['lenses'] },
  { key: 'photochromic', valueExpr: "LOWER(p.specs->>'photochromic')", labelExpr: "p.specs->>'photochromic'", families: ['lenses'] },
  { key: 'replacement_schedule', valueExpr: "LOWER(p.specs->>'replacement_schedule')", labelExpr: "p.specs->>'replacement_schedule'", families: ['contacts'] },
  { key: 'pack_size', valueExpr: "LOWER(p.specs->>'pack_size')", labelExpr: "p.specs->>'pack_size'", families: ['contacts'] },
];

export const resolveFamilies = async (input: QueryInput): Promise<string[]> => {
  const explicit = parseList(input.family);
  if (explicit.length) return explicit;
  const slugs = parseList(input.category);
  if (!slugs.length) return ['*'];
  const rows = await query<{ family: string }>(
    `SELECT DISTINCT family FROM categories WHERE LOWER(slug) = ANY($1::text[])`,
    [slugs],
  );
  const families = rows.map((row) => row.family);
  return families.length ? families : ['*'];
};

export const getFacets = async (input: QueryInput): Promise<{ groups: FacetGroup[] }> => {
  const rules = buildRules(input);
  const families = await resolveFamilies(input);
  const appliesTo = (definition: FacetDefinition) =>
    families.includes('*') ||
    definition.families.includes('*') ||
    definition.families.some((family) => families.includes(family));

  const groups: FacetGroup[] = [];
  const definitions = FACET_DEFINITIONS.filter(appliesTo);

  const usesVariants = definitions.some((definition) => definition.valueExpr.includes('v.'));
  const variantJoin = usesVariants
    ? 'LEFT JOIN product_variants v ON v.product_id = p.id'
    : '';

  for (const definition of definitions) {
    const where = buildWhere(rules, [definition.key]);
    const labelExpr = definition.labelExpr ?? definition.valueExpr;
    const labelFaExpr = definition.labelFaExpr ?? labelExpr;
    const rows = await query<{ value: string; label: string; label_fa: string; count: number }>(
      `SELECT ${definition.valueExpr} AS value,
              MAX(${labelExpr}) AS label,
              MAX(${labelFaExpr}) AS label_fa,
              COUNT(DISTINCT p.id)::int AS count
       ${PRODUCT_JOINS}
       ${variantJoin}
       ${where.sql ? `${where.sql} AND` : 'WHERE'} ${definition.valueExpr} IS NOT NULL AND ${definition.valueExpr} <> ''
       GROUP BY 1
       HAVING COUNT(DISTINCT p.id) > 0
       ORDER BY 4 DESC, 2 ASC
       LIMIT 40`,
      where.params,
    );
    if (!rows.length) continue;
    groups.push({
      key: definition.key,
      type: 'list',
      options: rows.map((row) => ({
        value: row.value,
        label: row.label ?? row.value,
        // Only groups with a dedicated Persian column (brand, colour) return a
        // localized label; other values are translated on the client.
        labelFa: definition.labelFaExpr ? (row.label_fa ?? null) : null,
        count: row.count,
      })),
    });
  }

  // Price range over the current scope (ignoring any price filter).
  const priceWhere = buildWhere(rules, ['price_min', 'price_max']);
  const priceRow = await queryOne<{ min: string | null; max: string | null }>(
    `SELECT MIN(COALESCE(p.sale_price, p.price))::text AS min, MAX(COALESCE(p.sale_price, p.price))::text AS max
     ${PRODUCT_JOINS} ${priceWhere.sql}`,
    priceWhere.params,
  );
  if (priceRow?.min && priceRow.max) {
    groups.push({
      key: 'price',
      type: 'range',
      min: Math.floor(numeric(priceRow.min)),
      max: Math.ceil(numeric(priceRow.max)),
    });
  }

  // Boolean facets share one scan so their counts stay consistent.
  const booleanWhere = buildWhere(rules, ['availability', 'prescription', 'polarized']);
  const booleanRow = await queryOne<{
    in_stock: number;
    out_of_stock: number;
    prescription: number;
    polarized: number;
  }>(
    `SELECT
        COUNT(DISTINCT p.id) FILTER (WHERE EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.stock > 0))::int AS in_stock,
        COUNT(DISTINCT p.id) FILTER (WHERE NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.stock > 0))::int AS out_of_stock,
        COUNT(DISTINCT p.id) FILTER (WHERE p.prescription_compatible)::int AS prescription,
        COUNT(DISTINCT p.id) FILTER (WHERE p.polarized)::int AS polarized
     ${PRODUCT_JOINS} ${booleanWhere.sql}`,
    booleanWhere.params,
  );
  if (booleanRow) {
    groups.push({
      key: 'availability',
      type: 'list',
      options: [
        { value: 'in-stock', label: 'in-stock', count: booleanRow.in_stock },
        { value: 'out-of-stock', label: 'out-of-stock', count: booleanRow.out_of_stock },
      ].filter((option) => option.count > 0),
    });
    if (booleanRow.prescription > 0) {
      groups.push({
        key: 'prescription',
        type: 'list',
        options: [{ value: 'true', label: 'true', count: booleanRow.prescription }],
      });
    }
    if (booleanRow.polarized > 0) {
      groups.push({
        key: 'polarized',
        type: 'list',
        options: [{ value: 'true', label: 'true', count: booleanRow.polarized }],
      });
    }
  }

  return { groups };
};

/* -------------------------------------------------------- categories & brands */

const mapCategory = (row: Record<string, unknown>): CategoryDto => ({
  slug: String(row.slug),
  family: String(row.family),
  nameEn: String(row.name_en),
  nameFa: String(row.name_fa),
  taglineEn: (row.tagline_en as string | null) ?? null,
  taglineFa: (row.tagline_fa as string | null) ?? null,
  descriptionEn: (row.description_en as string | null) ?? null,
  descriptionFa: (row.description_fa as string | null) ?? null,
  imageUrl: (row.image_url as string | null) ?? null,
});

export const listCategories = async (): Promise<CategoryDto[]> => {
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order, id`,
  );
  return rows.map(mapCategory);
};

export const getCategoryBySlug = async (slug: string): Promise<CategoryDto | null> => {
  const row = await queryOne<Record<string, unknown>>(
    `SELECT * FROM categories WHERE slug = $1 AND is_active = TRUE`,
    [slug],
  );
  return row ? mapCategory(row) : null;
};

const mapBrand = (row: Record<string, unknown>, productCount = 0): BrandDto & { productCount: number } => ({
  slug: String(row.slug),
  name: String(row.name),
  nameFa: (row.name_fa as string | null) ?? null,
  country: (row.country as string | null) ?? null,
  descriptionEn: (row.description_en as string | null) ?? null,
  descriptionFa: (row.description_fa as string | null) ?? null,
  imageUrl: (row.image_url as string | null) ?? null,
  productCount,
});

export const listBrands = async (): Promise<Array<BrandDto & { productCount: number }>> => {
  const rows = await query<Record<string, unknown>>(
    `SELECT b.*, COUNT(p.id)::int AS product_count
     FROM brands b
     LEFT JOIN products p ON p.brand_id = b.id AND p.is_active = TRUE
     WHERE b.is_active = TRUE
     GROUP BY b.id
     ORDER BY b.sort_order, b.name`,
  );
  return rows.map((row) => mapBrand(row, numeric(row.product_count)));
};

export const getBrandBySlug = async (
  slug: string,
): Promise<(BrandDto & { productCount: number }) | null> => {
  const row = await queryOne<Record<string, unknown>>(
    `SELECT b.*, COUNT(p.id)::int AS product_count
     FROM brands b
     LEFT JOIN products p ON p.brand_id = b.id AND p.is_active = TRUE
     WHERE b.slug = $1 AND b.is_active = TRUE
     GROUP BY b.id`,
    [slug],
  );
  return row ? mapBrand(row, numeric(row.product_count)) : null;
};

/* ---------------------------------------------------------------- search aid */

export type SearchSuggestions = {
  products: Array<{
    slug: string;
    nameEn: string;
    nameFa: string;
    price: number;
    salePrice: number | null;
    currency: string;
    imageUrl: string | null;
    brandName: string | null;
    categoryFa: string | null;
  }>;
  brands: Array<{ slug: string; name: string; nameFa: string | null }>;
  categories: Array<{ slug: string; nameEn: string; nameFa: string }>;
};

export const getSearchSuggestions = async (term: string, limit = 6): Promise<SearchSuggestions> => {
  const trimmed = term.trim();
  if (trimmed.length < 2) return { products: [], brands: [], categories: [] };
  const like = `%${trimmed}%`;

  const [productRows, brandRows, categoryRows] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT ${PRODUCT_COLUMNS} ${PRODUCT_JOINS}
       WHERE p.is_active = TRUE
         AND (p.name_en ILIKE $1 OR p.name_fa ILIKE $1 OR p.sku ILIKE $1
              OR COALESCE(b.name, '') ILIKE $1 OR COALESCE(c.name_fa, '') ILIKE $1)
       ORDER BY p.is_featured DESC, p.name_en ASC
       LIMIT $2`,
      [like, limit],
    ),
    query<Record<string, unknown>>(
      `SELECT slug, name, name_fa FROM brands
       WHERE is_active = TRUE AND (name ILIKE $1 OR COALESCE(name_fa, '') ILIKE $1)
       ORDER BY name LIMIT 4`,
      [like],
    ),
    query<Record<string, unknown>>(
      `SELECT slug, name_en, name_fa FROM categories
       WHERE is_active = TRUE AND (name_en ILIKE $1 OR name_fa ILIKE $1)
       ORDER BY sort_order LIMIT 4`,
      [like],
    ),
  ]);

  return {
    products: productRows.map((row) => {
      const images = asImages(row.images);
      return {
        slug: String(row.slug),
        nameEn: String(row.name_en),
        nameFa: String(row.name_fa),
        price: numeric(row.price),
        salePrice: optionalNumeric(row.sale_price),
        currency: String(row.currency ?? 'IRT'),
        imageUrl: images[0]?.url ?? null,
        brandName: (row.brand_name as string | null) ?? null,
        categoryFa: (row.category_name_fa as string | null) ?? null,
      };
    }),
    brands: brandRows.map((row) => ({
      slug: String(row.slug),
      name: String(row.name),
      nameFa: (row.name_fa as string | null) ?? null,
    })),
    categories: categoryRows.map((row) => ({
      slug: String(row.slug),
      nameEn: String(row.name_en),
      nameFa: String(row.name_fa),
    })),
  };
};

export const searchProducts = (term: string, options: Record<string, unknown> = {}) =>
  listProducts({ ...options, q: term });
