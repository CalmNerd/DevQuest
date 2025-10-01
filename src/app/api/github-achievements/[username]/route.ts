import { type NextRequest } from "next/server"
import { githubAchievementsScraperService } from "@/services/external"
import { ApiResponse } from "@/lib/api-response"

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    // Validate username parameter
    if (!username || username.trim() === "") {
      return ApiResponse.error(
        "Username is required",
        { status: 400 }
      )
    }

    // Additional validation for username format
    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
    if (!usernameRegex.test(username)) {
      return ApiResponse.error(
        "Invalid GitHub username format. Username must be 1-39 characters and can only contain alphanumeric characters and hyphens.",
        { status: 400 }
      )
    }

    console.log(
      `[API /api/github-achievements/${username}] Fetching GitHub achievements for user: ${username}`
    )

    // Scrape GitHub achievements for the user
    const achievements = await githubAchievementsScraperService.scrapeUserAchievements(username)

    console.log(
      `[API /api/github-achievements/${username}] Successfully scraped ${achievements.length} achievements`
    )

    // Return achievements data
    return ApiResponse.success(
      {
        username,
        achievements,
        totalCount: achievements.length,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.error(`[API /api/github-achievements/${params.username}] Error:`, error)

    // Handle specific error cases
    if (error instanceof Error) {
      // User not found
      if (error.message.includes("not found") || error.message.includes("404")) {
        return ApiResponse.error(
          `GitHub user '${params.username}' not found or achievements tab is not accessible`,
          { status: 404 }
        )
      }

      // Rate limit
      if (error.message.includes("Rate limit exceeded")) {
        return ApiResponse.error(
          "Rate limit exceeded. Please try again later.",
          { status: 429 }
        )
      }

      // Access forbidden
      if (error.message.includes("Access forbidden")) {
        return ApiResponse.error(
          "Access forbidden. GitHub may have blocked the request.",
          { status: 403 }
        )
      }

      // Invalid username format
      if (error.message.includes("Invalid username")) {
        return ApiResponse.error(
          error.message,
          { status: 400 }
        )
      }

      return ApiResponse.error(
        `Failed to fetch GitHub achievements: ${error.message}`,
        { status: 500 }
      )
    }

    return ApiResponse.error(
      "An unexpected error occurred while fetching GitHub achievements",
      { status: 500 }
    )
  }
}

//API Route: DELETE /api/github-achievements/[username]
//Clears the cache for a specific user's achievements
//Useful for forcing a refresh of the scraped data
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    if (!username || username.trim() === "") {
      return ApiResponse.error(
        "Username is required",
        { status: 400 }
      )
    }

    githubAchievementsScraperService.clearUserCache(username)

    return ApiResponse.success(
      {
        message: `Cache cleared successfully for user: ${username}`,
        username
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(`[API /api/github-achievements/${params.username}] Error clearing cache:`, error)

    return ApiResponse.error(
      "Failed to clear cache",
      { status: 500 }
    )
  }
}

//API Route: POST /api/github-achievements/[username]
// Force refresh achievements for a user by clearing cache and fetching fresh data
export async function POST(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    if (!username || username.trim() === "") {
      return ApiResponse.error(
        "Username is required",
        { status: 400 }
      )
    }

    console.log(
      `[API /api/github-achievements/${username}] Force refreshing achievements`
    )

    // Clear cache first
    githubAchievementsScraperService.clearUserCache(username)

    // Fetch fresh data
    const achievements = await githubAchievementsScraperService.scrapeUserAchievements(username)

    console.log(
      `[API /api/github-achievements/${username}] Successfully refreshed ${achievements.length} achievements`
    )

    return ApiResponse.success(
      {
        username,
        achievements,
        totalCount: achievements.length,
        refreshed: true,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.error(`[API /api/github-achievements/${params.username}] Error refreshing:`, error)

    if (error instanceof Error) {
      return ApiResponse.error(
        `Failed to refresh GitHub achievements: ${error.message}`,
        { status: 500 }
      )
    }

    return ApiResponse.error(
      "An unexpected error occurred while refreshing GitHub achievements",
      { status: 500 }
    )
  }
}