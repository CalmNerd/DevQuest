"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  Star,
  GitFork,
  Calendar,
  Loader2,
  RefreshCw,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingRepository } from '@/types/github.types'
import { popularLanguages } from '@/lib/constants'
import { formatRepositoryDate } from '@/lib/date-formatter'
import githubColors from "@/lib/github-colors.json"
import Link from "next/link"

interface TrendingRepositoriesProps {
  initialType?: 'stars' | 'forks' | 'language' | 'all-time' | 'recently-created' | 'recently-updated'
  initialPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020'
  initialLanguage?: string
  limit?: number
  showPagination?: boolean
}

export default function TrendingRepositories({
  initialType = 'stars',
  initialPeriod = 'weekly',
  initialLanguage,
  limit = 10,
  showPagination = false
}: TrendingRepositoriesProps) {

  const [trendingRepos, setTrendingRepos] = useState<TrendingRepository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState(initialType)
  const [period, setPeriod] = useState(initialPeriod)
  const [language, setLanguage] = useState(initialLanguage)
  const [allTimeSort, setAllTimeSort] = useState<'stars' | 'forks' | 'updated' | 'created'>('stars')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchTrendingRepositories = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        type,
        period,
        limit: limit.toString(),
        page: currentPage.toString()
      })

      if (language && language !== 'all' && type === 'language') {
        params.append('language', language)
      }

      if (type === 'all-time') {
        params.append('sort', allTimeSort)
      }

      const response = await fetch(`/api/repositories/trending?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch trending repositories')
      }

      const data = await response.json()

      // Handle both 'items' (GitHub API format) and 'repositories' (our format) response structures
      const repositories = data.items || data.repositories || []

      setTrendingRepos(repositories)
      setTotalPages(data.totalPages || Math.ceil(repositories.length / limit))
      setTotalCount(data.total_count || repositories.length)
    } catch (error) {
      console.error('Error fetching trending repositories:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch trending repositories')
    } finally {
      setLoading(false)
    }
  }, [type, period, language, limit, allTimeSort, currentPage])

  useEffect(() => {
    fetchTrendingRepositories()
  }, [fetchTrendingRepositories])

  const getLanguageColor = (language: string) => {
    return (githubColors as any)[language] || "#6b7280"
  }

  const getTimeAgo = (dateString: string) => {
    return formatRepositoryDate(dateString)
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

  return (
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
            onClick={fetchTrendingRepositories}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Select value={type} onValueChange={(value: 'stars' | 'forks' | 'language' | 'all-time' | 'recently-created' | 'recently-updated') => setType(value)}>
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
            <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020') => setPeriod(value)}>
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
            <Select value={allTimeSort} onValueChange={(value: 'stars' | 'forks' | 'updated' | 'created') => setAllTimeSort(value)}>
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
            <Button onClick={fetchTrendingRepositories} variant="outline">
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

        {!loading && !error && (
          <div className="space-y-4">
            {trendingRepos.map((repo, index) => (
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
                  {index < 3 && <Flame className="h-4 w-4 text-orange-500 mx-auto mt-1" />}
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
                      <Star className="h-3 w-3" />
                      <span>{repo.stargazers_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" />
                      <span>{repo.forks_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
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

        {!loading && !error && trendingRepos.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No trending repositories found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="mt-6">
            {/* Pagination Info */}
            <div className="text-center text-sm text-muted-foreground mb-4">
              Showing {((currentPage - 1) * limit) + 1} to{' '}
              {Math.min(currentPage * limit, totalCount)} of{' '}
              {totalCount.toLocaleString()} repositories
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}