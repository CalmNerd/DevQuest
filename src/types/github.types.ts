export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string
  state: "open" | "closed"
  created_at: string
  updated_at: string
  comments: number
  labels: Array<{
    name: string
    color: string
    description?: string
  }>
  user: {
    login: string
    avatar_url: string
  }
  assignees?: Array<{
    login: string
    avatar_url: string
    id: number
  }>
  repository: {
    name: string
    full_name: string
    owner: {
      login: string
    }
    stargazers_count: number
    forks_count: number
    watchers_count: number
    subscribers_count: number
    open_issues_count: number
    language: string
    languages?: string[]
    avatar_url?: string
  }
  html_url: string
}

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  bio: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  watchers_count: number
  language: string | null
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface GitHubContribution {
  date: string
  count: number
  level: number
}

export interface UserProfile {
  user: GitHubUser
  repos: GitHubRepo[]
  totalStars: number
  topLanguages: { [key: string]: number }
  contributionStreak: number
  longestStreak: number
  totalContributions: number
  achievements: string[]
}


export interface ProfileData {
  // Basic GitHub data
  id: number
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  html_url: string
  blog: string | null
  location: string | null
  email: string | null
  twitter_username: string | null
  created_at: string
  updated_at: string

  // GitHub stats
  public_repos: number
  public_gists: number
  followers: number
  following: number

  // Enhanced statistics
  totalStars: number
  totalForks: number
  totalWatchers: number
  totalIssues: number
  totalPRs: number
  totalCommits: number
  totalContributions: number
  contributionStreak: number
  longestStreak: number
  points: number

  // Additional detailed stats
  dailyContributions: number
  weeklyContributions: number
  monthlyContributions: number
  yearlyContributions: number
  last365Contributions: number
  thisYearContributions: number
  mergedPullRequests: number
  closedIssues: number
  totalReviews: number
  meaningfulCommits: number
  contributedTo: number
  externalContributors: number
  reposWithStars: number
  reposWithForks: number
  dependencyUsage: number
  languageCount: number
  topLanguagePercentage: number
  rareLanguageRepos: number

  // Power level system
  powerLevel: number
  powerProgress: number
  pointsToNext: number
  nextLevelCost: number

  // Languages and repositories
  topLanguages: Record<string, number>
  repos: Array<{
    id: number
    name: string
    description: string | null
    html_url: string
    language: string | null
    stargazers_count: number
    forks_count: number
    watchers_count: number
    open_issues_count: number
    created_at: string
    updated_at: string
    pushed_at: string
  }>

  // Contribution graph data
  contributionGraph: {
    weeks: Array<{
      contributionDays: Array<{
        date: string
        contributionCount: number
        level: number
      }>
    }>
    totalContributions: number
  }

  // Achievements
  achievements: string[]

  // Metadata
  cached: boolean
  lastUpdated: string
}

export interface GitHubStatsData {
  dailyContributions: number
  weeklyContributions: number
  monthlyContributions: number
  yearlyContributions: number
  last365Contributions: number
  thisYearContributions: number
  overallContributions: number
  points: number
  totalStars: number
  totalForks: number
  contributedTo: number
  totalRepositories: number
  followers: number
  following: number
  currentStreak: number
  longestStreak: number
  topLanguage: string | null
  languageStats: Record<string, number>
  contributionGraph: any
  totalCommits: number
  meaningfulCommits: number
  totalPullRequests: number
  mergedPullRequests: number
  totalIssues: number
  closedIssues: number
  totalReviews: number
  externalContributors: number
  reposWithStars: number
  reposWithForks: number
  dependencyUsage: number
  languageCount: number
  topLanguagePercentage: number
  rareLanguageRepos: number
  lastFetchedAt: Date
}