import axios from "axios"
import {
  GitHubSearchResponse,
  GitHubSearchRepo,
  RepositorySearchFilters,
  TrendingRepository
} from '@/types/github.types'

/**
 * Service class for handling GitHub repository operations
 * Provides methods for searching repositories, fetching trending repos, and filtering
 */
class RepositoryService {
  private baseUrl = "https://api.github.com"
  private token: string

  constructor() {
    this.token = process.env.GITHUB_TOKEN || ""
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error("GitHub token is required. Please set GITHUB_TOKEN environment variable.")
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DevQuest",
      ...(options.headers as Record<string, string> | undefined),
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Invalid GitHub token")
      }
      if (response.status === 403) {
        const resetTime = response.headers.get("x-ratelimit-reset")
        if (resetTime) {
          const resetDate = new Date(Number.parseInt(resetTime) * 1000)
          throw new Error(`Rate limit exceeded. Resets at ${resetDate.toISOString()}`)
        }
        throw new Error("Rate limit exceeded or insufficient permissions")
      }
      if (response.status === 422) {
        throw new Error("Invalid search query")
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Builds GitHub search query from filters
   */
  private buildSearchQuery(filters: RepositorySearchFilters): string {
    let query = filters.query || ""

    // Add repository name restriction to all searches
    if (query) {
      query += " in:name"
    } else {
      query = "in:name"
    }

    // If no query and no filters, add a default search to avoid empty queries
    if (!filters.query && !filters.language && !filters.topic && !filters.user && !filters.org) {
      query += " stars:>0" // Search for repositories with at least 1 star
    }

    // Add language filter
    if (filters.language) {
      query += ` language:${filters.language}`
    }

    // Add license filter
    if (filters.license) {
      query += ` license:${filters.license}`
    }

    // Add topic filter
    if (filters.topic) {
      query += ` topic:${filters.topic}`
    }

    // Add user filter
    if (filters.user) {
      query += ` user:${filters.user}`
    }

    // Add organization filter
    if (filters.org) {
      query += ` org:${filters.org}`
    }

    // Add archived filter
    if (filters.archived !== undefined) {
      query += ` archived:${filters.archived}`
    }

    // Add fork filter
    if (filters.fork !== undefined) {
      query += ` fork:${filters.fork}`
    }

    // Add created date filter
    if (filters.created) {
      query += ` created:${filters.created}`
    }

    // Add pushed date filter
    if (filters.pushed) {
      query += ` pushed:${filters.pushed}`
    }

    // Add size filter
    if (filters.size) {
      query += ` size:${filters.size}`
    }

    // Add stars filter
    if (filters.stars) {
      query += ` stars:${filters.stars}`
    }

    // Add forks filter
    if (filters.forks) {
      query += ` forks:${filters.forks}`
    }

    return query.trim()
  }

  /**
   * Searches repositories using GitHub API
   */
  async searchRepositories(filters: RepositorySearchFilters): Promise<GitHubSearchResponse & { headers: Headers }> {
    const query = this.buildSearchQuery(filters)
    const page = filters.page || 1
    const perPage = filters.per_page || 10
    const sort = filters.sort || 'stars'
    const order = filters.order || 'desc'

    const url = `${this.baseUrl}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`

    console.log(`[RepositoryService] Searching with URL: ${url}`)
    console.log(`[RepositoryService] Query: "${query}"`)
    console.log(`[RepositoryService] Filters:`, filters)

    return await this.makeRequest(url)
  }

  async getTrendingByLanguage(language: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020' = 'weekly', page: number = 1, limit: number = 100): Promise<TrendingRepository[]> {
    // Calculate date range for trending
    const now = new Date()
    let createdFilter: string

    if (period === '2024' || period === '2023' || period === '2022' || period === '2021' || period === '2020') {
      // Individual year filter
      const year = parseInt(period)
      const yearStart = new Date(year, 0, 1).toISOString().split('T')[0]
      const yearEnd = new Date(year, 11, 31).toISOString().split('T')[0]
      createdFilter = `>${yearStart} <${yearEnd}`
    } else {
      // Time period filters
      let since: string
      switch (period) {
        case 'daily':
          since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'weekly':
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'monthly':
          since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'yearly':
          // From January 1st of current year
          since = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
          break
        default:
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      createdFilter = `>${since}`
    }

    const filters: RepositorySearchFilters = {
      query: language ? `language:${language} in:name` : 'in:name',
      sort: 'stars',
      order: 'desc',
      created: createdFilter,
      page: page,
      per_page: limit
    }

    const response = await this.searchRepositories(filters)

    console.log("resrfa", response)

    // Transform to trending repositories with trend score
    return response.items.map((repo, index) => ({
      ...repo,
      trend_score: this.calculateTrendScore(repo, index),
      period
    }))
  }

  async getTrendingByForks(period: 'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020' = 'weekly', page: number = 1, limit: number = 100): Promise<TrendingRepository[]> {
    const now = new Date()
    let createdFilter: string

    if (period === '2024' || period === '2023' || period === '2022' || period === '2021' || period === '2020') {
      // Individual year filter
      const year = parseInt(period)
      const yearStart = new Date(year, 0, 1).toISOString().split('T')[0]
      const yearEnd = new Date(year, 11, 31).toISOString().split('T')[0]
      createdFilter = `>${yearStart} <${yearEnd}`
    } else {
      // Time period filters
      let since: string
      switch (period) {
        case 'daily':
          since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'weekly':
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'monthly':
          since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'yearly':
          // From January 1st of current year
          since = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
          break
        default:
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      createdFilter = `>${since}`
    }

    const filters: RepositorySearchFilters = {
      query: 'in:name',
      sort: 'forks',
      order: 'desc',
      created: createdFilter,
      page: page,
      per_page: limit
    }

    const response = await this.searchRepositories(filters)

    return response.items.map((repo, index) => ({
      ...repo,
      trend_score: this.calculateTrendScore(repo, index),
      period
    }))
  }


  // // this will be used to fix the pagination in trending tab
  // private parseLinkHeader(header: string | null) {
  //   if (!header) return {};
  //   return header.split(",").reduce((acc, part) => {
  //     const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
  //     if (match) {
  //       const [, url, rel] = match;
  //       acc[rel] = url;
  //     }
  //     return acc;
  //   }, {} as Record<string, string>);
  // }

  async getTrendingByStars(period: 'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020' = 'weekly', page: number = 1, limit: number = 100): Promise<TrendingRepository[]> {
    const now = new Date()
    let createdFilter: string

    if (period === '2024' || period === '2023' || period === '2022' || period === '2021' || period === '2020') {
      // Individual year filter
      const year = parseInt(period)
      const yearStart = new Date(year, 0, 1).toISOString().split('T')[0]
      const yearEnd = new Date(year, 11, 31).toISOString().split('T')[0]
      createdFilter = `>${yearStart} <${yearEnd}`
    } else {
      // Time period filters
      let since: string
      switch (period) {
        case 'daily':
          since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'weekly':
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'monthly':
          since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'yearly':
          // From January 1st of current year
          since = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
          break
        default:
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      createdFilter = `>${since}`
    }

    const filters: RepositorySearchFilters = {
      query: 'in:name',
      sort: 'stars',
      order: 'desc',
      created: createdFilter,
      page: page,
      per_page: limit
    }

    const response = await this.searchRepositories(filters)

    // this will be used to fix the pagination in trending tab
    // const linkHeader = response.headers.get("link");
    // const links = this.parseLinkHeader(linkHeader);

    return response.items.map((repo, index) => ({
      ...repo,
      trend_score: this.calculateTrendScore(repo, index),
      period,
      // this will be used to fix the pagination in trending tab
      // total_count: response.total_count,
      // totalPages: Math.ceil(response.total_count / (filters.per_page || 10)),
      // hasNextPage: Boolean(links.next),
      // hasPrevPage: Boolean(links.prev),
    }))
  }

  async getAllTimeTopRepositories(language?: string, sortBy: 'stars' | 'forks' | 'updated' | 'created' = 'stars', page: number = 1, limit: number = 100): Promise<GitHubSearchRepo[]> {
    const filters: RepositorySearchFilters = {
      query: language ? `language:${language} in:name` : 'in:name',
      sort: sortBy,
      order: 'desc',
      page: page,
      per_page: limit
    }

    const response = await this.searchRepositories(filters)
    return response.items
  }

  async getRepositoriesByUser(username: string, type: 'user' | 'org' = 'user'): Promise<GitHubSearchRepo[]> {
    const filters: RepositorySearchFilters = {
      query: 'in:name',
      sort: 'stars',
      order: 'desc',
      [type]: username,
      page: 1,
      per_page: 30
    }

    const response = await this.searchRepositories(filters)
    return response.items
  }

  async getRepositoriesByTopic(topic: string): Promise<GitHubSearchRepo[]> {
    const filters: RepositorySearchFilters = {
      query: 'in:name',
      sort: 'stars',
      order: 'desc',
      topic,
      page: 1,
      per_page: 30
    }

    const response = await this.searchRepositories(filters)
    return response.items
  }

  async getRepositoriesByLicense(license: string): Promise<GitHubSearchRepo[]> {
    const filters: RepositorySearchFilters = {
      query: 'in:name',
      sort: 'stars',
      order: 'desc',
      license,
      page: 1,
      per_page: 30
    }

    const response = await this.searchRepositories(filters)
    return response.items
  }

  async getRecentlyCreatedRepositories(language?: string, page: number = 1, limit: number = 100): Promise<GitHubSearchRepo[]> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const filters: RepositorySearchFilters = {
      query: language ? `language:${language} in:name` : 'in:name',
      sort: 'created',
      order: 'desc',
      created: `>${thirtyDaysAgo}`,
      page: page,
      per_page: limit
    }

    const response = await this.searchRepositories(filters)
    return response.items
  }

  async getRecentlyUpdatedRepositories(language?: string, page: number = 1, limit: number = 100): Promise<GitHubSearchRepo[]> {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const filters: RepositorySearchFilters = {
      query: language ? `language:${language} in:name` : 'in:name',
      sort: 'updated',
      order: 'desc',
      pushed: `>${sevenDaysAgo}`,
      page: page,
      per_page: limit
    }

    const response = await this.searchRepositories(filters)
    return response.items
  }

  private calculateTrendScore(repo: GitHubSearchRepo, index: number): number {
    // Simple trend score calculation based on position and recent activity
    const positionScore = (30 - index) / 30 // Higher score for better positions
    const starsScore = Math.log(repo.stargazers_count + 1) / 10 // Logarithmic stars score
    const forksScore = Math.log(repo.forks_count + 1) / 10 // Logarithmic forks score

    // Calculate recency score based on updated_at
    const updatedDate = new Date(repo.updated_at)
    const now = new Date()
    const daysSinceUpdate = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
    const recencyScore = Math.max(0, 1 - (daysSinceUpdate / 30)) // Higher score for more recent updates

    return (positionScore * 0.3) + (starsScore * 0.3) + (forksScore * 0.2) + (recencyScore * 0.2)
  }

  async getRepositoryDetails(owner: string, repo: string): Promise<GitHubSearchRepo> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}`
    return await this.makeRequest(url)
  }

  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/languages`
    return await this.makeRequest(url)
  }

  async getRepositoryTopics(owner: string, repo: string): Promise<string[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/topics`
    try {
      const response = await this.makeRequest(url)
      return response.names || []
    } catch (error) {
      console.warn(`Failed to fetch topics for ${owner}/${repo}:`, error)
      return []
    }
  }

  async getRepositoryContributors(owner: string, repo: string, perPage: number = 10): Promise<any[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contributors?per_page=${perPage}`
    try {
      return await this.makeRequest(url)
    } catch (error) {
      console.warn(`Failed to fetch contributors for ${owner}/${repo}:`, error)
      return []
    }
  }

  async checkRateLimit(): Promise<any> {
    const url = `${this.baseUrl}/rate_limit`
    return await this.makeRequest(url)
  }
}

export const repositoryService = new RepositoryService()
