ALTER TABLE "dietary_tags" RENAME TO "dietary_reqs";--> statement-breakpoint
ALTER TABLE "restaurant_dietary_tags" RENAME TO "restaurant_dietary_reqs";--> statement-breakpoint
ALTER TABLE "restaurant_dietary_reqs" RENAME COLUMN "dietaryTagId" TO "dietaryReqId";--> statement-breakpoint
ALTER TABLE "dietary_reqs" DROP CONSTRAINT "dietary_tags_name_unique";--> statement-breakpoint
ALTER TABLE "restaurant_dietary_reqs" DROP CONSTRAINT "restaurant_dietary_tags_restaurantId_restaurants_id_fk";
--> statement-breakpoint
ALTER TABLE "restaurant_dietary_reqs" DROP CONSTRAINT "restaurant_dietary_tags_dietaryTagId_dietary_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "restaurant_dietary_reqs" DROP CONSTRAINT "restaurant_dietary_tags_restaurantId_dietaryTagId_pk";--> statement-breakpoint
ALTER TABLE "restaurant_dietary_reqs" ADD CONSTRAINT "restaurant_dietary_reqs_restaurantId_dietaryReqId_pk" PRIMARY KEY("restaurantId","dietaryReqId");--> statement-breakpoint
ALTER TABLE "restaurant_dietary_reqs" ADD CONSTRAINT "restaurant_dietary_reqs_restaurantId_restaurants_id_fk" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_dietary_reqs" ADD CONSTRAINT "restaurant_dietary_reqs_dietaryReqId_dietary_reqs_id_fk" FOREIGN KEY ("dietaryReqId") REFERENCES "public"."dietary_reqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dietary_reqs" ADD CONSTRAINT "dietary_reqs_name_unique" UNIQUE("name");