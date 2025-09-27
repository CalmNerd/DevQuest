import { NextResponse } from 'next/server'
import { TimezoneService } from './timezone'

/**
 * Utility for creating consistent API responses with timezone information
 * All timestamps in responses are in UTC, with timezone metadata for client-side formatting
 */
export class ApiResponse {
  /**
   * Create a successful API response with timezone metadata
   */
  static success<T>(data: T, options: {
    status?: number
    headers?: Record<string, string>
    includeTimezoneInfo?: boolean
  } = {}): NextResponse {
    const { status = 200, headers = {}, includeTimezoneInfo = true } = options

    const responseData: any = {
      success: true,
      data,
      timestamp: TimezoneService.getCurrentUTCDateTime(),
    }

    // Include timezone information for client-side formatting
    if (includeTimezoneInfo) {
      responseData.timezone = {
        server: 'UTC',
        format: 'ISO 8601',
        note: 'All timestamps are in UTC. Use client-side timezone detection for display.'
      }
    }

    return NextResponse.json(responseData, { status, headers })
  }

  /**
   * Create an error API response with timezone metadata
   */
  static error(message: string, options: {
    status?: number
    details?: any
    includeTimezoneInfo?: boolean
  } = {}): NextResponse {
    const { status = 500, details, includeTimezoneInfo = true } = options

    const responseData: any = {
      success: false,
      error: message,
      timestamp: TimezoneService.getCurrentUTCDateTime(),
    }

    if (details) {
      responseData.details = details
    }

    // Include timezone information for client-side formatting
    if (includeTimezoneInfo) {
      responseData.timezone = {
        server: 'UTC',
        format: 'ISO 8601',
        note: 'All timestamps are in UTC. Use client-side timezone detection for display.'
      }
    }

    return NextResponse.json(responseData, { status })
  }

  /**
   * Create a paginated API response with timezone metadata
   */
  static paginated<T>(data: T[], pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }, options: {
    status?: number
    headers?: Record<string, string>
    includeTimezoneInfo?: boolean
  } = {}): NextResponse {
    const { status = 200, headers = {}, includeTimezoneInfo = true } = options

    const responseData: any = {
      success: true,
      data,
      pagination,
      timestamp: TimezoneService.getCurrentUTCDateTime(),
    }

    // Include timezone information for client-side formatting
    if (includeTimezoneInfo) {
      responseData.timezone = {
        server: 'UTC',
        format: 'ISO 8601',
        note: 'All timestamps are in UTC. Use client-side timezone detection for display.'
      }
    }

    return NextResponse.json(responseData, { status, headers })
  }

  /**
   * Transform database timestamps to UTC ISO strings
   * Ensures all timestamps in the response are properly formatted
   */
  static transformTimestamps<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.transformTimestamps(item)) as T
    }

    if (typeof obj === 'object') {
      const transformed = { ...obj } as any

      // Transform common timestamp fields
      const timestampFields = [
        'createdAt', 'updatedAt', 'lastFetchedAt', 'lastIncrementalFetch',
        'unlockedAt', 'startDate', 'endDate', 'lastUpdateAt', 'nextUpdateAt',
        'expire', 'githubCreatedAt', 'lastUpdated'
      ]

      for (const field of timestampFields) {
        if (transformed[field] instanceof Date) {
          transformed[field] = transformed[field].toISOString()
        } else if (typeof transformed[field] === 'string' && transformed[field]) {
          // Ensure string timestamps are valid ISO strings
          try {
            const date = new Date(transformed[field])
            if (!isNaN(date.getTime())) {
              transformed[field] = date.toISOString()
            }
          } catch (error) {
            // Keep original value if transformation fails
            console.warn(`Failed to transform timestamp field ${field}:`, error)
          }
        }
      }

      // Recursively transform nested objects
      for (const key in transformed) {
        if (transformed[key] && typeof transformed[key] === 'object') {
          transformed[key] = this.transformTimestamps(transformed[key])
        }
      }

      return transformed
    }

    return obj
  }

  /**
   * Create a response with transformed timestamps
   */
  static successWithTransformedTimestamps<T>(data: T, options: {
    status?: number
    headers?: Record<string, string>
    includeTimezoneInfo?: boolean
  } = {}): NextResponse {
    const transformedData = this.transformTimestamps(data)
    return this.success(transformedData, options)
  }

  /**
   * Create a paginated response with transformed timestamps
   */
  static paginatedWithTransformedTimestamps<T>(data: T[], pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }, options: {
    status?: number
    headers?: Record<string, string>
    includeTimezoneInfo?: boolean
  } = {}): NextResponse {
    const transformedData = this.transformTimestamps(data)
    return this.paginated(transformedData, pagination, options)
  }
}

// Export convenience functions
export const createSuccessResponse = <T>(data: T, options?: Parameters<typeof ApiResponse.success>[1]) =>
  ApiResponse.success(data, options)

export const createErrorResponse = (message: string, options?: Parameters<typeof ApiResponse.error>[1]) =>
  ApiResponse.error(message, options)

export const createPaginatedResponse = <T>(data: T[], pagination: Parameters<typeof ApiResponse.paginated>[1], options?: Parameters<typeof ApiResponse.paginated>[2]) =>
  ApiResponse.paginated(data, pagination, options)

export const transformTimestamps = <T>(obj: T) => ApiResponse.transformTimestamps(obj)
