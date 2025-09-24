"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Star, GitFork, Calendar, Clock, Code } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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

  // deafultserach
  useEffect(() => {
    if (!searchQuery && repositories.length === 0) {
      const defaultFilters = {
        ...filters,
        query: '',
        page: 1
      }
      setFilters(defaultFilters)
      fetchRepositories(defaultFilters)
    }
  }, [])

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
                    <Select
                      value={filters.sort}
                      onValueChange={(value) => handleFilterChange('sort', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sort option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stars">
                          <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Stars
                          </div>
                        </SelectItem>
                        <SelectItem value="forks">
                          <div className="flex items-center gap-2">
                        <GitFork className="h-4 w-4" />
                        Forks
                          </div>
                        </SelectItem>
                        <SelectItem value="updated">
                          <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Updated
                          </div>
                        </SelectItem>
                        <SelectItem value="created">
                          <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Created
                    </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Order</label>
                    <Select
                      value={filters.order}
                      onValueChange={(value) => handleFilterChange('order', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Select
                    value={filters.language || 'all'}
                    onValueChange={(value) => handleFilterChange('language', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select programming language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400" />
                          All Languages
                        </div>
                      </SelectItem>
                      {popularLanguages.map((language) => (
                        <SelectItem key={language} value={language}>
                          <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        {language}
                          </div>
                        </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
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
                <Select
                  value={filters.stars || 'any'}
                  onValueChange={(value) => handleFilterChange('stars', value === 'any' ? undefined : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select minimum stars" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Any Stars
                      </div>
                    </SelectItem>
                    <SelectItem value=">100">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        More than 100 stars
                      </div>
                    </SelectItem>
                    <SelectItem value=">1000">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        More than 1,000 stars
                      </div>
                    </SelectItem>
                    <SelectItem value=">5000">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        More than 5,000 stars
                      </div>
                    </SelectItem>
                    <SelectItem value=">10000">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        More than 10,000 stars
                </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
