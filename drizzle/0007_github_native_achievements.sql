-- Migration: Add GitHub Native Achievements table
-- This table stores scraped GitHub achievements from user profiles
-- Date: 2025-10-01

CREATE TABLE "github_native_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"name" varchar NOT NULL,
	"image" text NOT NULL,
	"tier" varchar,
	"description" text,
	"fetched_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "github_native_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint

CREATE UNIQUE INDEX "idx_user_github_achievement_unique" ON "github_native_achievements" ("user_id", "slug");
--> statement-breakpoint

CREATE INDEX "idx_github_achievement_user" ON "github_native_achievements" ("user_id");

