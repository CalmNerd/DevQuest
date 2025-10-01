import axios, { AxiosRequestConfig } from "axios"
import * as cheerio from "cheerio"
import {
  ScrapedTrendingRepo,
  ScrapedTrendingDeveloper,
  TrendingRepoOptions,
  TrendingDeveloperOptions,
} from "@/types/github.types"

/**
 * Service for scraping GitHub trending repositories and developers
 * GitHub doesn't provide an official API for trending, so we scrape the HTML
 * from https://github.com/trending and https://github.com/trending/developers
 * 
 * This service follows SOLID principles:
 * - Single Responsibility: Only handles scraping trending data from GitHub
 * - Open/Closed: Can be extended for new scraping methods without modification
 * - Dependency Inversion: Uses interfaces for type safety
 */
class GitHubTrendingScraperService {
  private readonly baseUrl = "https://github.com"
  private readonly trendingUrl = `${this.baseUrl}/trending`
  private readonly userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  
  // Cache for rate limiting protection (in-memory cache with TTL)
  private cache: Map<string, { data: any; expiresAt: number }> = new Map()
  private readonly cacheTTL = 10 * 60 * 1000 // 10 minutes in milliseconds

  /**
   * Make a request with proper headers to avoid blocking
   * @param url - The URL to fetch
   * @returns HTML content as string
   */
  private async makeRequest(url: string): Promise<string> {
    // Check cache first
    const cacheKey = url
    const cached = this.cache.get(cacheKey)
    
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[GitHubTrendingScraper] Cache hit for ${url}`)
      return cached.data
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

      console.log(`[GitHubTrendingScraper] Fetching ${url}`)
      const response = await axios.get(url, config)

      // Cache the response
      this.cache.set(cacheKey, {
        data: response.data,
        expiresAt: Date.now() + this.cacheTTL,
      })

      // Clean up expired cache entries
      this.cleanupCache()

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
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

  /**
   * Clean up expired cache entries to prevent memory leaks
   */
  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache entries
   */
  public clearCache(): void {
    this.cache.clear()
    console.log("[GitHubTrendingScraper] Cache cleared")
  }

  /**
   * Scrape GitHub trending repositories
   * 
   * @param options - Scraping options
   * @param options.language - Programming language filter (e.g., 'javascript', 'python', 'rust')
   * @param options.since - Time period ('daily' | 'weekly' | 'monthly')
   * @param options.spokenLanguage - Spoken language code (e.g., 'en', 'hi')
   * @returns Array of scraped trending repositories
   */
  async scrapeTrendingRepos(options: TrendingRepoOptions = {}): Promise<ScrapedTrendingRepo[]> {
    const { language = "", since = "daily", spokenLanguage = "" } = options

    // Build URL with query parameters
    const languagePath = language ? `/${language}` : ""
    const url = `${this.trendingUrl}${languagePath}?since=${since}&spoken_language_code=${spokenLanguage}`

    try {
      const html = await this.makeRequest(url)
      const $ = cheerio.load(html)
      const repos: ScrapedTrendingRepo[] = []

      // GitHub uses article.Box-row for each trending repository
      $("article.Box-row").each((index, element) => {
        try {
          const $el = $(element)

          // Extract repository title and URL
          const titleElement = $el.find("h2 a")
          const fullTitle = titleElement.text().trim().replace(/\s+/g, " ")
          const href = titleElement.attr("href")

          if (!href) {
            console.warn(`[GitHubTrendingScraper] Skipping repo at index ${index}: No href found`)
            return
          }

          // Parse owner and repo name from href (e.g., "/owner/repo" -> ["owner", "repo"])
          const pathParts = href.split("/").filter(Boolean)
          const owner = pathParts[0] || ""
          const name = pathParts[1] || ""
          
          // Extract description
          const description = $el.find("p").first().text().trim() || null

          // Extract language
          const language = $el.find('[itemprop="programmingLanguage"]').text().trim() || null

          // Extract stars count
          const starsElement = $el.find('.Link--muted[href*="/stargazers"]').first()
          const stars = starsElement.text().trim() || "0"

          // Extract forks count
          const forksElement = $el.find('.Link--muted[href*="/forks"]').first()
          const forks = forksElement.text().trim() || "0"

          // Extract today's stars
          const todayStarsElement = $el.find(".d-inline-block.float-sm-right")
          const todayStars = todayStarsElement.text().trim() || "0 stars today"

          // Extract "Built by" contributors
          const builtBy: Array<{ username: string; avatarUrl: string; profileUrl: string }> = []
          $el.find('span:contains("Built by")').find('a img.avatar-user').each((i, contributorImg) => {
            const $contributorLink = $(contributorImg).parent()
            const profileHref = $contributorLink.attr("href")
            const avatarSrc = $(contributorImg).attr("src")
            const alt = $(contributorImg).attr("alt")

            if (profileHref && avatarSrc) {
              const username = alt?.replace("@", "") || profileHref.split("/").filter(Boolean).pop() || ""
              
              builtBy.push({
                username,
                avatarUrl: avatarSrc,
                profileUrl: `${this.baseUrl}${profileHref}`,
              })
            }
          })

          repos.push({
            title: fullTitle,
            url: `${this.baseUrl}${href}`,
            description,
            language,
            stars,
            forks,
            todayStars,
            owner: owner || "",
            name: name || "",
            builtBy,
          })
        } catch (error) {
          console.error(`[GitHubTrendingScraper] Error parsing repo at index ${index}:`, error)
        }
      })

      console.log(`[GitHubTrendingScraper] Scraped ${repos.length} trending repositories`)
      return repos
    } catch (error) {
      console.error("[GitHubTrendingScraper] Error scraping trending repos:", error)
      throw error
    }
  }

  /**
   * Scrape GitHub trending developers
   * 
   * @param options - Scraping options
   * @param options.language - Programming language filter (e.g., 'javascript', 'python', 'rust')
   * @param options.since - Time period ('daily' | 'weekly' | 'monthly')
   * @returns Array of scraped trending developers
   */
  async scrapeTrendingDevelopers(options: TrendingDeveloperOptions = {}): Promise<ScrapedTrendingDeveloper[]> {
    const { language = "", since = "daily" } = options

    // Build URL with query parameters
    const languagePath = language ? `/${language}` : ""
    const url = `${this.trendingUrl}/developers${languagePath}?since=${since}`

    try {
      const html = await this.makeRequest(url)
      const $ = cheerio.load(html)
      const developers: ScrapedTrendingDeveloper[] = []

      // GitHub uses article.Box-row for each trending developer
      $("article.Box-row").each((index, element) => {
        try {
          const $el = $(element)

          // Extract developer name (full name like "Ido Salomon")
          const nameElement = $el.find("h1.h3.lh-condensed a")
          const name = nameElement.text().trim()
          const profileHref = nameElement.attr("href")

          // Extract username (like "idosal")
          const usernameElement = $el.find("p.f4.text-normal a")
          const username = usernameElement.text().trim()

          if (!profileHref || !username) {
            console.warn(`[GitHubTrendingScraper] Skipping developer at index ${index}: No profile href or username found`)
            return
          }

          // Extract avatar URL
          const avatarUrl = $el.find("img.avatar-user").attr("src") || null

          // Extract popular repository information (h1.h4 is more specific)
          const repoElement = $el.find("article h1.h4 a")
          const repoHref = repoElement.attr("href")
          const repoUrl = repoHref ? `${this.baseUrl}${repoHref}` : null
          
          // Extract repo name from href for accuracy (e.g., "/owner/repo" -> "repo")
          let repoName: string | null = null
          if (repoHref) {
            const repoPathParts = repoHref.split("/").filter(Boolean)
            if (repoPathParts.length >= 2) {
              repoName = repoPathParts[1] // Get the repository name part
            }
          }
          
          // Fallback: if href parsing failed, try to extract from text
          if (!repoName) {
            const repoText = repoElement.text().trim()
            if (repoText) {
              // Remove extra whitespace and newlines
              const cleanText = repoText.replace(/\s+/g, " ").trim()
              // Extract just the repository name if it contains owner/repo format
              const repoNameParts = cleanText.split("/").map(part => part.trim())
              if (repoNameParts.length === 2) {
                repoName = repoNameParts[1]
              } else {
                repoName = cleanText
              }
            }
          }

          // Extract repository description
          const repoDescription = $el.find("article .f6.color-fg-muted.mt-1").text().trim() || null

          developers.push({
            username,
            name,
            url: `${this.baseUrl}${profileHref}`,
            avatarUrl,
            repoName,
            repoUrl,
            repoDescription,
          })
        } catch (error) {
          console.error(`[GitHubTrendingScraper] Error parsing developer at index ${index}:`, error)
        }
      })

      console.log(`[GitHubTrendingScraper] Scraped ${developers.length} trending developers`)
      return developers
    } catch (error) {
      console.error("[GitHubTrendingScraper] Error scraping trending developers:", error)
      throw error
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Export singleton instance
export const githubTrendingScraperService = new GitHubTrendingScraperService()

// Export class for testing or creating custom instances
export { GitHubTrendingScraperService }
