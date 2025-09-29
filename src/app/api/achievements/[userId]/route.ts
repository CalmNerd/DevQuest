import { type NextRequest, NextResponse } from "next/server"
import { achievementService } from "@/services/api/achievement.service"
import { storage } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const rarity = searchParams.get("rarity")
    const includeProgress = searchParams.get("includeProgress") === "true"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    let achievements

    if (includeProgress) {
      // Get achievements with progress tracking
      achievements = await achievementService.getUserAchievementProgress(userId)
    } else {
      // Get basic achievement data
      if (category) {
        achievements = await achievementService.getAchievementsByCategory(category)
      } else if (rarity) {
        achievements = await achievementService.getAchievementsByRarity(rarity)
      } else {
        const allAchievements = await storage.getAllAchievements()
        const userAchievements = await storage.getUserAchievements(userId)
        
        achievements = allAchievements.map(achievement => {
          const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
          return {
            ...achievement,
            isUnlocked: !!userAchievement,
            unlockedAt: userAchievement?.unlockedAt,
            progress: userAchievement?.progress || 0,
            maxProgress: userAchievement?.maxProgress || 1,
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: achievements,
      count: achievements.length,
    })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch achievements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const body = await request.json()
    const { action } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    switch (action) {
      case "evaluate":
        // Evaluate and unlock new achievements
        const newlyUnlocked = await achievementService.evaluateAndUnlockAchievements(userId)
        return NextResponse.json({
          success: true,
          data: newlyUnlocked,
          message: `Unlocked ${newlyUnlocked.length} new achievements`,
        })

      case "updateProgress":
        // Update progress for all achievements
        await achievementService.updateAchievementProgress(userId)
        return NextResponse.json({
          success: true,
          message: "Achievement progress updated",
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing achievement action:", error)
    return NextResponse.json(
      {
        error: "Failed to process achievement action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
