CREATE TABLE "cuisines" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "cuisines_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "dietary_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "dietary_tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "restaurant_dietary_tags" (
	"restaurantId" text NOT NULL,
	"dietaryTagId" text NOT NULL,
	CONSTRAINT "restaurant_dietary_tags_restaurantId_dietaryTagId_pk" PRIMARY KEY("restaurantId","dietaryTagId")
);
--> statement-breakpoint
CREATE TABLE "suburbs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "suburbs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "_prisma_migrations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "_prisma_migrations" CASCADE;--> statement-breakpoint
ALTER TABLE "Restaurant" RENAME TO "restaurants";--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "suburbId" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "cuisineId" text;--> statement-breakpoint
ALTER TABLE "restaurant_dietary_tags" ADD CONSTRAINT "restaurant_dietary_tags_restaurantId_restaurants_id_fk" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_dietary_tags" ADD CONSTRAINT "restaurant_dietary_tags_dietaryTagId_dietary_tags_id_fk" FOREIGN KEY ("dietaryTagId") REFERENCES "public"."dietary_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_suburbId_suburbs_id_fk" FOREIGN KEY ("suburbId") REFERENCES "public"."suburbs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_cuisineId_cuisines_id_fk" FOREIGN KEY ("cuisineId") REFERENCES "public"."cuisines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" DROP COLUMN "suburb";--> statement-breakpoint
ALTER TABLE "restaurants" DROP COLUMN "cuisine";--> statement-breakpoint
ALTER TABLE "restaurants" DROP COLUMN "dietaryTags";