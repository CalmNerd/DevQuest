/**
 * Custom hook for fetching leaderboard data
 */

import { useState, useEffect, useCallback } from 'react'
import { leaderboardService } from '../services/api/leaderboard.service'

interface LeaderboardEntry {
  rank: number
  commits: number | null
  score: number | null
  userId: string
  username: string | null
  profileImageUrl: string | null
  updatedAt: Date | null
}

interface UseLeaderboardParams {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall'
  limit?: number
}

interface UseLeaderboardReturn {
  data: LeaderboardEntry[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useLeaderboard = ({ period, limit = 50 }: UseLeaderboardParams): UseLeaderboardReturn => {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const leaderboardData = await leaderboardService.getLeaderboard(period, limit)
      setData(leaderboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }, [period, limit])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    data,
    loading,
    error,
    refetch: fetchLeaderboard,
  }
}
