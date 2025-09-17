#!/usr/bin/env tsx

/**
 * Quick import test to verify all modules can be imported correctly
 * Run with: npx tsx scripts/test-imports.ts
 */

console.log("🧪 Testing module imports...")

try {
  // Test core database imports
  console.log("1️⃣ Testing database imports...")
  const { db } = await import("../lib/db-http")
  console.log("✅ Database connection imported successfully")

  // Test schema imports
  console.log("2️⃣ Testing schema imports...")
  const { users, githubStats, achievements } = await import("../lib/schema")
  console.log("✅ Schema imported successfully")

  // Test storage imports
  console.log("3️⃣ Testing storage imports...")
  const { storage } = await import("../lib/storage")
  console.log("✅ Storage service imported successfully")

  // Test drizzle service imports
  console.log("4️⃣ Testing drizzle service imports...")
  const { drizzleDb } = await import("../lib/drizzle-service")
  console.log("✅ Drizzle service imported successfully")

  // Test background service imports
  console.log("5️⃣ Testing background service imports...")
  const { backgroundUpdateService } = await import("../lib/background-service")
  console.log("✅ Background service imported successfully")

  // Test leaderboard service imports
  console.log("6️⃣ Testing leaderboard service imports...")
  const { leaderboardService } = await import("../lib/leaderboard-service")
  console.log("✅ Leaderboard service imported successfully")

  // Test github service imports
  console.log("7️⃣ Testing github service imports...")
  const { githubService } = await import("../lib/github-service")
  console.log("✅ GitHub service imported successfully")

  console.log("\n🎉 All imports successful!")
  console.log("✅ Build should work correctly now")

} catch (error) {
  console.error("❌ Import test failed:", error)
  process.exit(1)
}
