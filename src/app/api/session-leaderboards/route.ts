import { type NextRequest, NextResponse } from "next/server"
import { sessionLeaderboardService } from "@/services/api/session-leaderboard.service"
import { drizzleDb } from "@/services/database/drizzle.service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionType = searchParams.get("sessionType") || "daily"
    const type = searchParams.get("type") || "points"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "30")
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit

    console.log(`[Session Leaderboard] Fetching ${type} leaderboard for session ${sessionType}, page ${page}, limit ${limit}`)

    let leaderboardData: any[] = []
    let totalCount: number = 0

    // For commits and points, use session data
    if (type === 'commits' || type === 'points') {
      leaderboardData = await sessionLeaderboardService.getSessionLeaderboard(sessionType as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall', limit, offset)
      const sessionStats = await sessionLeaderboardService.getSessionStats(sessionType as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall')
      totalCount = sessionStats.totalParticipants
    } else {
      // For other types (stars, streak, repos, followers), use user data with session filtering
      switch (type) {
        case "stars":
          leaderboardData = await drizzleDb.getTopUsersByStars(limit, offset)
          totalCount = await drizzleDb.getTotalUsersCount()
          break
        case "streak":
          leaderboardData = await drizzleDb.getTopUsersByStreak(limit, offset)
          totalCount = await drizzleDb.getTotalUsersCount()
          break
        case "repos":
          leaderboardData = await drizzleDb.getTopUsersByRepositories(limit, offset)
          totalCount = await drizzleDb.getTotalUsersCount()
          break
        case "followers":
          leaderboardData = await drizzleDb.getTopUsersByFollowers(limit, offset)
          totalCount = await drizzleDb.getTotalUsersCount()
          break
        default:
          leaderboardData = await drizzleDb.getTopUsersByPoints(limit, offset)
          totalCount = await drizzleDb.getTotalUsersCount()
      }
    }

    // Transform data to match expected format
    const entries = leaderboardData.map((entry, index) => {
      // Handle different data sources
      const isSessionData = type === 'commits' || type === 'points'
      
      return {
        rank: entry.rank || (offset + index + 1),
        username: entry.username,
        name: entry.name || entry.username,
        avatar_url: entry.profileImageUrl || entry.avatar_url || "/placeholder.svg",
        score: getScoreForType(entry, type),
        metric: type,
        // Additional user data
        githubUrl: entry.githubUrl,
        bio: entry.bio,
        location: entry.location,
        followers: entry.followers || 0,
        following: entry.following || 0,
        publicRepos: entry.publicRepos || 0,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        // Session-specific data (only for session-based leaderboards)
        commits: isSessionData ? (entry.commits || 0) : 0,
        sessionType: isSessionData ? sessionType : 'global',
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    console.log(`[Session Leaderboard] Found ${entries.length} entries for ${sessionType} ${type}, page ${page}/${totalPages}`)

    return NextResponse.json({
      type,
      sessionType,
      period: sessionType, // Use sessionType as period for compatibility
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
    console.error("Error fetching session leaderboard:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch session leaderboard",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

function getScoreForType(entry: any, type: string): number {
  switch (type) {
    case "points":
      return entry.score || 0
    case "stars":
      return entry.totalStars || 0
    case "streak":
      return entry.longestStreak || 0
    case "commits":
      return entry.commits || 0
    case "repos":
      return entry.totalRepositories || entry.publicRepos || 0
    case "followers":
      return entry.followers || 0
    default:
      return entry.score || 0
  }
}