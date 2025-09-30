import { index, jsonb, pgTable, timestamp, uniqueIndex, varchar, integer, text, serial, boolean } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { relations } from "drizzle-orm"

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { withTimezone: true }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
)

// Users table for authentication and basic profile
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  githubId: varchar("github_id").unique(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  name: varchar("name"),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  githubToken: text("github_token"),
  githubScopes: varchar("github_scopes"),
  githubUrl: varchar("github_url"),
  blogUrl: varchar("blog_url"),
  linkedinUrl: varchar("linkedin_url"),
  twitterUsername: varchar("twitter_username"),
  location: varchar("location"),
  githubCreatedAt: timestamp("github_created_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// Enhanced GitHub stats table for storing comprehensive user statistics
export const githubStats = pgTable("github_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // Contribution metrics (not commits)
  dailyContributions: integer("daily_contributions").default(0),
  weeklyContributions: integer("weekly_contributions").default(0),
  monthlyContributions: integer("monthly_contributions").default(0),
  yearlyContributions: integer("yearly_contributions").default(0),
  last365Contributions: integer("last_365_contributions").default(0),
  thisYearContributions: integer("this_year_contributions").default(0),
  overallContributions: integer("overall_contributions").default(0),
  points: integer("points").default(0),

  // Basic stats
  totalStars: integer("total_stars").default(0),
  totalForks: integer("total_forks").default(0),
  contributedTo: integer("contributed_to").default(0),
  totalRepositories: integer("total_repositories").default(0),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  topLanguage: varchar("top_language"),
  languageStats: jsonb("language_stats"),
  contributionGraph: jsonb("contribution_graph"),

  // New fields for comprehensive achievements
  totalCommits: integer("total_commits").default(0),
  meaningfulCommits: integer("meaningful_commits").default(0), // additions > deletions
  totalPullRequests: integer("total_pull_requests").default(0),
  mergedPullRequests: integer("merged_pull_requests").default(0),
  totalIssues: integer("total_issues").default(0),
  closedIssues: integer("closed_issues").default(0),
  totalReviews: integer("total_reviews").default(0),
  externalContributors: integer("external_contributors").default(0), // repos with external contributors
  reposWithStars: integer("repos_with_stars").default(0), // repos with stars
  reposWithForks: integer("repos_with_forks").default(0), // repos with forks
  dependencyUsage: integer("dependency_usage").default(0), // repos reused as dependencies
  languageCount: integer("language_count").default(0), // number of languages contributed in
  topLanguagePercentage: integer("top_language_percentage").default(0), // % of contributions in top language
  rareLanguageRepos: integer("rare_language_repos").default(0), // repos in rare languages

  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }).defaultNow(),
  lastIncrementalFetch: timestamp("last_incremental_fetch", { withTimezone: true }), // Track last incremental fetch
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// Enhanced achievements table for defining available achievements with tiers
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // commit_streak, languages, stars, contributions, etc.
  icon: varchar("icon").notNull(),
  rarity: varchar("rarity").notNull().default("common"), // common, rare, epic, legendary
  tier: varchar("tier").notNull().default("bronze"), // bronze, silver, gold, platinum, diamond, legendary
  criteria: jsonb("criteria").notNull(), // JSON object defining unlock criteria
  points: integer("points").default(0), // Points awarded for unlocking this achievement
  isLeveled: boolean("is_leveled").default(false), // Whether this achievement supports infinite levels
  isGitHubNative: boolean("is_github_native").default(false), // GitHub native achievements
  source: varchar("source").default("custom"), // github, custom, trending, community
  isActive: boolean("is_active").default(true), // Whether achievement is active
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// User achievements table for tracking unlocked achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  achievementId: integer("achievement_id")
    .notNull()
    .references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }),
  progress: integer("progress").default(0), // Current progress towards achievement
  maxProgress: integer("max_progress").default(1), // Target progress needed
  currentLevel: integer("current_level").default(1), // Current level for leveled achievements
  currentValue: integer("current_value").default(0), // Current raw value (followers, stars, etc.)
  nextLevelRequirement: integer("next_level_requirement").default(1), // Value needed for next level
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex("idx_user_achievement_unique").on(table.userId, table.achievementId),
])

// Leaderboard sessions table for managing contest-like sessions
export const leaderboardSessions = pgTable(
  "leaderboard_sessions",
  {
    id: serial("id").primaryKey(),
    sessionType: varchar("session_type").notNull(), // daily, weekly, monthly, yearly, overall
    sessionKey: varchar("session_key").notNull(), // unique identifier for the session
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").default(true),
    updateIntervalMinutes: integer("update_interval_minutes").notNull(), // 5, 360, 720, 1440, 10080
    lastUpdateAt: timestamp("last_update_at", { withTimezone: true }),
    nextUpdateAt: timestamp("next_update_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_session_type_active").on(table.sessionType, table.isActive),
    index("idx_session_dates").on(table.startDate, table.endDate),
    uniqueIndex("idx_session_key").on(table.sessionKey),
  ],
)

// Leaderboards table for tracking different leaderboard periods
export const leaderboards = pgTable(
  "leaderboards",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: integer("session_id")
      .notNull()
      .references(() => leaderboardSessions.id, { onDelete: "cascade" }),
    period: varchar("period").notNull(), // daily, weekly, monthly, yearly, overall
    periodDate: varchar("period_date").notNull(), // YYYY-MM-DD for daily, YYYY-WW for weekly, etc.
    commits: integer("commits").default(0),
    score: integer("score").default(0), // Points used for power level (not for ranking)
    rank: integer("rank"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_leaderboard_period_date").on(table.period, table.periodDate),
    index("idx_leaderboard_rank").on(table.rank),
    index("idx_leaderboard_session").on(table.sessionId),
    uniqueIndex("idx_leaderboard_user_session").on(table.userId, table.sessionId),
  ],
)

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  githubStats: one(githubStats),
  achievements: many(userAchievements),
  leaderboardEntries: many(leaderboards),
}))

export const githubStatsRelations = relations(githubStats, ({ one }) => ({
  user: one(users, {
    fields: [githubStats.userId],
    references: [users.id],
  }),
}))

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}))

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}))

export const leaderboardSessionsRelations = relations(leaderboardSessions, ({ many }) => ({
  leaderboardEntries: many(leaderboards),
}))

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  user: one(users, {
    fields: [leaderboards.userId],
    references: [users.id],
  }),
  session: one(leaderboardSessions, {
    fields: [leaderboards.sessionId],
    references: [leaderboardSessions.id],
  }),
}))

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
})

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
})

export const insertGithubStatsSchema = createInsertSchema(githubStats).omit({
  id: true,
  lastFetchedAt: true,
  updatedAt: true,
})

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
})

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
})

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const insertLeaderboardSessionSchema = createInsertSchema(leaderboardSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// Types
export type UpsertUser = typeof users.$inferInsert
export type User = typeof users.$inferSelect
export type GithubStats = typeof githubStats.$inferSelect
export type InsertGithubStats = typeof githubStats.$inferInsert
export type Achievement = typeof achievements.$inferSelect
export type InsertAchievement = typeof achievements.$inferInsert
export type UserAchievement = typeof userAchievements.$inferSelect
export type InsertUserAchievement = typeof userAchievements.$inferInsert
export type Leaderboard = typeof leaderboards.$inferSelect
export type InsertLeaderboard = typeof leaderboards.$inferInsert
export type LeaderboardSession = typeof leaderboardSessions.$inferSelect
export type InsertLeaderboardSession = typeof leaderboardSessions.$inferInsert
