import { storage } from "@/lib/storage"
import type { Achievement, UserAchievement, GithubStats } from "@/lib/schema"
import {
  isLeveledCategory,
  calculateCurrentLevel,
  getNextLevelRequirement,
  getProgressToNextLevel,
  getVisualTier,
  getPointsMultiplier,
  getAchievementName,
  getAchievementDescription
} from "@/lib/level-formula"

// Achievement evaluation criteria types
export interface AchievementCriteria {
  // Basic metrics
  totalContributions?: number
  totalCommits?: number
  meaningfulCommits?: number
  totalStars?: number
  totalForks?: number
  totalRepositories?: number
  followers?: number
  following?: number

  // Streak metrics
  currentStreak?: number
  longestStreak?: number

  // Activity metrics
  totalPullRequests?: number
  mergedPullRequests?: number
  totalIssues?: number
  closedIssues?: number
  totalReviews?: number

  // Repository quality metrics
  reposWithStars?: number
  reposWithForks?: number
  externalContributors?: number
  dependencyUsage?: number

  // Language diversity
  languageCount?: number
  topLanguagePercentage?: number
  rareLanguageRepos?: number

  // Account metrics
  accountAge?: number // in years

  // GitHub native achievements
  quickdraw?: boolean // First issue/PR in a repo
  pairExtraordinaire?: boolean // Co-authored commits
  pullShark?: boolean // Merged PRs
  galaxyBrain?: boolean // Answered discussions
  yolo?: boolean // Merged PR without review
  publicSponsor?: boolean // Sponsoring open source

  // Custom achievements
  trendingDeveloper?: boolean // Featured in trending lists
  openSourceHero?: boolean // High impact open source contributions
  communityBuilder?: boolean // Active in community discussions

  // Time-based achievements
  dailyContributor?: number // Days with contributions
  weekendWarrior?: boolean // Active on weekends
  earlyBird?: boolean // Active early morning commits

  // Social achievements
  influencer?: boolean // High follower ratio
  mentor?: boolean // Helping other developers
  collaborator?: boolean // Active in multiple projects
}

// Achievement definition interface
export interface AchievementDefinition {
  id?: number
  name: string
  description: string
  category: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary"
  criteria: AchievementCriteria
  points: number
  isActive: boolean
  isGitHubNative?: boolean
  source?: "github" | "custom" | "trending" | "community"
  isLeveled?: boolean
}

// Achievement progress interface
export interface AchievementProgress {
  achievement: Achievement
  progress: number
  maxProgress: number
  progressPercentage: number
  isUnlocked: boolean
  unlockedAt?: Date | null
  nextMilestone?: number
  description: string
  // Leveled achievement properties
  currentLevel?: number
  currentValue?: number
  nextLevelRequirement?: number
  isLeveled?: boolean
  animationIntensity?: number
}

