/**
 * Test script for leaderboard functionality
 * Run with: npx tsx scripts/test-leaderboard.ts
 */

import { drizzleDb } from "../lib/drizzle-service"
import { leaderboardService } from "../lib/leaderboard-service"

async function testLeaderboard() {
  console.log("🧪 Testing Leaderboard Functionality...")
  
  try {
    // Test 1: Check if we have any users in the database
    console.log("\n1️⃣ Checking users in database...")
    const users = await drizzleDb.getAllUsers()
    console.log(`✅ Found ${users.length} users in database`)
    
    if (users.length === 0) {
      console.log("⚠️  No users found. Please add some profiles first.")
      return
    }

    // Test 2: Test top users by points
    console.log("\n2️⃣ Testing top users by points...")
    const topUsersByPoints = await drizzleDb.getTopUsersByPoints(5)
    console.log(`✅ Found ${topUsersByPoints.length} top users by points`)
    topUsersByPoints.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} - ${user.points || 0} points`)
    })

    // Test 3: Test top users by stars
    console.log("\n3️⃣ Testing top users by stars...")
    const topUsersByStars = await drizzleDb.getTopUsersByStars(5)
    console.log(`✅ Found ${topUsersByStars.length} top users by stars`)
    topUsersByStars.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} - ${user.totalStars || 0} stars`)
    })

    // Test 4: Test top users by repositories
    console.log("\n4️⃣ Testing top users by repositories...")
    const topUsersByRepos = await drizzleDb.getTopUsersByRepositories(5)
    console.log(`✅ Found ${topUsersByRepos.length} top users by repositories`)
    topUsersByRepos.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} - ${user.totalRepositories || 0} repos`)
    })

    // Test 5: Test leaderboard service
    console.log("\n5️⃣ Testing leaderboard service...")
    const leaderboardData = await leaderboardService.getLeaderboardWithUsers("global", 5)
    console.log(`✅ Found ${leaderboardData.length} leaderboard entries`)
    leaderboardData.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.username} - Rank: ${entry.rank}, Score: ${entry.score}`)
    })

    // Test 6: Test platform stats
    console.log("\n6️⃣ Testing platform statistics...")
    const platformStats = await drizzleDb.getPlatformStats()
    console.log(`✅ Platform Stats:`)
    console.log(`   Total Users: ${platformStats.totalUsers}`)
    console.log(`   Total Points: ${platformStats.totalPoints}`)
    console.log(`   Total Stars: ${platformStats.totalStars}`)
    console.log(`   Total Commits: ${platformStats.totalCommits}`)
    console.log(`   Average Points per User: ${platformStats.averagePointsPerUser}`)

    console.log("\n🎉 All leaderboard tests passed!")
    
  } catch (error) {
    console.error("❌ Leaderboard test failed:", error)
    process.exit(1)
  }
}

testLeaderboard()
  .then(() => {
    console.log("\n✨ Leaderboard testing completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Leaderboard testing failed:", error)
    process.exit(1)
  })
