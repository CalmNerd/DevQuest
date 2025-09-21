"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Code, Users, Github } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RepositorySearchForm } from '@/components/repositories/RepositorySearchForm'
import { RepositoryResults } from '@/components/repositories/RepositoryResults'
import { useRepositories } from '@/hooks/client'
import { RepositorySearchFilters } from '@/types/github.types'
import { popularLanguages, trendingTopics, popularOrganizations } from '@/lib/constants'

export default function RepositoryDiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { repositories, loading, error, pagination, fetchRepositories } = useRepositories()

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

  const handleTopicSelect = (topic: string) => {
    const query = `topic:${topic}`
    setSearchQuery(query)
    handleSearch(query)
  }

  const handleOrganizationSelect = (org: string) => {
    const query = `org:${org}`
    setSearchQuery(query)
    handleSearch(query)
  }

  const handleLanguageSelect = (language: string) => {
    const query = `language:${language}`
    setSearchQuery(query)
    handleSearch(query)
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Discover Repositories</h1>
            {pagination.total_count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pagination.total_count.toLocaleString()} found
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
              <Search className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Discover Repositories</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Explore repositories by topics, organizations, and programming languages
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
              placeholder="Search repositories by topics, organizations, or languages..."
            />
          </motion.div>

          {/* Discovery Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Github className="h-5 w-5 text-primary" />
                    Trending Topics
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.slice(0, 15).map((topic) => (
                      <Badge
                        key={topic}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleTopicSelect(topic)}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Popular Organizations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Popular Organizations
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {popularOrganizations.slice(0, 10).map((org) => (
                      <Button
                        key={org}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOrganizationSelect(org)}
                        className="w-full justify-start gap-2"
                      >
                        <Github className="h-4 w-4" />
                        {org}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Popular Languages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Popular Languages
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {popularLanguages.slice(0, 12).map((language) => (
                      <Button
                        key={language}
                        variant="outline"
                        size="sm"
                        onClick={() => handleLanguageSelect(language)}
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
                emptyDescription="Try selecting a topic, organization, or language above to discover repositories."
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
