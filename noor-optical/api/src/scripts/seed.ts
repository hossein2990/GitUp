import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { pool, queryOne, waitForDatabase } from '../db.js';
import { DEFAULT_SETTINGS } from '../routes/content.js';
import {
  SEED_BRANDS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_SERVICES,
  type SeedImage,
} from '../db/seed-data.js';

/**
 * Idempotent, non-destructive seed.
 *
 * Missing rows are inserted; existing rows are left untouched so edits made in
 * the admin panel survive container restarts. Re-running is safe.
 */

const insertCategories = async () => {
  for (const category of SEED_CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (slug, family, name_en, name_fa, tagline_en, tagline_fa,
                               description_en, description_fa, image_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (slug) DO NOTHING`,
      [
        category.slug,
        category.family,
        category.nameEn,
        category.nameFa,
        category.taglineEn,
        category.taglineFa,
        category.descriptionEn,
        category.descriptionFa,
        category.imageUrl,
        category.sortOrder,
      ],
    );
  }
};

const insertBrands = async () => {
  for (const brand of SEED_BRANDS) {
    await pool.query(
      `INSERT INTO brands (slug, name, name_fa, country, description_en, description_fa, image_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO NOTHING`,
      [
        brand.slug,
        brand.name,
        brand.nameFa,
        brand.country,
        brand.descriptionEn,
        brand.descriptionFa,
        brand.imageUrl,
        brand.sortOrder,
      ],
    );
  }
};

const insertServices = async () => {
  for (const service of SEED_SERVICES) {
    await pool.query(
      `INSERT INTO services (slug, name_en, name_fa, summary_en, summary_fa, description_en,
                             description_fa, duration_en, duration_fa, price_from, image_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (slug) DO NOTHING`,
      [
        service.slug,
        service.nameEn,
        service.nameFa,
        service.summaryEn,
        service.summaryFa,
        service.descriptionEn,
        service.descriptionFa,
        service.durationEn,
        service.durationFa,
        service.priceFrom,
        service.imageUrl,
        service.sortOrder,
      ],
    );
  }
};

const insertProducts = async () => {
  for (const product of SEED_PRODUCTS) {
    const brand = await queryOne<{ id: number }>('SELECT id FROM brands WHERE slug = $1', [
      product.brandSlug,
    ]);
    const category = await queryOne<{ id: number }>('SELECT id FROM categories WHERE slug = $1', [
      product.categorySlug,
    ]);

    const row = await queryOne<{ id: number }>(
      `INSERT INTO products (slug, sku, name_en, name_fa, summary_en, summary_fa, description_en,
                             description_fa, brand_id, category_id, price, currency, gender, shape,
                             material, frame_size, lens_color, uv_protection, polarized,
                             prescription_compatible, specs, images, included_accessories,
                             is_featured, is_new)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'IRT',$12,$13,$14,$15,$16,$17,$18,$19,
               $20::jsonb,$21::jsonb,$22::jsonb,$23,$24)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [
        product.slug,
        product.sku,
        product.nameEn,
        product.nameFa,
        product.summaryEn,
        product.summaryFa,
        product.descriptionEn,
        product.descriptionFa,
        brand?.id ?? null,
        category?.id ?? null,
        product.price,
        product.gender,
        product.shape ?? null,
        product.material ?? null,
        product.frameSize ?? null,
        product.lensColor ?? null,
        product.uvProtection ?? null,
        product.polarized ?? false,
        product.prescriptionCompatible ?? true,
        JSON.stringify(product.specs ?? {}),
        JSON.stringify(product.images),
        JSON.stringify(product.includedAccessories ?? []),
        product.isFeatured ?? false,
        product.isNew ?? false,
      ],
    );

    // Existing product (or fresh insert): only add variants when it has none.
    const target = row ?? (await queryOne<{ id: number }>('SELECT id FROM products WHERE slug = $1', [product.slug]));
    if (!target) continue;

    const variantCount = await queryOne<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM product_variants WHERE product_id = $1',
      [target.id],
    );
    if ((variantCount?.count ?? 0) > 0) continue;

    let order = 0;
    for (const variant of product.variants) {
      order += 1;
      await pool.query(
        `INSERT INTO product_variants (product_id, color_name_en, color_name_fa, color_hex, sku,
                                       stock, images, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
        [
          target.id,
          variant.colorNameEn,
          variant.colorNameFa,
          variant.colorHex,
          variant.sku,
          variant.stock,
          JSON.stringify(variant.images as SeedImage[]),
          order,
        ],
      );
    }
  }
};

const insertSettings = async () => {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(value)],
    );
  }
};

const insertAdmin = async () => {
  const existing = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM customers WHERE role = 'admin'`,
  );
  if ((existing?.count ?? 0) > 0) return;
  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  await pool.query(
    `INSERT INTO customers (email, password_hash, full_name, role)
     VALUES ($1,$2,$3,'admin')
     ON CONFLICT (email) DO NOTHING`,
    [config.adminEmail, passwordHash, 'NOOR OPTICAL staff'],
  );
  console.log(`[seed] created staff account ${config.adminEmail}`);
};

const seed = async () => {
  await waitForDatabase();
  await insertCategories();
  await insertBrands();
  await insertServices();
  await insertProducts();
  await insertSettings();
  await insertAdmin();

  const counts = await queryOne<{ products: number; variants: number; categories: number }>(
    `SELECT (SELECT COUNT(*)::int FROM products) AS products,
            (SELECT COUNT(*)::int FROM product_variants) AS variants,
            (SELECT COUNT(*)::int FROM categories) AS categories`,
  );
  console.log(
    `[seed] catalogue ready — ${counts?.products ?? 0} products, ${counts?.variants ?? 0} variants, ${counts?.categories ?? 0} categories`,
  );
  await pool.end();
};

seed().catch(async (error) => {
  console.error('[seed] failed', error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
