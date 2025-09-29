import type { AchievementDefinition } from "./achievement.service"
import {
  getAchievementName,
  getAchievementDescription,
  getVisualTier,
  getPointsMultiplier,
  isLeveledCategory,
  getLeveledCategories,
  requirementForLevelInCategory
} from "@/lib/level-formula"


export class LeveledAchievementDefinitionsService {
  // Each category gets one achievement definition that supports infinite levels
  static getAllLeveledDefinitions(): AchievementDefinition[] {
    const leveledCategories = getLeveledCategories()

    return leveledCategories.map(category => {
      // Get level 1 requirements for the description
      const level1Requirement = requirementForLevelInCategory(1, category)
      const visualTier = getVisualTier(1)
      const pointsMultiplier = getPointsMultiplier(1)

      return {
        id: undefined, // Will be set by database
        name: getAchievementName(category, 1),
        description: getAchievementDescription(category, 1),
        category: category,
        icon: this.getCategoryIcon(category),
        rarity: visualTier.rarity,
        tier: visualTier.tier,
        criteria: this.getCategoryCriteria(category),
        points: Math.floor(10 * pointsMultiplier), // Base 10 points with multiplier
        isActive: true,
        isLeveled: true,
        isGitHubNative: false,
        source: "custom"
      }
    })
  }

  // Get achievement definition for a specific category and level
  static getDefinitionForLevel(category: string, level: number): AchievementDefinition {
    if (!isLeveledCategory(category)) {
      throw new Error(`Category ${category} does not support leveled achievements`)
    }

    const visualTier = getVisualTier(level)
    const pointsMultiplier = getPointsMultiplier(level)

    return {
      id: undefined,
      name: getAchievementName(category, level),
      description: getAchievementDescription(category, level),
      category: category,
      icon: this.getCategoryIcon(category),
      rarity: visualTier.rarity,
      tier: visualTier.tier,
      criteria: this.getCategoryCriteria(category),
      points: Math.floor(10 * pointsMultiplier),
      isActive: true,
      isLeveled: true,
      isGitHubNative: false,
      source: "custom"
    }
  }

