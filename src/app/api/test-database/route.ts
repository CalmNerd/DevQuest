import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    console.log("🧪 Starting database test via API...")

    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
      },
    }

    // Test 1: Database connection
    try {
      const users = await storage.getAllUsers()
      results.tests.push({
        name: "Database Connection",
        status: "passed",
        details: `Retrieved ${users.length} users`,
      })
      results.summary.passedTests++
    } catch (error) {
      results.tests.push({
        name: "Database Connection",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      results.summary.failedTests++
    }
    results.summary.totalTests++

    // Test 2: User operations
    try {
      const testUser = {
        id: `test_${Date.now()}`,
        username: `testuser_${Date.now()}`,
        githubId: "99999",
        email: "test@example.com",
        name: "Test User",
        bio: "Test bio for API test",
      }

      const savedUser = await storage.upsertUser(testUser)
      const retrievedUser = await storage.getUser(testUser.id)

      results.tests.push({
        name: "User Operations",
        status: "passed",
        details: `Created and retrieved user: ${retrievedUser?.username}`,
      })
      results.summary.passedTests++
    } catch (error) {
      results.tests.push({
        name: "User Operations",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      results.summary.failedTests++
    }
    results.summary.totalTests++

    // Test 3: GitHub stats operations
    try {
      const testStats = {
        userId: `test_${Date.now()}`,
        dailyContributions: 3,
        weeklyContributions: 15,
        monthlyContributions: 60,
        yearlyContributions: 800,
        last365Contributions: 750,
        thisYearContributions: 800,
        overallContributions: 3000,
        points: 1200,
        totalStars: 30,
        totalForks: 15,
        contributedTo: 8,
        totalRepositories: 12,
        followers: 20,
        following: 25,
        currentStreak: 5,
        longestStreak: 20,
        topLanguage: "JavaScript",
        languageStats: { JavaScript: 8, TypeScript: 4 },
        contributionGraph: { weeks: [], totalContributions: 3000 },
        totalCommits: 1500,
        meaningfulCommits: 1200,
        totalPullRequests: 30,
        mergedPullRequests: 25,
        totalIssues: 20,
        closedIssues: 18,
        totalReviews: 50,
        externalContributors: 3,
        reposWithStars: 5,
        reposWithForks: 8,
        dependencyUsage: 2,
        languageCount: 2,
        topLanguagePercentage: 67,
        rareLanguageRepos: 0,
      }

      const savedStats = await storage.upsertGithubStats(testStats)
      const retrievedStats = await storage.getGithubStats(testStats.userId)

      results.tests.push({
        name: "GitHub Stats Operations",
        status: "passed",
        details: `Saved and retrieved stats with ${retrievedStats?.points} points`,
      })
      results.summary.passedTests++
    } catch (error) {
      results.tests.push({
        name: "GitHub Stats Operations",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      results.summary.failedTests++
    }
    results.summary.totalTests++

    // Test 4: Achievements
    try {
      const allAchievements = await storage.getAllAchievements()
      results.tests.push({
        name: "Achievement System",
        status: "passed",
        details: `Retrieved ${allAchievements.length} available achievements`,
      })
      results.summary.passedTests++
    } catch (error) {
      results.tests.push({
        name: "Achievement System",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      results.summary.failedTests++
    }
    results.summary.totalTests++

    // Test 5: Leaderboards
    try {
      const leaderboard = await storage.getLeaderboard("daily", 5)
      results.tests.push({
        name: "Leaderboard System",
        status: "passed",
        details: `Retrieved leaderboard with ${leaderboard.length} entries`,
      })
      results.summary.passedTests++
    } catch (error) {
      results.tests.push({
        name: "Leaderboard System",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      results.summary.failedTests++
    }
    results.summary.totalTests++

    // Determine overall status
    const overallStatus = results.summary.failedTests === 0 ? "success" : "partial"
    const statusCode = results.summary.failedTests === 0 ? 200 : 207

    console.log(`🧪 Database test completed: ${results.summary.passedTests}/${results.summary.totalTests} tests passed`)

    return NextResponse.json(
      {
        status: overallStatus,
        message: `Database test completed: ${results.summary.passedTests}/${results.summary.totalTests} tests passed`,
        ...results,
      },
      { status: statusCode }
    )
  } catch (error) {
    console.error("💥 Database test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Database test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
