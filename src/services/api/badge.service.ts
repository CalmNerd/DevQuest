import { Trophy, Star, Users, GitBranch, Zap, Crown, Shield, Flame, Target, Award } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  rarity: "common" | "rare" | "epic" | "legendary"
  category: "contribution" | "social" | "repository" | "streak" | "special"
  requirements: {
    type: string
    value: number
    operator: "gte" | "lte" | "eq"
  }[]
}

export interface UserBadge {
  badgeId: string
  earnedAt: Date
  progress?: number
  maxProgress?: number
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Contribution Badges
  {
    id: "first-commit",
    name: "First Steps",
    description: "Made your first commit",
    icon: GitBranch,
    color: "text-green-400",
    rarity: "common",
    category: "contribution",
    requirements: [{ type: "totalContributions", value: 1, operator: "gte" }],
  },
  {
    id: "century-club",
    name: "Century Club",
    description: "Made 100+ contributions",
    icon: Zap,
    color: "text-blue-400",
    rarity: "common",
    category: "contribution",
    requirements: [{ type: "totalContributions", value: 100, operator: "gte" }],
  },
  {
    id: "thousand-commits",
    name: "Commit Master",
    description: "Made 1000+ contributions",
    icon: Trophy,
    color: "text-purple-400",
    rarity: "rare",
    category: "contribution",
    requirements: [{ type: "totalContributions", value: 1000, operator: "gte" }],
  },
  {
    id: "mega-contributor",
    name: "Mega Contributor",
    description: "Made 5000+ contributions",
    icon: Crown,
    color: "text-yellow-400",
    rarity: "epic",
    category: "contribution",
    requirements: [{ type: "totalContributions", value: 5000, operator: "gte" }],
  },

  // Social Badges
  {
    id: "popular-dev",
    name: "Popular Developer",
    description: "Gained 100+ followers",
    icon: Users,
    color: "text-pink-400",
    rarity: "common",
    category: "social",
    requirements: [{ type: "followers", value: 100, operator: "gte" }],
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "More followers than following",
    icon: Star,
    color: "text-orange-400",
    rarity: "rare",
    category: "social",
    requirements: [
      { type: "followers", value: 50, operator: "gte" },
      { type: "followerRatio", value: 1, operator: "gte" },
    ],
  },
  {
    id: "celebrity-dev",
    name: "Celebrity Developer",
    description: "Gained 1000+ followers",
    icon: Crown,
    color: "text-red-400",
    rarity: "legendary",
    category: "social",
    requirements: [{ type: "followers", value: 1000, operator: "gte" }],
  },

  // Repository Badges
  {
    id: "prolific-creator",
    name: "Prolific Creator",
    description: "Created 50+ public repositories",
    icon: GitBranch,
    color: "text-cyan-400",
    rarity: "common",
    category: "repository",
    requirements: [{ type: "publicRepos", value: 50, operator: "gte" }],
  },
  {
    id: "star-collector",
    name: "Star Collector",
    description: "Earned 1000+ total stars",
    icon: Star,
    color: "text-yellow-400",
    rarity: "rare",
    category: "repository",
    requirements: [{ type: "totalStars", value: 1000, operator: "gte" }],
  },
  {
    id: "viral-repo",
    name: "Viral Repository",
    description: "Created a repo with 100+ stars",
    icon: Flame,
    color: "text-orange-400",
    rarity: "epic",
    category: "repository",
    requirements: [{ type: "maxRepoStars", value: 100, operator: "gte" }],
  },
  {
    id: "mega-star",
    name: "Mega Star",
    description: "Earned 10,000+ total stars",
    icon: Crown,
    color: "text-purple-400",
    rarity: "legendary",
    category: "repository",
    requirements: [{ type: "totalStars", value: 10000, operator: "gte" }],
  },

