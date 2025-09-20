/**
 * API-related type definitions
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ErrorResponse {
  success: false
  error: string
  message: string
  timestamp: string
  details?: Record<string, any>
}

// API Endpoint types
export interface LeaderboardParams {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall'
  limit?: number
  offset?: number
}

export interface UserProfileParams {
  username: string
  includeStats?: boolean
  includeAchievements?: boolean
}

export interface IssueSearchParams {
  query?: string
  language?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  labels?: string[]
  limit?: number
  page?: number
}
