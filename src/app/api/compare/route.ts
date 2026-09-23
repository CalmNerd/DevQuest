import { type NextRequest } from "next/server"
import { githubService } from "@/services/external/github.service"
import { getPowerProgress } from "@/services/api/power-level.service"
import { compareProfiles, type ComparableProfile } from "@/lib/comparison"
import { ApiResponse } from "@/lib/api-response"
import { isValidGitHubUsername } from "@/lib/utils"
import type { CompareProfileSummary, CompareResponse } from "@/types/github.types"

class UserNotFoundError extends Error {
  constructor(readonly username: string) {
    super(`GitHub user "${username}" not found`)
  }
}

/**
 * Deliberately skips the persistence, scraping and leaderboard work that
 * /api/github/[username] does: a comparison is a read, and should not have
 * side effects. Points and levels still come from the same service, so the
 * numbers agree with the profile page.
 *
 * Needs GITHUB_TOKEN. It makes no database calls, but still requires
 * DATABASE_URL to be set: githubService imports lib/storage, and
 * db-http.service throws at import time when that variable is missing.
 */
async function loadComparable(
  username: string,
): Promise<{ summary: CompareProfileSummary; comparable: ComparableProfile }> {
  // Confirm the user exists before paying for the stats fetch, which costs
  // several GraphQL round trips.
  const user = await githubService.fetchUserData(username).catch((error: unknown) => {
    if (error instanceof Error && error.message.includes("404")) {
      throw new UserNotFoundError(username)
    }
    throw error
  })

  const stats = await githubService.fetchUserStats(username)
  const power = getPowerProgress(stats.points || 0)

  const summary: CompareProfileSummary = {
    login: user.login,
    name: user.name ?? null,
    avatar_url: user.avatar_url,
    html_url: user.html_url,
    created_at: user.created_at,
    points: stats.points || 0,
    powerLevel: power.level,
    powerProgress: power.progressPercent,
  }

  const comparable: ComparableProfile = {
    login: user.login,
    created_at: user.created_at,
    followers: stats.followers ?? user.followers ?? 0,
    totalStars: stats.totalStars,
    totalContributions: stats.overallContributions,
    public_repos: stats.totalRepositories ?? user.public_repos ?? 0,
    longestStreak: stats.longestStreak,
    closedIssues: stats.closedIssues,
    mergedPullRequests: stats.mergedPullRequests,
    totalReviews: stats.totalReviews,
    languageCount: stats.languageCount,
    externalContributors: stats.externalContributors,
    points: stats.points || 0,
    powerLevel: power.level,
  }

  return { summary, comparable }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const a = searchParams.get("a")?.trim() ?? ""
  const b = searchParams.get("b")?.trim() ?? ""

  if (!a || !b) {
    return ApiResponse.error("Both 'a' and 'b' usernames are required", { status: 400 })
  }

  const invalid = [a, b].filter((username) => !isValidGitHubUsername(username))
  if (invalid.length > 0) {
    return ApiResponse.error(`Invalid GitHub username: ${invalid.join(", ")}`, { status: 400 })
  }

  if (a.toLowerCase() === b.toLowerCase()) {
    return ApiResponse.error("Pick two different users to compare", { status: 400 })
  }

  try {
    // Both sides are independent network work; overlap them.
    const [left, right] = await Promise.all([loadComparable(a), loadComparable(b)])
    const result = compareProfiles(left.comparable, right.comparable)

    const payload: CompareResponse = {
      a: left.summary,
      b: right.summary,
      metrics: result.metrics,
      wins: result.wins,
      winner: result.winner,
    }

    return ApiResponse.success(payload)
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return ApiResponse.error(error.message, { status: 404 })
    }

    console.error(`[Compare API] Failed to compare ${a} vs ${b}:`, error)
    return ApiResponse.error("Failed to compare profiles", {
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
