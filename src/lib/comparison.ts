import { calculateCurrentLevel } from "@/lib/level-formula"

/**
 * The subset of profile data a comparison needs. `ProfileData` satisfies this
 * structurally, so callers can pass a full profile without adapting it.
 */
export interface ComparableProfile {
  login: string
  created_at: string
  followers: number
  totalStars: number
  totalContributions: number
  public_repos: number
  longestStreak: number
  closedIssues: number
  mergedPullRequests: number
  totalReviews: number
  languageCount: number
  externalContributors: number
  points: number
  powerLevel: number
}

export type ComparisonSide = "a" | "b"
export type MetricOutcome = ComparisonSide | "tie"

export interface MetricComparison {
  /** Key from CATEGORY_FORMULAS, so levels stay consistent with achievements. */
  category: string
  label: string
  a: { value: number; level: number }
  b: { value: number; level: number }
  winner: MetricOutcome
}

export interface ComparisonResult {
  a: { login: string; points: number; powerLevel: number }
  b: { login: string; points: number; powerLevel: number }
  metrics: MetricComparison[]
  wins: { a: number; b: number; ties: number }
  winner: MetricOutcome
}

/**
 * Whole years elapsed since `createdAt`. Mirrors the account-age rule used by
 * the achievement service so a user's age scores the same in both places.
 */
export function completedYearsSince(createdAt: string, now = new Date()): number {
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return 0

  const years = now.getFullYear() - created.getFullYear()
  const monthDiff = now.getMonth() - created.getMonth()
  const beforeAnniversary = monthDiff < 0 || (monthDiff === 0 && now.getDate() < created.getDate())

  return Math.max(0, beforeAnniversary ? years - 1 : years)
}

/**
 * Metrics compared head to head. Each `category` maps to CATEGORY_FORMULAS, and
 * the value extractors mirror the achievement service's primary-metric mapping,
 * so a higher level here means the same thing it does on a profile page.
 */
const COMPARISON_METRICS: ReadonlyArray<{
  category: string
  label: string
  valueOf: (profile: ComparableProfile, now: Date) => number
}> = [
  { category: "stars", label: "Total Stars", valueOf: (p) => p.totalStars },
  { category: "followers", label: "Followers", valueOf: (p) => p.followers },
  { category: "contributions", label: "Contributions", valueOf: (p) => p.totalContributions },
  { category: "repositories", label: "Repositories", valueOf: (p) => p.public_repos },
  { category: "streak", label: "Longest Streak", valueOf: (p) => p.longestStreak },
  { category: "pull_requests", label: "Merged PRs", valueOf: (p) => p.mergedPullRequests },
  { category: "issues", label: "Closed Issues", valueOf: (p) => p.closedIssues },
  { category: "reviews", label: "Code Reviews", valueOf: (p) => p.totalReviews },
  { category: "language_diversity", label: "Languages", valueOf: (p) => p.languageCount },
  { category: "external_contributions", label: "External Contributors", valueOf: (p) => p.externalContributors },
  { category: "account_age", label: "Account Age (years)", valueOf: (p, now) => completedYearsSince(p.created_at, now) },
]

/**
 * Levels first, raw value only as a tiebreak: levels are the app's own notion of
 * "how good is this number", and they keep a 5000-vs-4999 star gap from reading
 * as a decisive win.
 */
function pickWinner(aValue: number, aLevel: number, bValue: number, bLevel: number): MetricOutcome {
  if (aLevel !== bLevel) return aLevel > bLevel ? "a" : "b"
  if (aValue !== bValue) return aValue > bValue ? "a" : "b"
  return "tie"
}

function levelFor(category: string, value: number): number {
  return calculateCurrentLevel(Math.max(0, value || 0), category)
}

export function compareProfiles(
  a: ComparableProfile,
  b: ComparableProfile,
  now = new Date(),
): ComparisonResult {
  const metrics = COMPARISON_METRICS.map(({ category, label, valueOf }) => {
    const aValue = Math.max(0, valueOf(a, now) || 0)
    const bValue = Math.max(0, valueOf(b, now) || 0)
    const aLevel = levelFor(category, aValue)
    const bLevel = levelFor(category, bValue)

    return {
      category,
      label,
      a: { value: aValue, level: aLevel },
      b: { value: bValue, level: bLevel },
      winner: pickWinner(aValue, aLevel, bValue, bLevel),
    }
  })

  const wins = {
    a: metrics.filter((m) => m.winner === "a").length,
    b: metrics.filter((m) => m.winner === "b").length,
    ties: metrics.filter((m) => m.winner === "tie").length,
  }

  return {
    a: { login: a.login, points: a.points, powerLevel: a.powerLevel },
    b: { login: b.login, points: b.points, powerLevel: b.powerLevel },
    metrics,
    wins,
    // Category count decides; total points break a draw, since that is the
    // single number the rest of the app already ranks users by.
    winner: pickWinner(a.points, wins.a, b.points, wins.b),
  }
}
