import { storage } from "./storage"
import { githubService } from "./github-service"
import { leaderboardService } from "./leaderboard-service"

/**
 * Background service for automatically updating user data and leaderboards
 * Runs every 5 minutes to keep data fresh without user interaction
 */
class BackgroundUpdateService {
  private updateInterval: NodeJS.Timeout | null = null
  private isUpdating = false
  private readonly UPDATE_INTERVAL_MS = Number.parseInt(process.env.BACKGROUND_UPDATE_INTERVAL_MS || "300000") // Default: 5 minutes
  private readonly BATCH_SIZE = Number.parseInt(process.env.BACKGROUND_UPDATE_BATCH_SIZE || "5") // Default: 5 users per batch
  private readonly BATCH_DELAY_MS = Number.parseInt(process.env.BACKGROUND_UPDATE_BATCH_DELAY_MS || "2000") // Default: 2 seconds between batches

  /**
   * Start the background update service
   */
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

  /**
   * Stop the background update service
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log("Background update service stopped")
    }
  }

  /**
   * Trigger an immediate update (for manual control)
   */
  triggerUpdate(): void {
    if (this.isUpdating) {
      console.log("Update already in progress, cannot trigger another")
      return
    }

    console.log("Manual update triggered")
    this.performUpdate()
  }

  /**
   * Perform the background update for all users
   */
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

  /**
   * Get all users from the database
   */
  private async getAllUsers(): Promise<any[]> {
    try {
      // This method needs to be implemented in storage.ts
      return await storage.getAllUsers()
    } catch (error) {
      console.error("Error fetching all users:", error)
      return []
    }
  }

  /**
   * Update data for a single user
   */
  private async updateUserData(user: any): Promise<"success" | "skipped"> {
    try {
      if (!user.username) {
        console.log(`Skipping user ${user.id} - no username`)
        return "skipped"
      }

      console.log(`Updating data for user: ${user.username}`)

      // Fetch latest GitHub data
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

      // Update GitHub stats
      await storage.upsertGithubStats({
        userId: user.id,
        ...statsData,
      })

      // Check for new achievements
      await storage.checkAndUnlockAchievements(user.id)

      // Update leaderboards
      await leaderboardService.updateUserLeaderboards(user.id, statsData)

      console.log(`Successfully updated user: ${user.username}`)
      return "success"
    } catch (error) {
      console.error(`Error updating user ${user.username}:`, error)
      throw error
    }
  }

  /**
   * Extract LinkedIn URL from text
   */
  private extractLinkedInUrl(input?: string | null): string | undefined {
    if (!input) return undefined
    const patterns = [/https?:\/\/([\w.-]*\.)?linkedin\.com\/[\w\-/?=&#.%]+/i]
    for (const p of patterns) {
      const m = input.match(p)
      if (m) return m[0]
    }
    return undefined
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get service status
   */
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

  /**
   * Get service configuration
   */
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
}

// Export singleton instance
export const backgroundUpdateService = new BackgroundUpdateService()