  // Get category-specific icon
  private static getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      followers: "users",
      stars: "star",
      contributions: "git-commit",
      language_diversity: "code",
      repositories: "git-branch",
      streak: "flame",
      account_age: "award",
      issues: "check-circle",
      pull_requests: "git-merge",
      reviews: "eye",
      external_contributions: "users"
    }

    return iconMap[category] || "trophy"
  }

  // Get category-specific criteria
  private static getCategoryCriteria(category: string): Record<string, any> {
    const criteriaMap: Record<string, Record<string, any>> = {
      followers: { followers: 1 },
      stars: { totalStars: 1 },
      contributions: { totalContributions: 1 },
      language_diversity: { languageCount: 1 },
      repositories: { totalRepositories: 1 },
      streak: { longestStreak: 1 }, // Changed from currentStreak to longestStreak
      account_age: { accountAge: 1 },
      issues: { closedIssues: 1 },
      pull_requests: { mergedPullRequests: 1 },
      reviews: { totalReviews: 1 },
      external_contributions: { externalContributors: 1 }
    }

    return criteriaMap[category] || {}
  }

  // Get all non-leveled achievement definitions (GitHub native, etc.)
  static getNonLeveledDefinitions(): AchievementDefinition[] {
    return [
      // GitHub Native Achievements - Keep these as-is
      {
        id: undefined,
        name: "Quickdraw",
        description: "Opened an issue or pull request within 5 minutes of a repository being created",
        category: "github_native",
        icon: "zap",
        rarity: "rare",
        tier: "gold",
        criteria: { quickdraw: true },
        points: 100,
        isActive: true,
        isGitHubNative: true,
        source: "github"
      },
      {
        id: undefined,
        name: "Pair Extraordinaire",
        description: "Co-authored commits merged into the default branch",
        category: "github_native",
        icon: "users",
        rarity: "rare",
        tier: "gold",
        criteria: { pairExtraordinaire: true },
        points: 100,
        isActive: true,
        isGitHubNative: true,
        source: "github"
      },
      {
        id: undefined,
        name: "Pull Shark",
        description: "2 pull requests merged into the default branch",
        category: "github_native",
        icon: "git-merge",
        rarity: "common",
        tier: "silver",
        criteria: { pullShark: true },
        points: 50,
        isActive: true,
        isGitHubNative: true,
        source: "github"
      },
      {
        id: undefined,
        name: "Galaxy Brain",
        description: "Answered a discussion",
        category: "github_native",
        icon: "brain",
        rarity: "common",
        tier: "silver",
        criteria: { galaxyBrain: true },
        points: 50,
        isActive: true,
        isGitHubNative: true,
        source: "github"
      },
      {
        id: undefined,
        name: "YOLO",
        description: "Merged a pull request without review",
        category: "github_native",
        icon: "skull",
        rarity: "epic",
        tier: "gold",
        criteria: { yolo: true },
        points: 200,
        isActive: true,
        isGitHubNative: true,
        source: "github"
      },
      {
        id: undefined,
        name: "Public Sponsor",
        description: "Sponsored an open source contributor",
        category: "github_native",
        icon: "heart",
        rarity: "epic",
        tier: "gold",
        criteria: { publicSponsor: true },
        points: 200,
        isActive: true,
        isGitHubNative: true,
        source: "github"
      },

      // Community Achievements - Keep these as-is
      {
        id: undefined,
        name: "Open Source Hero",
        description: "Made significant contributions to open source projects",
        category: "community",
        icon: "shield",
        rarity: "epic",
        tier: "gold",
        criteria: { openSourceHero: true },
        points: 200,
        isActive: true,
        isGitHubNative: false,
        source: "community"
      },
      {
        id: undefined,
        name: "Community Builder",
        description: "Active in community discussions and help",
        category: "community",
        icon: "users",
        rarity: "rare",
        tier: "silver",
        criteria: { communityBuilder: true },
        points: 100,
        isActive: true,
        isGitHubNative: false,
        source: "community"
      },
      {
        id: undefined,
        name: "Mentor",
        description: "Helped other developers through code reviews and guidance",
        category: "community",
        icon: "graduation-cap",
        rarity: "rare",
        tier: "silver",
        criteria: { mentor: true },
        points: 100,
        isActive: true,
        isGitHubNative: false,
        source: "community"
      },

      // Time-based Achievements - Keep these as-is
      {
        id: undefined,
        name: "Weekend Warrior",
        description: "Active contributor on weekends",
        category: "time_based",
        icon: "calendar",
        rarity: "common",
        tier: "bronze",
        criteria: { weekendWarrior: true },
        points: 25,
        isActive: true,
        isGitHubNative: false,
        source: "custom"
      },
      {
        id: undefined,
        name: "Early Bird",
        description: "Made commits early in the morning",
        category: "time_based",
        icon: "sunrise",
        rarity: "common",
        tier: "bronze",
        criteria: { earlyBird: true },
        points: 25,
        isActive: true,
        isGitHubNative: false,
        source: "custom"
      },
      {
        id: undefined,
        name: "Night Owl",
        description: "Made commits late at night",
        category: "time_based",
        icon: "moon",
        rarity: "common",
        tier: "bronze",
        criteria: { earlyBird: false },
        points: 25,
        isActive: true,
        isGitHubNative: false,
        source: "custom"
      },

      // Trending Achievements - Keep these as-is
      {
        id: undefined,
        name: "Trending Developer",
        description: "Featured in GitHub trending developers list",
        category: "trending",
        icon: "trending-up",
        rarity: "epic",
        tier: "gold",
        criteria: { trendingDeveloper: true },
        points: 300,
        isActive: true,
        isGitHubNative: false,
        source: "trending"
      },
      {
        id: undefined,
        name: "Weekly Star",
        description: "Featured in weekly trending developers",
        category: "trending",
        icon: "star",
        rarity: "rare",
        tier: "silver",
        criteria: { trendingDeveloper: true },
        points: 150,
        isActive: true,
        isGitHubNative: false,
        source: "trending"
      },
      {
        id: undefined,
        name: "Monthly Rising Star",
        description: "Featured in monthly trending developers",
        category: "trending",
        icon: "rocket",
        rarity: "epic",
        tier: "gold",
        criteria: { trendingDeveloper: true },
        points: 250,
        isActive: true,
        isGitHubNative: false,
        source: "trending"
      }
    ]
  }

  /**
   * Get all achievement definitions (leveled + non-leveled)
   */
  static getAllDefinitions(): AchievementDefinition[] {
    return [
      ...this.getAllLeveledDefinitions(),
      ...this.getNonLeveledDefinitions()
    ]
  }

  // Get definitions by category
  static getDefinitionsByCategory(category: string): AchievementDefinition[] {
    return this.getAllDefinitions().filter(def => def.category === category)
  }

  // Get leveled definitions by category
  static getLeveledDefinitionsByCategory(category: string): AchievementDefinition[] {
    if (!isLeveledCategory(category)) {
      return []
    }
    return this.getAllLeveledDefinitions().filter(def => def.category === category)
  }

  // Get non-leveled definitions by category
  static getNonLeveledDefinitionsByCategory(category: string): AchievementDefinition[] {
    return this.getNonLeveledDefinitions().filter(def => def.category === category)
  }

  // Get definitions by rarity
  static getDefinitionsByRarity(rarity: string): AchievementDefinition[] {
    return this.getAllDefinitions().filter(def => def.rarity === rarity)
  }

  // Get GitHub native definitions
  static getGitHubNativeDefinitions(): AchievementDefinition[] {
    return this.getAllDefinitions().filter(def => def.isGitHubNative)
  }

  // Get trending developer definitions
  static getTrendingDeveloperDefinitions(): AchievementDefinition[] {
    return this.getAllDefinitions().filter(def => def.source === "trending")
  }

  // Check if a category supports leveled achievements
  static isLeveledCategory(category: string): boolean {
    return isLeveledCategory(category)
  }

  // Get all leveled categories
  static getLeveledCategories(): string[] {
    return getLeveledCategories()
  }
}
