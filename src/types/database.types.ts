export type {
    UpsertUser,
    User,
    GithubStats,
    InsertGithubStats,
    Achievement,
    InsertAchievement,
    UserAchievement,
    InsertUserAchievement,
    Leaderboard,
    InsertLeaderboard,
} from "../lib/schema"

export interface DatabaseConfig {
    connectionString: string
    ssl?: boolean
    maxConnections?: number
}

export interface QueryResult<T> {
    data: T[]
    count: number
    error?: string
}

export interface PaginationParams {
    page: number
    limit: number
    offset?: number
}

export interface SortParams {
    field: string
    direction: 'asc' | 'desc'
}
