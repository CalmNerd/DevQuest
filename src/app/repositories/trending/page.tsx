"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTrendingRepositories } from '@/hooks/client'
import { popularLanguages } from '@/lib/constants'
import githubColors from "@/lib/github-colors.json"
import Link from "next/link"

export default function RepositoryTrendingPage() {
  const [type, setType] = useState<'stars' | 'forks' | 'language' | 'all-time' | 'recently-created' | 'recently-updated'>('stars')
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020'>('weekly')
  const [language, setLanguage] = useState<string>('')
  const [allTimeSort, setAllTimeSort] = useState<'stars' | 'forks' | 'updated' | 'created'>('stars')

  const { repositories, loading, error, pagination, fetchTrendingRepositories } = useTrendingRepositories({
    type,
    period,
    language: language || undefined,
    limit: 30,
    page: 1,
    sort: allTimeSort
  })

  const getLanguageColor = (language: string) => {
    return (githubColors as any)[language] || "#6b7280"
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInHours < 1) {
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInDays < 365) {
      return `${diffInDays}d ago`
    } else {
      return `${diffInYears}y ago`
    }
  }

  const getTrendingTypeLabel = () => {
    switch (type) {
      case 'stars': return 'Most Starred'
      case 'forks': return 'Most Forked'
      case 'language': return `Trending in ${language || 'All Languages'}`
      case 'all-time': return 'All-Time Top'
      case 'recently-created': return 'Recently Created'
      case 'recently-updated': return 'Recently Updated'
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
      default: return 'This Week'
    }
  }

  const handleRefresh = () => {
    fetchTrendingRepositories({
      type,
      period,
      language: language || undefined,
      limit: 30,
      page: 1,
      sort: allTimeSort
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Trending Repositories</h1>
            {pagination.totalCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pagination.totalCount.toLocaleString()} repositories
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
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {getTrendingTypeLabel()} {getPeriodLabel()}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 flex-wrap">
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All-Time Top</SelectItem>
                      <SelectItem value="stars">Most Starred</SelectItem>
                      <SelectItem value="forks">Most Forked</SelectItem>
                      <SelectItem value="language">By Language</SelectItem>
                      <SelectItem value="recently-created">Recently Created</SelectItem>
                      <SelectItem value="recently-updated">Recently Updated</SelectItem>
                    </SelectContent>
                  </Select>

                  {type !== 'all-time' && type !== 'recently-created' && type !== 'recently-updated' && (
                    <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
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
                      </SelectContent>
                    </Select>
                  )}

                  {type === 'language' && (
                    <Select value={language || 'all'} onValueChange={setLanguage}>
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
                  )}

                  {type === 'all-time' && (
                    <Select value={allTimeSort} onValueChange={(value: any) => setAllTimeSort(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stars">By Stars</SelectItem>
                        <SelectItem value="forks">By Forks</SelectItem>
                        <SelectItem value="updated">Recently Updated</SelectItem>
                        <SelectItem value="created">Recently Created</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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
                          {index < 3 && <span className="text-orange-500 text-sm">🔥</span>}
                        </div>

                        {/* Repository Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
                              <AvatarFallback className="text-xs">{repo.owner.login[0]}</AvatarFallback>
                            </Avatar>
                            <Link
                              href={`https://github.com/${repo.full_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary text-sm truncate"
                            >
                              {repo.full_name}
                            </Link>
                            {repo.trend_score && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                🔥 {Math.round(repo.trend_score * 100)}%
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
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                                />
                                <span>{repo.language}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span>⭐</span>
                              <span>{repo.stargazers_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>🍴</span>
                              <span>{repo.forks_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>📅</span>
                              <span>Updated {getTimeAgo(repo.updated_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Topics */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="hidden md:flex gap-1">
                            {repo.topics.slice(0, 3).map((topic, topicIndex) => (
                              <Badge key={topicIndex} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {repo.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
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
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
