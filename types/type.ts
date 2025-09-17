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