import { type NextRequest, NextResponse } from "next/server"
import { drizzleDb } from "@/services/database/drizzle.service"
import { leaderboardService } from "@/services/api/leaderboard.service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "points"
    const period = searchParams.get("period") || "global"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "30")
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit

    console.log(`[Leaderboard] Fetching ${type} leaderboard for period ${period}, page ${page}, limit ${limit}`)

    let leaderboardData: any[] = []
    let totalCount: number = 0

    switch (type) {
      case "points":
        leaderboardData = await drizzleDb.getTopUsersByPoints(limit, offset)
        totalCount = await drizzleDb.getTotalUsersCount()
        break
      case "stars":
        leaderboardData = await drizzleDb.getTopUsersByStars(limit, offset)
        totalCount = await drizzleDb.getTotalUsersCount()
        break
      case "streak":
        leaderboardData = await drizzleDb.getTopUsersByStreak(limit, offset)
        totalCount = await drizzleDb.getTotalUsersCount()
        break
      case "commits":
        // Get users with most commits from leaderboard
        leaderboardData = await leaderboardService.getLeaderboardWithUsers(period, limit, offset)
        totalCount = await leaderboardService.getTotalLeaderboardUsersCount(period)
        break
      case "repos":
        // Get users with most repositories
        leaderboardData = await drizzleDb.getTopUsersByRepositories(limit, offset)
        totalCount = await drizzleDb.getTotalUsersCount()
        break
      case "followers":
        // Get users with most followers
        leaderboardData = await drizzleDb.getTopUsersByFollowers(limit, offset)
        totalCount = await drizzleDb.getTotalUsersCount()
        break
      default:
        leaderboardData = await drizzleDb.getTopUsersByPoints(limit, offset)
        totalCount = await drizzleDb.getTotalUsersCount()
    }

    // Transform data to match expected format
    const entries = leaderboardData.map((user, index) => ({
      rank: offset + index + 1, // Calculate global rank based on offset
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

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    console.log(`[Leaderboard] Found ${entries.length} entries for ${type}, page ${page}/${totalPages}`)

    return NextResponse.json({
      type,
      period,
      entries,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
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
