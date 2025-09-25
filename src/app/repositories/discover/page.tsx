"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Code, Users, Github, Building2, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RepositorySearchForm, SearchType } from '@/components/repositories/RepositorySearchForm'
import { RepositoryResults } from '@/components/repositories/RepositoryResults'
import { useRepositories } from '@/hooks/client'
import { RepositorySearchFilters } from '@/types/github.types'
import { popularLanguages, trendingTopics, popularOrganizations } from '@/lib/constants'
import githubColors from "@/lib/github-colors.json"

export default function RepositoryDiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('general')
  const { repositories, loading, error, pagination, fetchRepositories } = useRepositories()

  // deefault search 
  useEffect(() => {
    if (!searchQuery && repositories.length === 0) {
      const defaultQuery = 'topic:typescript'
      setSearchQuery(defaultQuery)
      handleSearch(defaultQuery)
    }
  }, [])

  const getLanguageColor = (language: string) => {
    return (githubColors as any)[language] || "#6b7280" // Default gray
  }

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
      sort: 'forks',
      order: 'desc',
      page,
      per_page: 10
    }
    fetchRepositories(filters)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {/* <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
      </div> */}

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >

            <Card className='py-0 gap-0'>
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
                  searchType={searchType}
                  setSearchType={setSearchType}
                  showSearchTypeSelector={true}
                  className='py-0 border-none'
                />
              </motion.div>

              {/* Discovery Options */}
              <Card className="flex flex-col gap-6 pt-0 border-none">
                {/* Popular Languages */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardHeader>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      Popular Languages
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {/* {popularLanguages.slice(0, 12).map((language) => (
                    <Button
                      key={language}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLanguageSelect(language)}
                      className="justify-start gap-2 text-xs"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {language}
                    </Button>
                  ))} */}
                      {popularLanguages.slice(0, 12).map((lang) => {
                        const color = getLanguageColor(lang);
                        return (
                          <div
                            key={lang}
                            className="inline-block transform -skew-x-20 rounded cursor-pointer transition-colors"
                            onClick={() => handleLanguageSelect(lang)}
                            title={lang}
                            style={{
                              color: color,
                              backgroundColor: `${color}66`,
                              border: `2px solid transparent`
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLDivElement).style.border = `2px solid ${color}`;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLDivElement).style.border = `2px solid transparent`;
                            }}
                          >
                            <span
                              className="block px-2 font-medium text-sm transform skew-x-20 whitespace-nowrap">
                              {lang}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </motion.div>

                {/* Trending Topics */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardHeader>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      Trending Topics
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.slice(0, 15).map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="cursor-pointer hover:bg-[#4493f8] hover:text-primary-foreground text-[#4493f8] bg-[#4493f8]/10 transition-colors"
                          onClick={() => handleTopicSelect(topic)}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>

                {/* Popular Organizations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardHeader>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Popular Organizations
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 text-muted-foreground">
                      {popularOrganizations.slice(0, 10).map((org) => (
                        <Button
                          key={org}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrganizationSelect(org)}
                          className="justify-start gap-2 border"
                        >
                          <Github className="h-4 w-4" />
                          {org}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              </Card>
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
                emptyDescription="Try selecting a topic, organization, or language above to discover repositories."
              />
            </motion.div>
          )}
        </div>  
      </div>
    </div>
  )
}
