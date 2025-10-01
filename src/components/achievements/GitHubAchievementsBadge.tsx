'use client'

import React, { useState, useEffect } from 'react'
import { ScrapedGitHubAchievement } from '@/types/github.types'
import { Button } from '@/components/ui/button'
import { Loader2, Trophy, RefreshCw, Search, ExternalLink } from 'lucide-react'

/**
 * Props for the GitHubAchievementsBadge component
 */
interface GitHubAchievementsBadgeProps {
  /** GitHub username to fetch achievements for */
  username?: string
  /** Show the search input */
  showSearch?: boolean
  /** Maximum number of achievements to display (0 = show all) */
  limit?: number
  /** Custom className for styling */
  className?: string
}

/**
 * Component to display GitHub achievements for a user
 * 
 * Features:
 * - Fetches achievements from the API
 * - Displays achievement badges with images, names, and tiers
 * - Supports search functionality
 * - Refresh button to force update
 * - Loading and error states
 * - Responsive grid layout
 * 
 * @example
 * <GitHubAchievementsBadge username="benbalter" showSearch limit={10} />
 */
export function GitHubAchievementsBadge({
  username: initialUsername = '',
  showSearch = true,
  limit = 0,
  className = '',
}: GitHubAchievementsBadgeProps) {
  // State management
  const [username, setUsername] = useState<string>(initialUsername)
  const [searchInput, setSearchInput] = useState<string>(initialUsername)
  const [achievements, setAchievements] = useState<ScrapedGitHubAchievement[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  /**
   * Fetch achievements from the API
   * @param forceRefresh - Whether to force refresh (clear cache)
   */
  const fetchAchievements = async (user: string, forceRefresh = false) => {
    if (!user || user.trim() === '') {
      setError('Please enter a GitHub username')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const endpoint = `/api/github-achievements/${encodeURIComponent(user)}`
      
      // Use POST for force refresh, GET for normal fetch
      const response = forceRefresh 
        ? await fetch(endpoint, { method: 'POST' })
        : await fetch(endpoint, { method: 'GET' })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      if (result.success && result.data) {
        setAchievements(result.data.achievements || [])
        setUsername(user)
        setLastFetched(new Date())
        
        // Don't set error for 0 achievements - let the empty state UI handle it
      } else {
        throw new Error('Invalid response format from API')
      }
    } catch (err) {
      console.error('Error fetching GitHub achievements:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
      setAchievements([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      fetchAchievements(searchInput.trim())
    }
  }

  /**
   * Handle refresh button click
   */
  const handleRefresh = () => {
    if (username) {
      fetchAchievements(username, true)
    }
  }

  // Auto-fetch on mount if username is provided
  useEffect(() => {
    if (initialUsername && initialUsername.trim() !== '') {
      fetchAchievements(initialUsername)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Apply limit to displayed achievements
  const displayedAchievements = limit > 0 ? achievements.slice(0, limit) : achievements

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">GitHub Achievements</h2>
        </div>
        
        {username && (
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* Search Form */}
      {showSearch && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter GitHub username (e.g., benbalter)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading || !searchInput.trim()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </form>
      )}

      {/* User Info */}
      {username && !loading && !error && (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Viewing achievements for</p>
            <p className="text-lg font-semibold">{username}</p>
          </div>
          <a
            href={`https://github.com/${username}?tab=achievements`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            View on GitHub
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">
            Fetching achievements for {searchInput || username}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Achievements Grid */}
      {!loading && !error && displayedAchievements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {displayedAchievements.length} of {achievements.length} achievements
            </p>
            {lastFetched && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Last updated: {lastFetched.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedAchievements.map((achievement, index) => (
              <AchievementCard key={`${achievement.slug}-${index}`} achievement={achievement} />
            ))}
          </div>

          {/* Show more indicator */}
          {limit > 0 && achievements.length > limit && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                +{achievements.length - limit} more achievements
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State (when no achievements but no error) */}
      {!loading && !error && username && achievements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No achievements found for {username}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Individual Achievement Card Component
 */
function AchievementCard({ achievement }: { achievement: ScrapedGitHubAchievement }) {
  return (
    <div className="group relative p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105">
      {/* Achievement Image */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          <img
            src={achievement.image}
            alt={achievement.name}
            className="h-20 w-20 object-contain"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"%3E%3C/path%3E%3Cpath d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"%3E%3C/path%3E%3Cpath d="M4 22h16"%3E%3C/path%3E%3Cpath d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"%3E%3C/path%3E%3Cpath d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"%3E%3C/path%3E%3Cpath d="M18 2H6v7a6 6 0 0 0 12 0V2Z"%3E%3C/path%3E%3C/svg%3E'
            }}
          />
          
          {/* Tier Badge */}
          {achievement.tier && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              {achievement.tier}
            </div>
          )}
        </div>
      </div>

      {/* Achievement Name */}
      <h3 className="text-center font-semibold text-gray-800 dark:text-gray-100 mb-1">
        {achievement.name}
      </h3>

      {/* Achievement Description */}
      {achievement.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-2">
          {achievement.description}
        </p>
      )}

      {/* Slug (subtle) */}
      <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-2 font-mono">
        {achievement.slug}
      </p>
    </div>
  )
}

export default GitHubAchievementsBadge

