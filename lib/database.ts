export interface CachedProfile {
  username: string
  profile: any
  lastUpdated: Date
  refreshCount: number
}

export interface LeaderboardEntry {
  username: string
  score: number
  rank: number
  avatar_url: string
  name: string
  metric: string
}

class InMemoryDatabase {
  private profiles: Map<string, CachedProfile> = new Map()
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map()

  // Profile management
  cacheProfile(username: string, profile: any): void {
    const existing = this.profiles.get(username.toLowerCase())
    this.profiles.set(username.toLowerCase(), {
      username: username.toLowerCase(),
      profile,
      lastUpdated: new Date(),
      refreshCount: existing ? existing.refreshCount + 1 : 1,
    })
  }

  getCachedProfile(username: string): CachedProfile | null {
    return this.profiles.get(username.toLowerCase()) || null
  }

  isProfileStale(username: string, maxAgeMinutes = 30): boolean {
    const cached = this.getCachedProfile(username)
    if (!cached) return true

    const ageMinutes = (Date.now() - cached.lastUpdated.getTime()) / (1000 * 60)
    return ageMinutes > maxAgeMinutes
  }

  getAllProfiles(): CachedProfile[] {
    return Array.from(this.profiles.values())
  }

  // Leaderboard management
  updateLeaderboard(type: string, entries: LeaderboardEntry[]): void {
    this.leaderboards.set(
      type,
      entries.sort((a, b) => b.score - a.score),
    )
  }

  getLeaderboard(type: string): LeaderboardEntry[] {
    return this.leaderboards.get(type) || []
  }

  generateLeaderboards(): void {
    const profiles = this.getAllProfiles()

    if (profiles.length === 0) return

    // Generate different leaderboard types
    const leaderboardTypes = [
      { key: "stars", getValue: (p: any) => p.profile.totalStars },
      { key: "followers", getValue: (p: any) => p.profile.user.followers },
      { key: "repos", getValue: (p: any) => p.profile.user.public_repos },
      { key: "contributions", getValue: (p: any) => p.profile.totalContributions },
    ]

    leaderboardTypes.forEach(({ key, getValue }) => {
      const entries: LeaderboardEntry[] = profiles
        .map((cached) => ({
          username: cached.profile.user.login,
          score: getValue(cached),
          rank: 0,
          avatar_url: cached.profile.user.avatar_url,
          name: cached.profile.user.name || cached.profile.user.login,
          metric: key,
        }))
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))

      this.updateLeaderboard(key, entries)
    })
  }
}

export const database = new InMemoryDatabase()