  // Streak Badges
  {
    id: "consistent-contributor",
    name: "Consistent Contributor",
    description: "Maintained a 30-day streak",
    icon: Target,
    color: "text-green-400",
    rarity: "common",
    category: "streak",
    requirements: [{ type: "contributionStreak", value: 30, operator: "gte" }],
  },
  {
    id: "dedication-master",
    name: "Dedication Master",
    description: "Maintained a 100-day streak",
    icon: Shield,
    color: "text-blue-400",
    rarity: "rare",
    category: "streak",
    requirements: [{ type: "contributionStreak", value: 100, operator: "gte" }],
  },
  {
    id: "unstoppable-force",
    name: "Unstoppable Force",
    description: "Maintained a 365-day streak",
    icon: Flame,
    color: "text-red-400",
    rarity: "legendary",
    category: "streak",
    requirements: [{ type: "contributionStreak", value: 365, operator: "gte" }],
  },

  // Special Badges
  {
    id: "veteran-developer",
    name: "Veteran Developer",
    description: "GitHub account 5+ years old",
    icon: Award,
    color: "text-gray-400",
    rarity: "rare",
    category: "special",
    requirements: [{ type: "accountAge", value: 5, operator: "gte" }],
  },
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "GitHub account 10+ years old",
    icon: Crown,
    color: "text-indigo-400",
    rarity: "legendary",
    category: "special",
    requirements: [{ type: "accountAge", value: 10, operator: "gte" }],
  },
]

export class BadgeSystem {
  static evaluateBadges(profile: any): string[] {
    const earnedBadges: string[] = []

    // Calculate derived metrics
    const accountAge = new Date().getFullYear() - new Date(profile.user.created_at).getFullYear()
    const followerRatio = profile.user.following > 0 ? profile.user.followers / profile.user.following : 0
    const maxRepoStars = Math.max(...profile.repos.map((repo: any) => repo.stargazers_count), 0)

    const metrics = {
      totalContributions: profile.totalContributions,
      followers: profile.user.followers,
      publicRepos: profile.user.public_repos,
      totalStars: profile.totalStars,
      contributionStreak: profile.contributionStreak,
      longestStreak: profile.longestStreak,
      accountAge,
      followerRatio,
      maxRepoStars,
    }

    for (const badge of BADGE_DEFINITIONS) {
      const meetsRequirements = badge.requirements.every((req) => {
        const value = metrics[req.type as keyof typeof metrics]
        if (value === undefined) return false

        switch (req.operator) {
          case "gte":
            return value >= req.value
          case "lte":
            return value <= req.value
          case "eq":
            return value === req.value
          default:
            return false
        }
      })

      if (meetsRequirements) {
        earnedBadges.push(badge.id)
      }
    }

    return earnedBadges
  }

  static getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
    return BADGE_DEFINITIONS.find((badge) => badge.id === badgeId)
  }

  static getBadgesByCategory(category: string): BadgeDefinition[] {
    return BADGE_DEFINITIONS.filter((badge) => badge.category === category)
  }

  static getBadgesByRarity(rarity: string): BadgeDefinition[] {
    return BADGE_DEFINITIONS.filter((badge) => badge.rarity === rarity)
  }

  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case "common":
        return "border-gray-400 bg-gray-400/10"
      case "rare":
        return "border-blue-400 bg-blue-400/10"
      case "epic":
        return "border-purple-400 bg-purple-400/10"
      case "legendary":
        return "border-yellow-400 bg-yellow-400/10"
      default:
        return "border-gray-400 bg-gray-400/10"
    }
  }

  static getRarityGlow(rarity: string): string {
    switch (rarity) {
      case "common":
        return "shadow-gray-400/20"
      case "rare":
        return "shadow-blue-400/20"
      case "epic":
        return "shadow-purple-400/20"
      case "legendary":
        return "shadow-yellow-400/20 animate-pulse"
      default:
        return "shadow-gray-400/20"
    }
  }
}

export const badgeService = new BadgeSystem()