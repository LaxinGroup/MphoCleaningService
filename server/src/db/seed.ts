import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { CATALOG } from "../data/catalog.ts";
import { env } from "../config/env.ts";

const here = path.dirname(fileURLToPath(import.meta.url));

async function seed(): Promise<void> {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required to seed Neon.");
  }

  const sql = neon(env.databaseUrl);
  const schema = await readFile(path.join(here, "schema.sql"), "utf8");

  for (const statement of schema
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)) {
    await sql.query(statement);
  }

  for (const [cIndex, category] of CATALOG.entries()) {
    const rows = (await sql`
      INSERT INTO service_categories (slug, name, tagline, accent, sort_order)
      VALUES (
        ${category.slug},
        ${category.name},
        ${category.tagline},
        ${category.accent},
        ${cIndex + 1}
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        tagline = EXCLUDED.tagline,
        accent = EXCLUDED.accent,
        sort_order = EXCLUDED.sort_order
      RETURNING id
    `) as { id: number }[];

    const categoryId = rows[0].id;

    // Upsert (never delete) so service ids referenced by bookings stay valid.
    for (const [sIndex, service] of category.services.entries()) {
      await sql`
        INSERT INTO services (
          category_id, name, description, price_label, price_from_cents, sort_order
        ) VALUES (
          ${categoryId},
          ${service.name},
          ${service.description},
          ${service.priceLabel},
          ${service.priceFromCents},
          ${sIndex + 1}
        )
        ON CONFLICT (category_id, name) DO UPDATE SET
          description = EXCLUDED.description,
          price_label = EXCLUDED.price_label,
          price_from_cents = EXCLUDED.price_from_cents,
          sort_order = EXCLUDED.sort_order
      `;
    }
  }

  console.log(`Seeded ${CATALOG.length} MUPHO service categories into Neon.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
