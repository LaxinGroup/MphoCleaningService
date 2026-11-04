import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG } from "../data/catalog.ts";
import { env } from "../config/env.ts";
import type {
  BookingRecord,
  ServiceCategory,
  ServiceItem,
  SlotId,
} from "../types.ts";

type Sql = ReturnType<typeof neon>;

export type NewBooking = {
  serviceId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string | null;
  notes: string | null;
  bookingDate: string;
  slotId: SlotId;
  slotStart: Date;
  slotEnd: Date;
  googleEventId: string | null;
};

type MemoryState = {
  categories: ServiceCategory[];
  bookings: BookingRecord[];
};

function seedMemory(): MemoryState {
  const categories: ServiceCategory[] = CATALOG.map((category, cIndex) => {
    const id = cIndex + 1;
    const services: ServiceItem[] = category.services.map((service, sIndex) => ({
      id: cIndex * 100 + sIndex + 1,
      categoryId: id,
      name: service.name,
      description: service.description,
      priceLabel: service.priceLabel,
      priceFromCents: service.priceFromCents,
      sortOrder: sIndex + 1,
    }));
    return {
      id,
      slug: category.slug,
      name: category.name,
      tagline: category.tagline,
      accent: category.accent,
      sortOrder: cIndex + 1,
      services,
    };
  });
  return { categories, bookings: [] };
}

function mapBooking(row: Record<string, unknown>): BookingRecord {
  return {
    id: String(row.id),
    serviceId: Number(row.service_id),
    customerName: String(row.customer_name),
    customerEmail: String(row.customer_email),
    customerPhone: String(row.customer_phone),
    address: row.address ? String(row.address) : null,
    notes: row.notes ? String(row.notes) : null,
    bookingDate:
      row.booking_date instanceof Date
        ? row.booking_date.toISOString().slice(0, 10)
        : String(row.booking_date).slice(0, 10),
    slotId: String(row.slot_id) as SlotId,
    slotStart: new Date(String(row.slot_start)).toISOString(),
    slotEnd: new Date(String(row.slot_end)).toISOString(),
    status: row.status === "cancelled" ? "cancelled" : "confirmed",
    googleEventId: row.google_event_id ? String(row.google_event_id) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export type Database = {
  mode: "neon" | "memory";
  listCategories(): Promise<ServiceCategory[]>;
  getService(id: number): Promise<ServiceItem | null>;
  countBookingsOnDate(isoDate: string): Promise<number>;
  listBookingsOnDate(isoDate: string): Promise<BookingRecord[]>;
  insertBookingIfUnderCap(
    input: NewBooking,
    cap: number,
  ): Promise<BookingRecord | "cap" | "slot_taken">;
  attachGoogleEvent(bookingId: string, eventId: string): Promise<void>;
  deleteBooking(bookingId: string): Promise<void>;
};

function memoryDb(state: MemoryState): Database {
  return {
    mode: "memory",
    async listCategories() {
      return state.categories;
    },
    async getService(id) {
      for (const category of state.categories) {
        const found = category.services.find((service) => service.id === id);
        if (found) return found;
      }
      return null;
    },
    async countBookingsOnDate(isoDate) {
      return state.bookings.filter(
        (booking) =>
          booking.bookingDate === isoDate && booking.status === "confirmed",
      ).length;
    },
    async listBookingsOnDate(isoDate) {
      return state.bookings.filter(
        (booking) =>
          booking.bookingDate === isoDate && booking.status === "confirmed",
      );
    },
    async insertBookingIfUnderCap(input, cap) {
      const confirmed = state.bookings.filter(
        (booking) =>
          booking.bookingDate === input.bookingDate &&
          booking.status === "confirmed",
      );
      if (confirmed.length >= cap) return "cap";
      if (confirmed.some((booking) => booking.slotId === input.slotId)) {
        return "slot_taken";
      }
      const record: BookingRecord = {
        id: randomUUID(),
        serviceId: input.serviceId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        address: input.address,
        notes: input.notes,
        bookingDate: input.bookingDate,
        slotId: input.slotId,
        slotStart: input.slotStart.toISOString(),
        slotEnd: input.slotEnd.toISOString(),
        status: "confirmed",
        googleEventId: input.googleEventId,
        createdAt: new Date().toISOString(),
      };
      state.bookings.push(record);
      return record;
    },
    async attachGoogleEvent(bookingId, eventId) {
      const found = state.bookings.find((booking) => booking.id === bookingId);
      if (found) found.googleEventId = eventId;
    },
    async deleteBooking(bookingId) {
      state.bookings = state.bookings.filter(
        (booking) => booking.id !== bookingId,
      );
    },
  };
}

let seedPromise: Promise<void> | null = null;

async function ensureNeonSeeded(sql: Sql): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const here = path.dirname(fileURLToPath(import.meta.url));
      const schema = await readFile(path.join(here, "schema.sql"), "utf8");
      const statements = schema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await sql.query(statement);
      }
      console.log("[mupho] Auto-seeded Neon database tables and pricing catalogue.");
    } catch (error) {
      console.error("[mupho] Failed to auto-seed Neon schema:", error);
    }
  })();
  return seedPromise;
}

