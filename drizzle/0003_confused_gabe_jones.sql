ALTER TABLE "achievements" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "github_stats" ALTER COLUMN "last_fetched_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "github_stats" ALTER COLUMN "last_fetched_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "github_stats" ALTER COLUMN "last_incremental_fetch" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "github_stats" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "github_stats" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "leaderboard_sessions" ALTER COLUMN "start_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leaderboard_sessions" ALTER COLUMN "end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leaderboard_sessions" ALTER COLUMN "last_update_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leaderboard_sessions" ALTER COLUMN "next_update_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leaderboard_sessions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leaderboard_sessions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "leaderboard_sessions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leaderboard_sessions" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "leaderboards" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leaderboards" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "leaderboards" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leaderboards" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "expire" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "unlocked_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "unlocked_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "github_created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();