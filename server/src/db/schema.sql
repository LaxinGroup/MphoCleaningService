-- MUPHO THE CLEANER — Neon PostgreSQL Schema & Seed Data
-- Run this in the Neon SQL Editor console or via `pnpm seed`.

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL,
  accent      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL
);

-- 2. Services Table (Prices and descriptions can be changed directly in Neon)
CREATE TABLE IF NOT EXISTS services (
  id                 SERIAL PRIMARY KEY,
  category_id        INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  description        TEXT NOT NULL DEFAULT '',
  price_label        TEXT NOT NULL,
  price_from_cents   INTEGER,
  sort_order         INTEGER NOT NULL
);

-- Unique constraint ensuring ON CONFLICT idempotency when updating prices
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_category_name
  ON services (category_id, name);

-- 3. Bookings Table (Strict solo-cleaner cap and single-slot occupancy)
CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id       INTEGER NOT NULL REFERENCES services(id),
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  address          TEXT,
  notes            TEXT,
  -- Calendar date in Africa/Johannesburg (the day the cleaner attends).
  booking_date     DATE NOT NULL,
  slot_id          TEXT NOT NULL,
  slot_start       TIMESTAMPTZ NOT NULL,
  slot_end         TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL DEFAULT 'confirmed'
                   CHECK (status IN ('confirmed', 'cancelled')),
  google_event_id  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_date, slot_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_date_status
  ON bookings (booking_date, status);

-- -------------------------------------------------------------
-- Seed / Upsert Service Categories
-- -------------------------------------------------------------
INSERT INTO service_categories (slug, name, tagline, accent, sort_order)
VALUES
  ('laundry', 'Laundry Services', 'Fresh. Clean. Neat.', 'laundry', 1),
  ('home-cleaning', 'Home Cleaning Services', 'A cleaner home, a healthier you.', 'home', 2),
  ('windows', 'Window Cleaning Services', 'Clear Views. Brighter Spaces.', 'windows', 3),
  ('floors', 'Floor, Carpet & Upholstery', 'Fresh Floors. Revived Spaces.', 'floor', 4),
  ('office', 'Office & Workspace Cleaning', 'Clean Workspaces. Better Productivity.', 'office', 5),
  ('gardening', 'Gardening & Landscaping', 'Greener Spaces. Healthier Lives.', 'garden', 6),
  ('additional', 'Additional Services', 'Let us do the dirty work!', 'extra', 7)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  accent = EXCLUDED.accent,
  sort_order = EXCLUDED.sort_order;

