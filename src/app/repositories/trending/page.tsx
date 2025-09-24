"use client"

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, RefreshCw, Loader2, ChevronLeft, ChevronRight, Star, GitFork, Calendar, SquarePen, Package, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTrendingRepositories } from '@/hooks/client'
import { popularLanguages } from '@/lib/constants'
import Link from "next/link"
import { formatSize, getLanguageColor, getTimeAgo } from '@/lib/utils'

export default function RepositoryTrendingPage() {
  const [type, setType] = useState<'stars' | 'forks'>('stars')
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020' | 'all-time'>('all-time')
  const [language, setLanguage] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const filters = useMemo(() => {
    // When period is all-time, we need to map the type to the appropriate all-time sort
    if (period === 'all-time') {
      return {
        type: 'all-time' as const,
        period: undefined,
        language: language || undefined,
        limit: itemsPerPage,
        page: currentPage,
        sort: type as 'stars' | 'forks' | 'updated' | 'created'
      }
    }

    // For time-based periods, use the type as-is
    return {
      type: type as 'stars' | 'forks',
      period: period,
      language: language || undefined,
      limit: itemsPerPage,
      page: currentPage
    }
  }, [type, period, language, currentPage, itemsPerPage])

  const { repositories, loading, error, pagination, fetchTrendingRepositories } = useTrendingRepositories(filters)

  const getTrendingTypeLabel = () => {
    if (period === 'all-time') {
      switch (type) {
        case 'stars': return 'All-Time Top Stars'
        case 'forks': return 'All-Time Top Forks'
        default: return 'All-Time Top'
      }
    }

    switch (type) {
      case 'stars': return 'Most Starred'
      case 'forks': return 'Most Forked'
      default: return 'Trending'
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return 'Today'
      case 'weekly': return 'This Week'
      case 'monthly': return 'This Month'
      case 'yearly': return 'This Year'
      case '2024': return 'Year 2024'
      case '2023': return 'Year 2023'
      case '2022': return 'Year 2022'
      case '2021': return 'Year 2021'
      case '2020': return 'Year 2020'
      case 'all-time': return 'All Time'
      default: return 'This Week'
    }
  }

  const handleRefresh = () => {
    fetchTrendingRepositories(filters)
  }

  // Reset to page 1 when filters change
  const handleFilterChange = (filterType: string, value: any) => {
    setCurrentPage(1) // Reset to first page when filters change
    switch (filterType) {
      case 'type':
        setType(value)
        break
      case 'period':
        setPeriod(value)
        break
      case 'language':
        setLanguage(value === 'all' ? '' : value)
        break
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
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
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Trending Repositories</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Discover what's trending in the development world
            </p>
          </motion.div>

          {/* Trending Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex text-lg font-semibold items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {getTrendingTypeLabel()} {getPeriodLabel()}
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={loading}
                      className='size-10'
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    {/* Filters */}
                    <div className="flex gap-4 flex-wrap">
                      {/* Type Filter */}
                      <Select value={type} onValueChange={(value: any) => handleFilterChange('type', value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stars">Most Starred</SelectItem>
                          <SelectItem value="forks">Most Forked</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Timeframe Filter */}
                      <Select value={period} onValueChange={(value: any) => handleFilterChange('period', value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Today</SelectItem>
                          <SelectItem value="weekly">This Week</SelectItem>
                          <SelectItem value="monthly">This Month</SelectItem>
                          <SelectItem value="yearly">This Year</SelectItem>
                          <SelectItem value="2024">Year 2024</SelectItem>
                          <SelectItem value="2023">Year 2023</SelectItem>
                          <SelectItem value="2022">Year 2022</SelectItem>
                          <SelectItem value="2021">Year 2021</SelectItem>
                          <SelectItem value="2020">Year 2020</SelectItem>
                          <SelectItem value="all-time">All Time</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Language Filter */}
                      <Select value={language || 'all'} onValueChange={(value: any) => handleFilterChange('language', value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Languages</SelectItem>
                          {popularLanguages.slice(0, 20).map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                    </div>

                    {/* //uncomment this when the pagination is implemented
                    {pagination.totalCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {pagination.totalCount.toLocaleString()} repositories
                      </Badge>
                    )} */}
                  </div>
                </div>


              </CardHeader>

              <CardContent>
                {error && (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={handleRefresh} variant="outline">
                      Try Again
                    </Button>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading trending repositories...</p>
                  </div>
                )}

                {!loading && !error && repositories.length > 0 && (
                  <div className="space-y-4">
                    {repositories.map((repo, index) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        {/* Ranking */}
                        <div className="flex-shrink-0 w-8 text-center">
                          <div className={`text-lg font-bold ${index < 3 ? 'text-yellow-500' : 'text-muted-foreground'
                            }`}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Repository Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6 rounded-sm border">
                              <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
                              <AvatarFallback className="text-xs">{repo.owner.login[0]}</AvatarFallback>
                            </Avatar>
                            {/* <Link
                              href={`https://github.com/${repo.full_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary text-sm truncate"
                            >
                              {repo.full_name}
                            </Link> */}
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-sm text-muted-foreground">
                                {repo.owner.login}
                              </span>
                              <span className="text-muted-foreground">/</span>
                              <Link
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold hover:text-primary line-clamp-1 break-words"
                                title={repo.full_name}
                              >
                                {repo.name}
                              </Link>
                            </div>
                            {repo.trend_score && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white text-xs">
                                <Flame className="h-4 w-4 text-orange-500" /> {Math.round(repo.trend_score * 100)}%
                              </Badge>
                            )}
                          </div>

                          {repo.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {repo.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {repo.language && (
                              <div
                                className="inline-block border transform -skew-x-20 rounded"
                                style={{
                                  borderColor: getLanguageColor(repo.language),
                                  color: getLanguageColor(repo.language),
                                  backgroundColor: `${getLanguageColor(repo.language)}66`
                                }}
                              >
                                <span className="block px-2 font-medium text-sm transform skew-x-20 whitespace-nowrap">
                                  {repo.language}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span><Star className="h-4 w-4 text-yellow-400" /></span>
                              <span>{repo.stargazers_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span><GitFork className="h-4 w-4 text-blue-400" /></span>
                              <span>{repo.forks_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span><Package className="h-4 w-4 text-indigo-400" /></span>
                              <span>{formatSize(repo.size)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span><SquarePen className="h-4 w-4" /></span>
                              <span>Updated {getTimeAgo(repo.updated_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Topics */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="hidden md:flex flex-wrap gap-1 max-w-1/3">
                            {repo.topics.slice(0, 3).map((topic, topicIndex) => (
                              <Badge key={topicIndex} variant="outline"
                                className="text-xs border-none hover:bg-[#4493f8] hover:text-primary-foreground text-[#4493f8] bg-[#4493f8]/10 transition-color"
                              >
                                {topic}
                              </Badge>
                            ))}
                            {repo.topics.length > 3 && (
                              <Badge variant="outline"
                                className="text-xs border-none cursor-help"
                                style={{
                                  color: '#6b7280',
                                  backgroundColor: '#6b72804D'
                                }}
                                title={repo.topics.slice(3).join(', ')}
                              >
                                +{repo.topics.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {!loading && !error && repositories.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No trending repositories found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                  </div>
                )}

                {/* Pagination */}
                {!loading && !error && repositories.length > 0 && pagination.totalPages > 1 && (
                  <div className="mt-8 pt-6">
                    {/* Pagination Info */}
                    {/* <div className="text-center text-sm text-muted-foreground mb-4">
                      Showing {((pagination.currentPage - 1) * itemsPerPage) + 1} to{' '}
                      {Math.min(pagination.currentPage * itemsPerPage, pagination.totalCount)} of{' '}
                      {pagination.totalCount.toLocaleString()} repositories
                    </div> */}

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!pagination.hasPrevPage || loading}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let page: number
                          if (pagination.totalPages <= 5) {
                            page = i + 1
                          } else if (pagination.currentPage <= 3) {
                            page = i + 1
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            page = pagination.totalPages - 4 + i
                          } else {
                            page = pagination.currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={page}
                              variant={pagination.currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              disabled={loading}
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
                        onClick={handleNextPage}
                        disabled={!pagination.hasNextPage || loading}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quick Jump */}
                    {pagination.totalPages > 10 && (
                      <div className="mt-4 text-center">
                        <span className="text-sm text-muted-foreground mr-2">Jump to page:</span>
                        <Select
                          value={pagination.currentPage.toString()}
                          onValueChange={(value) => handlePageChange(parseInt(value))}
                        >
                          <SelectTrigger className="w-20 inline-flex">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: pagination.totalPages }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
