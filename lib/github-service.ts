class GitHubService {
  private baseUrl = "https://api.github.com"
  private graphqlUrl = "https://api.github.com/graphql"

  private async makeRequest(url: string, options: RequestInit = {}) {
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      throw new Error("GitHub token is required. Please set GITHUB_TOKEN environment variable.")
    }

    const baseHeaders: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevQuest",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> | undefined),
    }

    const response = await fetch(url, {
      ...options,
      headers: baseHeaders,
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async makeGraphQLRequest(query: string, variables: any = {}) {
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      throw new Error("GitHub token is required. Please set GITHUB_TOKEN environment variable.")
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "DevQuest",
      Authorization: `Bearer ${token}`,
    }

    try {
      const response = await fetch(this.graphqlUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 403) {
          const resetTime = response.headers.get("x-ratelimit-reset")
          if (resetTime) {
            const resetDate = new Date(Number.parseInt(resetTime) * 1000)
            throw new Error(`Rate limit exceeded. Resets at ${resetDate.toISOString()}`)
          }
        }

        // For 502/504 errors, fall back to REST API
        if (response.status >= 502 && response.status <= 504) {
          console.warn(`GraphQL API returned ${response.status}, falling back to REST API`)
          throw new Error(`GitHub GraphQL API temporarily unavailable: ${response.status}`)
        }

        throw new Error(`GitHub GraphQL API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      if (result.errors) {
        console.error("GraphQL errors:", result.errors)
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
      }

      return result.data
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("GitHub API request timed out")
      }
      throw error
    }
  }

  private async fetchComprehensiveStats(username: string) {
    const query = `
      query($username: String!) {
        user(login: $username) {
          createdAt
          name
          bio
          url
          websiteUrl
          twitterUsername
          followers { totalCount }
          following { totalCount }
          
          # Repositories with detailed stats
          repositories(first: 100, orderBy: {field: STARGAZERS, direction: DESC}) {
            totalCount
            nodes { 
              stargazerCount 
              forkCount 
              primaryLanguage { name }
              isFork
              isPrivate
              languages(first: 10) {
                nodes { name }
              }
            }
          }
          
          # Pull Requests
          pullRequests(first: 100, states: [OPEN, MERGED, CLOSED]) {
            totalCount
            nodes {
              state
              merged
              additions
              deletions
            }
          }
          
          # Issues
          issues(first: 100, states: [OPEN, CLOSED]) {
            totalCount
            nodes {
              state
              closed
            }
          }
          
          # Reviews
          contributionsCollection {
            pullRequestReviewContributions(first: 100) {
              totalCount
            }
          }
          
          # Contributions calendar
          contributionsCollection {
            contributionCalendar {
              weeks { contributionDays { contributionCount date } }
              totalContributions
            }
          }
        }
      }
    `

    try {
      const data = await this.makeGraphQLRequest(query, { username })
      return data.user
    } catch (error) {
      console.error("Error fetching comprehensive stats:", error)
      return null
    }
  }

  // Fixed method to fetch all repository details
  private async fetchAllRepositoryDetails(username: string) {
    try {
      // Use the existing fetchUserRepositories method which works correctly
      const repositories = await this.fetchUserRepositories(username, 1, 100)
      
      // If you need additional details for each repo, fetch them individually
      // But be careful about rate limits
      const detailedRepos = []
      
      for (const repo of repositories.slice(0, 20)) { // Limit to prevent rate limiting
        try {
          const repoDetail = await this.fetchRepositoryDetails(`${username}/${repo.name}`)
          detailedRepos.push(repoDetail)
        } catch (error) {
          console.warn(`Failed to fetch details for ${username}/${repo.name}:`, error)
          // Use the basic repo data if detailed fetch fails
          detailedRepos.push(repo)
        }
      }
      
      return detailedRepos
    } catch (error) {
      console.error("Error fetching repository details:", error)
      return []
    }
  }

  // Fixed and simplified commit stats method
  private async fetchCommitStats(username: string) {
    try {
      // Use a simpler approach - get contribution stats instead of individual commits
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
              totalRepositoryContributions
            }
            repositories(first: 50, ownerAffiliations: [OWNER]) {
              nodes {
                name
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(first: 1) {
                        totalCount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `

      const data = await this.makeGraphQLRequest(query, { username })
      
      if (!data.user) {
        return { totalCommits: 0, repositories: [] }
      }

      // Calculate total commits across all repositories
      let totalCommits = 0
      const repositories = data.user.repositories.nodes || []
      
      repositories.forEach((repo: any) => {
        if (repo.defaultBranchRef?.target?.history?.totalCount) {
          totalCommits += repo.defaultBranchRef.target.history.totalCount
        }
      })

      return {
        totalCommits,
        repositories,
        contributionsCollection: data.user.contributionsCollection
      }
    } catch (error) {
      console.error("Error fetching commit stats:", error)
      return { totalCommits: 0, repositories: [] }
    }
  }

  private async fetchUserStatsWithREST(username: string) {
    try {
      console.log(`[v0] Falling back to REST API for user: ${username}`)

      // Fetch basic user data
      const userData = await this.fetchUserData(username)

      // Fetch repositories
      const repos = await this.fetchUserRepositories(username, 1, 100)

      // Calculate basic stats from REST API data
      let totalStars = 0
      let totalForks = 0
      const languageStats: Record<string, number> = {}

      repos.forEach((repo: any) => {
        totalStars += repo.stargazers_count || 0
        totalForks += repo.forks_count || 0
        if (repo.language) {
          languageStats[repo.language] = (languageStats[repo.language] || 0) + 1
        }
      })

      const topLanguage =
        Object.entries(languageStats).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || null

      // Return simplified stats when GraphQL is unavailable
      return {
        dailyContributions: 0,
        weeklyContributions: 0,
        monthlyContributions: 0,
        yearlyContributions: 0,
        last365Contributions: 0,
        thisYearContributions: 0,
        overallContributions: 0,
        points: totalStars * 2 + repos.length * 3,
        totalStars,
        totalForks,
        contributedTo: repos.filter((r: any) => r.fork).length,
        totalRepositories: repos.length,
        followers: userData.followers || 0,
        following: userData.following || 0,
        currentStreak: 0,
        longestStreak: 0,
        topLanguage,
        languageStats,
        contributionGraph: { weeks: [], totalContributions: 0 },
        totalCommits: 0,
        meaningfulCommits: 0,
        totalPullRequests: 0,
        mergedPullRequests: 0,
        totalIssues: 0,
        closedIssues: 0,
        totalReviews: 0,
        externalContributors: 0,
        reposWithStars: repos.filter((r: any) => r.stargazers_count > 0).length,
        reposWithForks: repos.filter((r: any) => r.forks_count > 0).length,
        dependencyUsage: 0,
        languageCount: Object.keys(languageStats).length,
        topLanguagePercentage: topLanguage ? Math.round((languageStats[topLanguage] / repos.length) * 100) : 0,
        rareLanguageRepos: 0,
        lastFetchedAt: new Date(),
      }
    } catch (error) {
      console.error("REST API fallback failed:", error)
      throw error
    }
  }

  async fetchUserStats(username: string) {
    try {
      // Try GraphQL first
      return await this.fetchUserStatsWithGraphQL(username)
    } catch (error) {
      console.warn("GraphQL failed, trying REST API fallback:", error)
      // Fall back to REST API if GraphQL fails
      return await this.fetchUserStatsWithREST(username)
    }
  }

  // Updated main GraphQL method with fixes
  private async fetchUserStatsWithGraphQL(username: string) {
    const comprehensiveData = await this.fetchComprehensiveStats(username) // This works fine
    const repoDetails = await this.fetchAllRepositoryDetails(username) // Fixed method
    const commitStats = await this.fetchCommitStats(username) // Fixed method

    if (!comprehensiveData) {
      throw new Error("User not found or data unavailable")
    }

    const user = comprehensiveData

    // Basic stats
    const followers = user.followers.totalCount
    const following = user.following.totalCount
    const totalRepositories = user.repositories.totalCount
    let totalStars = 0
    let totalForks = 0
    let contributedTo = 0
    const languageStats: Record<string, number> = {}
    let reposWithStars = 0
    let reposWithForks = 0
    let rareLanguageRepos = 0

    // Process repositories
    user.repositories.nodes.forEach((repo: any) => {
      totalStars += repo.stargazerCount
      totalForks += repo.forkCount

      if (repo.stargazerCount > 0) reposWithStars++
      if (repo.forkCount > 0) reposWithForks++

      // Count repositories user contributed to (not owned)
      if (repo.isFork || !repo.isPrivate) {
        contributedTo++
      }

      if (repo.primaryLanguage) {
        languageStats[repo.primaryLanguage.name] = (languageStats[repo.primaryLanguage.name] || 0) + 1
      }

      // Check for rare languages
      if (repo.languages?.nodes) {
        repo.languages.nodes.forEach((lang: any) => {
          if (lang.name && this.isRareLanguage(lang.name)) {
            rareLanguageRepos++
          }
        })
      }
    })

    const topLanguage =
      Object.entries(languageStats).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || null
    const languageCount = Object.keys(languageStats).length

    // Calculate top language percentage
    let topLanguagePercentage = 0
    if (topLanguage && languageStats[topLanguage]) {
      topLanguagePercentage = Math.round((languageStats[topLanguage] / totalRepositories) * 100)
    }

    // Use the simplified commit stats
    const totalCommits = commitStats.totalCommits || 0
    const meaningfulCommits = Math.floor(totalCommits * 0.7) // Estimate meaningful commits

    // Process PR statistics
    const totalPullRequests = user.pullRequests.totalCount
    let mergedPullRequests = 0
    let totalAdditions = 0
    let totalDeletions = 0

    user.pullRequests.nodes.forEach((pr: any) => {
      if (pr.merged) {
        mergedPullRequests++
      }
      if (pr.additions) totalAdditions += pr.additions
      if (pr.deletions) totalDeletions += pr.deletions
    })

    // Process issue statistics
    const totalIssues = user.issues.totalCount
    let closedIssues = 0

    user.issues.nodes.forEach((issue: any) => {
      if (issue.closed) {
        closedIssues++
      }
    })

    // Process review statistics
    const totalReviews = user.contributionsCollection.pullRequestReviewContributions.totalCount

    // Calculate external contributors (simplified - repos with forks)
    const externalContributors = reposWithForks

    // Calculate dependency usage (simplified - repos that are forked)
    const dependencyUsage = repoDetails.filter((repo: any) => repo.fork).length

    // Contribution graph
    const calendar = user.contributionsCollection.contributionCalendar
    const weeks = calendar.weeks || []
    const allDays = weeks.flatMap((w: any) => w.contributionDays)

    // Current streak and longest streak from calendar
    const sortedDays = [...allDays].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let currentStreak = 0,
      longestStreak = 0,
      tempStreak = 0
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const day = sortedDays[i]
      const d = new Date(day.date)
      d.setUTCHours(0, 0, 0, 0)
      if (day.contributionCount > 0) {
        if (d.getTime() === today.getTime() - currentStreak * 86400000) currentStreak++
        else break
      } else if (d.getTime() === today.getTime()) continue
      else break
    }
    
    sortedDays.forEach((day: any) => {
      if (day.contributionCount > 0) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    })

    // Calculate contribution windows
    const now = new Date()
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay())
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    const last365Start = new Date(startOfToday)
    last365Start.setUTCDate(last365Start.getUTCDate() - 364)

    const clamp = (dateStr: string) => new Date(dateStr)
    const sumRange = (from: Date, to: Date) =>
      allDays.reduce((sum: number, d: any) => {
        const dd = clamp(d.date)
        return sum + (dd >= from && dd <= to ? d.contributionCount || 0 : 0)
      }, 0)

    const dailyContributions = sumRange(
      startOfToday,
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59)),
    )
    const weeklyContributions = sumRange(
      startOfWeek,
      new Date(
        Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() + 6, 23, 59, 59),
      ),
    )
    const monthlyContributions = sumRange(
      startOfMonth,
      new Date(Date.UTC(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth() + 1, 0, 23, 59, 59)),
    )
    const yearlyContributions = sumRange(
      startOfYear,
      new Date(Date.UTC(startOfYear.getUTCFullYear(), 11, 31, 23, 59, 59)),
    )
    const last365Contributions = sumRange(
      last365Start,
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59)),
    )
    const thisYearContributions = yearlyContributions

    // Overall contributions across all years
    let overallContributions = calendar.totalContributions || 0
    try {
      const createdAt = new Date(user.createdAt)
      overallContributions = await this.fetchOverallContributions(username, createdAt)
    } catch {
      // Use current year if overall fetch fails
      overallContributions = thisYearContributions
    }

    // Enhanced points calculation
    const points =
      last365Contributions +
      totalStars * 2 +
      currentStreak * 5 +
      totalRepositories * 3 +
      mergedPullRequests * 10 +
      closedIssues * 5 +
      totalReviews * 3 +
      meaningfulCommits * 2

    return {
      dailyContributions,
      weeklyContributions,
      monthlyContributions,
      yearlyContributions,
      last365Contributions,
      thisYearContributions,
      overallContributions,
      points,
      totalStars,
      totalForks,
      contributedTo,
      totalRepositories,
      followers,
      following,
      currentStreak,
      longestStreak,
      topLanguage,
      languageStats,
      contributionGraph: calendar,
      totalCommits,
      meaningfulCommits,
      totalPullRequests,
      mergedPullRequests,
      totalIssues,
      closedIssues,
      totalReviews,
      externalContributors,
      reposWithStars,
      reposWithForks,
      dependencyUsage,
      languageCount,
      topLanguagePercentage,
      rareLanguageRepos,
      lastFetchedAt: new Date(),
    }
  }

  private async fetchOverallContributions(username: string, createdAt: Date): Promise<number> {
    const startYear = createdAt.getUTCFullYear()
    const endYear = new Date().getUTCFullYear()
    let total = 0
    for (let y = startYear; y <= endYear; y++) {
      const from = new Date(Date.UTC(y, 0, 1, 0, 0, 0))
      const to = new Date(Date.UTC(y, 11, 31, 23, 59, 59))
      total += await this.fetchContributionSum(username, from, to)
    }
    return total
  }

  private async fetchContributionSum(username: string, from: Date, to: Date): Promise<number> {
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks { contributionDays { contributionCount date } }
            }
          }
        }
      }
    `
    try {
      const data = await this.makeGraphQLRequest(query, { username, from: from.toISOString(), to: to.toISOString() })
      const weeks = data.user?.contributionsCollection?.contributionCalendar?.weeks || []
      let sum = 0
      for (const w of weeks) for (const d of w.contributionDays) sum += d.contributionCount || 0
      return sum
    } catch (error) {
      console.error(`Error fetching contributions for ${from.getFullYear()}:`, error)
      return 0
    }
  }

  private getIsoDate(year: number, month: number, day: number): string {
    const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
    return d.toISOString()
  }

  async fetchUserData(username: string) {
    const url = `${this.baseUrl}/users/${username}`
    return await this.makeRequest(url)
  }

  // Helper method to identify rare languages
  private isRareLanguage(language: string): boolean {
    const rareLanguages = [
      "COBOL",
      "Fortran",
      "Assembly",
      "Pascal",
      "Ada",
      "Lisp",
      "Prolog",
      "Haskell",
      "Erlang",
      "Elixir",
      "Clojure",
      "Scala",
      "F#",
      "Rust",
      "Go",
      "Kotlin",
      "Swift",
      "Dart",
      "Julia",
      "R",
      "MATLAB",
    ]
    return rareLanguages.includes(language)
  }

  async fetchUserRepositories(username: string, page = 1, perPage = 30) {
    const url = `${this.baseUrl}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=stars&direction=desc`
    return await this.makeRequest(url)
  }

  // This method is for fetching a single repository's details
  async fetchRepositoryDetails(repoPath: string) {
    const url = `${this.baseUrl}/repos/${repoPath}`
    return await this.makeRequest(url)
  }

  // Additional utility methods for enhanced functionality
  async fetchUserOrganizations(username: string) {
    const url = `${this.baseUrl}/users/${username}/orgs`
    try {
      return await this.makeRequest(url)
    } catch (error) {
      console.warn(`Failed to fetch organizations for ${username}:`, error)
      return []
    }
  }

  async fetchUserEvents(username: string, page = 1, perPage = 30) {
    const url = `${this.baseUrl}/users/${username}/events/public?page=${page}&per_page=${perPage}`
    try {
      return await this.makeRequest(url)
    } catch (error) {
      console.warn(`Failed to fetch events for ${username}:`, error)
      return []
    }
  }

  async fetchRepositoryContributors(repoPath: string) {
    const url = `${this.baseUrl}/repos/${repoPath}/contributors`
    try {
      return await this.makeRequest(url)
    } catch (error) {
      console.warn(`Failed to fetch contributors for ${repoPath}:`, error)
      return []
    }
  }

  async fetchRepositoryLanguages(repoPath: string) {
    const url = `${this.baseUrl}/repos/${repoPath}/languages`
    try {
      return await this.makeRequest(url)
    } catch (error) {
      console.warn(`Failed to fetch languages for ${repoPath}:`, error)
      return {}
    }
  }

  // Rate limiting helper method
  async checkRateLimit() {
    const url = `${this.baseUrl}/rate_limit`
    try {
      return await this.makeRequest(url)
    } catch (error) {
      console.error("Failed to check rate limit:", error)
      return null
    }
  }

  // Batch processing helper to avoid rate limits
  async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize = 5,
    delayMs = 1000
  ): Promise<R[]> {
    const results: R[] = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      const batchResults = await Promise.allSettled(
        batch.map(item => processor(item))
      )
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.warn(`Failed to process item ${i + index}:`, result.reason)
        }
      })
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
    
    return results
  }
}

export const githubService = new GitHubService()