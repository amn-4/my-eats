// drizzle\schema.ts

import { pgTable, text, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const suburbs = pgTable("suburbs", {
  id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text().notNull().unique(),
  createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const cuisines = pgTable("cuisines", {
  id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text().notNull().unique(),
  createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const dietaryTags = pgTable("dietary_tags", {
  id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text().notNull().unique(),
  createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const restaurants = pgTable("restaurants", {
  id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  suburbId: text().references(() => suburbs.id),
  cuisineId: text().references(() => cuisines.id),
  openingHours: jsonb(),
  source: text(),
  url: text(),
  createdAt: timestamp({ precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const restaurantDietaryTags = pgTable("restaurant_dietary_tags", {
  restaurantId: text().references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  dietaryTagId: text().references(() => dietaryTags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.restaurantId, table.dietaryTagId] }),
}));