import { storage } from "../../lib/storage"
import { githubService } from "../external/github.service"
import { timezoneService } from "../../lib/timezone"

class BackgroundUpdateService {
  private updateInterval: NodeJS.Timeout | null = null
  private isUpdating = false
  private readonly UPDATE_INTERVAL_MS = Number.parseInt(process.env.BACKGROUND_UPDATE_INTERVAL_MS || "300000") // Default: 5 minutes
  private readonly BATCH_SIZE = Number.parseInt(process.env.BACKGROUND_UPDATE_BATCH_SIZE || "5") // Default: 5 users per batch
  private readonly BATCH_DELAY_MS = Number.parseInt(process.env.BACKGROUND_UPDATE_BATCH_DELAY_MS || "2000") // Default: 2 seconds between batches

  //  Start the background update service
  start(): void {
    if (this.updateInterval) {
      console.log("Background update service is already running")
      return
    }

    console.log(`Starting background update service - will run every ${this.UPDATE_INTERVAL_MS / 1000} seconds`)

    // Run initial update after a short delay
    setTimeout(() => this.performUpdate(), 10000) // 10 seconds delay

    // Set up recurring updates
    this.updateInterval = setInterval(() => {
      this.performUpdate()
    }, this.UPDATE_INTERVAL_MS)
  }

