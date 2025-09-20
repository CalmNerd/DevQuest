import {
  users,
  githubStats,
  achievements,
  userAchievements,
  leaderboards,
  type User,
  type UpsertUser,
  type GithubStats,
  type InsertGithubStats,
  type Achievement,
  type UserAchievement,
  type Leaderboard,
  type InsertLeaderboard,
} from "./schema"
import { db } from "../services/database/db-http.service"
import { eq, and } from "drizzle-orm"

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>
  upsertUser(user: UpsertUser): Promise<User>
  getUserByGithubId(githubId: string): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  getAllUsers(): Promise<User[]>

  // GitHub stats operations
  getGithubStats(userId: string): Promise<GithubStats | undefined>
  upsertGithubStats(stats: InsertGithubStats): Promise<GithubStats>

  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>
  getUserAchievements(userId: string): Promise<UserAchievement[]>
  unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement>
  checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]>

  // Leaderboard operations
  getLeaderboard(period: string, limit?: number): Promise<Leaderboard[]>
  updateLeaderboardEntry(entry: InsertLeaderboard): Promise<Leaderboard>
  getUserRank(userId: string, period: string): Promise<number | undefined>
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning()
    return user
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId))
    return user
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username))
    return user
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users)
  }

  // GitHub stats operations
  async getGithubStats(userId: string): Promise<GithubStats | undefined> {
    const [stats] = await db.select().from(githubStats).where(eq(githubStats.userId, userId))
    return stats
  }

  async upsertGithubStats(stats: InsertGithubStats): Promise<GithubStats> {
    const [result] = await db
      .insert(githubStats)
      .values(stats)
      .onConflictDoUpdate({
        target: githubStats.userId,
        set: {
          ...stats,
          updatedAt: new Date(),
        },
      })
      .returning()
    return result
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements)
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId))
  }

  async unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement> {
    const [achievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
      })
      .onConflictDoNothing()
      .returning()
    return achievement
  }

  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    const userStats = await this.getGithubStats(userId)
    if (!userStats) return []

    const allAchievements = await this.getAllAchievements()
    const userUnlockedAchievements = await this.getUserAchievements(userId)
    const unlockedIds = userUnlockedAchievements.map((ua) => ua.achievementId)

    const newlyUnlocked: UserAchievement[] = []

    for (const achievement of allAchievements) {
      if (unlockedIds.includes(achievement.id)) continue

      const criteria = achievement.criteria as any
      let shouldUnlock = false

      // Check various achievement criteria based on category
      switch (achievement.category) {
        // Legacy categories
        case "commits":
          if (criteria.totalCommits && (userStats.yearlyContributions || 0) >= criteria.totalCommits) {
            shouldUnlock = true
          }
          break
        case "streak":
          if (criteria.currentStreak && (userStats.currentStreak || 0) >= criteria.currentStreak) {
            shouldUnlock = true
          }
          if (criteria.longestStreak && (userStats.longestStreak || 0) >= criteria.longestStreak) {
            shouldUnlock = true
          }
          break
        case "stars":
          if (criteria.totalStars && (userStats.totalStars || 0) >= criteria.totalStars) {
            shouldUnlock = true
          }
          break
        case "followers":
          if (criteria.followers && (userStats.followers || 0) >= criteria.followers) {
            shouldUnlock = true
          }
          break
        case "repositories":
          if (criteria.totalRepositories && (userStats.totalRepositories || 0) >= criteria.totalRepositories) {
            shouldUnlock = true
          }
          break

        // New comprehensive categories
        case "commit_streak":
          if (criteria.currentStreak && (userStats.currentStreak || 0) >= criteria.currentStreak) {
            shouldUnlock = true
          }
          break
        case "total_commits":
          if (criteria.totalCommits && (userStats.totalCommits || 0) >= criteria.totalCommits) {
            shouldUnlock = true
          }
          break
        case "meaningful_commits":
          if (criteria.meaningfulCommits && (userStats.meaningfulCommits || 0) >= criteria.meaningfulCommits) {
            shouldUnlock = true
          }
          break
        case "external_prs":
          if (criteria.mergedPullRequests && (userStats.mergedPullRequests || 0) >= criteria.mergedPullRequests) {
            shouldUnlock = true
          }
          break
        case "closed_issues":
          if (criteria.closedIssues && (userStats.closedIssues || 0) >= criteria.closedIssues) {
            shouldUnlock = true
          }
          break
        case "pr_reviews":
          if (criteria.totalReviews && (userStats.totalReviews || 0) >= criteria.totalReviews) {
            shouldUnlock = true
          }
          break
        case "external_contributors":
          if (criteria.externalContributors && (userStats.externalContributors || 0) >= criteria.externalContributors) {
            shouldUnlock = true
          }
          break
        case "repo_stars":
          if (criteria.totalStars && (userStats.totalStars || 0) >= criteria.totalStars) {
            shouldUnlock = true
          }
          break
        case "repo_forks":
          if (criteria.totalForks && (userStats.totalForks || 0) >= criteria.totalForks) {
            shouldUnlock = true
          }
          break
        case "dependency_usage":
          if (criteria.dependencyUsage && (userStats.dependencyUsage || 0) >= criteria.dependencyUsage) {
            shouldUnlock = true
          }
          break
        case "language_count":
          if (criteria.languageCount && (userStats.languageCount || 0) >= criteria.languageCount) {
            shouldUnlock = true
          }
          break
        case "top_language_percentage":
          if (
            criteria.topLanguagePercentage &&
            (userStats.topLanguagePercentage || 0) >= criteria.topLanguagePercentage
          ) {
            shouldUnlock = true
          }
          break
        case "rare_languages":
          if (criteria.rareLanguageRepos && (userStats.rareLanguageRepos || 0) >= criteria.rareLanguageRepos) {
            shouldUnlock = true
          }
          break
        case "activity_diversity":
          if (criteria.activityAreas) {
            const areas = []
            if ((userStats.totalCommits || 0) > 0) areas.push("commits")
            if ((userStats.totalIssues || 0) > 0) areas.push("issues")
            if ((userStats.totalPullRequests || 0) > 0) areas.push("prs")
            if ((userStats.totalReviews || 0) > 0) areas.push("reviews")
            if (areas.length >= criteria.activityAreas) {
              shouldUnlock = true
            }
          }
          break
        case "net_issue_fixes":
          if (criteria.netIssueFixes) {
            const netFixes = (userStats.closedIssues || 0) - (userStats.totalIssues || 0)
            if (netFixes >= criteria.netIssueFixes) {
              shouldUnlock = true
            }
          }
          break
        case "external_prs_on_repos":
          // This would need additional data about PRs on user's repos
          // For now, we'll skip this category
          break
      }

      if (shouldUnlock) {
        const unlocked = await this.unlockAchievement(userId, achievement.id)
        if (unlocked) {
          newlyUnlocked.push(unlocked)
        }
      }
    }

    return newlyUnlocked
  }

  // Leaderboard operations
  async getLeaderboard(period: string, limit = 50): Promise<Leaderboard[]> {
    const today = new Date()
    let periodDate: string

    switch (period) {
      case "daily":
        periodDate = today.toISOString().split("T")[0]
        break
      case "weekly":
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
        periodDate = weekStart.toISOString().split("T")[0]
        break
      case "monthly":
        periodDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
        break
      case "yearly":
        periodDate = String(today.getFullYear())
        break
      case "global":
        periodDate = "all-time"
        break
      default:
        periodDate = today.toISOString().split("T")[0]
    }

    return await db
      .select()
      .from(leaderboards)
      .where(and(eq(leaderboards.period, period), eq(leaderboards.periodDate, periodDate)))
      .orderBy(leaderboards.rank)
      .limit(limit)
  }

  async updateLeaderboardEntry(entry: InsertLeaderboard): Promise<Leaderboard> {
    const [result] = await db
      .insert(leaderboards)
      .values(entry)
      .onConflictDoUpdate({
        target: [leaderboards.userId, leaderboards.period, leaderboards.periodDate],
        set: {
          commits: entry.commits,
          score: entry.score,
          updatedAt: new Date(),
        },
      })
      .returning()
    return result
  }

  async getUserRank(userId: string, period: string): Promise<number | undefined> {
    const now = new Date()
    let periodDate: string

    switch (period) {
      case "daily":
        periodDate = now.toISOString().split("T")[0]
        break
      case "weekly": {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
        const day = d.getUTCDay()
        d.setUTCDate(d.getUTCDate() - day)
        periodDate = d.toISOString().split("T")[0]
        break
      }
      case "monthly":
        periodDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        break
      case "yearly":
        periodDate = String(now.getFullYear())
        break
      case "global":
        periodDate = "all-time"
        break
      default:
        periodDate = now.toISOString().split("T")[0]
    }

    const [result] = await db
      .select({ rank: leaderboards.rank })
      .from(leaderboards)
      .where(
        and(eq(leaderboards.userId, userId), eq(leaderboards.period, period), eq(leaderboards.periodDate, periodDate)),
      )

    return result?.rank ?? undefined
  }
}

export const storage = new DatabaseStorage()
