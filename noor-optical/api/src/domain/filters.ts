import type { SqlValue } from '../db.js';

/**
 * Query-parameter driven product filtering.
 *
 * Every filter is expressed as a `FilterRule` whose SQL is generated at call
 * time against a shared parameter bag. Because the rules can be rebuilt for any
 * subset, the same engine powers both the product query and the per-facet
 * counts (each facet excludes its own rule so its options stay selectable).
 */

export type FilterRule = {
  key: string;
  build: (bag: ParamBag) => string | null;
};

export class ParamBag {
  readonly values: SqlValue[] = [];

  add(value: SqlValue): string {
    this.values.push(value);
    return `$${this.values.length}`;
  }
}

export type QueryInput = Record<string, unknown>;

export const parseList = (value: unknown): string[] =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
    : Array.isArray(value)
      ? value.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean)
      : [];

const COLUMN_FILTERS = [
  'shape',
  'material',
  'gender',
  'lens_color',
  'frame_size',
  'uv_protection',
] as const;

/** Spec keys live in `products.specs` (jsonb) and are filterable by name. */
export const SPEC_FILTER_KEYS = [
  'lens_type',
  'lens_material',
  'refractive_index',
  'coating',
  'vision_type',
  'photochromic',
  'replacement_schedule',
  'pack_size',
  'water_content',
] as const;

export const SORT_OPTIONS = ['relevance', 'newest', 'price-asc', 'price-desc', 'name'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const normalizeSort = (value: unknown): SortOption => {
  const raw = typeof value === 'string' ? value : '';
  return (SORT_OPTIONS as readonly string[]).includes(raw) ? (raw as SortOption) : 'relevance';
};

export const sortClause = (sort: SortOption): string => {
  switch (sort) {
    case 'newest':
      return 'p.created_at DESC, p.id DESC';
    case 'price-asc':
      return 'COALESCE(p.sale_price, p.price) ASC, p.id ASC';
    case 'price-desc':
      return 'COALESCE(p.sale_price, p.price) DESC, p.id DESC';
    case 'name':
      return 'p.name_en ASC, p.id ASC';
    default:
      return 'p.is_featured DESC, p.is_new DESC, p.created_at DESC, p.id DESC';
  }
};

export const buildRules = (input: QueryInput): FilterRule[] => {
  const rules: FilterRule[] = [
    { key: 'visibility', build: () => 'p.is_active = TRUE' },
  ];

  const search = typeof input.q === 'string' ? input.q.trim() : '';
  if (search) {
    rules.push({
      key: 'q',
      build: (bag) => {
        const like = bag.add(`%${search}%`);
        return `(p.name_en ILIKE ${like} OR p.name_fa ILIKE ${like} OR p.sku ILIKE ${like}
                 OR COALESCE(p.summary_en, '') ILIKE ${like} OR COALESCE(p.summary_fa, '') ILIKE ${like}
                 OR COALESCE(b.name, '') ILIKE ${like} OR COALESCE(c.name_en, '') ILIKE ${like}
                 OR COALESCE(c.name_fa, '') ILIKE ${like})`;
      },
    });
  }

  const categories = parseList(input.category);
  if (categories.length) {
    rules.push({
      key: 'category',
      build: (bag) => `LOWER(c.slug) = ANY(${bag.add(categories)}::text[])`,
    });
  }

  const families = parseList(input.family);
  if (families.length) {
    rules.push({
      key: 'family',
      build: (bag) => `LOWER(c.family) = ANY(${bag.add(families)}::text[])`,
    });
  }

  const brands = parseList(input.brand);
  if (brands.length) {
    rules.push({
      key: 'brand',
      build: (bag) => `LOWER(b.slug) = ANY(${bag.add(brands)}::text[])`,
    });
  }

  for (const key of COLUMN_FILTERS) {
    const values = parseList(input[key]);
    if (!values.length) continue;
    const column = `p.${key}`;
    rules.push({
      key,
      build: (bag) => `LOWER(${column}) = ANY(${bag.add(values)}::text[])`,
    });
  }

  const colors = parseList(input.color);
  if (colors.length) {
    rules.push({
      key: 'color',
      build: (bag) => `EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id
                      AND LOWER(v.color_name_en) = ANY(${bag.add(colors)}::text[]))`,
    });
  }

  const priceMin = Number(input.price_min);
  if (Number.isFinite(priceMin) && priceMin > 0) {
    rules.push({
      key: 'price_min',
      build: (bag) => `COALESCE(p.sale_price, p.price) >= ${bag.add(priceMin)}::numeric`,
    });
  }

  const priceMax = Number(input.price_max);
  if (Number.isFinite(priceMax) && priceMax > 0) {
    rules.push({
      key: 'price_max',
      build: (bag) => `COALESCE(p.sale_price, p.price) <= ${bag.add(priceMax)}::numeric`,
    });
  }

  const availability = parseList(input.availability)[0];
  if (availability === 'in-stock' || availability === 'out-of-stock') {
    const inStock = "EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.stock > 0)";
    rules.push({
      key: 'availability',
      build: () => (availability === 'in-stock' ? inStock : `NOT ${inStock}`),
    });
  }

  if (parseList(input.prescription)[0] === 'true') {
    rules.push({ key: 'prescription', build: () => 'p.prescription_compatible = TRUE' });
  }

  if (parseList(input.polarized)[0] === 'true') {
    rules.push({ key: 'polarized', build: () => 'p.polarized = TRUE' });
  }

  if (parseList(input.sale)[0] === 'true') {
    rules.push({
      key: 'sale',
      build: () => 'p.sale_price IS NOT NULL AND p.sale_price < p.price',
    });
  }

  if (parseList(input.featured)[0] === 'true') {
    rules.push({ key: 'featured', build: () => 'p.is_featured = TRUE' });
  }

  for (const specKey of SPEC_FILTER_KEYS) {
    const values = parseList(input[specKey]);
    if (!values.length) continue;
    rules.push({
      key: specKey,
      build: (bag) => `LOWER(p.specs->>'${specKey}') = ANY(${bag.add(values)}::text[])`,
    });
  }

  return rules;
};

export const WHERE_JOINS = `
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN categories c ON c.id = p.category_id
`;

export const buildWhere = (
  rules: FilterRule[],
  excludeKeys: string[] = [],
): { sql: string; params: SqlValue[] } => {
  const bag = new ParamBag();
  const parts = rules
    .filter((rule) => !excludeKeys.includes(rule.key))
    .map((rule) => rule.build(bag))
    .filter((part): part is string => Boolean(part));
  return { sql: parts.length ? `WHERE ${parts.join(' AND ')}` : '', params: bag.values };
};
