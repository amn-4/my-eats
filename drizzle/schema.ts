// drizzle\schema.ts

import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const restaurants = pgTable("Restaurant", {
  id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  suburb: text(),
  cuisine: text(),
  openingHours: jsonb(),
  dietaryTags: text().array().default(sql`ARRAY[]::text[]`),
  source: text(),
  url: text(),
  createdAt: timestamp({ precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});
