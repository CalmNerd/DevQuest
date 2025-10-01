import axios, { AxiosRequestConfig } from "axios"
import * as cheerio from "cheerio"
import { ScrapedGitHubAchievement } from "@/types/github.types"

class GitHubAchievementsScraperService {
  private readonly baseUrl = "https://github.com"
  private readonly userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

  // Cache for rate limiting protection (in-memory cache with TTL)
  private cache: Map<string, { data: ScrapedGitHubAchievement[]; expiresAt: number }> = new Map()
  private readonly cacheTTL = 30 * 60 * 1000 // 30 minutes in milliseconds (achievements don't change frequently)

  // Make a request with proper headers to avoid blocking
  private async makeRequest(url: string): Promise<string> {
    // Check cache first
    const cacheKey = url
    const cached = this.cache.get(cacheKey)

    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[GitHubAchievementsScraper] Cache hit for ${url}`)
      return JSON.stringify(cached.data) // Return cached data
    }

    try {
      const config: AxiosRequestConfig = {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        timeout: 15000, // 15 second timeout
      }

      console.log(`[GitHubAchievementsScraper] Fetching ${url}`)
      const response = await axios.get(url, config)

      // Clean up expired cache entries
      this.cleanupCache()

      return response.data
    } catch (error) {
      // Return cached data if available, even if expired
      if (cached) {
        console.log(`[GitHubAchievementsScraper] Returning expired cache for ${url} due to error`)
        return JSON.stringify(cached.data)
      }

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`User not found or achievements tab is not accessible`)
        }
        if (error.response?.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.")
        }
        if (error.response?.status === 403) {
          throw new Error("Access forbidden. GitHub may have blocked the request.")
        }
        throw new Error(`Failed to fetch from GitHub: ${error.message}`)
      }
      throw error
    }
  }

  // Clean up expired cache entries to prevent memory leaks
  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        this.cache.delete(key)
      }
    }
  }

  // Clear all cache entries
  public clearCache(): void {
    this.cache.clear()
    console.log("[GitHubAchievementsScraper] Cache cleared")
  }

  // Clear cache for a specific username
  public clearUserCache(username: string): void {
    const url = `${this.baseUrl}/${username}?tab=achievements`
    this.cache.delete(url)
    console.log(`[GitHubAchievementsScraper] Cache cleared for user: ${username}`)
  }

  async scrapeUserAchievements(username: string): Promise<ScrapedGitHubAchievement[]> {
    if (!username || username.trim() === "") {
      throw new Error("Username is required")
    }

    // Sanitize username to prevent URL injection
    const sanitizedUsername = username.trim().replace(/[^a-zA-Z0-9-]/g, "")
    if (sanitizedUsername !== username.trim()) {
      throw new Error("Invalid username format")
    }

    const url = `${this.baseUrl}/${sanitizedUsername}?tab=achievements`

    try {
      const html = await this.makeRequest(url)

      // Check if we got cached data
      if (html.startsWith('[') || html.startsWith('{')) {
        try {
          const cachedData = JSON.parse(html)
          if (Array.isArray(cachedData)) {
            console.log(`[GitHubAchievementsScraper] Returning ${cachedData.length} cached achievements for ${sanitizedUsername}`)
            return cachedData
          }
        } catch (e) {
          // Continue with normal parsing
        }
      }

      const $ = cheerio.load(html)
      const achievements: ScrapedGitHubAchievement[] = []

      // GitHub uses details.js-achievement-card-details for each achievement
      $("details.js-achievement-card-details").each((index, element) => {
        try {
          const $el = $(element)

          // Extract achievement slug from data attribute
          const slug = $el.attr("data-achievement-slug")?.trim() || ""

          if (!slug) {
            console.warn(`[GitHubAchievementsScraper] Skipping achievement at index ${index}: No slug found`)
            return
          }

          // Extract achievement image
          const img = $el.find("summary img").attr("src") || ""

          // Extract achievement name from h3 or heading
          const name = $el.find("summary h3").text().trim() ||
            $el.find("summary .h3").text().trim() ||
            slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

          // Extract tier badge like "x3", "Gold", "Bronze", etc.
          // GitHub uses various classes for tier labels
          const tierElement = $el.find("summary .achievement-tier-label, summary .Label--info, summary span[class*='tier']")
          const tier = tierElement.text().trim() || null

          // Try to extract description from the details content (expanded section)
          const descriptionElement = $el.find(".achievement-details, .achievement-description, div.f6")
          const description = descriptionElement.text().trim() || null

          achievements.push({
            slug,
            name,
            image: img,
            tier,
            description,
          })
        } catch (error) {
          console.error(`[GitHubAchievementsScraper] Error parsing achievement at index ${index}:`, error)
        }
      })

      // If no achievements found, check if the page structure has changed or user has no achievements
      if (achievements.length === 0) {
        // Check if the user profile exists
        const profileExists = $('meta[property="og:title"]').length > 0
        if (!profileExists) {
          throw new Error(`User '${sanitizedUsername}' not found`)
        }

        // Check for "no achievements" message
        const noAchievementsText = $('body').text()
        if (noAchievementsText.includes('no achievements') || noAchievementsText.includes('No achievements')) {
          console.log(`[GitHubAchievementsScraper] User ${sanitizedUsername} has no achievements`)
          return []
        }

        // Log warning if structure might have changed
        console.warn(`[GitHubAchievementsScraper] No achievements found for ${sanitizedUsername}. Page structure may have changed.`)
      }

      // Cache the successful response
      this.cache.set(url, {
        data: achievements,
        expiresAt: Date.now() + this.cacheTTL,
      })

      console.log(`[GitHubAchievementsScraper] Scraped ${achievements.length} achievements for ${sanitizedUsername}`)
      return achievements
    } catch (error) {
      console.error(`[GitHubAchievementsScraper] Error scraping achievements for ${sanitizedUsername}:`, error)
      throw error
    }
  }

  // Get cache statistics for monitoring
  public getCacheStats(): { size: number; keys: string[]; entries: Array<{ key: string; itemCount: number; expiresAt: string }> } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      itemCount: value.data.length,
      expiresAt: new Date(value.expiresAt).toISOString(),
    }))

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries,
    }
  }
}

// Export singleton instance
export const githubAchievementsScraperService = new GitHubAchievementsScraperService()

// Export class for testing or creating custom instances
export { GitHubAchievementsScraperService }

