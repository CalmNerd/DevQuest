import { NextRequest, NextResponse } from "next/server"
import { drizzleDb } from '@/services/database/drizzle.service'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "overview"

    switch (type) {
      case "overview":
        const platformStats = await drizzleDb.getPlatformStats()
        const achievementStats = await drizzleDb.getAchievementStats()

        return NextResponse.json({
          status: "success",
          data: {
            platform: platformStats,
            achievements: achievementStats,
            timestamp: new Date().toISOString(),
          },
        })

      case "top-users":
        const limit = parseInt(searchParams.get("limit") || "10")
        const topUsersByPoints = await drizzleDb.getTopUsersByPoints(limit)
        const topUsersByStars = await drizzleDb.getTopUsersByStars(limit)
        const topUsersByStreak = await drizzleDb.getTopUsersByStreak(limit)

        return NextResponse.json({
          status: "success",
          data: {
            byPoints: topUsersByPoints,
            byStars: topUsersByStars,
            byStreak: topUsersByStreak,
            timestamp: new Date().toISOString(),
          },
        })

      case "languages":
        const languageDistribution = await drizzleDb.getLanguageDistribution()

        return NextResponse.json({
          status: "success",
          data: {
            distribution: languageDistribution,
            timestamp: new Date().toISOString(),
          },
        })

      case "growth":
        const days = parseInt(searchParams.get("days") || "30")
        const userGrowth = await drizzleDb.getUserGrowth(days)

        return NextResponse.json({
          status: "success",
          data: {
            growth: userGrowth,
            period: `${days} days`,
            timestamp: new Date().toISOString(),
          },
        })

      case "leaderboards":
        const period = searchParams.get("period") || "daily"
        const periodDate = searchParams.get("periodDate") || new Date().toISOString().split("T")[0]
        const leaderboardLimit = parseInt(searchParams.get("limit") || "50")

        const leaderboard = await drizzleDb.getLeaderboardWithUsers(period, periodDate, leaderboardLimit)

        return NextResponse.json({
          status: "success",
          data: {
            leaderboard,
            period,
            periodDate,
            timestamp: new Date().toISOString(),
          },
        })

      default:
        return NextResponse.json(
          {
            status: "error",
            message: "Invalid analytics type. Use: overview, top-users, languages, growth, leaderboards",
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error fetching Drizzle analytics:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch analytics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