  //  Stop the background update service

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log("Background update service stopped")
    }
  }

  //  Trigger an immediate update (for manual control)

  triggerUpdate(): void {
    if (this.isUpdating) {
      console.log("Update already in progress, cannot trigger another")
      return
    }

    console.log("Manual update triggered")
    this.performUpdate()
  }

  //  Perform the background update for all users

  private async performUpdate(): Promise<void> {
    if (this.isUpdating) {
      console.log("Background update already in progress, skipping...")
      return
    }

    this.isUpdating = true
    const startTime = Date.now()

    try {
      console.log("Starting background update for all users...")

      // Get all users from the database
      const allUsers = await this.getAllUsers()

      if (!allUsers || allUsers.length === 0) {
        console.log("No users found in database, skipping update")
        return
      }

      console.log(`Found ${allUsers.length} users to update`)

      let successCount = 0
      let errorCount = 0
      let skippedCount = 0

      // Process users in batches to avoid overwhelming the GitHub API
      for (let i = 0; i < allUsers.length; i += this.BATCH_SIZE) {
        const batch = allUsers.slice(i, i + this.BATCH_SIZE)

        // Process batch concurrently
        const batchPromises = batch.map((user) => this.updateUserData(user))
        const batchResults = await Promise.allSettled(batchPromises)

        // Count results
        batchResults.forEach((result) => {
          if (result.status === "fulfilled") {
            if (result.value === "skipped") {
              skippedCount++
            } else {
              successCount++
            }
          } else {
            errorCount++
            console.error("Error updating user:", result.reason)
          }
        })

        // Add delay between batches to respect GitHub API rate limits
        if (i + this.BATCH_SIZE < allUsers.length) {
          await this.delay(this.BATCH_DELAY_MS)
        }
      }

      const duration = Date.now() - startTime
      console.log(
        `Background update completed in ${duration}ms. Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`,
      )
    } catch (error) {
      console.error("Critical error in background update:", error)
    } finally {
      this.isUpdating = false
    }
  }

  //  Get all users from the database

  private async getAllUsers(): Promise<any[]> {
    try {
      // This method needs to be implemented in storage.ts
      return await storage.getAllUsers()
    } catch (error) {
      console.error("Error fetching all users:", error)
      return []
    }
  }

  //  Update data for a single user with full fetch only
  private async updateUserData(user: any): Promise<"success" | "skipped"> {
    try {
      if (!user.username) {
        console.log(`Skipping user ${user.id} - no username`)
        return "skipped"
      }

      console.log(`Updating data for user: ${user.username} (full fetch)`)

      // // Check if we should perform incremental fetch
      // const shouldIncremental = await storage.shouldPerformIncrementalFetch(user.id, 24) // 24 hours max age
      // const lastFetchTime = await storage.getLastFetchTime(user.id)

      // console.log(`User ${user.username}: ${shouldIncremental ? 'incremental' : 'full'} fetch (last fetch: ${lastFetchTime?.toISOString() || 'never'})`)
      // // Fetch latest GitHub data with incremental logic
      // const statsData = await githubService.fetchUserStatsIncremental(
      //   user.username,
      //   lastFetchTime || undefined,
      //   shouldIncremental
      // )

      // Fetch latest GitHub data with full fetch only
      const githubData = await githubService.fetchUserData(user.username)
      const statsData = await githubService.fetchUserStats(user.username)

      // Update user profile if needed
      await storage.upsertUser({
        id: user.id,
        username: githubData.login,
        githubId: githubData.id.toString(),
        email: githubData.email,
        profileImageUrl: githubData.avatar_url,
        name: githubData.name,
        bio: githubData.bio,
        githubUrl: githubData.html_url,
        blogUrl: githubData.blog,
        linkedinUrl: this.extractLinkedInUrl(githubData.blog) || this.extractLinkedInUrl(githubData.bio),
        twitterUsername: githubData.twitter_username,
        location: githubData.location,
        githubCreatedAt: githubData.created_at ? new Date(githubData.created_at) : undefined,
      })

      // Update GitHub stats with full fetch data
      await storage.upsertGithubStats({
        userId: user.id,
        ...statsData,
        // lastIncrementalFetch: (statsData as any).isIncrementalFetch ? new Date() : undefined,
      })

      // Check for new achievements
      await storage.checkAndUnlockAchievements(user.id)

      // Update leaderboards for all active sessions
      await this.updateUserLeaderboards(user.id, statsData)

      // const fetchType = (statsData as any).isIncrementalFetch ? 'incremental' : 'full'
      // const eventsCount = (statsData as any).recentEventsCount || 0
      // console.log(`Successfully updated user: ${user.username} (${fetchType} fetch, ${eventsCount} recent events)`)

      console.log(`Successfully updated user: ${user.username} (full fetch)`)
      return "success"
    } catch (error) {
      console.error(`Error updating user ${user.username}:`, error)
      throw error
    }
  }

  //  Extract LinkedIn URL from text
  private extractLinkedInUrl(input?: string | null): string | undefined {
    if (!input) return undefined
    const patterns = [/https?:\/\/([\w.-]*\.)?linkedin\.com\/[\w\-/?=&#.%]+/i]
    for (const p of patterns) {
      const m = input.match(p)
      if (m) return m[0]
    }
    return undefined
  }

  //  Utility function to add delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  //  Get service status
  getStatus(): { isRunning: boolean; isUpdating: boolean; nextUpdateIn: number } {
    if (!this.updateInterval) {
      return { isRunning: false, isUpdating: false, nextUpdateIn: 0 }
    }

    // Calculate time until next update
    const now = Date.now()
    const nextUpdate = Math.ceil(now / this.UPDATE_INTERVAL_MS) * this.UPDATE_INTERVAL_MS
    const nextUpdateIn = nextUpdate - now

    return {
      isRunning: true,
      isUpdating: this.isUpdating,
      nextUpdateIn,
    }
  }

  //  Get service configuration
  getConfig(): {
    updateIntervalMs: number
    batchSize: number
    batchDelayMs: number
    updateIntervalSeconds: number
    batchDelaySeconds: number
  } {
    return {
      updateIntervalMs: this.UPDATE_INTERVAL_MS,
      batchSize: this.BATCH_SIZE,
      batchDelayMs: this.BATCH_DELAY_MS,
      updateIntervalSeconds: this.UPDATE_INTERVAL_MS / 1000,
      batchDelaySeconds: this.BATCH_DELAY_MS / 1000,
    }
  }

  //  Update leaderboards for a user across all active sessions
  private async updateUserLeaderboards(userId: string, statsData: any): Promise<void> {
    try {
      // Get user's current stats
      const userStats = await storage.getGithubStats(userId)
      if (!userStats) {
        console.log(`No stats found for user ${userId}, skipping leaderboard update`)
        return
      }

      // Calculate commits for different periods
      const commits = {
        daily: userStats.dailyContributions || 0,
        weekly: userStats.weeklyContributions || 0,
        monthly: userStats.monthlyContributions || 0,
        yearly: userStats.yearlyContributions || 0,
        overall: userStats.overallContributions || 0,
      }

      // Calculate score based on points
      const score = userStats.points || 0

      // Update leaderboards for each session type
      const sessionTypes = ['daily', 'weekly', 'monthly', 'yearly', 'overall'] as const

      for (const sessionType of sessionTypes) {
        try {
          // Get active session for this type
          const activeSession = await this.getActiveSession(sessionType)
          if (!activeSession) {
            console.log(`No active ${sessionType} session found, skipping`)
            continue
          }

          // Update leaderboard entry for this session
          await storage.updateLeaderboardEntry({
            userId,
            sessionId: activeSession.id,
            period: sessionType,
            periodDate: this.getPeriodDate(sessionType, activeSession.startDate),
            commits: commits[sessionType],
            score: score,
          })

          console.log(`Updated ${sessionType} leaderboard for user ${userId}: ${commits[sessionType]} commits, ${score} score (rank updated immediately)`)
        } catch (error) {
          console.error(`Error updating ${sessionType} leaderboard for user ${userId}:`, error)
        }
      }
    } catch (error) {
      console.error(`Error updating leaderboards for user ${userId}:`, error)
    }
  }

  //  Get active session for a specific type 
  private async getActiveSession(sessionType: string): Promise<any | null> {
    try {
      const { db } = await import("../database/db-http.service")
      const { leaderboardSessions } = await import("../../lib/schema")
      const { eq, and } = await import("drizzle-orm")

      const result = await db
        .select()
        .from(leaderboardSessions)
        .where(
          and(
            eq(leaderboardSessions.sessionType, sessionType),
            eq(leaderboardSessions.isActive, true)
          )
        )
        .limit(1)

      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error(`Error getting active session for ${sessionType}:`, error)
      return null
    }
  }

  //  Get period date for a session type
  private getPeriodDate(sessionType: string, startDate: Date): string {
    return timezoneService.getPeriodDate(sessionType as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'global')
  }
}

// Export singleton instance
export const backgroundUpdateService = new BackgroundUpdateService()

export const backgroundService = backgroundUpdateService
