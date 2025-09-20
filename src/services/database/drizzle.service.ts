import { db } from "./db-http.service"
import { 
  users, 
  githubStats, 
  achievements, 
  userAchievements, 
  leaderboards,
  type User,
  type GithubStats,
  type Achievement,
  type UserAchievement,
  type Leaderboard
} from "../../lib/schema"
import { eq, and, desc, asc, sql, count, max, sum } from "drizzle-orm"

/**
 * Enhanced Database Service using Drizzle ORM best practices
 * Provides optimized queries and comprehensive data operations
 */
export class DrizzleDatabaseService {
  
  // ==================== USER OPERATIONS ====================
  
  /**
   * Get user by ID with optimized query
   */
  async getUserById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    
    return user || null
  }

  /**
   * Get user by GitHub ID with optimized query
   */
  async getUserByGithubId(githubId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.githubId, githubId))
      .limit(1)
    
    return user || null
  }

  /**
   * Get user by username with optimized query
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    
    return user || null
  }

  /**
   * Upsert user with conflict resolution
   */
  async upsertUser(userData: Partial<User>): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required for upsert operation")
    }

    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        username: userData.username,
        githubId: userData.githubId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name,
        bio: userData.bio,
        profileImageUrl: userData.profileImageUrl,
        githubToken: userData.githubToken,
        githubUrl: userData.githubUrl,
        blogUrl: userData.blogUrl,
        linkedinUrl: userData.linkedinUrl,
        twitterUsername: userData.twitterUsername,
        location: userData.location,
        githubCreatedAt: userData.githubCreatedAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          username: userData.username,
          githubId: userData.githubId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name,
          bio: userData.bio,
          profileImageUrl: userData.profileImageUrl,
          githubToken: userData.githubToken,
          githubUrl: userData.githubUrl,
          blogUrl: userData.blogUrl,
          linkedinUrl: userData.linkedinUrl,
          twitterUsername: userData.twitterUsername,
          location: userData.location,
          githubCreatedAt: userData.githubCreatedAt,
          updatedAt: new Date(),
        },
      })
      .returning()
    
    return user
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(limit = 100, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(asc(users.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // ==================== GITHUB STATS OPERATIONS ====================

  /**
   * Get GitHub stats for user with optimized query
   */
  async getGithubStats(userId: string): Promise<GithubStats | null> {
    const [stats] = await db
      .select()
      .from(githubStats)
      .where(eq(githubStats.userId, userId))
      .limit(1)
    
    return stats || null
  }

  /**
   * Upsert GitHub stats with conflict resolution
   */
  async upsertGithubStats(statsData: Partial<GithubStats>): Promise<GithubStats> {
    if (!statsData.userId) {
      throw new Error("User ID is required for upsert operation")
    }

    const [stats] = await db
      .insert(githubStats)
      .values({
        userId: statsData.userId,
        dailyContributions: statsData.dailyContributions,
        weeklyContributions: statsData.weeklyContributions,
        monthlyContributions: statsData.monthlyContributions,
        yearlyContributions: statsData.yearlyContributions,
        last365Contributions: statsData.last365Contributions,
        thisYearContributions: statsData.thisYearContributions,
        overallContributions: statsData.overallContributions,
        points: statsData.points,
        totalStars: statsData.totalStars,
        totalForks: statsData.totalForks,
        contributedTo: statsData.contributedTo,
        totalRepositories: statsData.totalRepositories,
        followers: statsData.followers,
        following: statsData.following,
        currentStreak: statsData.currentStreak,
        longestStreak: statsData.longestStreak,
        topLanguage: statsData.topLanguage,
        languageStats: statsData.languageStats,
        contributionGraph: statsData.contributionGraph,
        totalCommits: statsData.totalCommits,
        meaningfulCommits: statsData.meaningfulCommits,
        totalPullRequests: statsData.totalPullRequests,
        mergedPullRequests: statsData.mergedPullRequests,
        totalIssues: statsData.totalIssues,
        closedIssues: statsData.closedIssues,
        totalReviews: statsData.totalReviews,
        externalContributors: statsData.externalContributors,
        reposWithStars: statsData.reposWithStars,
        reposWithForks: statsData.reposWithForks,
        dependencyUsage: statsData.dependencyUsage,
        languageCount: statsData.languageCount,
        topLanguagePercentage: statsData.topLanguagePercentage,
        rareLanguageRepos: statsData.rareLanguageRepos,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: githubStats.userId,
        set: {
          dailyContributions: statsData.dailyContributions,
          weeklyContributions: statsData.weeklyContributions,
          monthlyContributions: statsData.monthlyContributions,
          yearlyContributions: statsData.yearlyContributions,
          last365Contributions: statsData.last365Contributions,
          thisYearContributions: statsData.thisYearContributions,
          overallContributions: statsData.overallContributions,
          points: statsData.points,
          totalStars: statsData.totalStars,
          totalForks: statsData.totalForks,
          contributedTo: statsData.contributedTo,
          totalRepositories: statsData.totalRepositories,
          followers: statsData.followers,
          following: statsData.following,
          currentStreak: statsData.currentStreak,
          longestStreak: statsData.longestStreak,
          topLanguage: statsData.topLanguage,
          languageStats: statsData.languageStats,
          contributionGraph: statsData.contributionGraph,
          totalCommits: statsData.totalCommits,
          meaningfulCommits: statsData.meaningfulCommits,
          totalPullRequests: statsData.totalPullRequests,
          mergedPullRequests: statsData.mergedPullRequests,
          totalIssues: statsData.totalIssues,
          closedIssues: statsData.closedIssues,
          totalReviews: statsData.totalReviews,
          externalContributors: statsData.externalContributors,
          reposWithStars: statsData.reposWithStars,
          reposWithForks: statsData.reposWithForks,
          dependencyUsage: statsData.dependencyUsage,
          languageCount: statsData.languageCount,
          topLanguagePercentage: statsData.topLanguagePercentage,
          rareLanguageRepos: statsData.rareLanguageRepos,
          updatedAt: new Date(),
        },
      })
      .returning()
    
    return stats
  }

  /**
   * Get top users by points with optimized query
   */
  async getTopUsersByPoints(limit = 10): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        profileImageUrl: users.profileImageUrl,
        githubUrl: users.githubUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        points: githubStats.points,
      })
      .from(users)
      .innerJoin(githubStats, eq(users.id, githubStats.userId))
      .orderBy(desc(githubStats.points))
      .limit(limit)
  }

  /**
   * Get users with most stars
   */
  async getTopUsersByStars(limit = 10): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        profileImageUrl: users.profileImageUrl,
        githubUrl: users.githubUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        totalStars: githubStats.totalStars,
      })
      .from(users)
      .innerJoin(githubStats, eq(users.id, githubStats.userId))
      .orderBy(desc(githubStats.totalStars))
      .limit(limit)
  }

  /**
   * Get users with longest streaks
   */
  async getTopUsersByStreak(limit = 10): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        profileImageUrl: users.profileImageUrl,
        githubUrl: users.githubUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        longestStreak: githubStats.longestStreak,
      })
      .from(users)
      .innerJoin(githubStats, eq(users.id, githubStats.userId))
      .orderBy(desc(githubStats.longestStreak))
      .limit(limit)
  }

  /**
   * Get users with most repositories
   */
  async getTopUsersByRepositories(limit = 10): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        profileImageUrl: users.profileImageUrl,
        githubUrl: users.githubUrl,
        bio: users.bio,
        location: users.location,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        totalRepositories: githubStats.totalRepositories,
        publicRepos: githubStats.totalRepositories,
      })
      .from(users)
      .innerJoin(githubStats, eq(users.id, githubStats.userId))
      .orderBy(desc(githubStats.totalRepositories))
      .limit(limit)
  }

  /**
   * Get users with most followers
   */
  async getTopUsersByFollowers(limit = 10): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        profileImageUrl: users.profileImageUrl,
        githubUrl: users.githubUrl,
        bio: users.bio,
        location: users.location,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        followers: githubStats.followers,
        following: githubStats.following,
      })
      .from(users)
      .innerJoin(githubStats, eq(users.id, githubStats.userId))
      .orderBy(desc(githubStats.followers))
      .limit(limit)
  }

  // ==================== ACHIEVEMENT OPERATIONS ====================

  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .orderBy(asc(achievements.category), asc(achievements.points))
  }

  /**
   * Get user achievements with achievement details
   */
  async getUserAchievements(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt))
  }

  /**
   * Unlock achievement for user
   */
  async unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement | null> {
    const [achievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
      })
      .onConflictDoNothing()
      .returning()
    
    return achievement || null
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(): Promise<{
    totalAchievements: number
    totalUnlocked: number
    mostCommonAchievement: Achievement | null
  }> {
    const [totalAchievements] = await db
      .select({ count: count() })
      .from(achievements)

    const [totalUnlocked] = await db
      .select({ count: count() })
      .from(userAchievements)

    // Get most common achievement
    const [mostCommon] = await db
      .select({
        achievementId: userAchievements.achievementId,
        count: count(),
      })
      .from(userAchievements)
      .groupBy(userAchievements.achievementId)
      .orderBy(desc(count()))
      .limit(1)

    let mostCommonAchievement: Achievement | null = null
    if (mostCommon) {
      const [achievement] = await db
        .select()
        .from(achievements)
        .where(eq(achievements.id, mostCommon.achievementId))
        .limit(1)
      mostCommonAchievement = achievement || null
    }

    return {
      totalAchievements: totalAchievements.count,
      totalUnlocked: totalUnlocked.count,
      mostCommonAchievement,
    }
  }

  // ==================== LEADERBOARD OPERATIONS ====================

  /**
   * Get leaderboard for specific period
   */
  async getLeaderboard(period: string, periodDate: string, limit = 50): Promise<Leaderboard[]> {
    return await db
      .select()
      .from(leaderboards)
      .where(and(
        eq(leaderboards.period, period),
        eq(leaderboards.periodDate, periodDate)
      ))
      .orderBy(asc(leaderboards.rank))
      .limit(limit)
  }

  /**
   * Get leaderboard with user details
   */
  async getLeaderboardWithUsers(period: string, periodDate: string, limit = 50): Promise<any[]> {
    return await db
      .select()
      .from(leaderboards)
      .innerJoin(users, eq(leaderboards.userId, users.id))
      .where(and(
        eq(leaderboards.period, period),
        eq(leaderboards.periodDate, periodDate)
      ))
      .orderBy(asc(leaderboards.rank))
      .limit(limit)
  }

  /**
   * Update leaderboard entry
   */
  async updateLeaderboardEntry(entry: Partial<Leaderboard>): Promise<Leaderboard> {
    if (!entry.userId || !entry.period || !entry.periodDate) {
      throw new Error("userId, period, and periodDate are required for leaderboard entry")
    }

    const [result] = await db
      .insert(leaderboards)
      .values({
        userId: entry.userId,
        period: entry.period,
        periodDate: entry.periodDate,
        commits: entry.commits,
        score: entry.score,
        rank: entry.rank,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [leaderboards.userId, leaderboards.period, leaderboards.periodDate],
        set: {
          commits: entry.commits,
          score: entry.score,
          rank: entry.rank,
          updatedAt: new Date(),
        },
      })
      .returning()
    
    return result
  }

  /**
   * Update ranks for a specific period
   */
  async updateRanksForPeriod(period: string, periodDate: string): Promise<void> {
    await db.execute(sql`
      WITH ordered AS (
        SELECT id, commits as rank_value,
          ROW_NUMBER() OVER (ORDER BY commits DESC, updated_at ASC) AS new_rank
        FROM ${leaderboards}
        WHERE period = ${period} AND period_date = ${periodDate}
      )
      UPDATE ${leaderboards} AS l
      SET rank = o.new_rank
      FROM ordered o
      WHERE l.id = o.id;
    `)
  }

  // ==================== ANALYTICS OPERATIONS ====================

  /**
   * Get platform statistics with error handling
   */
  async getPlatformStats(): Promise<{
    totalUsers: number
    totalPoints: number
    totalStars: number
    totalCommits: number
    averagePointsPerUser: number
  }> {
    try {
      const [stats] = await db
        .select({
          totalUsers: count(users.id),
          totalPoints: sum(githubStats.points),
          totalStars: sum(githubStats.totalStars),
          totalCommits: sum(githubStats.totalCommits),
        })
        .from(users)
        .leftJoin(githubStats, eq(users.id, githubStats.userId))

      const averagePointsPerUser = stats.totalUsers > 0 
        ? Math.round((Number(stats.totalPoints) || 0) / stats.totalUsers)
        : 0

      return {
        totalUsers: stats.totalUsers,
        totalPoints: Number(stats.totalPoints) || 0,
        totalStars: Number(stats.totalStars) || 0,
        totalCommits: Number(stats.totalCommits) || 0,
        averagePointsPerUser,
      }
    } catch (error) {
      console.error("Error getting platform stats:", error)
      // Return default values if query fails
      return {
        totalUsers: 0,
        totalPoints: 0,
        totalStars: 0,
        totalCommits: 0,
        averagePointsPerUser: 0,
      }
    }
  }

  /**
   * Get user growth over time with error handling
   */
  async getUserGrowth(days = 30): Promise<Array<{ date: string; count: number }>> {
    try {
      const result = await db.execute(sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM ${users}
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `)

      return result.rows as Array<{ date: string; count: number }>
    } catch (error) {
      console.error("Error getting user growth:", error)
      return []
    }
  }

  /**
   * Get language distribution with error handling
   */
  async getLanguageDistribution(): Promise<Array<{ language: string; count: number }>> {
    try {
      const result = await db.execute(sql`
        SELECT 
          top_language as language,
          COUNT(*) as count
        FROM ${githubStats}
        WHERE top_language IS NOT NULL
        GROUP BY top_language
        ORDER BY count DESC
        LIMIT 20
      `)

      return result.rows as Array<{ language: string; count: number }>
    } catch (error) {
      console.error("Error getting language distribution:", error)
      return []
    }
  }
}

// Export singleton instance
export const drizzleDb = new DrizzleDatabaseService()

export const drizzleService = drizzleDb