-- -------------------------------------------------------------
-- Seed / Upsert Services & Live Prices
-- Modify any price_label or price_from_cents here or directly in Neon anytime!
-- -------------------------------------------------------------
INSERT INTO services (category_id, name, description, price_label, price_from_cents, sort_order)
VALUES
  -- 1. Laundry Services
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Wash & Fold — Small Basket', 'Everyday wash and fold for a small household load.', 'R100', 10000, 1),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Wash & Fold — Medium Basket', 'Everyday wash and fold for a medium household load.', 'R150', 15000, 2),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Wash & Fold — Large Basket', 'Everyday wash and fold for a large household load.', 'R250', 25000, 3),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Ironing — Small Basket', 'Pressed and folded, ready to wear.', 'R150', 15000, 4),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Ironing — Medium Basket', 'Pressed and folded, ready to wear.', 'R200', 20000, 5),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Ironing — Large Basket', 'Pressed and folded, ready to wear.', 'R300', 30000, 6),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Blanket Wash — Single', 'Gentle wash for a single blanket.', 'R100', 10000, 7),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Blanket Wash — Double', 'Gentle wash for a double blanket.', 'R150', 15000, 8),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Blanket Wash — Queen', 'Gentle wash for a queen blanket.', 'R250', 25000, 9),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Bedding & Linen Wash — Single / Double Bed', 'Sheets, duvet covers and pillowcases.', 'R150', 15000, 10),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Bedding & Linen Wash — Queen Bed', 'Sheets, duvet covers and pillowcases.', 'R250', 25000, 11),
  ((SELECT id FROM service_categories WHERE slug = 'laundry'), 'Kids laundry incl. school uniform', 'Children’s clothing plus school uniform wash.', 'R300', 30000, 12),

  -- 2. Home Cleaning Services
  ((SELECT id FROM service_categories WHERE slug = 'home-cleaning'), 'Spring & Once-off Cleaning', 'Priced on size and number of bedrooms.', 'From R450', 45000, 1),
  ((SELECT id FROM service_categories WHERE slug = 'home-cleaning'), 'Standard Cleaning', 'Priced on number of rooms and property size.', 'From R350', 35000, 2),
  ((SELECT id FROM service_categories WHERE slug = 'home-cleaning'), 'Deep Cleaning — Standard', 'Priced on size, number of rooms and condition.', 'From R700', 70000, 3),
  ((SELECT id FROM service_categories WHERE slug = 'home-cleaning'), 'Specialised Move-in / Move-out / End of tenancy', 'Detailed cleaning of all rooms, kitchen cabinets and bathroom.', 'From R1 700', 170000, 4),

  -- 3. Window Cleaning Services
  ((SELECT id FROM service_categories WHERE slug = 'windows'), 'Glass', 'Discount applies on 4 or more windows.', 'R30', 3000, 1),
  ((SELECT id FROM service_categories WHERE slug = 'windows'), 'Aluminium frames', 'Discount applies on 5 or more frames.', 'From R50', 5000, 2),

  -- 4. Floor, Carpet & Upholstery
  ((SELECT id FROM service_categories WHERE slug = 'floors'), 'Carpet Cleaning', 'Quoted per square metre.', 'From R25 per m²', 2500, 1),
  ((SELECT id FROM service_categories WHERE slug = 'floors'), 'Hard Floor Cleaning', 'Tile, vinyl, laminate — mopping and polish.', 'From R45 per m²', 4500, 2),
  ((SELECT id FROM service_categories WHERE slug = 'floors'), 'Upholstery Cleaning', 'Sofas and chairs, per seat. Fabric care and stain removal.', 'From R300', 30000, 3),

  -- 5. Office & Workspace Cleaning
  ((SELECT id FROM service_categories WHERE slug = 'office'), 'Standard office clean', 'Office areas, desks, dusting, bins, general tidy.', 'From R800', 80000, 1),
  ((SELECT id FROM service_categories WHERE slug = 'office'), 'Deep office clean', 'Vents, fixtures, carpets and high-touch areas.', 'From R1 200', 120000, 2),

  -- 6. Gardening & Landscaping
  ((SELECT id FROM service_categories WHERE slug = 'gardening'), 'Yard tidy', 'Lawn debris, rubbish removal, general yard tidy.', 'R100', 10000, 1),
  ((SELECT id FROM service_categories WHERE slug = 'gardening'), 'Gardening', 'Weeding, pruning, planting and garden maintenance.', 'From R150', 15000, 2),

  -- 7. Additional Services
  ((SELECT id FROM service_categories WHERE slug = 'additional'), 'After Party', 'Post-event clean — bottles, décor, general cleanup.', 'From R400', 40000, 1),
  ((SELECT id FROM service_categories WHERE slug = 'additional'), 'After Funeral & Functions', 'Respectful deep clean after a funeral or function.', 'From R700', 70000, 2),
  ((SELECT id FROM service_categories WHERE slug = 'additional'), 'Deco Cleaning', 'Décor removal, display cleaning and space reset.', 'From R600', 60000, 3),
  ((SELECT id FROM service_categories WHERE slug = 'additional'), 'After Building', 'Post-construction — dust removal, debris, detailed clean.', 'From R800', 80000, 4),
  ((SELECT id FROM service_categories WHERE slug = 'additional'), 'De-cluttering & Storage', 'Organising, sorting, packing, declutter and storage prep.', 'From R350', 35000, 5)

ON CONFLICT (category_id, name) DO UPDATE SET
  description = EXCLUDED.description,
  price_label = EXCLUDED.price_label,
  price_from_cents = EXCLUDED.price_from_cents,
  sort_order = EXCLUDED.sort_order;
