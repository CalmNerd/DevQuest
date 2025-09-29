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
  size: number
  open_issues_count: number
  topics: string[]
  license?: {
    key: string
    name: string
    spdx_id: string
    url: string
    node_id: string
  } | null
  default_branch: string
  archived: boolean
  disabled: boolean
  fork: boolean
  private: boolean
  visibility: string
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
    type: string
  }
  clone_url: string
  ssh_url: string
  homepage?: string | null
  language_color?: string
  languages?: Record<string, number>
}

export interface GitHubSearchRepo {
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
  size: number
  open_issues_count: number
  topics: string[]
  license?: {
    key: string
    name: string
    spdx_id: string
    url: string
    node_id: string
  } | null
  default_branch: string
  archived: boolean
  disabled: boolean
  fork: boolean
  private: boolean
  visibility: string
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
    type: string
  }
  clone_url: string
  ssh_url: string
  homepage?: string | null
  language_color?: string
  languages?: Record<string, number>
  score: number
}

export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubSearchRepo[]
}

export interface RepositorySearchFilters {
  query: string
  sort: 'stars' | 'forks' | 'help-wanted-issues' | 'updated' | 'created'
  order: 'asc' | 'desc'
  language?: string
  license?: string
  topic?: string
  user?: string
  org?: string
  archived?: boolean
  fork?: boolean
  created?: string
  pushed?: string
  size?: string
  stars?: string
  forks?: string
  page?: number
  per_page?: number
}

export interface TrendingRepository {
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
  size: number
  open_issues_count: number
  topics: string[]
  license?: {
    key: string
    name: string
    spdx_id: string
    url: string
    node_id: string
  } | null
  default_branch: string
  archived: boolean
  disabled: boolean
  fork: boolean
  private: boolean
  visibility: string
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
    type: string
  }
  clone_url: string
  ssh_url: string
  homepage?: string | null
  language_color?: string
  languages?: Record<string, number>
  score: number
  trend_score: number
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020'
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
  achievementProgress?: any[]
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
  achievementProgress: Array<{
    achievement: {
      id: number
      name: string
      description: string
      category: string
      icon: string
      rarity: "common" | "rare" | "epic" | "legendary"
      tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary"
      points: number
    }
    progress: number
    maxProgress: number
    progressPercentage: number
    isUnlocked: boolean
    unlockedAt?: Date | null
    nextMilestone?: number
    description: string
    isLeveled?: boolean
    currentLevel?: number
    currentValue?: number
    nextLevelRequirement?: number
    animationIntensity?: number
  }>

  // Metadata
  cached: boolean
  lastUpdated: string
  hasApiErrors: boolean
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