import { TimezoneService } from './timezone'

/**
 * Centralized date formatting utility for consistent UI display
 * All dates are stored in UTC and displayed in user's local timezone
 * 
 * This utility provides a clean interface for formatting dates throughout the application
 * while ensuring consistency and proper timezone handling.
 */
export class DateFormatter {
  /**
   * Format a UTC timestamp for general display
   * Shows date and time in user's local timezone
   */
  static format(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatForDisplay(utcTimestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }, timezone)
  }

  /**
   * Format a UTC timestamp as a relative time (e.g., "2 hours ago", "in 3 days")
   */
  static relative(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatRelativeTime(utcTimestamp, timezone)
  }

  /**
   * Format a UTC timestamp as date only (no time)
   */
  static date(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatDateOnly(utcTimestamp, timezone)
  }

  /**
   * Format a UTC timestamp as time only (no date)
   */
  static time(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatTimeOnly(utcTimestamp, timezone)
  }

  /**
   * Format a UTC timestamp for leaderboard display
   * Shows month, day, and time in user's timezone
   */
  static leaderboard(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatLeaderboardTime(utcTimestamp, timezone)
  }

  /**
   * Format a UTC timestamp for session display
   * Shows full date and time in user's timezone
   */
  static session(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatSessionTime(utcTimestamp, timezone)
  }

  /**
   * Format a UTC timestamp for profile display
   * Shows date in a user-friendly format
   */
  static profile(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatForDisplay(utcTimestamp, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }, timezone)
  }

  /**
   * Format a UTC timestamp for admin display
   * Shows full date and time with timezone
   */
  static admin(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatForDisplay(utcTimestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'long'
    }, timezone)
  }

  /**
   * Format a UTC timestamp for cache display
   * Shows time with relative indicator
   */
  static cache(utcTimestamp: string | Date, timezone?: string): string {
    const relative = TimezoneService.formatRelativeTime(utcTimestamp, timezone)
    const time = TimezoneService.formatTimeOnly(utcTimestamp, timezone)
    
    // If it's very recent, show relative time, otherwise show time
    if (relative.includes('minute') || relative.includes('second') || relative.includes('hour')) {
      return relative
    }
    
    return time
  }

  /**
   * Format a UTC timestamp for contribution graph
   * Shows date in a compact format
   */
  static contribution(utcTimestamp: string | Date, timezone?: string): string {
    return TimezoneService.formatForDisplay(utcTimestamp, {
      month: 'short',
      day: 'numeric'
    }, timezone)
  }

  /**
   * Format a UTC timestamp for repository display
   * Shows relative time for recent updates, date for older ones
   */
  static repository(utcTimestamp: string | Date, timezone?: string): string {
    const now = new Date()
    const date = typeof utcTimestamp === 'string' ? new Date(utcTimestamp) : utcTimestamp
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

    // Show relative time for recent updates (within 7 days)
    if (diffInDays < 7) {
      return TimezoneService.formatRelativeTime(utcTimestamp, timezone)
    }

    // Show date for older updates
    return TimezoneService.formatForDisplay(utcTimestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }, timezone)
  }

  /**
   * Format a UTC timestamp for issue display
   * Shows relative time for recent issues, date for older ones
   */
  static issue(utcTimestamp: string | Date, timezone?: string): string {
    const now = new Date()
    const date = typeof utcTimestamp === 'string' ? new Date(utcTimestamp) : utcTimestamp
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

    // Show relative time for recent issues (within 30 days)
    if (diffInDays < 30) {
      return TimezoneService.formatRelativeTime(utcTimestamp, timezone)
    }

    // Show date for older issues
    return TimezoneService.formatForDisplay(utcTimestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }, timezone)
  }

  /**
   * Get a smart formatted date based on context
   * Automatically chooses the best format based on how recent the date is
   */
  static smart(utcTimestamp: string | Date, timezone?: string): string {
    const now = new Date()
    const date = typeof utcTimestamp === 'string' ? new Date(utcTimestamp) : utcTimestamp
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    // Very recent (within 1 hour) - show relative time
    if (diffInHours < 1) {
      return TimezoneService.formatRelativeTime(utcTimestamp, timezone)
    }

    // Recent (within 24 hours) - show time
    if (diffInHours < 24) {
      return TimezoneService.formatTimeOnly(utcTimestamp, timezone)
    }

    // This year - show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return TimezoneService.formatForDisplay(utcTimestamp, {
        month: 'short',
        day: 'numeric'
      }, timezone)
    }

    // Older - show full date
    return TimezoneService.formatForDisplay(utcTimestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }, timezone)
  }

  /**
   * Check if a date is today in user's timezone
   */
  static isToday(utcTimestamp: string | Date, timezone?: string): boolean {
    return TimezoneService.isToday(utcTimestamp, timezone)
  }

  /**
   * Check if a date is yesterday in user's timezone
   */
  static isYesterday(utcTimestamp: string | Date, timezone?: string): boolean {
    return TimezoneService.isYesterday(utcTimestamp, timezone)
  }

  /**
   * Get timezone information for display
   */
  static getTimezoneInfo(timezone?: string) {
    return TimezoneService.getTimezoneInfo(timezone)
  }

  /**
   * Get user's current timezone
   */
  static getUserTimezone(): string {
    return TimezoneService.getUserTimezone()
  }
}

// Export singleton instance for convenience
export const dateFormatter = DateFormatter

// Export individual methods for easy access
export const formatDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.format(utcTimestamp, timezone)
export const formatRelativeDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.relative(utcTimestamp, timezone)
export const formatDateOnly = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.date(utcTimestamp, timezone)
export const formatTimeOnly = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.time(utcTimestamp, timezone)
export const formatLeaderboardDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.leaderboard(utcTimestamp, timezone)
export const formatSessionDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.session(utcTimestamp, timezone)
export const formatProfileDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.profile(utcTimestamp, timezone)
export const formatAdminDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.admin(utcTimestamp, timezone)
export const formatCacheDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.cache(utcTimestamp, timezone)
export const formatContributionDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.contribution(utcTimestamp, timezone)
export const formatRepositoryDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.repository(utcTimestamp, timezone)
export const formatIssueDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.issue(utcTimestamp, timezone)
export const formatSmartDate = (utcTimestamp: string | Date, timezone?: string) => 
  DateFormatter.smart(utcTimestamp, timezone)
