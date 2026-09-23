import assert from "node:assert/strict"
import { compareProfiles, completedYearsSince, type ComparableProfile } from "../src/lib/comparison"

const NOW = new Date("2025-06-15T00:00:00Z")

function profile(overrides: Partial<ComparableProfile> = {}): ComparableProfile {
  return {
    login: "user",
    created_at: "2020-01-01T00:00:00Z",
    followers: 0,
    totalStars: 0,
    totalContributions: 0,
    public_repos: 0,
    longestStreak: 0,
    closedIssues: 0,
    mergedPullRequests: 0,
    totalReviews: 0,
    languageCount: 0,
    externalContributors: 0,
    points: 0,
    powerLevel: 0,
    ...overrides,
  }
}

// Account age counts only whole years.
assert.equal(completedYearsSince("2020-06-15T00:00:00Z", NOW), 5)
assert.equal(completedYearsSince("2020-06-16T00:00:00Z", NOW), 4, "day before anniversary")
assert.equal(completedYearsSince("2030-01-01T00:00:00Z", NOW), 0, "future date clamps to 0")
assert.equal(completedYearsSince("not-a-date", NOW), 0, "invalid date clamps to 0")

// Identical profiles tie on every metric and overall.
const twin = compareProfiles(profile({ login: "a" }), profile({ login: "b" }), NOW)
assert.equal(twin.winner, "tie")
assert.equal(twin.wins.a, 0)
assert.equal(twin.wins.b, 0)
assert.equal(twin.wins.ties, twin.metrics.length)

// A strictly better profile wins the metric and the match.
const starry = compareProfiles(
  profile({ login: "a", totalStars: 5000 }),
  profile({ login: "b", totalStars: 0 }),
  NOW,
)
assert.equal(starry.metrics.find((m) => m.category === "stars")?.winner, "a")
assert.equal(starry.wins.a, 1)
assert.equal(starry.winner, "a")

// Same level, different raw value: the higher value takes it.
const close = compareProfiles(
  profile({ login: "a", totalStars: 11 }),
  profile({ login: "b", totalStars: 10 }),
  NOW,
)
const closeStars = close.metrics.find((m) => m.category === "stars")!
assert.equal(closeStars.a.level, closeStars.b.level, "expected both inside the same star level")
assert.equal(closeStars.winner, "a")

// Equal category wins fall through to total points.
const drawn = compareProfiles(
  profile({ login: "a", totalStars: 5000, points: 10 }),
  profile({ login: "b", followers: 5000, points: 999 }),
  NOW,
)
assert.equal(drawn.wins.a, drawn.wins.b)
assert.equal(drawn.winner, "b", "points should break a category draw")

// Missing/negative numbers are floored rather than throwing.
const messy = compareProfiles(
  profile({ login: "a", totalStars: -5, followers: undefined as unknown as number }),
  profile({ login: "b" }),
  NOW,
)
assert.equal(messy.metrics.find((m) => m.category === "stars")?.a.value, 0)
assert.equal(messy.winner, "tie")

console.log(`comparison: all checks passed (${twin.metrics.length} metrics)`)
