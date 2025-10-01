import { githubTrendingScraperService } from "@/services/external"
import { storage } from "@/lib/storage"
import type { TrendingDeveloperBadge } from "@/lib/schema"

export class TrendingDeveloperCheckService {
  private static instance: TrendingDeveloperCheckService

  private constructor() { }

  static getInstance(): TrendingDeveloperCheckService {
    if (!TrendingDeveloperCheckService.instance) {
      TrendingDeveloperCheckService.instance = new TrendingDeveloperCheckService()
    }
    return TrendingDeveloperCheckService.instance
  }

  // Check if a user is currently trending in any time period
  async checkTrendingStatus(
    username: string,
    userId: string
  ): Promise<{
    isTrending: boolean
    trendingPeriods: string[]
    badges: TrendingDeveloperBadge[]
  }> {
    try {
      console.log(`\n=== Checking trending status for ${username} ===`)

      const timePeriods: Array<"daily" | "weekly" | "monthly"> = ["daily", "weekly", "monthly"]
      const trendingPeriods: string[] = []
      const updatedBadges: TrendingDeveloperBadge[] = []

      // Check each time period
      for (const period of timePeriods) {
        try {
          console.log(`Checking ${period} trending developers...`)

          // Scrape trending developers for this period
          const trendingDevs = await githubTrendingScraperService.scrapeTrendingDevelopers({
            since: period,
          })

          // Check if user is in the trending list and get their rank
          const trendingIndex = trendingDevs.findIndex(
            (dev) => dev.username.toLowerCase() === username.toLowerCase()
          )
          const isTrending = trendingIndex !== -1
          const currentRank = isTrending ? trendingIndex + 1 : undefined // +1 because index is 0-based

          if (isTrending) {
            console.log(`✓ ${username} is trending (${period}) at rank #${currentRank}`)
            trendingPeriods.push(period)

            // Find the developer's language if specified
            const trendingDev = trendingDevs[trendingIndex]

            // Update or create badge with rank
            const badge = await storage.upsertTrendingDeveloperBadge(
              userId,
              period,
              true,
              currentRank,
              trendingDev?.repoName || undefined
            )

            updatedBadges.push(badge)
          } else {
            console.log(`✗ ${username} is not trending (${period})`)

            // Mark as not current if badge exists
            const badge = await storage.upsertTrendingDeveloperBadge(
              userId,
              period,
              false,
              undefined // no rank since not trending
            )

            if (badge.id > 0) {
              updatedBadges.push(badge)
            }
          }
        } catch (error) {
          console.error(`Error checking ${period} trending:`, error)
          // Continue checking other periods even if one fails
        }
      }

      // Get all badges (including past ones)
      const allBadges = await storage.getTrendingDeveloperBadges(userId)

      console.log(`=== Trending check complete for ${username} ===`)
      console.log(`Trending in: ${trendingPeriods.length > 0 ? trendingPeriods.join(", ") : "none"}`)
      console.log(`Total badges: ${allBadges.length}`)

      return {
        isTrending: trendingPeriods.length > 0,
        trendingPeriods,
        badges: allBadges,
      }
    } catch (error) {
      console.error(`Error checking trending status for ${username}:`, error)

      // On error, return existing badges from database
      try {
        const existingBadges = await storage.getTrendingDeveloperBadges(userId)
        return {
          isTrending: false,
          trendingPeriods: [],
          badges: existingBadges,
        }
      } catch (dbError) {
        console.error("Failed to fetch existing badges:", dbError)
        return {
          isTrending: false,
          trendingPeriods: [],
          badges: [],
        }
      }
    }
  }

  // Quick check - just returns existing badges without scraping
  // Useful for displaying cached status without API calls
  async getCachedTrendingStatus(userId: string): Promise<TrendingDeveloperBadge[]> {
    return await storage.getTrendingDeveloperBadges(userId)
  }
}

// Export singleton instance
export const trendingDeveloperCheckService = TrendingDeveloperCheckService.getInstance()

