import { DateTime } from 'luxon'

/**
 * Timezone utility service for handling date calculations consistently across the application.
 * This ensures fair and accurate date handling for international users and contest leaderboards.
 * 
 * Key principles:
 * - All date calculations are done in UTC to ensure consistency
 * - All data is stored in UTC in the database
 * - All API responses include UTC timestamps
 * - UI displays dates in user's local timezone
 * - Daily periods start at 00:00:00 UTC and end at 23:59:59 UTC
 * - Weekly periods start on sunday 00:00:00 UTC
 * - Monthly periods start on the 1st day at 00:00:00 UTC
 * - Yearly periods start on January 1st at 00:00:00 UTC
 */
export class TimezoneService {
  // Get the current date in UTC as a string (YYYY-MM-DD format)
  // This ensures consistent date calculation regardless of server timezone
  static getCurrentUTCDate(): string {
    return DateTime.utc().toISODate()!
  }

  // Get the current date and time in UTC as ISO string
  static getCurrentUTCDateTime(): string {
    return DateTime.utc().toISO()
  }

  // Get the start of today in UTC (00:00:00.000Z)
  static getTodayStartUTC(): DateTime {
    return DateTime.utc().startOf('day')
  }

  // Get the end of today in UTC (23:59:59.999Z)
  static getTodayEndUTC(): DateTime {
    return DateTime.utc().endOf('day')
  }

  // Get the start of the current week in UTC (Sunday 00:00:00.000Z)
  static getCurrentWeekStartUTC(): DateTime {
    return DateTime.utc().startOf('week')
  }

  // Get the end of the current week in UTC (Sunday 23:59:59.999Z)
  static getCurrentWeekEndUTC(): DateTime {
    return DateTime.utc().endOf('week')
  }

  // Get the start of the current month in UTC (1st day 00:00:00.000Z)
  static getCurrentMonthStartUTC(): DateTime {
    return DateTime.utc().startOf('month')
  }

  // Get the end of the current month in UTC (last day 23:59:59.999Z)
  static getCurrentMonthEndUTC(): DateTime {
    return DateTime.utc().endOf('month')
  }

  // Get the start of the current year in UTC (January 1st 00:00:00.000Z)
  static getCurrentYearStartUTC(): DateTime {
    return DateTime.utc().startOf('year')
  }

  // Get the end of the current year in UTC (December 31st 23:59:59.999Z)
  static getCurrentYearEndUTC(): DateTime {
    return DateTime.utc().endOf('year')
  }

  // Get period date string for leaderboard entries
  // This ensures consistent period identification across all leaderboard types
  static getPeriodDate(period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'global'): string {
    switch (period) {
      case 'daily':
        return this.getCurrentUTCDate() // YYYY-MM-DD format

      case 'weekly':
        const weekStart = this.getCurrentWeekStartUTC()
        const year = weekStart.year
        const weekNumber = weekStart.weekNumber
        return `${year}-W${weekNumber.toString().padStart(2, '0')}`

      case 'monthly':
        const monthStart = this.getCurrentMonthStartUTC()
        return `${monthStart.year}-${monthStart.month.toString().padStart(2, '0')}`

      case 'yearly':
        return DateTime.utc().year.toString()

      case 'global':
        return 'all-time'

      default:
        return this.getCurrentUTCDate()
    }
  }

  // Get session key for leaderboard sessions
  // This ensures consistent session identification across all session types
  static getSessionKey(sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall'): string {
    const now = DateTime.utc()

    switch (sessionType) {
      case 'daily':
        return `${sessionType}-${now.year}-${now.month.toString().padStart(2, '0')}-${now.day.toString().padStart(2, '0')}`

      case 'weekly':
        return `${sessionType}-${now.year}-W${now.weekNumber.toString().padStart(2, '0')}`

      case 'monthly':
        return `${sessionType}-${now.year}-${now.month.toString().padStart(2, '0')}`

      case 'yearly':
        return `${sessionType}-${now.year}`

      case 'overall':
        return `${sessionType}-all-time`

      default:
        return `${sessionType}-${now.year}-${now.month.toString().padStart(2, '0')}-${now.day.toString().padStart(2, '0')}`
    }
  }

  // Get session start date for a given session type
  // All sessions start at the beginning of their respective period in UTC
  static getSessionStartDate(sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall'): Date {
    switch (sessionType) {
      case 'daily':
        return this.getTodayStartUTC().toJSDate()

      case 'weekly':
        return this.getCurrentWeekStartUTC().toJSDate()

      case 'monthly':
        return this.getCurrentMonthStartUTC().toJSDate()

      case 'yearly':
        return this.getCurrentYearStartUTC().toJSDate()

      case 'overall':
        // Overall sessions start from a fixed date (e.g., 2020-01-01)
        return DateTime.fromISO('2020-01-01T00:00:00.000Z').toJSDate()

      default:
        return this.getTodayStartUTC().toJSDate()
    }
  }

