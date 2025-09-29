import { GitHubContribution, GitHubRepo, GitHubUser } from '@/types/github.types'

interface UserProfile {
  user: GitHubUser
  repos: GitHubRepo[]
  totalStars: number
  topLanguages: { [key: string]: number }
  contributionStreak: number
  longestStreak: number
  totalContributions: number
  achievements: string[]
  achievementProgress?: any[]
}

export class GitHubAPI {
  private baseURL = "https://api.github.com"
  private token?: string

  constructor(token?: string) {
    this.token = token
  }

  private async fetch(endpoint: string) {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevQuest-App",
    }

    if (this.token) {
      headers["Authorization"] = `token ${this.token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, { headers })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.fetch(`/users/${username}`)
  }

  async getUserRepos(username: string, page = 1, perPage = 100): Promise<GitHubRepo[]> {
    return this.fetch(`/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`)
  }

  async getUserContributions(username: string): Promise<GitHubContribution[]> {
    // Note: This would typically require scraping GitHub's contribution graph
    // For now, we'll return mock data or use a third-party service
    return []
  }

  async buildUserProfile(username: string): Promise<UserProfile> {
    try {
      const [user, repos] = await Promise.all([this.getUser(username), this.getUserRepos(username)])

      // Calculate total stars
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)

      // Calculate top languages
      const topLanguages: { [key: string]: number } = {}
      repos.forEach((repo) => {
        if (repo.language) {
          topLanguages[repo.language] = (topLanguages[repo.language] || 0) + 1
        }
      })

      // Mock contribution data (in real app, would fetch from GitHub's contribution API)
      const contributionStreak = Math.floor(Math.random() * 100)
      const longestStreak = Math.floor(Math.random() * 200)
      const totalContributions = Math.floor(Math.random() * 5000)

      // Generate achievements based on stats
      const achievements = this.generateAchievements(user, repos, totalStars)

      return {
        user,
        repos,
        totalStars,
        topLanguages,
        contributionStreak,
        longestStreak,
        totalContributions,
        achievements,
      }
    } catch (error) {
      console.error("Error building user profile:", error)
      throw error
    }
  }

  private generateAchievements(user: GitHubUser, repos: GitHubRepo[], totalStars: number): string[] {
    const profile = {
      user,
      repos,
      totalStars,
      totalContributions: Math.floor(Math.random() * 5000),
      contributionStreak: Math.floor(Math.random() * 100),
      longestStreak: Math.floor(Math.random() * 200),
    }

    return []
  }
}

export const githubAPI = new GitHubAPI()
export const createAuthenticatedAPI = (token: string) => new GitHubAPI(token)

export const githubApiService = githubAPI