function neonDb(sql: Sql): Database {
  return {
    mode: "neon",
    async listCategories() {
      let categories: Record<string, unknown>[] = [];
      try {
        categories = (await sql`
          SELECT id, slug, name, tagline, accent, sort_order
          FROM service_categories
          ORDER BY sort_order ASC
        `) as Record<string, unknown>[];
      } catch (err: unknown) {
        console.warn("[mupho] service_categories query failed, auto-initializing schema in Neon...");
        await ensureNeonSeeded(sql);
        categories = (await sql`
          SELECT id, slug, name, tagline, accent, sort_order
          FROM service_categories
          ORDER BY sort_order ASC
        `) as Record<string, unknown>[];
      }

      if (categories.length === 0) {
        console.log("[mupho] Neon service_categories table is empty, auto-populating initial catalogue...");
        await ensureNeonSeeded(sql);
        categories = (await sql`
          SELECT id, slug, name, tagline, accent, sort_order
          FROM service_categories
          ORDER BY sort_order ASC
        `) as Record<string, unknown>[];
      }

      const services = (await sql`
        SELECT id, category_id, name, description, price_label, price_from_cents, sort_order
        FROM services
        ORDER BY sort_order ASC
      `) as Record<string, unknown>[];

      return categories.map((category) => ({
        id: Number(category.id),
        slug: String(category.slug),
        name: String(category.name),
        tagline: String(category.tagline),
        accent: category.accent as ServiceCategory["accent"],
        sortOrder: Number(category.sort_order),
        services: services
          .filter((service) => Number(service.category_id) === Number(category.id))
          .map((service) => ({
            id: Number(service.id),
            categoryId: Number(service.category_id),
            name: String(service.name),
            description: String(service.description),
            priceLabel: String(service.price_label),
            priceFromCents:
              service.price_from_cents === null
                ? null
                : Number(service.price_from_cents),
            sortOrder: Number(service.sort_order),
          })),
      }));
    },
    async getService(id) {
      const rows = (await sql`
        SELECT id, category_id, name, description, price_label, price_from_cents, sort_order
        FROM services
        WHERE id = ${id}
        LIMIT 1
      `) as Record<string, unknown>[];
      const service = rows[0];
      if (!service) return null;
      return {
        id: Number(service.id),
        categoryId: Number(service.category_id),
        name: String(service.name),
        description: String(service.description),
        priceLabel: String(service.price_label),
        priceFromCents:
          service.price_from_cents === null
            ? null
            : Number(service.price_from_cents),
        sortOrder: Number(service.sort_order),
      };
    },
    /**
     * 3-booking cap: group confirmed rows by booking_date and count.
     * The DATE column is the SAST calendar day, never a guessed UTC midnight.
     */
    async countBookingsOnDate(isoDate) {
      const rows = (await sql`
        SELECT booking_date, COUNT(*)::int AS booking_count
        FROM bookings
        WHERE booking_date = ${isoDate}::date
          AND status <> 'cancelled'
        GROUP BY booking_date
      `) as { booking_count: number }[];
      return rows[0]?.booking_count ?? 0;
    },
    async listBookingsOnDate(isoDate) {
      const rows = (await sql`
        SELECT *
        FROM bookings
        WHERE booking_date = ${isoDate}::date
          AND status <> 'cancelled'
      `) as Record<string, unknown>[];
      return rows.map(mapBooking);
    },
    async insertBookingIfUnderCap(input, cap) {
      try {
        const rows = (await sql`
          INSERT INTO bookings (
            service_id, customer_name, customer_email, customer_phone,
            address, notes, booking_date, slot_id, slot_start, slot_end,
            status, google_event_id
          )
          SELECT
            ${input.serviceId},
            ${input.customerName},
            ${input.customerEmail},
            ${input.customerPhone},
            ${input.address},
            ${input.notes},
            ${input.bookingDate}::date,
            ${input.slotId},
            ${input.slotStart.toISOString()}::timestamptz,
            ${input.slotEnd.toISOString()}::timestamptz,
            'confirmed',
            ${input.googleEventId}
          WHERE (
            SELECT COUNT(*)
            FROM bookings
            WHERE booking_date = ${input.bookingDate}::date
              AND status <> 'cancelled'
          ) < ${cap}
          RETURNING *
        `) as Record<string, unknown>[];

        if (!rows[0]) return "cap";
        return mapBooking(rows[0]);
      } catch (error) {
        const code =
          typeof error === "object" && error && "code" in error
            ? String((error as { code: unknown }).code)
            : "";
        if (code === "23505") return "slot_taken";
        throw error;
      }
    },
    async attachGoogleEvent(bookingId, eventId) {
      await sql`
        UPDATE bookings
        SET google_event_id = ${eventId}
        WHERE id = ${bookingId}::uuid
      `;
    },
    async deleteBooking(bookingId) {
      await sql`
        DELETE FROM bookings WHERE id = ${bookingId}::uuid
      `;
    },
  };
}

export const db: Database = env.databaseUrl
  ? neonDb(neon(env.databaseUrl))
  : memoryDb(seedMemory());

if (db.mode === "memory") {
  console.warn(
    "[mupho] DATABASE_URL is not set — using in-memory catalogue and bookings. Seed Neon before production.",
  );
}
