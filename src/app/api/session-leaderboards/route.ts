import { type NextRequest } from "next/server"
import { sessionLeaderboardService } from "@/services/api/session-leaderboard.service"
import { drizzleDb } from "@/services/database/drizzle.service"
import { ApiResponse } from "@/lib/api-response"

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

    // Use session data for all leaderboard types
    leaderboardData = await sessionLeaderboardService.getSessionLeaderboard(
      sessionType as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall', 
      limit, 
      offset, 
      type as 'points' | 'commits' | 'stars' | 'streak' | 'repos' | 'followers'
    )
    const sessionStats = await sessionLeaderboardService.getSessionStats(sessionType as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall')
    totalCount = sessionStats.totalParticipants

    // Get session information for display
    const sessionInfo = sessionStats.sessionInfo

    // Transform data to match expected format
    const entries = leaderboardData.map((entry, index) => {
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
        publicRepos: entry.publicRepos || entry.totalRepositories || 0,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        // Session-specific data (all leaderboards now use session data)
        commits: entry.commits || 0,
        sessionType: sessionType,
        // Session information for UI display
        sessionKey: entry.sessionKey,
        sessionStartDate: entry.sessionStartDate,
        sessionEndDate: entry.sessionEndDate,
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    console.log(`[Session Leaderboard] Found ${entries.length} entries for ${sessionType} ${type}, page ${page}/${totalPages}`)

    // Create response data with session info
    const responseData = {
      entries,
      sessionInfo,
      type,
      sessionType,
      period: sessionType,
      lastUpdated: new Date().toISOString(),
    }

    return ApiResponse.success(responseData, {
      headers: {
        'X-Session-Type': sessionType,
        'X-Leaderboard-Type': type,
        'X-Pagination': JSON.stringify({
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        })
      }
    })
  } catch (error) {
    console.error("Error fetching session leaderboard:", error)
    return ApiResponse.error(
      "Failed to fetch session leaderboard",
      {
        details: error instanceof Error ? error.message : "Unknown error"
      }
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