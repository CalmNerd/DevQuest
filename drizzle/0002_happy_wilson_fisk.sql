CREATE TABLE "leaderboard_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_type" varchar NOT NULL,
	"session_key" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"update_interval_minutes" integer NOT NULL,
	"last_update_at" timestamp,
	"next_update_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP INDEX "idx_leaderboard_user_period_date";--> statement-breakpoint
ALTER TABLE "leaderboards" ADD COLUMN "session_id" integer NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_session_type_active" ON "leaderboard_sessions" USING btree ("session_type","is_active");--> statement-breakpoint
CREATE INDEX "idx_session_dates" ON "leaderboard_sessions" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_session_key" ON "leaderboard_sessions" USING btree ("session_key");--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_session_id_leaderboard_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."leaderboard_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_leaderboard_session" ON "leaderboards" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_leaderboard_user_session" ON "leaderboards" USING btree ("user_id","session_id");