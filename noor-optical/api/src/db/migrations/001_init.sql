-- NOOR OPTICAL storefront schema.
-- Applied by `npm run db:migrate`; safe to run repeatedly.

CREATE TABLE IF NOT EXISTS categories (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  family         TEXT NOT NULL DEFAULT 'frames',   -- frames | lenses | contacts | accessories
  name_en        TEXT NOT NULL,
  name_fa        TEXT NOT NULL,
  tagline_en     TEXT,
  tagline_fa     TEXT,
  description_en TEXT,
  description_fa TEXT,
  image_url      TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS brands (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  name_fa        TEXT,
  country        TEXT,
  description_en TEXT,
  description_fa TEXT,
  image_url      TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products (
  id                       SERIAL PRIMARY KEY,
  slug                     TEXT NOT NULL UNIQUE,
  sku                      TEXT NOT NULL UNIQUE,
  name_en                  TEXT NOT NULL,
  name_fa                  TEXT NOT NULL,
  summary_en               TEXT,
  summary_fa               TEXT,
  description_en           TEXT,
  description_fa           TEXT,
  brand_id                 INTEGER REFERENCES brands(id) ON DELETE SET NULL,
  category_id              INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price                    NUMERIC(12, 2) NOT NULL,
  sale_price               NUMERIC(12, 2),
  currency                 TEXT NOT NULL DEFAULT 'IRT',
  gender                   TEXT,        -- men | women | unisex | kids
  shape                    TEXT,
  material                 TEXT,
  frame_size               TEXT,
  lens_color               TEXT,
  uv_protection            TEXT,
  polarized                BOOLEAN NOT NULL DEFAULT FALSE,
  prescription_compatible  BOOLEAN NOT NULL DEFAULT TRUE,
  specs                    JSONB NOT NULL DEFAULT '{}'::jsonb,
  images                   JSONB NOT NULL DEFAULT '[]'::jsonb,
  included_accessories     JSONB NOT NULL DEFAULT '[]'::jsonb,
  warranty_en              TEXT,
  warranty_fa              TEXT,
  is_featured              BOOLEAN NOT NULL DEFAULT FALSE,
  is_new                   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name_en  TEXT NOT NULL,
  color_name_fa  TEXT NOT NULL,
  color_hex      TEXT,
  sku            TEXT NOT NULL,
  price          NUMERIC(12, 2),
  sale_price     NUMERIC(12, 2),
  stock          INTEGER NOT NULL DEFAULT 0,
  images         JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name_en        TEXT NOT NULL,
  name_fa        TEXT NOT NULL,
  summary_en     TEXT,
  summary_fa     TEXT,
  description_en TEXT,
  description_fa TEXT,
  duration_en    TEXT,
  duration_fa    TEXT,
  price_from     NUMERIC(12, 2),
  image_url      TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customers (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'customer',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                  SERIAL PRIMARY KEY,
  order_number        TEXT NOT NULL UNIQUE,
  customer_id         INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT NOT NULL,
  address             TEXT,
  city                TEXT,
  postal_code         TEXT,
  delivery_method     TEXT NOT NULL DEFAULT 'delivery',
  prescription_status TEXT NOT NULL DEFAULT 'later',   -- uploaded | later | not_required
  note                TEXT,
  subtotal            NUMERIC(12, 2) NOT NULL,
  shipping            NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total               NUMERIC(12, 2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'IRT',
  status              TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | preparing | shipped | delivered | cancelled
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id             SERIAL PRIMARY KEY,
  order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  variant_id     INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  slug           TEXT,
  name_en        TEXT NOT NULL,
  name_fa        TEXT NOT NULL,
  brand_name     TEXT,
  color_name_en  TEXT,
  color_name_fa  TEXT,
  image_url      TEXT,
  sku            TEXT,
  unit_price     NUMERIC(12, 2) NOT NULL,
  quantity       INTEGER NOT NULL,
  line_total     NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id             SERIAL PRIMARY KEY,
  full_name      TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  service_slug   TEXT,
  service_name   TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'requested',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand_id);
CREATE INDEX IF NOT EXISTS products_active_idx ON products (is_active, is_featured);
CREATE INDEX IF NOT EXISTS products_specs_idx ON products USING GIN (specs);
CREATE INDEX IF NOT EXISTS variants_product_idx ON product_variants (product_id);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
