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

export const dietaryReqs = pgTable("dietary_reqs", {
  id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text().notNull().unique(),
  createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const tags = pgTable("tags", {
  id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text().notNull().unique(),
  createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const restaurants = pgTable("restaurants", {
  id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text().notNull(),
  name: text().notNull(),
  suburbId: text().references(() => suburbs.id),
  cuisineId: text().references(() => cuisines.id),

  // google places data
  googlePlaceId: text(),
  googleMapsUrl: text(),
  address: text(),
  phone: text(),
  openingHours: jsonb(),

  // social media
  source: text(),
  url: text(),
  
  createdAt: timestamp({ precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const restaurantDietaryReqs = pgTable("restaurant_dietary_reqs", {
  restaurantId: text().references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  dietaryReqId: text().references(() => dietaryReqs.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.restaurantId, table.dietaryReqId] }),
}));

export const restaurantTags = pgTable("restaurant_tags", {
  restaurantId: text().references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  tagId: text().references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.restaurantId, table.tagId] }),
}));