// Comprehensive Achievement Service
// Handles all achievement-related operations including evaluation, progress tracking, and GitHub native achievements
export class AchievementService {
  private static instance: AchievementService

  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService()
    }
    return AchievementService.instance
  }

  // Get all available achievements with progress for a user
  async getUserAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    const allAchievements = await storage.getAllAchievements()
    const userStats = await storage.getGithubStats(userId)
    const userAchievements = await storage.getUserAchievements(userId)

    if (!userStats) {
      return allAchievements.map(achievement => ({
        achievement,
        progress: 0,
        maxProgress: 1,
        progressPercentage: 0,
        isUnlocked: false,
        description: achievement.description,
        isLeveled: achievement.isLeveled || false
      }))
    }

    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId))

    return await Promise.all(allAchievements.map(async achievement => {
      const isUnlocked = unlockedAchievementIds.has(achievement.id)
      const unlockedAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)

      // Handle leveled achievements
      if (achievement.isLeveled && isLeveledCategory(achievement.category)) {
        return await this.getLeveledAchievementProgress(achievement, userStats, userId, unlockedAchievement)
      }

      // Handle non-leveled achievements (existing logic)
      if (isUnlocked && unlockedAchievement) {
        return {
          achievement,
          progress: unlockedAchievement.progress || 0,
          maxProgress: unlockedAchievement.maxProgress || 1,
          progressPercentage: 100,
          isUnlocked: true,
          unlockedAt: unlockedAchievement.unlockedAt,
          description: achievement.description,
          isLeveled: false
        }
      }

      // Calculate progress for locked achievements
      const progress = await this.calculateAchievementProgress(achievement, userStats, userId)
      const maxProgress = await this.getMaxProgressForAchievement(achievement, userStats, userId)
      const progressPercentage = maxProgress > 0 ? Math.min(100, (progress / maxProgress) * 100) : 0

      return {
        achievement,
        progress,
        maxProgress,
        progressPercentage,
        isUnlocked: false,
        nextMilestone: await this.getNextMilestone(achievement, progress),
        description: achievement.description,
        isLeveled: false
      }
    }))
  }

  // Get leveled achievement progress
  private async getLeveledAchievementProgress(
    achievement: Achievement,
    userStats: GithubStats,
    userId: string,
    unlockedAchievement?: UserAchievement
  ): Promise<AchievementProgress> {
    const currentValue = await this.getUserMetricValue(this.getPrimaryMetric(achievement.category) || '', userStats, userId)
    const currentLevel = calculateCurrentLevel(currentValue, achievement.category)
    const nextRequirement = getNextLevelRequirement(currentValue, achievement.category)
    const progressData = getProgressToNextLevel(currentValue, achievement.category)
    const visualTier = getVisualTier(currentLevel)

    // Update achievement properties based on current level
    const leveledAchievement = {
      ...achievement,
      name: getAchievementName(achievement.category, currentLevel),
      description: getAchievementDescription(achievement.category, currentLevel),
      rarity: visualTier.rarity,
      tier: visualTier.tier,
      points: Math.floor((achievement.points || 10) * getPointsMultiplier(currentLevel))
    }

    return {
      achievement: leveledAchievement,
      progress: progressData.progress,
      maxProgress: nextRequirement - progressData.progress,
      progressPercentage: Math.min(100, (progressData.progress / (nextRequirement - (progressData.progress - progressData.progress))) * 100),
      isUnlocked: currentLevel >= 0, // Changed from >= 1 to >= 0
      unlockedAt: unlockedAchievement?.unlockedAt,
      currentLevel,
      currentValue,
      nextLevelRequirement: nextRequirement,
      isLeveled: true,
      animationIntensity: visualTier.animationIntensity,
      description: leveledAchievement.description
    }
  }

  // Evaluate and unlock achievements for a user
  async evaluateAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    const userStats = await storage.getGithubStats(userId)
    if (!userStats) return []

    const allAchievements = await storage.getAllAchievements()
    const userAchievements = await storage.getUserAchievements(userId)
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

    const newlyUnlocked: UserAchievement[] = []

    for (const achievement of allAchievements) {
      // Handle leveled achievements
      if (achievement.isLeveled && isLeveledCategory(achievement.category)) {
        const currentValue = await this.getUserMetricValue(this.getPrimaryMetric(achievement.category) || '', userStats, userId)
        const currentLevel = calculateCurrentLevel(currentValue, achievement.category)

        if (currentLevel >= 0) {
          // Check if we need to unlock or update this leveled achievement
          const existingAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)

          if (!existingAchievement) {
            // Unlock the achievement for the first time
            const unlocked = await storage.unlockAchievement(userId, achievement.id)
            if (unlocked) {
              await storage.updateUserAchievementProgress(
                userId,
                achievement.id,
                currentValue,
                getNextLevelRequirement(currentValue, achievement.category),
                currentLevel
              )
              newlyUnlocked.push(unlocked)
            }
          } else {
            // Update existing leveled achievement
            await storage.updateUserAchievementProgress(
              userId,
              achievement.id,
              currentValue,
              getNextLevelRequirement(currentValue, achievement.category),
              currentLevel
            )
          }
        }
        continue
      }

      // Handle non-leveled achievements (existing logic)
      if (unlockedIds.has(achievement.id)) continue

      const shouldUnlock = await this.evaluateAchievement(achievement, userStats, userId)
      if (shouldUnlock) {
        const maxProgress = await this.getMaxProgressForAchievement(achievement)
        const progress = await this.calculateAchievementProgress(achievement, userStats, userId)

        const unlocked = await storage.unlockAchievement(userId, achievement.id)
        if (unlocked) {
          // Update progress if needed
          if (progress !== maxProgress) {
            await storage.updateUserAchievementProgress(userId, achievement.id, progress, maxProgress)
          }
          newlyUnlocked.push(unlocked)
        }
      }
    }

    return newlyUnlocked
  }

  // Update achievement progress for all achievements (for locked ones)
  async updateAchievementProgress(userId: string): Promise<void> {
    const userStats = await storage.getGithubStats(userId)
    if (!userStats) return

    const allAchievements = await storage.getAllAchievements()
    const userAchievements = await storage.getUserAchievements(userId)
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue

      const progress = await this.calculateAchievementProgress(achievement, userStats, userId)
      const maxProgress = await this.getMaxProgressForAchievement(achievement)

      // Update or create progress record
      await storage.updateUserAchievementProgress(userId, achievement.id, progress, maxProgress)
    }
  }

  // Evaluate if an achievement should be unlocked
  private async evaluateAchievement(achievement: Achievement, userStats: GithubStats, userId?: string): Promise<boolean> {
    const criteria = achievement.criteria as AchievementCriteria

    // Check each criterion
    for (const [key, requiredValue] of Object.entries(criteria)) {
      if (requiredValue === undefined || requiredValue === null) continue

      const userValue = await this.getUserMetricValue(key, userStats, userId)

      if (typeof requiredValue === 'boolean') {
        if (requiredValue && !userValue) return false
      } else if (typeof requiredValue === 'number') {
        if (userValue < requiredValue) return false
      }
    }

    return true
  }

  // Calculate current progress towards an achievement
  private async calculateAchievementProgress(achievement: Achievement, userStats: GithubStats, userId?: string): Promise<number> {
    const criteria = achievement.criteria as AchievementCriteria

    // For achievements with multiple criteria, calculate progress based on the primary metric
    const primaryMetric = this.getPrimaryMetric(achievement.category)
    if (!primaryMetric) return 0

    const userValue = await this.getUserMetricValue(primaryMetric, userStats, userId)
    const requiredValue = criteria[primaryMetric as keyof AchievementCriteria]

    if (typeof requiredValue === 'number' && requiredValue > 0) {
      return Math.min(userValue, requiredValue)
    }

    return userValue
  }

  // Get maximum progress needed for an achievement
  private async getMaxProgressForAchievement(achievement: Achievement, userStats?: GithubStats, userId?: string): Promise<number> {
    const criteria = achievement.criteria as AchievementCriteria
    const primaryMetric = this.getPrimaryMetric(achievement.category)

    if (!primaryMetric) return 1

    const requiredValue = criteria[primaryMetric as keyof AchievementCriteria]
    return typeof requiredValue === 'number' ? requiredValue : 1
  }

  // Get next milestone for an achievement
  private async getNextMilestone(achievement: Achievement, currentProgress: number): Promise<number | undefined> {
    const maxProgress = await this.getMaxProgressForAchievement(achievement)
    if (currentProgress >= maxProgress) return undefined

    // For tiered achievements, return the next tier
    const tiers = this.getTiersForCategory(achievement.category)
    if (tiers) {
      const nextTier = tiers.find(tier => tier > currentProgress)
      return nextTier
    }

    return maxProgress
  }

  // Get user metric value from stats
  private async getUserMetricValue(metric: string, userStats: GithubStats, userId?: string): Promise<number> {
    const statsMap: Record<string, keyof GithubStats> = {
      totalContributions: 'overallContributions',
      totalCommits: 'totalCommits',
      meaningfulCommits: 'meaningfulCommits',
      totalStars: 'totalStars',
      totalForks: 'totalForks',
      totalRepositories: 'totalRepositories',
      followers: 'followers',
      following: 'following',
      currentStreak: 'currentStreak',
      longestStreak: 'longestStreak',
      totalPullRequests: 'totalPullRequests',
      mergedPullRequests: 'mergedPullRequests',
      totalIssues: 'totalIssues',
      closedIssues: 'closedIssues',
      totalReviews: 'totalReviews',
      reposWithStars: 'reposWithStars',
      reposWithForks: 'reposWithForks',
      externalContributors: 'externalContributors',
      dependencyUsage: 'dependencyUsage',
      languageCount: 'languageCount',
      topLanguagePercentage: 'topLanguagePercentage',
      rareLanguageRepos: 'rareLanguageRepos',
    }

    // Special handling for account_age - get from user data, not stats
    if (metric === 'accountAge' && userId) {
      try {
        const user = await storage.getUser(userId)
        if (user && user.githubCreatedAt) {
          const accountCreated = new Date(user.githubCreatedAt)
          const now = new Date()
          const yearsDiff = now.getFullYear() - accountCreated.getFullYear()
          const monthDiff = now.getMonth() - accountCreated.getMonth()

          // Only count full years completed
          if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < accountCreated.getDate())) {
            return Math.max(0, yearsDiff - 1)
          } else {
            return Math.max(0, yearsDiff)
          }
        }
      } catch (error) {
        console.error('Error fetching user data for account age:', error)
      }
      return 0
    }

    const statKey = statsMap[metric]
    if (statKey && userStats[statKey] !== null && userStats[statKey] !== undefined) {
      return userStats[statKey] as number
    }

    return 0
  }

  // Get primary metric for a category
  private getPrimaryMetric(category: string): string | null {
    const primaryMetrics: Record<string, string> = {
      contributions: 'totalContributions',
      commits: 'totalCommits',
      meaningful_commits: 'meaningfulCommits',
      stars: 'totalStars',
      forks: 'totalForks',
      repositories: 'totalRepositories',
      followers: 'followers',
      streak: 'longestStreak', // Changed from currentStreak to longestStreak
      pull_requests: 'mergedPullRequests',
      issues: 'closedIssues',
      reviews: 'totalReviews',
      language_diversity: 'languageCount',
      account_age: 'accountAge',
    }

    return primaryMetrics[category] || null
  }

  // Get tiers for a category (for milestone tracking)
  private getTiersForCategory(category: string): number[] | null {
    const tierMappings: Record<string, number[]> = {
      contributions: [1, 10, 50, 100, 500, 1000, 5000],
      stars: [1, 10, 50, 100, 500, 1000, 5000, 10000],
      repositories: [1, 5, 10, 25, 50, 100],
      followers: [1, 10, 50, 100, 500, 1000],
      streak: [1, 7, 30, 100, 365],
      commits: [1, 10, 100, 500, 1000, 5000],
    }

    return tierMappings[category] || null
  }

  // Get achievements by category
  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    const allAchievements = await storage.getAllAchievements()
    return allAchievements.filter(achievement => achievement.category === category)
  }

  // Get achievements by rarity
  async getAchievementsByRarity(rarity: string): Promise<Achievement[]> {
    const allAchievements = await storage.getAllAchievements()
    return allAchievements.filter(achievement => achievement.rarity === rarity)
  }

  // Get GitHub native achievements
  async getGitHubNativeAchievements(): Promise<Achievement[]> {
    const allAchievements = await storage.getAllAchievements()
    return allAchievements.filter(achievement =>
      achievement.criteria &&
      typeof achievement.criteria === 'object' &&
      'isGitHubNative' in achievement.criteria
    )
  }

  // Get trending developer achievements
  async getTrendingDeveloperAchievements(): Promise<Achievement[]> {
    const allAchievements = await storage.getAllAchievements()
    return allAchievements.filter(achievement =>
      achievement.criteria &&
      typeof achievement.criteria === 'object' &&
      'trendingDeveloper' in achievement.criteria
    )
  }
}

export const achievementService = AchievementService.getInstance()