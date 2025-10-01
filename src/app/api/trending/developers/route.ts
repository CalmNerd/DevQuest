import { type NextRequest } from "next/server"
import { githubTrendingScraperService } from "@/services/external"
import { ApiResponse } from "@/lib/api-response"

/**
 * API Route: GET /api/trending/developers
 * 
 * Query Parameters:
 * - language: Programming language filter (e.g., 'javascript', 'python', 'rust')
 * - since: Time period - 'daily' | 'weekly' | 'monthly' (default: 'daily')
 * 
 * Example: /api/trending/developers?language=javascript&since=weekly
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const language = searchParams.get("language") || ""
    const since = (searchParams.get("since") as "daily" | "weekly" | "monthly") || "daily"

    // Validate 'since' parameter
    if (!["daily", "weekly", "monthly"].includes(since)) {
      return ApiResponse.error(
        "Invalid 'since' parameter. Must be 'daily', 'weekly', or 'monthly'",
        { status: 400 }
      )
    }

    console.log(
      `[API /api/trending/developers] Fetching trending developers - language: ${language || "all"}, since: ${since}`
    )

    // Scrape all trending developers (GitHub returns ~25 items max)
    const developers = await githubTrendingScraperService.scrapeTrendingDevelopers({
      language,
      since,
    })

    console.log(
      `[API /api/trending/developers] Successfully scraped ${developers.length} developers`
    )

    // Return all results
    return ApiResponse.success(
      {
        developers,
        totalCount: developers.length,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.error("[API /api/trending/developers] Error:", error)

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("Rate limit exceeded")) {
        return ApiResponse.error("Rate limit exceeded. Please try again later.", {
          status: 429,
        })
      }

      if (error.message.includes("Access forbidden")) {
        return ApiResponse.error("Access forbidden. GitHub may have blocked the request.", {
          status: 403,
        })
      }

      return ApiResponse.error(`Failed to fetch trending developers: ${error.message}`, {
        status: 500,
      })
    }

    return ApiResponse.error("An unexpected error occurred while fetching trending developers", {
      status: 500,
    })
  }
}

/**
 * API Route: DELETE /api/trending/developers
 * 
 * Clears the cache for trending developers
 * Useful for forcing a refresh of the scraped data
 */
export async function DELETE() {
  try {
    githubTrendingScraperService.clearCache()
    
    return ApiResponse.success(
      { message: "Cache cleared successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API /api/trending/developers] Error clearing cache:", error)
    
    return ApiResponse.error("Failed to clear cache", { status: 500 })
  }
}
