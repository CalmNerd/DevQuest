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
import { eq, and, sql } from "drizzle-orm"
import { timezoneService } from "./timezone"

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
  getLastFetchTime(userId: string): Promise<Date | undefined>
  shouldPerformIncrementalFetch(userId: string, maxAgeHours?: number): Promise<boolean>

  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>
  getUserAchievements(userId: string): Promise<UserAchievement[]>
  unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement>
  checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]>
  updateUserAchievementProgress(userId: string, achievementId: number, progress: number, maxProgress: number, currentLevel?: number, currentValue?: number, nextLevelRequirement?: number): Promise<void>
  seedAchievements(): Promise<void>

  // Leaderboard operations
  getLeaderboard(period: string, limit?: number): Promise<Leaderboard[]>
  updateLeaderboardEntry(entry: InsertLeaderboard): Promise<Leaderboard>
  getUserRank(userId: string, period: string): Promise<number | undefined>
  
  // Rank update operations (for immediate rank calculation)
  updateSessionRanks(sessionId: number): Promise<void>
  updateRanksForPeriod(period: string, periodDate: string): Promise<void>
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
    // Make username lookup case-insensitive by using ilike
    const [user] = await db.select().from(users).where(sql`LOWER(${users.username}) = LOWER(${username})`)
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

  async getLastFetchTime(userId: string): Promise<Date | undefined> {
    const [stats] = await db
      .select({ lastFetchedAt: githubStats.lastFetchedAt })
      .from(githubStats)
      .where(eq(githubStats.userId, userId))
    return stats?.lastFetchedAt ?? undefined
  }

  async shouldPerformIncrementalFetch(userId: string, maxAgeHours: number = 24): Promise<boolean> {
    const lastFetch = await this.getLastFetchTime(userId)
    if (!lastFetch) return false // No previous data, do full fetch
    
    const now = new Date()
    const hoursSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceLastFetch < maxAgeHours
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
    // Use the new achievement service for evaluation
    const { achievementService } = await import("@/services/api/achievement.service")
    return await achievementService.evaluateAndUnlockAchievements(userId)
  }

  async updateUserAchievementProgress(
    userId: string, 
    achievementId: number, 
    progress: number, 
    maxProgress: number, 
    currentLevel?: number, 
    currentValue?: number, 
    nextLevelRequirement?: number
  ): Promise<void> {
    await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        progress,
        maxProgress,
        currentLevel: currentLevel || 0,
        currentValue: currentValue || 0,
        nextLevelRequirement: nextLevelRequirement || 1,
        unlockedAt: null, // Not unlocked yet
      })
      .onConflictDoUpdate({
        target: [userAchievements.userId, userAchievements.achievementId],
        set: {
          progress,
          maxProgress,
          currentLevel: currentLevel || 0,
          currentValue: currentValue || 0,
          nextLevelRequirement: nextLevelRequirement || 1,
          updatedAt: new Date(),
        },
      })
  }

  async seedAchievements(): Promise<void> {
    const { LeveledAchievementDefinitionsService } = await import("@/services/api/leveled-achievement-definitions.service")
    const definitions = LeveledAchievementDefinitionsService.getAllDefinitions()
    
    console.log(`Seeding ${definitions.length} achievement definitions...`)
    
    for (const definition of definitions) {
      try {
        await db
          .insert(achievements)
          .values({
            name: definition.name,
            description: definition.description,
            category: definition.category,
            icon: definition.icon,
            rarity: definition.rarity,
            tier: definition.tier,
            criteria: definition.criteria,
            points: definition.points,
            isLeveled: definition.isLeveled || false,
            isGitHubNative: definition.isGitHubNative || false,
            source: definition.source || "custom",
            isActive: definition.isActive || true,
          })
          .onConflictDoUpdate({
            target: [achievements.category],
            set: {
              name: definition.name,
              description: definition.description,
              icon: definition.icon,
              rarity: definition.rarity,
              tier: definition.tier,
              criteria: definition.criteria,
              points: definition.points,
              isLeveled: definition.isLeveled || false,
              isGitHubNative: definition.isGitHubNative || false,
              source: definition.source || "custom",
              isActive: definition.isActive || true,
            },
          })
      } catch (error) {
        console.error(`Failed to seed achievement "${definition.name}":`, error)
      }
    }
    
    console.log("Achievement seeding completed")
  }

  // Leaderboard operations
  async getLeaderboard(period: string, limit = 50): Promise<Leaderboard[]> {
    const periodDate = timezoneService.getPeriodDate(period as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'global')

    return await db
      .select()
      .from(leaderboards)
      .where(and(eq(leaderboards.period, period), eq(leaderboards.periodDate, periodDate)))
      .orderBy(leaderboards.rank)
      .limit(limit)
  }

  async updateLeaderboardEntry(entry: InsertLeaderboard): Promise<Leaderboard> {
    // Check if this is a session-based entry (has sessionId) or legacy entry
    if (entry.sessionId) {
      // SAFEGUARD 1: Check if entry already exists in THIS session
      const existingEntries = await db
        .select()
        .from(leaderboards)
        .where(
          and(
            eq(leaderboards.userId, entry.userId),
            eq(leaderboards.sessionId, entry.sessionId)
          )
        )

      // If multiple entries exist in same session (should never happen due to unique constraint)
      if (existingEntries.length > 1) {
        console.error(`CRITICAL: Found ${existingEntries.length} duplicate leaderboard entries for user ${entry.userId} in session ${entry.sessionId}!`)
        console.error('Duplicate entry IDs:', existingEntries.map(e => e.id).join(', '))
        
        // Keep the most recent entry and delete others
        const entryToKeep = existingEntries.sort((a, b) => {
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
          return dateB - dateA
        })[0]
        
        const entriesToDelete = existingEntries.filter(e => e.id !== entryToKeep.id)
        for (const dupEntry of entriesToDelete) {
          await db.delete(leaderboards).where(eq(leaderboards.id, dupEntry.id))
          console.log(`Deleted duplicate leaderboard entry ID: ${dupEntry.id}`)
        }
      }

      // SAFEGUARD 2: Delete entries for this user and period from OTHER (inactive) sessions
      // This prevents accumulation of entries across session changes
      const { leaderboardSessions } = await import('./schema')
      
      // Find entries for the same user and period but in different sessions
      const entriesFromOtherSessions = await db
        .select({
          leaderboardId: leaderboards.id,
          sessionId: leaderboards.sessionId,
          sessionKey: leaderboardSessions.sessionKey,
          isActive: leaderboardSessions.isActive,
        })
        .from(leaderboards)
        .innerJoin(leaderboardSessions, eq(leaderboards.sessionId, leaderboardSessions.id))
        .where(
          and(
            eq(leaderboards.userId, entry.userId),
            eq(leaderboards.period, entry.period),
            sql`${leaderboards.sessionId} != ${entry.sessionId}` // Different session
          )
        )

      if (entriesFromOtherSessions.length > 0) {
        console.log(`Found ${entriesFromOtherSessions.length} old entries for user ${entry.userId} in period ${entry.period} from other sessions. Cleaning up...`)
        
        for (const oldEntry of entriesFromOtherSessions) {
          await db.delete(leaderboards).where(eq(leaderboards.id, oldEntry.leaderboardId))
          console.log(`Deleted old entry from session ${oldEntry.sessionKey} (ID: ${oldEntry.leaderboardId}, active: ${oldEntry.isActive})`)
        }
      }

      // New session-based leaderboard entry with upsert
      const [result] = await db
        .insert(leaderboards)
        .values(entry)
        .onConflictDoUpdate({
          target: [leaderboards.userId, leaderboards.sessionId],
          set: {
            commits: entry.commits,
            score: entry.score,
            updatedAt: new Date(),
          },
        })
        .returning()

      // Immediately update ranks for this session after adding/updating the entry
      await this.updateSessionRanks(entry.sessionId)
      
      return result
    } else {
      // Legacy leaderboard entry - use upsert approach
      const existing = await db
        .select()
        .from(leaderboards)
        .where(
          and(
            eq(leaderboards.userId, entry.userId),
            eq(leaderboards.period, entry.period),
            eq(leaderboards.periodDate, entry.periodDate)
          )
        )
        .limit(1)

      if (existing.length > 0) {
        // Update existing entry
        const [result] = await db
          .update(leaderboards)
          .set({
            commits: entry.commits,
            score: entry.score,
            updatedAt: new Date(),
          })
          .where(eq(leaderboards.id, existing[0].id))
          .returning()

        // Immediately update ranks for this period after updating the entry
        await this.updateRanksForPeriod(entry.period, entry.periodDate)
        
        return result
      } else {
        // Insert new entry
        const [result] = await db
          .insert(leaderboards)
          .values(entry)
          .returning()

        // Immediately update ranks for this period after adding the entry
        await this.updateRanksForPeriod(entry.period, entry.periodDate)
        
        return result
      }
    }
  }

  async getUserRank(userId: string, period: string): Promise<number | undefined> {
    const periodDate = timezoneService.getPeriodDate(period as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'global')

    const [result] = await db
      .select({ rank: leaderboards.rank })
      .from(leaderboards)
      .where(
        and(eq(leaderboards.userId, userId), eq(leaderboards.period, period), eq(leaderboards.periodDate, periodDate)),
      )

    return result?.rank ?? undefined
  }


  //  This ensures that when a new user is added, their rank is immediately calculated
  async updateSessionRanks(sessionId: number): Promise<void> {
    try {
      await db.execute(sql`
        WITH ordered AS (
          SELECT id, commits as rank_value,
            ROW_NUMBER() OVER (ORDER BY commits DESC, score DESC, updated_at ASC) AS new_rank
          FROM ${leaderboards}
          WHERE session_id = ${sessionId}
        )
        UPDATE ${leaderboards} AS l
        SET rank = o.new_rank
        FROM ordered o
        WHERE l.id = o.id;
      `)
    } catch (error) {
      console.error(`Error updating ranks for session ${sessionId}:`, error)
      // Don't throw error to avoid breaking the main flow
    }
  }
  
   //  Update ranks for a specific period (legacy system)
   //  This ensures that when a new user is added, their rank is immediately calculated
  async updateRanksForPeriod(period: string, periodDate: string): Promise<void> {
    try {
      await db.execute(sql`
        WITH ordered AS (
          SELECT id, commits as rank_value,
            ROW_NUMBER() OVER (ORDER BY commits DESC, score DESC, updated_at ASC) AS new_rank
          FROM ${leaderboards}
          WHERE period = ${period} AND period_date = ${periodDate}
        )
        UPDATE ${leaderboards} AS l
        SET rank = o.new_rank
        FROM ordered o
        WHERE l.id = o.id;
      `)
    } catch (error) {
      console.error(`Error updating ranks for period ${period} (${periodDate}):`, error)
      // Don't throw error to avoid breaking the main flow
    }
  }
}

export const storage = new DatabaseStorage()
