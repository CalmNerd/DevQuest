"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, Star, GitFork, Calendar, Clock, Code } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RepositorySearchForm } from '@/components/repositories/RepositorySearchForm'
import { RepositoryResults } from '@/components/repositories/RepositoryResults'
import { useRepositories } from '@/hooks/client'
import { RepositorySearchFilters } from '@/types/github.types'
import { popularLanguages } from '@/lib/constants'

export default function RepositoryAdvancedPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<RepositorySearchFilters>({
    query: '',
    sort: 'stars',
    order: 'desc',
    language: undefined,
    stars: undefined,
    forks: undefined,
    created: undefined,
    page: 1,
    per_page: 10
  })

  const { repositories, loading, error, pagination, fetchRepositories } = useRepositories()

  const handleSearch = (query: string) => {
    const newFilters = {
      ...filters,
      query,
      page: 1
    }
    setFilters(newFilters)
    fetchRepositories(newFilters)
  }

  const handleFilterChange = (key: keyof RepositorySearchFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1
    }
    setFilters(newFilters)
    fetchRepositories(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = {
      ...filters,
      page
    }
    setFilters(newFilters)
    fetchRepositories(newFilters)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Advanced Filters</h1>
            {pagination.total_count > 0 && (
              <span className="text-sm text-muted-foreground">
                {pagination.total_count.toLocaleString()} repositories found
              </span>
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
              <Filter className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Advanced Filters</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Refine your repository search with advanced filtering options
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
              placeholder="Search repositories with advanced filters..."
            />
          </motion.div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sort & Order */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Sort & Order
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={filters.sort === 'stars' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('sort', 'stars')}
                        className="gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Stars
                      </Button>
                      <Button
                        variant={filters.sort === 'forks' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('sort', 'forks')}
                        className="gap-2"
                      >
                        <GitFork className="h-4 w-4" />
                        Forks
                      </Button>
                      <Button
                        variant={filters.sort === 'updated' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('sort', 'updated')}
                        className="gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Updated
                      </Button>
                      <Button
                        variant={filters.sort === 'created' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('sort', 'created')}
                        className="gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Created
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Order</label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.order === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('order', 'desc')}
                        className="flex-1"
                      >
                        Descending
                      </Button>
                      <Button
                        variant={filters.order === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('order', 'asc')}
                        className="flex-1"
                      >
                        Ascending
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Language Filter */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Language
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {popularLanguages.slice(0, 12).map((language) => (
                      <Button
                        key={language}
                        variant={filters.language === language ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('language', filters.language === language ? undefined : language)}
                        className="justify-start gap-2"
                      >
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        {language}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stars Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Stars
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant={filters.stars === '>100' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('stars', filters.stars === '>100' ? undefined : '>100')}
                  >
                    &gt;100
                  </Button>
                  <Button
                    variant={filters.stars === '>1000' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('stars', filters.stars === '>1000' ? undefined : '>1000')}
                  >
                    &gt;1K
                  </Button>
                  <Button
                    variant={filters.stars === '>5000' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('stars', filters.stars === '>5000' ? undefined : '>5000')}
                  >
                    &gt;5K
                  </Button>
                  <Button
                    variant={filters.stars === '>10000' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('stars', filters.stars === '>10000' ? undefined : '>10000')}
                  >
                    &gt;10K
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Results */}
          {(searchQuery || repositories.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <RepositoryResults
                repositories={repositories}
                loading={loading}
                error={error}
                searchQuery={searchQuery}
                pagination={pagination}
                onPageChange={handlePageChange}
                emptyMessage="No repositories found"
                emptyDescription="Try adjusting your filters or search query to find repositories."
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
