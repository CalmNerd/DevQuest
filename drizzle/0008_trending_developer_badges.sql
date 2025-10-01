-- Migration: Add Trending Developer Badges table
-- This table tracks users who are/were trending on GitHub
-- Supports leveling system - level increases each time they trend again
-- Date: 2025-10-01

CREATE TABLE "trending_developer_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"time_period" varchar NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"language" varchar,
	"first_trending_at" timestamp with time zone NOT NULL,
	"last_trending_at" timestamp with time zone NOT NULL,
	"last_checked_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "trending_developer_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint

CREATE UNIQUE INDEX "idx_user_trending_period_unique" ON "trending_developer_badges" ("user_id", "time_period");
--> statement-breakpoint

CREATE INDEX "idx_trending_user" ON "trending_developer_badges" ("user_id");
--> statement-breakpoint

CREATE INDEX "idx_trending_current" ON "trending_developer_badges" ("is_current");
--> statement-breakpoint

CREATE INDEX "idx_trending_period" ON "trending_developer_badges" ("time_period");

