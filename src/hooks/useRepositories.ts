"use client"

import { useState, useEffect, useCallback } from 'react'
import { GitHubSearchRepo, RepositorySearchFilters } from '@/types/github.types'

interface UseRepositoriesState {
  repositories: GitHubSearchRepo[]
  loading: boolean
  error: string | null
  pagination: {
    current_page: number
    per_page: number
    total_count: number
    total_pages: number
    has_next_page: boolean
    has_prev_page: boolean
    next_page: number | null
    prev_page: number | null
  }
}

interface UseRepositoriesReturn extends UseRepositoriesState {
  fetchRepositories: (filters: RepositorySearchFilters) => Promise<void>
  reset: () => void
}

/**
 * Custom hook for managing repository data fetching
 * Provides loading states, error handling, and pagination
 * Removes mock data fallbacks and implements proper error states
 */
export function useRepositories(initialFilters?: RepositorySearchFilters): UseRepositoriesReturn {
  const [state, setState] = useState<UseRepositoriesState>({
    repositories: [],
    loading: false,
    error: null,
    pagination: {
      current_page: 1,
      per_page: 10,
      total_count: 0,
      total_pages: 0,
      has_next_page: false,
      has_prev_page: false,
      next_page: null,
      prev_page: null
    }
  })

  const fetchRepositories = useCallback(async (filters: RepositorySearchFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams()
      
      if (filters.query) params.append('query', filters.query)
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.order) params.append('order', filters.order)
      if (filters.language) params.append('language', filters.language)
      if (filters.stars) params.append('stars', filters.stars)
      if (filters.forks) params.append('forks', filters.forks)
      if (filters.created) params.append('created', filters.created)
      if (filters.license) params.append('license', filters.license)
      if (filters.topic) params.append('topic', filters.topic)
      if (filters.user) params.append('user', filters.user)
      if (filters.org) params.append('org', filters.org)
      if (filters.archived !== undefined) params.append('archived', filters.archived.toString())
      if (filters.fork !== undefined) params.append('fork', filters.fork.toString())
      if (filters.pushed) params.append('pushed', filters.pushed)
      if (filters.size) params.append('size', filters.size)
      
      params.append('page', filters.page?.toString() || '1')
      params.append('per_page', filters.per_page?.toString() || '10')

      const response = await fetch(`/api/repositories?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Handle both 'items' (GitHub API format) and 'repositories' (our format) response structures
      const repositories = data.items || data.repositories || []
      
      setState(prev => ({
        ...prev,
        repositories: repositories,
        pagination: data.pagination || prev.pagination,
        loading: false,
        error: null
      }))
    } catch (err) {
      console.error('Repository fetch error:', err)
      setState(prev => ({
        ...prev,
        repositories: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch repositories'
      }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      repositories: [],
      loading: false,
      error: null,
      pagination: {
        current_page: 1,
        per_page: 10,
        total_count: 0,
        total_pages: 0,
        has_next_page: false,
        has_prev_page: false,
        next_page: null,
        prev_page: null
      }
    })
  }, [])

  // Initial fetch if filters are provided
  useEffect(() => {
    if (initialFilters) {
      fetchRepositories(initialFilters)
    }
  }, [initialFilters, fetchRepositories])

  return {
    ...state,
    fetchRepositories,
    reset
  }
}
