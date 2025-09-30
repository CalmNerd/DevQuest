/**
 * Error handling utilities for GitHub API failures
 * 
 * This module provides utilities to handle API failures gracefully
 * while preserving data integrity in the database.
 */

export interface ApiErrorContext {
  username: string
  operation: string
  error: Error
  timestamp: Date
}

export interface PreservedStats {
  preserved: boolean
  reason: 'existing_stats_found' | 'no_existing_stats' | 'user_not_found'
  stats?: any
}

/**
 * Handles GitHub API failures by preserving existing data
 * 
 * @param context - Error context information
 * @param existingStats - Existing stats from database (if any)
 * @returns Preserved stats or minimal fallback
 */
export function handleApiFailure(
  context: ApiErrorContext,
  existingStats?: any
): PreservedStats {
  console.error(`API failure for ${context.username} (${context.operation}):`, context.error.message)

  if (existingStats) {
    console.log(`Preserving existing stats for ${context.username} to maintain data integrity`)
    return {
      preserved: true,
      reason: 'existing_stats_found',
      stats: {
        ...existingStats,
        lastFetchedAt: new Date(),
        fetchFailed: true,
        fetchError: context.error.message
      }
    }
  }

  return {
    preserved: false,
    reason: 'no_existing_stats'
  }
}

/**
 * Creates minimal fallback stats when no existing data is available
 * 
 * @param githubData - Basic GitHub user data
 * @param error - The error that occurred
 * @returns Minimal stats object
 */
export function createMinimalFallback(githubData: any, error: Error): any {
  return {
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
    fetchError: error.message
  }
}

/**
 * Logs API failure for monitoring and debugging
 * 
 * @param context - Error context
 * @param preserved - Whether data was preserved
 */
export function logApiFailure(context: ApiErrorContext, preserved: boolean): void {
  const status = preserved ? 'PRESERVED' : 'FALLBACK'
  console.log(`[${status}] API failure handled for ${context.username}: ${context.error.message}`)
}
