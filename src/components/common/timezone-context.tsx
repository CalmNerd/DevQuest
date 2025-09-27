'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TimezoneService } from '@/lib/timezone'

/**
 * Timezone context for managing user's timezone across the application
 * Provides timezone detection, formatting utilities, and timezone information
 */
interface TimezoneContextType {
  // Current user timezone
  timezone: string
  
  // Timezone information
  timezoneInfo: {
    name: string
    offset: string
    abbreviation: string
  }
  
  // Utility functions
  formatDate: (utcTimestamp: string | Date, options?: Intl.DateTimeFormatOptions) => string
  formatRelativeTime: (utcTimestamp: string | Date) => string
  formatDateOnly: (utcTimestamp: string | Date) => string
  formatTimeOnly: (utcTimestamp: string | Date) => string
  formatLeaderboardTime: (utcTimestamp: string | Date) => string
  formatSessionTime: (utcTimestamp: string | Date) => string
  
  // Date checks
  isToday: (utcTimestamp: string | Date) => boolean
  isYesterday: (utcTimestamp: string | Date) => boolean
  
  // Timezone management
  setTimezone: (timezone: string) => void
  resetToUserTimezone: () => void
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined)

interface TimezoneProviderProps {
  children: ReactNode
  initialTimezone?: string
}

/**
 * Timezone provider component that manages timezone state and provides formatting utilities
 */
export function TimezoneProvider({ children, initialTimezone }: TimezoneProviderProps) {
  const [timezone, setTimezoneState] = useState<string>(() => {
    // Use initial timezone if provided, otherwise detect user's timezone
    return initialTimezone || TimezoneService.getUserTimezone()
  })

  // Update timezone info when timezone changes
  const timezoneInfo = TimezoneService.getTimezoneInfo(timezone)

  // Utility functions that use the current timezone
  const formatDate = (utcTimestamp: string | Date, options?: Intl.DateTimeFormatOptions) => {
    return TimezoneService.formatForDisplay(utcTimestamp, options, timezone)
  }

  const formatRelativeTime = (utcTimestamp: string | Date) => {
    return TimezoneService.formatRelativeTime(utcTimestamp, timezone)
  }

  const formatDateOnly = (utcTimestamp: string | Date) => {
    return TimezoneService.formatDateOnly(utcTimestamp, timezone)
  }

  const formatTimeOnly = (utcTimestamp: string | Date) => {
    return TimezoneService.formatTimeOnly(utcTimestamp, timezone)
  }

  const formatLeaderboardTime = (utcTimestamp: string | Date) => {
    return TimezoneService.formatLeaderboardTime(utcTimestamp, timezone)
  }

  const formatSessionTime = (utcTimestamp: string | Date) => {
    return TimezoneService.formatSessionTime(utcTimestamp, timezone)
  }

  const isToday = (utcTimestamp: string | Date) => {
    return TimezoneService.isToday(utcTimestamp, timezone)
  }

  const isYesterday = (utcTimestamp: string | Date) => {
    return TimezoneService.isYesterday(utcTimestamp, timezone)
  }

  const setTimezone = (newTimezone: string) => {
    setTimezoneState(newTimezone)
  }

  const resetToUserTimezone = () => {
    setTimezoneState(TimezoneService.getUserTimezone())
  }

  // Auto-detect timezone changes (e.g., when user travels)
  useEffect(() => {
    const handleTimezoneChange = () => {
      const detectedTimezone = TimezoneService.getUserTimezone()
      if (detectedTimezone !== timezone) {
        setTimezoneState(detectedTimezone)
      }
    }

    // Listen for timezone changes (this is a custom event we can dispatch)
    window.addEventListener('timezonechange', handleTimezoneChange)
    
    // Also check periodically for timezone changes
    const interval = setInterval(handleTimezoneChange, 60000) // Check every minute

    return () => {
      window.removeEventListener('timezonechange', handleTimezoneChange)
      clearInterval(interval)
    }
  }, [timezone])

  const value: TimezoneContextType = {
    timezone,
    timezoneInfo,
    formatDate,
    formatRelativeTime,
    formatDateOnly,
    formatTimeOnly,
    formatLeaderboardTime,
    formatSessionTime,
    isToday,
    isYesterday,
    setTimezone,
    resetToUserTimezone,
  }

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  )
}

/**
 * Hook to use the timezone context
 * Must be used within a TimezoneProvider
 */
export function useTimezone(): TimezoneContextType {
  const context = useContext(TimezoneContext)
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider')
  }
  return context
}

/**
 * Hook to get timezone-aware date formatting functions
 * Returns formatting functions that use the current timezone
 */
export function useDateFormatting() {
  const { 
    formatDate, 
    formatRelativeTime, 
    formatDateOnly, 
    formatTimeOnly,
    formatLeaderboardTime,
    formatSessionTime,
    isToday,
    isYesterday
  } = useTimezone()

  return {
    formatDate,
    formatRelativeTime,
    formatDateOnly,
    formatTimeOnly,
    formatLeaderboardTime,
    formatSessionTime,
    isToday,
    isYesterday,
  }
}

/**
 * Hook to get timezone information and management functions
 */
export function useTimezoneManagement() {
  const { 
    timezone, 
    timezoneInfo, 
    setTimezone, 
    resetToUserTimezone 
  } = useTimezone()

  return {
    timezone,
    timezoneInfo,
    setTimezone,
    resetToUserTimezone,
  }
}

/**
 * Higher-order component to provide timezone context
 * Useful for wrapping specific parts of the application
 */
export function withTimezoneProvider<P extends object>(
  Component: React.ComponentType<P>,
  initialTimezone?: string
) {
  return function TimezoneWrappedComponent(props: P) {
    return (
      <TimezoneProvider initialTimezone={initialTimezone}>
        <Component {...props} />
      </TimezoneProvider>
    )
  }
}

/**
 * Utility function to dispatch timezone change events
 * Can be called when the user manually changes their timezone
 */
export function dispatchTimezoneChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('timezonechange'))
  }
}

/**
 * Utility function to get available timezones
 * Returns a list of common timezones for user selection
 */
export function getAvailableTimezones(): Array<{ value: string; label: string; offset: string }> {
  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
  ]

  return commonTimezones.map(tz => {
    const info = TimezoneService.getTimezoneInfo(tz)
    return {
      value: tz,
      label: tz.replace('_', ' '),
      offset: info.offset
    }
  })
}
