import { type NextRequest, NextResponse } from "next/server"
import { drizzleDb } from "@/services/database/drizzle.service"
import { leaderboardService } from "@/services/api/leaderboard.service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "points"
    const period = searchParams.get("period") || "global"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log(`[Leaderboard] Fetching ${type} leaderboard for period ${period}`)

    let leaderboardData: any[] = []

    switch (type) {
      case "points":
        leaderboardData = await drizzleDb.getTopUsersByPoints(limit)
        break
      case "stars":
        leaderboardData = await drizzleDb.getTopUsersByStars(limit)
        break
      case "streak":
        leaderboardData = await drizzleDb.getTopUsersByStreak(limit)
        break
      case "commits":
        // Get users with most commits from leaderboard
        leaderboardData = await leaderboardService.getLeaderboardWithUsers(period, limit)
        break
      case "repos":
        // Get users with most repositories
        leaderboardData = await drizzleDb.getTopUsersByRepositories(limit)
        break
      case "followers":
        // Get users with most followers
        leaderboardData = await drizzleDb.getTopUsersByFollowers(limit)
        break
      default:
        leaderboardData = await drizzleDb.getTopUsersByPoints(limit)
    }

    // Transform data to match expected format
    const entries = leaderboardData.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      name: user.name,
      avatar_url: user.profileImageUrl,
      score: getScoreForType(user, type),
      metric: type,
      // Additional user data
      githubUrl: user.githubUrl,
      bio: user.bio,
      location: user.location,
      followers: user.followers || 0,
      following: user.following || 0,
      publicRepos: user.publicRepos || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    console.log(`[Leaderboard] Found ${entries.length} entries for ${type}`)

    return NextResponse.json({
      type,
      period,
      entries,
      total: entries.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch leaderboard",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

function getScoreForType(user: any, type: string): number {
  switch (type) {
    case "points":
      return user.points || 0
    case "stars":
      return user.totalStars || 0
    case "streak":
      return user.longestStreak || 0
    case "commits":
      return user.commits || 0
    case "repos":
      return user.totalRepositories || user.publicRepos || 0
    case "followers":
      return user.followers || 0
    default:
      return user.points || 0
  }
}
