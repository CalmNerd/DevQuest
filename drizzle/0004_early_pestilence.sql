ALTER TABLE "user_achievements" ALTER COLUMN "unlocked_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_achievement_unique" ON "user_achievements" USING btree ("user_id","achievement_id");