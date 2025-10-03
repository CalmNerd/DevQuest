"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Search, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitHubSearchRepo } from '@/types/github.types'
import RepositoryCard from '@/components/features/repository-card'

interface RepositoryResultsProps {
  repositories: GitHubSearchRepo[]
  loading: boolean
  error: string | null
  searchQuery?: string
  pagination?: {
    current_page: number
    per_page: number
    total_count: number
    total_pages: number
    has_next_page: boolean
    has_prev_page: boolean
  }
  onPageChange?: (page: number) => void
  emptyMessage?: string
  emptyDescription?: string
}

export function RepositoryResults({
  repositories,
  loading,
  error,
  pagination,
  onPageChange,
  emptyMessage = "No repositories found",
  emptyDescription = "Try adjusting your search query or filters."
}: RepositoryResultsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading repositories...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">Search Error</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!loading && repositories.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="rounded-full bg-muted p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
            <p className="text-muted-foreground">{emptyDescription}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Results
            </h3>
            {pagination && (
              <Badge variant="secondary">
                {pagination.total_count.toLocaleString()} repositories
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Repository List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {repositories.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RepositoryCard repository={repo} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center justify-center lg:justify-between"
          >
            {pagination && (
              <p className="hidden lg:block text-sm text-muted-foreground">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of{' '}
                {pagination.total_count.toLocaleString()} repositories
              </p>
            )}
            {pagination && pagination.total_pages > 1 && onPageChange && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.current_page - 1)}
                    disabled={!pagination.has_prev_page}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={pagination.current_page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.current_page + 1)}
                    disabled={!pagination.has_next_page}
                  >
                    Next
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
          {/* Pagination */}
        </CardContent>
      </Card>
    </div>
  )
}
