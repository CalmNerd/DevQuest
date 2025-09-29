ALTER TABLE "achievements" ADD COLUMN "is_leveled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "is_github_native" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "source" varchar DEFAULT 'custom';--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "current_level" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "current_value" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "next_level_requirement" integer DEFAULT 1;