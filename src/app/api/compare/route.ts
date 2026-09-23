import { type NextRequest } from "next/server"
import { githubService } from "@/services/external/github.service"
import { getPowerProgress } from "@/services/api/power-level.service"
import { compareProfiles, type ComparableProfile } from "@/lib/comparison"
import { ApiResponse } from "@/lib/api-response"
import { isValidGitHubUsername } from "@/lib/utils"
import { storage } from "@/lib/storage"
import type { CompareProfileSummary, CompareResponse } from "@/types/github.types"

class UserNotFoundError extends Error {
  constructor(readonly username: string) {
    super(`GitHub user "${username}" not found`)
  }
}

/**
 * DB-first: reuses a cached profile+stats row when one exists, so repeat
 * comparisons don't re-pay for the GraphQL round trips. A miss falls back to
 * githubService and persists the result, same as /api/github/[username].
 *
 * Needs GITHUB_TOKEN for the fallback fetch, and DATABASE_URL always:
 * githubService imports lib/storage, and db-http.service throws at import
 * time when that variable is missing.
 */
async function loadComparable(
  username: string,
): Promise<{ summary: CompareProfileSummary; comparable: ComparableProfile }> {
  const cachedUser = await storage.getUserByUsername(username)
  const cachedStats = cachedUser && (await storage.getGithubStats(cachedUser.id))

  if (cachedUser && cachedStats) {
    const power = getPowerProgress(cachedStats.points || 0)

    const summary: CompareProfileSummary = {
      login: cachedUser.username ?? username,
      name: cachedUser.name ?? null,
      avatar_url: cachedUser.profileImageUrl ?? "",
      html_url: cachedUser.githubUrl ?? `https://github.com/${username}`,
      created_at: cachedUser.githubCreatedAt?.toISOString() ?? new Date().toISOString(),
      points: cachedStats.points || 0,
      powerLevel: power.level,
      powerProgress: power.progressPercent,
    }

    const comparable: ComparableProfile = {
      login: summary.login,
      created_at: summary.created_at,
      followers: cachedStats.followers ?? 0,
      totalStars: cachedStats.totalStars ?? 0,
      totalContributions: cachedStats.overallContributions ?? 0,
      public_repos: cachedStats.totalRepositories ?? 0,
      longestStreak: cachedStats.longestStreak ?? 0,
      closedIssues: cachedStats.closedIssues ?? 0,
      mergedPullRequests: cachedStats.mergedPullRequests ?? 0,
      totalReviews: cachedStats.totalReviews ?? 0,
      languageCount: cachedStats.languageCount ?? 0,
      externalContributors: cachedStats.externalContributors ?? 0,
      points: cachedStats.points || 0,
      powerLevel: power.level,
    }

    return { summary, comparable }
  }

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

  const userId = cachedUser?.id ?? user.id?.toString() ?? `user_${username.toLowerCase()}`
  await storage.upsertUser({
    id: userId,
    username: user.login,
    githubId: user.id?.toString(),
    name: user.name,
    profileImageUrl: user.avatar_url,
    githubUrl: user.html_url,
    githubCreatedAt: user.created_at ? new Date(user.created_at) : undefined,
  })
  await storage.upsertGithubStats({
    userId,
    overallContributions: stats.overallContributions || 0,
    points: stats.points || 0,
    totalStars: stats.totalStars || 0,
    totalRepositories: stats.totalRepositories ?? user.public_repos ?? 0,
    followers: stats.followers ?? user.followers ?? 0,
    longestStreak: stats.longestStreak || 0,
    mergedPullRequests: stats.mergedPullRequests || 0,
    closedIssues: stats.closedIssues || 0,
    totalReviews: stats.totalReviews || 0,
    externalContributors: stats.externalContributors || 0,
    languageCount: stats.languageCount || 0,
    lastFetchedAt: new Date(),
  })

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
