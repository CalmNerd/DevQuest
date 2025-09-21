"use client"

import { useState, useEffect, useCallback } from 'react'
import { TrendingRepository } from '@/types/github.types'

interface TrendingFilters {
  type: 'stars' | 'forks' | 'language' | 'all-time' | 'recently-created' | 'recently-updated'
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020'
  language?: string
  limit?: number
  page?: number
  sort?: 'stars' | 'forks' | 'updated' | 'created'
}

interface UseTrendingRepositoriesState {
  repositories: TrendingRepository[]
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface UseTrendingRepositoriesReturn extends UseTrendingRepositoriesState {
  fetchTrendingRepositories: (filters: TrendingFilters) => Promise<void>
  reset: () => void
}

/**
 * Custom hook for managing trending repository data fetching
 * Provides loading states, error handling, and pagination
 * Removes mock data fallbacks and implements proper error states
 */
export function useTrendingRepositories(initialFilters?: TrendingFilters): UseTrendingRepositoriesReturn {
  const [state, setState] = useState<UseTrendingRepositoriesState>({
    repositories: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  })

  const fetchTrendingRepositories = useCallback(async (filters: TrendingFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams({
        type: filters.type,
        period: filters.period || 'weekly',
        limit: (filters.limit || 30).toString(),
        page: (filters.page || 1).toString()
      })
      
      if (filters.language && filters.type === 'language') {
        params.append('language', filters.language)
      }
      
      if (filters.sort && filters.type === 'all-time') {
        params.append('sort', filters.sort)
      }

      const response = await fetch(`/api/repositories/trending?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      const repositories = data.repositories || []
      
      setState(prev => ({
        ...prev,
        repositories: repositories,
        pagination: {
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalCount: data.total_count || 0,
          hasNextPage: data.hasNextPage || false,
          hasPrevPage: data.hasPrevPage || false
        },
        loading: false,
        error: null
      }))
    } catch (err) {
      console.error('Trending repositories fetch error:', err)
      setState(prev => ({
        ...prev,
        repositories: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch trending repositories'
      }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      repositories: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    })
  }, [])

  // Initial fetch if filters are provided
  useEffect(() => {
    if (initialFilters) {
      fetchTrendingRepositories(initialFilters)
    }
  }, [initialFilters, fetchTrendingRepositories])

  return {
    ...state,
    fetchTrendingRepositories,
    reset
  }
}
