CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"icon" varchar NOT NULL,
	"rarity" varchar DEFAULT 'common' NOT NULL,
	"tier" varchar DEFAULT 'bronze' NOT NULL,
	"criteria" jsonb NOT NULL,
	"points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "github_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"daily_contributions" integer DEFAULT 0,
	"weekly_contributions" integer DEFAULT 0,
	"monthly_contributions" integer DEFAULT 0,
	"yearly_contributions" integer DEFAULT 0,
	"last_365_contributions" integer DEFAULT 0,
	"this_year_contributions" integer DEFAULT 0,
	"overall_contributions" integer DEFAULT 0,
	"points" integer DEFAULT 0,
	"total_stars" integer DEFAULT 0,
	"total_forks" integer DEFAULT 0,
	"contributed_to" integer DEFAULT 0,
	"total_repositories" integer DEFAULT 0,
	"followers" integer DEFAULT 0,
	"following" integer DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"top_language" varchar,
	"language_stats" jsonb,
	"contribution_graph" jsonb,
	"total_commits" integer DEFAULT 0,
	"meaningful_commits" integer DEFAULT 0,
	"total_pull_requests" integer DEFAULT 0,
	"merged_pull_requests" integer DEFAULT 0,
	"total_issues" integer DEFAULT 0,
	"closed_issues" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"external_contributors" integer DEFAULT 0,
	"repos_with_stars" integer DEFAULT 0,
	"repos_with_forks" integer DEFAULT 0,
	"dependency_usage" integer DEFAULT 0,
	"language_count" integer DEFAULT 0,
	"top_language_percentage" integer DEFAULT 0,
	"rare_language_repos" integer DEFAULT 0,
	"last_fetched_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "github_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"period" varchar NOT NULL,
	"period_date" varchar NOT NULL,
	"commits" integer DEFAULT 0,
	"score" integer DEFAULT 0,
	"rank" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_id" integer NOT NULL,
	"unlocked_at" timestamp DEFAULT now(),
	"progress" integer DEFAULT 0,
	"max_progress" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"github_id" varchar,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"name" varchar,
	"bio" text,
	"profile_image_url" varchar,
	"username" varchar,
	"github_token" text,
	"github_url" varchar,
	"blog_url" varchar,
	"linkedin_url" varchar,
	"twitter_username" varchar,
	"location" varchar,
	"github_created_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "github_stats" ADD CONSTRAINT "github_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_leaderboard_period_date" ON "leaderboards" USING btree ("period","period_date");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_rank" ON "leaderboards" USING btree ("rank");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_leaderboard_user_period_date" ON "leaderboards" USING btree ("user_id","period","period_date");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");