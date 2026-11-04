-- MUPHO THE CLEANER — Neon PostgreSQL schema
-- Run via `pnpm seed` (see src/db/seed.ts).

CREATE TABLE IF NOT EXISTS service_categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL,
  accent      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id                 SERIAL PRIMARY KEY,
  category_id        INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  description        TEXT NOT NULL DEFAULT '',
  price_label        TEXT NOT NULL,
  price_from_cents   INTEGER,
  sort_order         INTEGER NOT NULL
);

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