  // Get session end date for a given session type
  // All sessions end at the end of their respective period in UTC
  static getSessionEndDate(sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall'): Date {
    switch (sessionType) {
      case 'daily':
        return this.getTodayEndUTC().toJSDate()

      case 'weekly':
        return this.getCurrentWeekEndUTC().toJSDate()

      case 'monthly':
        return this.getCurrentMonthEndUTC().toJSDate()

      case 'yearly':
        return this.getCurrentYearEndUTC().toJSDate()

      case 'overall':
        // Overall sessions have no end date (effectively permanent)
        // Use a far future date instead of MAX_SAFE_INTEGER to avoid issues
        return DateTime.fromISO('2099-12-31T23:59:59.999Z').toJSDate()

      default:
        return this.getTodayEndUTC().toJSDate()
    }
  }

  // Check if a given date is within a specific period
  // Useful for filtering contributions and commits
  static isDateInPeriod(date: Date, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): boolean {
    const dateTime = DateTime.fromJSDate(date).toUTC()

    switch (period) {
      case 'daily':
        const today = this.getTodayStartUTC()
        return dateTime >= today && dateTime <= this.getTodayEndUTC()

      case 'weekly':
        const weekStart = this.getCurrentWeekStartUTC()
        return dateTime >= weekStart && dateTime <= this.getCurrentWeekEndUTC()

      case 'monthly':
        const monthStart = this.getCurrentMonthStartUTC()
        return dateTime >= monthStart && dateTime <= this.getCurrentMonthEndUTC()

      case 'yearly':
        const yearStart = this.getCurrentYearStartUTC()
        return dateTime >= yearStart && dateTime <= this.getCurrentYearEndUTC()

      default:
        return false
    }
  }

  // Get date range for a specific period
  // Returns start and end dates as ISO strings
  static getPeriodDateRange(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): {
    start: string
    end: string
  } {
    switch (period) {
      case 'daily':
        return {
          start: this.getTodayStartUTC().toISO()!,
          end: this.getTodayEndUTC().toISO()!
        }

      case 'weekly':
        return {
          start: this.getCurrentWeekStartUTC().toISO()!,
          end: this.getCurrentWeekEndUTC().toISO()!
        }

      case 'monthly':
        return {
          start: this.getCurrentMonthStartUTC().toISO()!,
          end: this.getCurrentMonthEndUTC().toISO()!
        }

      case 'yearly':
        return {
          start: this.getCurrentYearStartUTC().toISO()!,
          end: this.getCurrentYearEndUTC().toISO()!
        }

      default:
        return {
          start: this.getTodayStartUTC().toISO()!,
          end: this.getTodayEndUTC().toISO()!
        }
    }
  }

  // Parse a date string and return it as a UTC DateTime
  // Handles various date formats commonly used in the application
  static parseAsUTC(dateString: string): DateTime {
    // Try different common formats
    const formats = [
      'yyyy-MM-dd',
      'yyyy-MM-ddTHH:mm:ss',
      'yyyy-MM-ddTHH:mm:ss.SSS',
      'yyyy-MM-ddTHH:mm:ss.SSSZ'
    ]

    for (const format of formats) {
      const parsed = DateTime.fromFormat(dateString, format, { zone: 'utc' })
      if (parsed.isValid) {
        return parsed
      }
    }

    // Fallback to ISO parsing
    const iso = DateTime.fromISO(dateString, { zone: 'utc' })
    if (iso.isValid) {
      return iso
    }

    throw new Error(`Unable to parse date string: ${dateString}`)
  }

  // Get the current time in a specific timezone for display purposes
  // This is only for user-facing displays, not for calculations
  static getCurrentTimeInTimezone(timezone: string): DateTime {
    return DateTime.now().setZone(timezone)
  }

  // Convert a UTC date to a specific timezone for display
  // This is only for user-facing displays, not for calculations
  static convertUTCToTimezone(utcDate: DateTime, timezone: string): DateTime {
    return utcDate.setZone(timezone)
  }

  // ===== CLIENT-SIDE TIMEZONE DETECTION AND DISPLAY UTILITIES =====

