"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Github, Zap, Code, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RepositorySearchForm } from '@/components/repositories/RepositorySearchForm'
import { RepositoryResults } from '@/components/repositories/RepositoryResults'
import { useRepositories } from '@/hooks/client'
import { useDebounce } from '@/hooks/client'
import { RepositorySearchFilters } from '@/types/github.types'
import { popularLanguages, trendingTopics } from '@/lib/constants'


export default function RepositoryHomePage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { repositories, loading, error, pagination, fetchRepositories } = useRepositories()

  // Handle search from URL params
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [searchParams])

  // Debounced search effect
  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery !== searchQuery) {
      handleSearch(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery])

  const handleSearch = (query: string) => {
    const filters: RepositorySearchFilters = {
      query,
      sort: 'stars',
      order: 'desc',
      page: 1,
      per_page: 10
    }
    fetchRepositories(filters)
  }

  const handlePageChange = (page: number) => {
    const filters: RepositorySearchFilters = {
      query: searchQuery,
      sort: 'stars',
      order: 'desc',
      page,
      per_page: 10
    }
    fetchRepositories(filters)
  }

  const quickSearches = [
    { query: 'react', label: 'React', icon: <Code className="h-4 w-4" /> },
    { query: 'vue', label: 'Vue.js', icon: <Code className="h-4 w-4" /> },
    { query: 'angular', label: 'Angular', icon: <Code className="h-4 w-4" /> },
    { query: 'typescript', label: 'TypeScript', icon: <Code className="h-4 w-4" /> },
    { query: 'machine learning', label: 'ML', icon: <Zap className="h-4 w-4" /> },
    { query: 'blockchain', label: 'Blockchain', icon: <Zap className="h-4 w-4" /> }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Repository Search</h1>
            {pagination.total_count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pagination.total_count.toLocaleString()} repositories
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Github className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Discover Repositories</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Search and explore millions of open source repositories on GitHub
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <RepositorySearchForm
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              loading={loading}
              placeholder="Search repositories by name, description, or topic..."
            />
          </motion.div>

          {/* Quick Searches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Searches
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {quickSearches.map((search) => (
                    <Button
                      key={search.query}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(search.query)
                        handleSearch(search.query)
                      }}
                      className="justify-start gap-2 h-10"
                    >
                      {search.icon}
                      {search.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Found</p>
                    <p className="text-2xl font-bold">{pagination.total_count.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Languages</p>
                    <p className="text-2xl font-bold">{popularLanguages.length}+</p>
                  </div>
                  <Code className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Topics</p>
                    <p className="text-2xl font-bold">{trendingTopics.length}+</p>
                  </div>
                  <Github className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Results */}
          {(searchQuery || repositories.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RepositoryResults
                repositories={repositories}
                loading={loading}
                error={error}
                searchQuery={searchQuery}
                pagination={pagination}
                onPageChange={handlePageChange}
                emptyMessage="No repositories found"
                emptyDescription="Try adjusting your search query or explore the quick searches above."
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

