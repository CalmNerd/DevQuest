export function requirementForLevel(n: number, B: number, p: number, alpha: number, t: number): number {
  if (n <= 0) return 0

  const poly = B * Math.pow(n, p)
  const logFactor = Math.log2(n + 1)
  const late = Math.pow(1 + alpha, Math.max(0, n - t))

  return Math.floor(poly * logFactor * late)
}

// Category-specific formula parameters
export const CATEGORY_FORMULAS = {
  followers: { B: 10, p: 1.5, t: 20, alpha: 0.08 },
  stars: { B: 10, p: 1.6, t: 22, alpha: 0.08 },
  contributions: { B: 10, p: 1.7, t: 25, alpha: 0.08 },
  language_diversity: { B: 2, p: 1.3, t: 30, alpha: 0.05 },
  repositories: { B: 1, p: 1.5, t: 20, alpha: 0.08 },
  streak: { B: 7, p: 1.4, t: 30, alpha: 0.06 },
  account_age: { B: 1, p: 1.0, t: 0, alpha: 0.0 }, // Special case: 1 year = 1 level
  issues: { B: 5, p: 1.4, t: 15, alpha: 0.08 },
  pull_requests: { B: 5, p: 1.5, t: 20, alpha: 0.08 },
  reviews: { B: 10, p: 1.6, t: 25, alpha: 0.08 },
  external_contributions: { B: 3, p: 1.4, t: 10, alpha: 0.08 }
}

// Get requirement for a specific level in a category
export function requirementForLevelInCategory(level: number, category: string): number {
  const params = CATEGORY_FORMULAS[category as keyof typeof CATEGORY_FORMULAS]
  if (!params) {
    throw new Error(`No formula parameters found for category: ${category}`)
  }

  return requirementForLevel(level, params.B, params.p, params.alpha, params.t)
}

// Calculate current level based on current value and category
export function calculateCurrentLevel(currentValue: number, category: string): number {
  const params = CATEGORY_FORMULAS[category as keyof typeof CATEGORY_FORMULAS]
  if (!params) {
    throw new Error(`No formula parameters found for category: ${category}`)
  }

  // Special case for account_age (1 year = 1 level, but only full years completed)
  if (category === 'account_age') {
    return Math.floor(currentValue)
  }

  let level = 0
  while (requirementForLevel(level + 1, params.B, params.p, params.alpha, params.t) <= currentValue) {
    level++
  }

  return Math.max(0, level)
}

// Get next level requirement for a category
export function getNextLevelRequirement(currentValue: number, category: string): number {
  const currentLevel = calculateCurrentLevel(currentValue, category)
  return requirementForLevelInCategory(currentLevel + 1, category)
}

// Get progress to next level
export function getProgressToNextLevel(currentValue: number, category: string): {
  progress: number
  nextRequirement: number
  progressPercentage: number
} {
  const currentLevel = calculateCurrentLevel(currentValue, category)
  const currentRequirement = requirementForLevelInCategory(currentLevel, category)
  const nextRequirement = requirementForLevelInCategory(currentLevel + 1, category)

  const progress = currentValue - currentRequirement
  const progressPercentage = nextRequirement > currentRequirement
    ? ((progress / (nextRequirement - currentRequirement)) * 100)
    : 100

  return {
    progress,
    nextRequirement,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage))
  }
}

// Get visual tier based on level
export function getVisualTier(level: number): {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  animationIntensity: number
} {
  if (level >= 50) {
    return { tier: 'legendary', rarity: 'legendary', animationIntensity: 1.0 }
  } else if (level >= 30) {
    return { tier: 'diamond', rarity: 'legendary', animationIntensity: 0.8 }
  } else if (level >= 20) {
    return { tier: 'platinum', rarity: 'epic', animationIntensity: 0.6 }
  } else if (level >= 10) {
    return { tier: 'gold', rarity: 'epic', animationIntensity: 0.4 }
  } else if (level >= 5) {
    return { tier: 'silver', rarity: 'rare', animationIntensity: 0.2 }
  } else {
    return { tier: 'bronze', rarity: 'common', animationIntensity: 0.1 }
  }
}

