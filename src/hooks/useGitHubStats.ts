import { useState, useEffect, useCallback } from 'react'
import { githubService } from '../services/external/github.service'
import { GitHubStatsData } from '@/types'

interface UseGitHubStatsReturn {
  stats: GitHubStatsData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useGitHubStats = (username: string): UseGitHubStatsReturn => {
  const [stats, setStats] = useState<GitHubStatsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!username) return

    setLoading(true)
    setError(null)

    try {
      const userStats = await githubService.fetchUserStats(username)
      setStats(userStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
