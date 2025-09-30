import { type NextRequest, NextResponse } from "next/server"
import { githubService } from "@/services/external/github.service"
import { getPowerProgress } from "@/services/api/power-level.service"
import { storage } from "@/lib/storage"

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<any>>()

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    // Check if there's already an ongoing request for this user
    if (!forceRefresh && ongoingRequests.has(username)) {
      console.log(` Request for ${username} already in progress, waiting...`)
      const result = await ongoingRequests.get(username)
      return NextResponse.json(result)
    }

    console.log(` Fetching profile for username: ${username}`)

    // Create a promise for this request and store it
    const requestPromise = (async () => {
      let githubData
      let statsData
      let hasErrors = false

    try {
      // Try to fetch basic user data first
      githubData = await githubService.fetchUserData(username)
      console.log(` Successfully fetched basic user data for ${username}`)
    } catch (error) {
      console.error(` Failed to fetch basic user data:`, error)
      if (error instanceof Error && error.message.includes("404")) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      throw error
    }

    try {
      // Always perform full fetch
      console.log(`User ${username}: performing full fetch`)

      // Add request ID to track concurrent requests
      const requestId = Math.random().toString(36).substring(7)
      console.log(`[${requestId}] Starting full fetch for ${username}`)

      // Try to fetch enhanced stats with full fetch
      const startTime = Date.now()
      statsData = await githubService.fetchUserStats(username)
      const fetchTime = Date.now() - startTime
      console.log(`[${requestId}] Successfully fetched user stats for ${username} (full fetch) in ${fetchTime}ms`)
    } catch (error) {
      console.error(` Failed to fetch user stats:`, error)
      hasErrors = true

      // CRITICAL FIX: Don't create fallback data that overwrites existing stats
      // Instead, get existing stats from database to preserve data integrity
      const existingUser = await storage.getUserByUsername(username)
      if (existingUser) {
        const existingStats = await storage.getGithubStats(existingUser.id)
        if (existingStats) {
          console.log(`Using existing stats to preserve data integrity for ${username}`)
          // Return existing stats with updated timestamp only
          statsData = {
            ...existingStats,
            lastFetchedAt: new Date(),
            // Mark as failed fetch for monitoring
            fetchFailed: true,
            fetchError: error instanceof Error ? error.message : 'Unknown error'
          }
        } else {
          // No existing stats, create minimal fallback
          console.log(`No existing stats found, creating minimal fallback for ${username}`)
          statsData = {
            dailyContributions: 0,
            weeklyContributions: 0,
            monthlyContributions: 0,
            yearlyContributions: 0,
            last365Contributions: 0,
            thisYearContributions: 0,
            overallContributions: 0,
            points: (githubData.public_repos || 0) * 3 + (githubData.followers || 0),
            totalStars: 0,
            totalForks: 0,
            contributedTo: 0,
            totalRepositories: githubData.public_repos || 0,
            followers: githubData.followers || 0,
            following: githubData.following || 0,
            currentStreak: 0,
            longestStreak: 0,
            topLanguage: null,
            languageStats: {},
            contributionGraph: { weeks: [], totalContributions: 0 },
            totalCommits: 0,
            meaningfulCommits: 0,
            totalPullRequests: 0,
            mergedPullRequests: 0,
            totalIssues: 0,
            closedIssues: 0,
            totalReviews: 0,
            externalContributors: 0,
            reposWithStars: 0,
            reposWithForks: 0,
            dependencyUsage: 0,
            languageCount: 0,
            topLanguagePercentage: 0,
            rareLanguageRepos: 0,
            lastFetchedAt: new Date(),
            fetchFailed: true,
            fetchError: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      } else {
        // User doesn't exist, create minimal fallback
        console.log(`User not found, creating minimal fallback for ${username}`)
        statsData = {
          dailyContributions: 0,
          weeklyContributions: 0,
          monthlyContributions: 0,
          yearlyContributions: 0,
          last365Contributions: 0,
          thisYearContributions: 0,
          overallContributions: 0,
          points: (githubData.public_repos || 0) * 3 + (githubData.followers || 0),
          totalStars: 0,
          totalForks: 0,
          contributedTo: 0,
          totalRepositories: githubData.public_repos || 0,
          followers: githubData.followers || 0,
          following: githubData.following || 0,
          currentStreak: 0,
          longestStreak: 0,
          topLanguage: null,
          languageStats: {},
          contributionGraph: { weeks: [], totalContributions: 0 },
          totalCommits: 0,
          meaningfulCommits: 0,
          totalPullRequests: 0,
          mergedPullRequests: 0,
          totalIssues: 0,
          closedIssues: 0,
          totalReviews: 0,
          externalContributors: 0,
          reposWithStars: 0,
          reposWithForks: 0,
          dependencyUsage: 0,
          languageCount: 0,
          topLanguagePercentage: 0,
          rareLanguageRepos: 0,
          lastFetchedAt: new Date(),
          fetchFailed: true,
          fetchError: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    let repos = []
    try {
      repos = await githubService.fetchUserRepositories(username, 1, 30)
      console.log(` Successfully fetched ${repos.length} repositories for ${username}`)

      if (hasErrors && repos.length > 0) {
        const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0)
        const totalForks = repos.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0)
        const reposWithStars = repos.filter((repo: any) => repo.stargazers_count > 0).length
        const reposWithForks = repos.filter((repo: any) => repo.forks_count > 0).length

        // Calculate language stats from repositories
        const languageStats: Record<string, number> = {}
        repos.forEach((repo: any) => {
          if (repo.language) {
            languageStats[repo.language] = (languageStats[repo.language] || 0) + 1
          }
        })
        const languageCount = Object.keys(languageStats).length

        const topLanguage =
          Object.entries(languageStats).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || null

        const topLanguagePercentage = topLanguage ? Math.round((languageStats[topLanguage] / repos.length) * 100) : 0

        // Recalculate points with repository data
        const points = totalStars * 2 + repos.length * 3 + (githubData.followers || 0)

        // Update statsData with calculated values
        statsData.totalStars = totalStars
        statsData.totalForks = totalForks
        statsData.reposWithStars = reposWithStars
        statsData.reposWithForks = reposWithForks
        statsData.languageStats = languageStats
        statsData.languageCount = languageCount
        statsData.topLanguage = topLanguage
        statsData.topLanguagePercentage = topLanguagePercentage
        statsData.points = points
      }
    } catch (error) {
      console.error(` Failed to fetch repositories:`, error)
      repos = []
    }

    const powerLevel = getPowerProgress(statsData.points)

    // Generate a unique user ID based on GitHub ID or username
    const userId = githubData.id?.toString() || `user_${username.toLowerCase()}`

    const profile = {
      // Basic GitHub data
      id: githubData.id,
      login: githubData.login,
      name: githubData.name,
      bio: githubData.bio,
      avatar_url: githubData.avatar_url,
      html_url: githubData.html_url,
      blog: githubData.blog,
      location: githubData.location,
      email: githubData.email,
      twitter_username: githubData.twitter_username,
      created_at: githubData.created_at,
      updated_at: githubData.updated_at,

      // GitHub stats
      public_repos: githubData.public_repos,
      public_gists: githubData.public_gists,
      followers: githubData.followers,
      following: githubData.following,

      // Enhanced statistics (with fallbacks)
      totalStars: statsData.totalStars,
      totalForks: statsData.totalForks,
      totalWatchers: repos.reduce((sum: number, repo: any) => sum + (repo.watchers_count || 0), 0),
      totalIssues: statsData.totalIssues,
      totalPRs: statsData.totalPullRequests,
      totalCommits: statsData.totalCommits,
      totalContributions: statsData.overallContributions,
      contributionStreak: statsData.currentStreak,
      longestStreak: statsData.longestStreak,
      points: statsData.points,

      // Additional detailed stats
      dailyContributions: statsData.dailyContributions,
      weeklyContributions: statsData.weeklyContributions,
      monthlyContributions: statsData.monthlyContributions,
      yearlyContributions: statsData.yearlyContributions,
      last365Contributions: statsData.last365Contributions,
      thisYearContributions: statsData.thisYearContributions,
      mergedPullRequests: statsData.mergedPullRequests,
      closedIssues: statsData.closedIssues,
      totalReviews: statsData.totalReviews,
      meaningfulCommits: statsData.meaningfulCommits,
      contributedTo: statsData.contributedTo,
      externalContributors: statsData.externalContributors,
      reposWithStars: statsData.reposWithStars,
      reposWithForks: statsData.reposWithForks,
      dependencyUsage: statsData.dependencyUsage,
      languageCount: statsData.languageCount,
      topLanguagePercentage: statsData.topLanguagePercentage,
      rareLanguageRepos: statsData.rareLanguageRepos,

      // Power level system
      powerLevel: powerLevel.level,
      powerProgress: powerLevel.progressPercent,
      pointsToNext: powerLevel.pointsToNext,
      nextLevelCost: powerLevel.nextLevelCost,

      // Languages and repositories
      topLanguages: statsData.languageStats || {},
      repos: repos.slice(0, 20), // Limit to top 20 repos

      // Contribution graph
      contributionGraph: statsData.contributionGraph || { weeks: [], totalContributions: 0 },

      achievements: [], //handled by leveled achievements
      achievementProgress: await getUserAchievementProgress(userId),

      // Metadata
      cached: false,
      lastUpdated: new Date().toISOString(),
      hasApiErrors: hasErrors, // Flag to indicate if there were API issues
    }

    console.log(` Successfully built profile for ${username} with ${hasErrors ? "fallback" : "full"} data`)

    // Save data to database (async, don't wait for completion)
    saveUserDataToDatabase(userId, username, githubData, statsData, repos).catch((error) => {
      console.error(` Failed to save data for ${username}:`, error)
    })

      return profile
    })()

    // Store the promise and clean up when done
    ongoingRequests.set(username, requestPromise)
    
    try {
      const result = await requestPromise
      return NextResponse.json(result)
    } finally {
      // Clean up the ongoing request
      ongoingRequests.delete(username)
    }
  } catch (error) {
    console.error(` Error fetching GitHub profile:`, error)

    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function getUserAchievementProgress(userId: string): Promise<any[]> {
  try {
    const { achievementService } = await import("@/services/api/achievement.service")
    return await achievementService.getUserAchievementProgress(userId)
  } catch (error) {
    console.error("Failed to get achievement progress:", error)
    return []
  }
}


//  Save user data to database asynchronously
//  This function handles all database operations for user profiles 
async function saveUserDataToDatabase(
  userId: string,
  username: string,
  githubData: any,
  statsData: any,
  repos: any[]
): Promise<void> {
  try {
    console.log(` Starting database save for ${username}`)

    // Upsert user profile data
    await storage.upsertUser({
      id: userId,
      username: githubData.login,
      githubId: githubData.id?.toString(),
      email: githubData.email,
      firstName: githubData.name?.split(' ')[0],
      lastName: githubData.name?.split(' ').slice(1).join(' '),
      name: githubData.name,
      bio: githubData.bio,
      profileImageUrl: githubData.avatar_url,
      githubUrl: githubData.html_url,
      blogUrl: githubData.blog,
      twitterUsername: githubData.twitter_username,
      location: githubData.location,
      githubCreatedAt: githubData.created_at ? new Date(githubData.created_at) : undefined,
    })

    console.log(` Saved user profile for ${username}`)

    // Upsert GitHub stats with incremental metadata
    await storage.upsertGithubStats({
      userId,
      dailyContributions: statsData.dailyContributions || 0,
      weeklyContributions: statsData.weeklyContributions || 0,
      monthlyContributions: statsData.monthlyContributions || 0,
      yearlyContributions: statsData.yearlyContributions || 0,
      last365Contributions: statsData.last365Contributions || 0,
      thisYearContributions: statsData.thisYearContributions || 0,
      overallContributions: statsData.overallContributions || 0,
      points: statsData.points || 0,
      totalStars: statsData.totalStars || 0,
      totalForks: statsData.totalForks || 0,
      contributedTo: statsData.contributedTo || 0,
      totalRepositories: statsData.totalRepositories || 0,
      followers: statsData.followers || githubData.followers || 0,
      following: statsData.following || githubData.following || 0,
      currentStreak: statsData.currentStreak || 0,
      longestStreak: statsData.longestStreak || 0,
      topLanguage: statsData.topLanguage,
      languageStats: statsData.languageStats || {},
      contributionGraph: statsData.contributionGraph || { weeks: [], totalContributions: 0 },
      totalCommits: statsData.totalCommits || 0,
      meaningfulCommits: statsData.meaningfulCommits || 0,
      totalPullRequests: statsData.totalPullRequests || 0,
      mergedPullRequests: statsData.mergedPullRequests || 0,
      totalIssues: statsData.totalIssues || 0,
      closedIssues: statsData.closedIssues || 0,
      totalReviews: statsData.totalReviews || 0,
      externalContributors: statsData.externalContributors || 0,
      reposWithStars: statsData.reposWithStars || 0,
      reposWithForks: statsData.reposWithForks || 0,
      dependencyUsage: statsData.dependencyUsage || 0,
      languageCount: statsData.languageCount || 0,
      topLanguagePercentage: statsData.topLanguagePercentage || 0,
      rareLanguageRepos: statsData.rareLanguageRepos || 0,
      lastFetchedAt: new Date(),
    })

    console.log(` Saved GitHub stats for ${username}`)

    // Check and unlock achievements
    const newAchievements = await storage.checkAndUnlockAchievements(userId)
    if (newAchievements.length > 0) {
      console.log(` Unlocked ${newAchievements.length} new achievements for ${username}`)
    }

    // Update leaderboards for all active sessions
    await updateUserLeaderboards(userId, statsData)
    console.log(` Updated leaderboards for ${username}`)

    console.log(` Successfully saved all data for ${username}`)
  } catch (error) {
    console.error(` Database save failed for ${username}:`, error)
    throw error
  }
}

//  Update leaderboards for a user across all active sessions
async function updateUserLeaderboards(userId: string, statsData: any): Promise<void> {
  try {
    // Get user's current stats
    const userStats = await storage.getGithubStats(userId)
    if (!userStats) {
      console.log(`No stats found for user ${userId}, skipping leaderboard update`)
      return
    }

    // Calculate commits for different periods
    const commits = {
      daily: userStats.dailyContributions || 0,
      weekly: userStats.weeklyContributions || 0,
      monthly: userStats.monthlyContributions || 0,
      yearly: userStats.yearlyContributions || 0,
      overall: userStats.overallContributions || 0,
    }

    // Calculate score based on points
    const score = userStats.points || 0

    // Update leaderboards for each session type
    const sessionTypes = ['daily', 'weekly', 'monthly', 'yearly', 'overall'] as const
    
    for (const sessionType of sessionTypes) {
      try {
        // Get active session for this type
        const activeSession = await getActiveSession(sessionType)
        if (!activeSession) {
          console.log(`No active ${sessionType} session found, skipping`)
          continue
        }

        // Update leaderboard entry for this session
        await storage.updateLeaderboardEntry({
          userId,
          sessionId: activeSession.id,
          period: sessionType,
          periodDate: getPeriodDate(sessionType, activeSession.startDate),
          commits: commits[sessionType],
          score: score,
        })

        console.log(`Updated ${sessionType} leaderboard for user ${userId}: ${commits[sessionType]} commits, ${score} score (rank updated immediately)`)
      } catch (error) {
        console.error(`Error updating ${sessionType} leaderboard for user ${userId}:`, error)
      }
    }
  } catch (error) {
    console.error(`Error updating leaderboards for user ${userId}:`, error)
  }
}

//  Get active session for a specific type
//  Enhanced to ensure only one active session per type and clean up duplicates
async function getActiveSession(sessionType: string): Promise<any | null> {
  try {
    const { db } = await import("@/services/database/db-http.service")
    const { leaderboardSessions } = await import("@/lib/schema")
    const { eq, and } = await import("drizzle-orm")
    const { timezoneService } = await import("@/lib/timezone")

    // Get all active sessions for this type to check for duplicates
    const activeSessions = await db
      .select()
      .from(leaderboardSessions)
      .where(
        and(
          eq(leaderboardSessions.sessionType, sessionType),
          eq(leaderboardSessions.isActive, true)
        )
      )

    if (activeSessions.length === 0) {
      console.log(`No active ${sessionType} session found`)
      return null
    }

    // If multiple active sessions exist (shouldn't happen but can due to race conditions)
    if (activeSessions.length > 1) {
      console.warn(`WARNING: Found ${activeSessions.length} active ${sessionType} sessions! Cleaning up duplicates...`)
      
      // Get the expected session key for current period
      const expectedSessionKey = timezoneService.getSessionKey(sessionType as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall')
      
      // Find the session with the correct session key
      const correctSession = activeSessions.find(s => s.sessionKey === expectedSessionKey)
      
      // If no session matches the expected key, keep the most recent one
      const sessionToKeep = correctSession || activeSessions.sort((a, b) => {
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        return dateB - dateA
      })[0]
      
      // Deactivate all other sessions
      const sessionsToDeactivate = activeSessions.filter(s => s.id !== sessionToKeep.id)
      for (const session of sessionsToDeactivate) {
        await db
          .update(leaderboardSessions)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(leaderboardSessions.id, session.id))
        console.log(`Deactivated duplicate ${sessionType} session: ${session.sessionKey} (ID: ${session.id})`)
      }
      
      return sessionToKeep
    }

    return activeSessions[0]
  } catch (error) {
    console.error(`Error getting active session for ${sessionType}:`, error)
    return null
  }
}

//  Get period date for a session type
function getPeriodDate(sessionType: string, startDate: Date): string {
  const date = new Date(startDate)
  
  switch (sessionType) {
    case 'daily':
      return date.toISOString().split('T')[0] // YYYY-MM-DD
    case 'weekly':
      const year = date.getFullYear()
      const week = getWeekNumber(date)
      return `${year}-W${week.toString().padStart(2, '0')}`
    case 'monthly':
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    case 'yearly':
      return date.getFullYear().toString()
    case 'overall':
      return 'all-time'
    default:
      return date.toISOString().split('T')[0]
  }
}

//  Get week number for a date
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