// Get points multiplier based on level
export function getPointsMultiplier(level: number): number {
  if (level >= 50) return 10.0
  if (level >= 30) return 7.0
  if (level >= 20) return 5.0
  if (level >= 10) return 3.0
  if (level >= 5) return 2.0
  return 1.0
}

// Get achievement name based on category and level
// Special handling for account_age to use year-based naming
export function getAchievementName(category: string, level: number): string {
  // Special naming for account_age based on years
  if (category === 'account_age') {
    if (level >= 15) return "GitHub Legend"
    if (level >= 10) return "GitHub Veteran - Master"
    if (level >= 7) return "GitHub Veteran - Advanced"
    if (level >= 5) return "GitHub Veteran - Expert"
    if (level >= 3) return "GitHub Veteran"
    if (level >= 1) return "GitHub Member"
    return "GitHub Newcomer"
  }

  // Standard naming for other categories
  const baseNames: Record<string, string> = {
    followers: "Social Legend",
    stars: "Star Collector",
    contributions: "Code Master",
    language_diversity: "Polyglot",
    repositories: "Repository Architect",
    streak: "Streak Champion",
    issues: "Issue Solver",
    pull_requests: "Merge Master",
    reviews: "Code Reviewer",
    external_contributions: "Open Source Hero"
  }

  const baseName = baseNames[category] || "Achievement"

  if (level >= 50) return `${baseName} - Legendary`
  if (level >= 30) return `${baseName} - Master`
  if (level >= 20) return `${baseName} - Advanced`
  if (level >= 10) return `${baseName} - Expert`
  if (level >= 5) return `${baseName} - Pro`
  if (level >= 3) return `${baseName} - Skilled`
  if (level >= 1) return baseName

  return baseName
}

//Get achievement description based on category and level
//Special handling for account_age to use year-based descriptions

export function getAchievementDescription(category: string, level: number): string {
  // Special descriptions for account_age based on years
  if (category === 'account_age') {
    if (level >= 15) return `A legendary GitHub veteran with ${level} years of experience`
    if (level >= 10) return `A master-level GitHub veteran with ${level} years of experience`
    if (level >= 7) return `An advanced GitHub veteran with ${level} years of experience`
    if (level >= 5) return `An expert GitHub veteran with ${level} years of experience`
    if (level >= 3) return `A seasoned GitHub veteran with ${level} years of experience`
    if (level >= 1) return `A GitHub member with ${level} year${level > 1 ? 's' : ''} of experience`
    return "Just getting started on GitHub"
  }

  // Standard descriptions for other categories
  const nextRequirement = requirementForLevelInCategory(level + 1, category)
  const currentRequirement = requirementForLevelInCategory(level, category)

  const descriptions: Record<string, string> = {
    followers: `Gained ${currentRequirement}+ followers. Next: ${nextRequirement} followers`,
    stars: `Received ${currentRequirement}+ stars. Next: ${nextRequirement} stars`,
    contributions: `Made ${currentRequirement}+ contributions. Next: ${nextRequirement} contributions`,
    language_diversity: `Used ${currentRequirement}+ programming languages. Next: ${nextRequirement} languages`,
    repositories: `Created ${currentRequirement}+ repositories. Next: ${nextRequirement} repositories`,
    streak: `Achieved ${currentRequirement}+ day streak. Next: ${nextRequirement} days`,
    issues: `Closed ${currentRequirement}+ issues. Next: ${nextRequirement} issues`,
    pull_requests: `Merged ${currentRequirement}+ pull requests. Next: ${nextRequirement} PRs`,
    reviews: `Completed ${currentRequirement}+ code reviews. Next: ${nextRequirement} reviews`,
    external_contributions: `Contributed to ${currentRequirement}+ external repos. Next: ${nextRequirement} repos`
  }

  return descriptions[category] || `Reached level ${level}`
}

// Check if a category supports leveled achievements
export function isLeveledCategory(category: string): boolean {
  return category in CATEGORY_FORMULAS
}

// Get all categories that support leveled achievements
export function getLeveledCategories(): string[] {
  return Object.keys(CATEGORY_FORMULAS)
}