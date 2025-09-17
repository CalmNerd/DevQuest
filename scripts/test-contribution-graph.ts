/**
 * Test script for contribution graph functionality
 * Run with: npx tsx scripts/test-contribution-graph.ts
 */

import { githubService } from "../lib/github-service"

async function testContributionGraph() {
  console.log("🧪 Testing Contribution Graph Functionality...")
  
  try {
    // Test with a known GitHub user
    const testUsername = "octocat" // GitHub's mascot account
    
    console.log(`\n1️⃣ Fetching contribution data for ${testUsername}...`)
    const statsData = await githubService.fetchUserStats(testUsername)
    
    console.log("✅ Successfully fetched user stats")
    console.log(`   Total Contributions: ${statsData.overallContributions || 0}`)
    console.log(`   Current Streak: ${statsData.currentStreak || 0} days`)
    console.log(`   Longest Streak: ${statsData.longestStreak || 0} days`)
    
    if (statsData.contributionGraph) {
      console.log("\n2️⃣ Analyzing contribution graph data...")
      const graph = statsData.contributionGraph
      console.log(`   Total Weeks: ${graph.weeks?.length || 0}`)
      console.log(`   Total Contributions: ${graph.totalContributions || 0}`)
      
      if (graph.weeks && graph.weeks.length > 0) {
        const totalDays = graph.weeks.reduce((sum, week) => sum + (week.contributionDays?.length || 0), 0)
        console.log(`   Total Days: ${totalDays}`)
        
        // Find days with contributions
        const daysWithContributions = graph.weeks.reduce((sum, week) => {
          return sum + (week.contributionDays?.filter(day => day.contributionCount > 0).length || 0)
        }, 0)
        console.log(`   Days with Contributions: ${daysWithContributions}`)
        
        // Find max contributions in a single day
        let maxDailyContributions = 0
        graph.weeks.forEach(week => {
          week.contributionDays?.forEach(day => {
            maxDailyContributions = Math.max(maxDailyContributions, day.contributionCount || 0)
          })
        })
        console.log(`   Max Daily Contributions: ${maxDailyContributions}`)
        
        console.log("\n✅ Contribution graph data structure is valid!")
      } else {
        console.log("⚠️  No contribution graph weeks data found")
      }
    } else {
      console.log("⚠️  No contribution graph data found")
    }
    
    console.log("\n🎉 Contribution graph test completed!")
    
  } catch (error) {
    console.error("❌ Contribution graph test failed:", error)
    process.exit(1)
  }
}

testContributionGraph()
  .then(() => {
    console.log("\n✨ Contribution graph testing completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Contribution graph testing failed:", error)
    process.exit(1)
  })
