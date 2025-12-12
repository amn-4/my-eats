CREATE TABLE "restaurant_tags" (
	"restaurantId" text NOT NULL,
	"tagId" text NOT NULL,
	CONSTRAINT "restaurant_tags_restaurantId_tagId_pk" PRIMARY KEY("restaurantId","tagId")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "restaurant_tags" ADD CONSTRAINT "restaurant_tags_restaurantId_restaurants_id_fk" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_tags" ADD CONSTRAINT "restaurant_tags_tagId_tags_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;