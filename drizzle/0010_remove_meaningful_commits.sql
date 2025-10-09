CREATE TABLE "github_native_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"name" varchar NOT NULL,
	"image" text NOT NULL,
	"tier" varchar,
	"description" text,
	"fetched_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trending_developer_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"time_period" varchar NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"current_rank" integer,
	"best_rank" integer,
	"language" varchar,
	"first_trending_at" timestamp with time zone NOT NULL,
	"last_trending_at" timestamp with time zone NOT NULL,
	"last_checked_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "github_native_achievements" ADD CONSTRAINT "github_native_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trending_developer_badges" ADD CONSTRAINT "trending_developer_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_github_achievement_unique" ON "github_native_achievements" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "idx_github_achievement_user" ON "github_native_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_trending_period_unique" ON "trending_developer_badges" USING btree ("user_id","time_period");--> statement-breakpoint
CREATE INDEX "idx_trending_user" ON "trending_developer_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_trending_current" ON "trending_developer_badges" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "idx_trending_period" ON "trending_developer_badges" USING btree ("time_period");--> statement-breakpoint
ALTER TABLE "github_stats" DROP COLUMN "meaningful_commits";