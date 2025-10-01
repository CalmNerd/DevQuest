import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { getPowerProgress } from "@/services/api/power-level.service"
import { achievementService } from "@/services/api/achievement.service"
import { ApiResponse } from "@/lib/api-response"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
    try {
        const { username } = params
        const { searchParams } = new URL(request.url)
        const includeAchievements = searchParams.get("achievements") !== "false"

        console.log(`[User Profile API] Fetching database profile for: ${username}`)

        // Get user from database
        const user = await storage.getUserByUsername(username)
        if (!user) {
            return ApiResponse.error("User not found", { status: 404 })
        }

        // Get user's GitHub stats
        const githubStats = await storage.getGithubStats(user.id)
        if (!githubStats) {
            return ApiResponse.error("User stats not found", { status: 404 })
        }

        // Get user's achievements if requested
        let achievementProgress: any[] = []
        if (includeAchievements) {
            try {
                achievementProgress = await achievementService.getUserAchievementProgress(user.id)
            } catch (error) {
                console.error(`Failed to fetch achievements for ${username}:`, error)
                // Don't fail the request if achievements fail
            }
        }

        // Get GitHub native achievements
        let githubNativeAchievements: any[] = []
        try {
            const nativeAchievements = await storage.getGithubNativeAchievements(user.id)
            githubNativeAchievements = nativeAchievements.map(a => ({
                slug: a.slug,
                name: a.name,
                image: a.image,
                tier: a.tier,
                description: a.description,
            }))
        } catch (error) {
            console.error(`Failed to fetch GitHub native achievements for ${username}:`, error)
        }

        // Get trending developer badges
        let trendingDeveloperBadges: any[] = []
        try {
            const badges = await storage.getTrendingDeveloperBadges(user.id)
            trendingDeveloperBadges = badges.map(badge => ({
                timePeriod: badge.timePeriod,
                level: badge.level,
                isCurrent: badge.isCurrent,
                currentRank: badge.currentRank,
                bestRank: badge.bestRank,
                language: badge.language,
                firstTrendingAt: badge.firstTrendingAt.toISOString(),
                lastTrendingAt: badge.lastTrendingAt.toISOString(),
            }))
        } catch (error) {
            console.error(`Failed to fetch trending badges for ${username}:`, error)
        }

        // Calculate power level
        const powerLevel = getPowerProgress(githubStats.points || 0)

        // Build comprehensive profile data
        const profile = {
            // Basic user data
            user: {
                id: user.githubId || user.id,
                login: user.username,
                name: user.name,
                bio: user.bio,
                avatar_url: user.profileImageUrl || "/placeholder.svg",
                html_url: user.githubUrl || `https://github.com/${user.username}`,
                blog: user.blogUrl,
                location: user.location,
                email: user.email,
                twitter_username: user.twitterUsername,
                created_at: user.githubCreatedAt?.toISOString() || user.createdAt?.toISOString(),
                updated_at: user.updatedAt?.toISOString(),
                public_repos: githubStats.totalRepositories || 0,
                public_gists: 0, // Not stored in our database
                followers: githubStats.followers || 0,
                following: githubStats.following || 0,
            },

            // Enhanced statistics
            totalStars: githubStats.totalStars || 0,
            totalForks: githubStats.totalForks || 0,
            totalWatchers: 0, // Not directly stored
            totalIssues: githubStats.totalIssues || 0,
            totalPRs: githubStats.totalPullRequests || 0,
            totalCommits: githubStats.totalCommits || 0,
            totalContributions: githubStats.overallContributions || 0,
            contributionStreak: githubStats.currentStreak || 0,
            longestStreak: githubStats.longestStreak || 0,
            points: githubStats.points || 0,

            // Additional detailed stats
            dailyContributions: githubStats.dailyContributions || 0,
            weeklyContributions: githubStats.weeklyContributions || 0,
            monthlyContributions: githubStats.monthlyContributions || 0,
            yearlyContributions: githubStats.yearlyContributions || 0,
            last365Contributions: githubStats.last365Contributions || 0,
            thisYearContributions: githubStats.thisYearContributions || 0,
            mergedPullRequests: githubStats.mergedPullRequests || 0,
            closedIssues: githubStats.closedIssues || 0,
            totalReviews: githubStats.totalReviews || 0,
            meaningfulCommits: githubStats.meaningfulCommits || 0,
            contributedTo: githubStats.contributedTo || 0,
            externalContributors: githubStats.externalContributors || 0,
            reposWithStars: githubStats.reposWithStars || 0,
            reposWithForks: githubStats.reposWithForks || 0,
            dependencyUsage: githubStats.dependencyUsage || 0,
            languageCount: githubStats.languageCount || 0,
            topLanguagePercentage: githubStats.topLanguagePercentage || 0,
            rareLanguageRepos: githubStats.rareLanguageRepos || 0,

            // Power level system
            powerLevel: powerLevel.level,
            powerProgress: powerLevel.progressPercent,
            pointsToNext: powerLevel.pointsToNext,
            nextLevelCost: powerLevel.nextLevelCost,

            // Languages and repositories
            topLanguages: githubStats.languageStats || {},
            repos: [], // Not stored in database, would need separate endpoint

            // Contribution graph
            contributionGraph: githubStats.contributionGraph || { weeks: [], totalContributions: 0 },

            // Achievements
            achievements: [], // Legacy field
            achievementProgress,

            // GitHub Native Achievements
            githubNativeAchievements,

            // Trending Developer Badges
            trendingDeveloperBadges,

            // Metadata
            cached: true,
            lastUpdated: githubStats.lastFetchedAt?.toISOString() || user.updatedAt?.toISOString(),
            hasApiErrors: false,
        }

        console.log(`[User Profile API] Successfully fetched profile for ${username}`)

        return ApiResponse.success(profile)
    } catch (error) {
        console.error(`[User Profile API] Error fetching profile for ${params.username}:`, error)
        return ApiResponse.error(
            "Failed to fetch user profile",
            {
                details: error instanceof Error ? error.message : "Unknown error"
            }
        )
    }
}
