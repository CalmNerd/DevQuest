import { NextResponse } from "next/server"
import { drizzleDb } from '@/services/database/drizzle.service'

export async function POST() {
  try {
    console.log("[Test Data] Creating test leaderboard data...")

    // Create some test users with different stats
    const testUsers = [
      {
        id: "test_user_1",
        username: "alice_dev",
        githubId: "1001",
        email: "alice@example.com",
        name: "Alice Developer",
        bio: "Full-stack developer passionate about React and Node.js",
        profileImageUrl: "https://github.com/github.png",
        githubUrl: "https://github.com/alice_dev",
        location: "San Francisco, CA",
        githubCreatedAt: new Date("2020-01-15"),
      },
      {
        id: "test_user_2", 
        username: "bob_coder",
        githubId: "1002",
        email: "bob@example.com",
        name: "Bob Coder",
        bio: "Python enthusiast and data scientist",
        profileImageUrl: "https://github.com/github.png",
        githubUrl: "https://github.com/bob_coder",
        location: "New York, NY",
        githubCreatedAt: new Date("2019-06-20"),
      },
      {
        id: "test_user_3",
        username: "charlie_js",
        githubId: "1003", 
        email: "charlie@example.com",
        name: "Charlie JavaScript",
        bio: "Frontend specialist with Vue.js expertise",
        profileImageUrl: "https://github.com/github.png",
        githubUrl: "https://github.com/charlie_js",
        location: "Austin, TX",
        githubCreatedAt: new Date("2021-03-10"),
      },
      {
        id: "test_user_4",
        username: "diana_rust",
        githubId: "1004",
        email: "diana@example.com", 
        name: "Diana Rustacean",
        bio: "Systems programming with Rust and Go",
        profileImageUrl: "https://github.com/github.png",
        githubUrl: "https://github.com/diana_rust",
        location: "Seattle, WA",
        githubCreatedAt: new Date("2018-11-05"),
      },
      {
        id: "test_user_5",
        username: "eve_mobile",
        githubId: "1005",
        email: "eve@example.com",
        name: "Eve Mobile",
        bio: "Mobile app developer using React Native and Flutter",
        profileImageUrl: "https://github.com/github.png", 
        githubUrl: "https://github.com/eve_mobile",
        location: "Miami, FL",
        githubCreatedAt: new Date("2022-02-28"),
      }
    ]

    // Create test GitHub stats with varied data
    const testStats = [
      {
        userId: "test_user_1",
        points: 2500,
        totalStars: 150,
        totalRepositories: 25,
        followers: 120,
        following: 80,
        totalCommits: 800,
        longestStreak: 45,
        currentStreak: 12,
        totalForks: 30,
        languageCount: 8,
        topLanguage: "JavaScript",
      },
      {
        userId: "test_user_2",
        points: 3200,
        totalStars: 200,
        totalRepositories: 35,
        followers: 180,
        following: 95,
        totalCommits: 1200,
        longestStreak: 60,
        currentStreak: 8,
        totalForks: 45,
        languageCount: 12,
        topLanguage: "Python",
      },
      {
        userId: "test_user_3",
        points: 1800,
        totalStars: 90,
        totalRepositories: 18,
        followers: 75,
        following: 60,
        totalCommits: 600,
        longestStreak: 30,
        currentStreak: 5,
        totalForks: 20,
        languageCount: 6,
        topLanguage: "Vue",
      },
      {
        userId: "test_user_4",
        points: 4500,
        totalStars: 300,
        totalRepositories: 50,
        followers: 250,
        following: 120,
        totalCommits: 2000,
        longestStreak: 90,
        currentStreak: 25,
        totalForks: 80,
        languageCount: 15,
        topLanguage: "Rust",
      },
      {
        userId: "test_user_5",
        points: 1200,
        totalStars: 60,
        totalRepositories: 12,
        followers: 45,
        following: 40,
        totalCommits: 400,
        longestStreak: 20,
        currentStreak: 3,
        totalForks: 15,
        languageCount: 4,
        topLanguage: "Dart",
      }
    ]

    // Insert test users
    console.log("[Test Data] Inserting test users...")
    for (const user of testUsers) {
      await drizzleDb.upsertUser(user)
    }

    // Insert test stats
    console.log("[Test Data] Inserting test stats...")
    for (const stats of testStats) {
      await drizzleDb.upsertGithubStats(stats)
    }

    // Update leaderboards
    console.log("[Test Data] Leaderboard updates handled by session management service")
    // Note: Leaderboard updates are now handled by the session management service

    console.log("[Test Data] Test data created successfully!")

    return NextResponse.json({
      success: true,
      message: "Test leaderboard data created successfully",
      usersCreated: testUsers.length,
      statsCreated: testStats.length,
    })

  } catch (error) {
    console.error("[Test Data] Error creating test data:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create test data",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}