  // Get the user's local timezone (client-side only)
  // Returns the browser's timezone or falls back to UTC  
  static getUserTimezone(): string {
    if (typeof window !== 'undefined') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    }
    return 'UTC'
  }

  // Format a UTC timestamp for display in user's local timezone
  // @param utcTimestamp - ISO string or Date object in UTC
  // @param options - Intl.DateTimeFormatOptions for formatting
  // @param timezone - Optional timezone override (defaults to user's timezone)
  static formatForDisplay(
    utcTimestamp: string | Date,
    options: Intl.DateTimeFormatOptions = {},
    timezone?: string
  ): string {
    const userTimezone = timezone || this.getUserTimezone()
    const date = typeof utcTimestamp === 'string'
      ? DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      : DateTime.fromJSDate(utcTimestamp, { zone: 'utc' })

    if (!date.isValid) {
      return 'Invalid Date'
    }

    const localDate = date.setZone(userTimezone)

    // Default formatting options
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      ...options
    }

    return localDate.toLocaleString(defaultOptions)
  }

  static formatRelativeTime(
    utcTimestamp: string | Date,
    timezone?: string
  ): string {
    const userTimezone = timezone || this.getUserTimezone()
    const date = typeof utcTimestamp === 'string'
      ? DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      : DateTime.fromJSDate(utcTimestamp, { zone: 'utc' })

    if (!date.isValid) {
      return 'Invalid Date'
    }

    const localDate = date.setZone(userTimezone)
    const now = DateTime.now().setZone(userTimezone)

    return localDate.toRelative({ base: now }) || 'Unknown'
  }

  static formatDateOnly(
    utcTimestamp: string | Date,
    timezone?: string
  ): string {
    return this.formatForDisplay(utcTimestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }, timezone)
  }

  static formatTimeOnly(
    utcTimestamp: string | Date,
    timezone?: string
  ): string {
    return this.formatForDisplay(utcTimestamp, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }, timezone)
  }

  static formatLeaderboardTime(
    utcTimestamp: string | Date,
    timezone?: string
  ): string {
    return this.formatForDisplay(utcTimestamp, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }, timezone)
  }

  static formatSessionTime(
    utcTimestamp: string | Date,
    timezone?: string
  ): string {
    return this.formatForDisplay(utcTimestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }, timezone)
  }

  static getTimezoneInfo(timezone?: string): {
    name: string
    offset: string
    abbreviation: string
  } {
    const tz = timezone || this.getUserTimezone()
    const now = DateTime.now().setZone(tz)

    return {
      name: tz,
      offset: now.toFormat('ZZZZ'),
      abbreviation: now.toFormat('z')
    }
  }

  static isToday(
    utcTimestamp: string | Date,
    timezone?: string
  ): boolean {
    const userTimezone = timezone || this.getUserTimezone()
    const date = typeof utcTimestamp === 'string'
      ? DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      : DateTime.fromJSDate(utcTimestamp, { zone: 'utc' })

    if (!date.isValid) {
      return false
    }

    const localDate = date.setZone(userTimezone)
    const today = DateTime.now().setZone(userTimezone)

    return localDate.hasSame(today, 'day')
  }

  static isYesterday(
    utcTimestamp: string | Date,
    timezone?: string
  ): boolean {
    const userTimezone = timezone || this.getUserTimezone()
    const date = typeof utcTimestamp === 'string'
      ? DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      : DateTime.fromJSDate(utcTimestamp, { zone: 'utc' })

    if (!date.isValid) {
      return false
    }

    const localDate = date.setZone(userTimezone)
    const yesterday = DateTime.now().setZone(userTimezone).minus({ days: 1 })

    return localDate.hasSame(yesterday, 'day')
  }

  static getTimeDifference(
    utcTimestamp: string | Date,
    timezone?: string
  ): {
    isPast: boolean
    isFuture: boolean
    difference: string
    exact: string
  } {
    const userTimezone = timezone || this.getUserTimezone()
    const date = typeof utcTimestamp === 'string'
      ? DateTime.fromISO(utcTimestamp, { zone: 'utc' })
      : DateTime.fromJSDate(utcTimestamp, { zone: 'utc' })

    if (!date.isValid) {
      return {
        isPast: false,
        isFuture: false,
        difference: 'Invalid Date',
        exact: 'Invalid Date'
      }
    }

    const localDate = date.setZone(userTimezone)
    const now = DateTime.now().setZone(userTimezone)

    const diff = localDate.diff(now)
    const isPast = diff.as('milliseconds') < 0
    const isFuture = diff.as('milliseconds') > 0

    return {
      isPast,
      isFuture,
      difference: localDate.toRelative({ base: now }) || 'Unknown',
      exact: localDate.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')
    }
  }
}

// Export a singleton instance for convenience
export const timezoneService = TimezoneService

// Export commonly used functions for backward compatibility
export const getCurrentUTCDate = () => TimezoneService.getCurrentUTCDate()
export const getPeriodDate = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'global') =>
  TimezoneService.getPeriodDate(period)
export const getSessionKey = (sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall') =>
  TimezoneService.getSessionKey(sessionType)

// Export new display utilities for easy access
export const formatForDisplay = (utcTimestamp: string | Date, options?: Intl.DateTimeFormatOptions, timezone?: string) =>
  TimezoneService.formatForDisplay(utcTimestamp, options, timezone)
export const formatRelativeTime = (utcTimestamp: string | Date, timezone?: string) =>
  TimezoneService.formatRelativeTime(utcTimestamp, timezone)
export const formatDateOnly = (utcTimestamp: string | Date, timezone?: string) =>
  TimezoneService.formatDateOnly(utcTimestamp, timezone)
export const formatTimeOnly = (utcTimestamp: string | Date, timezone?: string) =>
  TimezoneService.formatTimeOnly(utcTimestamp, timezone)
export const formatLeaderboardTime = (utcTimestamp: string | Date, timezone?: string) =>
  TimezoneService.formatLeaderboardTime(utcTimestamp, timezone)
export const formatSessionTime = (utcTimestamp: string | Date, timezone?: string) =>
  TimezoneService.formatSessionTime(utcTimestamp, timezone)
export const getUserTimezone = () => TimezoneService.getUserTimezone()
export const getTimezoneInfo = (timezone?: string) => TimezoneService.getTimezoneInfo(timezone)