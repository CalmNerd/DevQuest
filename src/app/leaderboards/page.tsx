"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy, Medal, Award, Star, Users, BookOpen, Zap, RefreshCw,
  TrendingUp, Crown, Flame, Calendar, MapPin, ExternalLink,
  GitCommit, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProfileCardTrigger } from '@/components/features/discord-profile-card'
import { getPowerLevelFromPoints } from '@/lib/utils'
import Header from "@/components/layout/Header"

interface LeaderboardEntry {
  rank: number
  username: string
  name: string
  avatar_url: string
  score: number
  metric: string
  // Additional comprehensive data
  githubUrl?: string
  bio?: string
  location?: string
  followers?: number
  following?: number
  publicRepos?: number
  createdAt?: string
  updatedAt?: string
  // Extended stats
  totalStars?: number
  totalCommits?: number
  longestStreak?: number
  currentStreak?: number
  totalForks?: number
  totalIssues?: number
  totalPullRequests?: number
  languageCount?: number
  topLanguage?: string
}

interface LeaderboardData {
  type: string
  period: string
  entries: LeaderboardEntry[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  lastUpdated: string
}

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: LeaderboardData }>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("points")
  const [timeFilter, setTimeFilter] = useState("global")
  const [loadingMore, setLoadingMore] = useState<{ [key: string]: boolean }>({})

  const leaderboardTypes = [
    { key: "points", label: "Power Level", icon: Zap, color: "text-purple-400", description: "Overall developer power level" },
    { key: "stars", label: "Stars", icon: Star, color: "text-yellow-400", description: "Total repository stars" },
    { key: "commits", label: "Commits", icon: GitCommit, color: "text-green-400", description: "Total commits made" },
    { key: "streak", label: "Streak", icon: Flame, color: "text-orange-400", description: "Longest contribution streak" },
    { key: "repos", label: "Repositories", icon: BookOpen, color: "text-blue-400", description: "Total repositories" },
    { key: "followers", label: "Followers", icon: Users, color: "text-pink-400", description: "GitHub followers" },
  ]

  const fetchLeaderboard = async (type: string, page: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`/api/leaderboards?type=${type}&period=${timeFilter}&page=${page}&limit=30`)
      if (response.ok) {
        const data = await response.json()

        if (append && leaderboards[type]) {
          // Append new results to existing ones
          const updatedEntries = [...leaderboards[type].entries, ...data.entries]
          setLeaderboards((prev) => ({
            ...prev,
            [type]: {
              ...data,
              entries: updatedEntries
            }
          }))
        } else {
          // Replace with new results
          setLeaderboards((prev) => ({ ...prev, [type]: data }))
        }
      } else {
        console.error(`Failed to fetch ${type} leaderboard:`, response.statusText)
      }
    } catch (error) {
      console.error(`Error fetching ${type} leaderboard:`, error)
    }
  }

  const fetchAllLeaderboards = async () => {
    setLoading(true)
    setRefreshing(true)

    await Promise.all(leaderboardTypes.map((type) => fetchLeaderboard(type.key, 1)))

    setLoading(false)
    setRefreshing(false)
  }

  const handleLoadMore = async (type: string) => {
    const currentData = leaderboards[type]
    if (!currentData || !currentData.pagination.hasNextPage) return

    setLoadingMore((prev) => ({ ...prev, [type]: true }))

    const nextPage = currentData.pagination.currentPage + 1
    await fetchLeaderboard(type, nextPage, true)

    setLoadingMore((prev) => ({ ...prev, [type]: false }))
  }

  const resetLeaderboards = () => {
    setLeaderboards({})
    setLoadingMore({})
  }

  useEffect(() => {
    resetLeaderboards()
    fetchAllLeaderboards()
  }, [timeFilter])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <div className="flex h-5 w-5 items-center justify-center text-sm font-bold">{rank}</div>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleDateString()
  }

  const formatNumber = (num?: number) => {
    if (!num) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const currentLeaderboard = leaderboards[activeTab]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leaderboards</h1>
            <p className="text-muted-foreground">Compete with developers worldwide</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">All Time</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="daily">Today</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllLeaderboards}
              disabled={refreshing}
              className="gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Leaderboard Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              {leaderboardTypes.map((type) => (
                <TabsTrigger key={type.key} value={type.key} className="gap-2 text-xs md:text-sm">
                  <type.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{type.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {leaderboardTypes.map((type) => (
              <TabsContent key={type.key} value={type.key} className="space-y-4">
                {loading && !currentLeaderboard ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : currentLeaderboard?.entries.length > 0 ? (
                  <>
                    {/* Top 3 Podium */}
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-400" />
                          Top Performers - {type.label}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          {currentLeaderboard.entries.slice(0, 3).map((entry, index) => (
                            <motion.div
                              key={entry.username}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`relative rounded-lg p-6 text-center ${index === 0
                                ? "bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border-yellow-400/20"
                                : index === 1
                                  ? "bg-gradient-to-br from-gray-400/10 to-gray-600/10 border-gray-400/20"
                                  : "bg-gradient-to-br from-amber-600/10 to-amber-800/10 border-amber-600/20"
                                } border`}
                            >
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge variant={getRankBadgeVariant(entry.rank)} className="gap-1">
                                  {getRankIcon(entry.rank)}#{entry.rank}
                                </Badge>
                              </div>
                              <ProfileCardTrigger username={entry.username}>
                                <Avatar className="mx-auto mb-4 h-16 w-16 border-2 border-primary/20">
                                  <AvatarImage src={entry.avatar_url || "/placeholder.svg"} alt={entry.username} />
                                  <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <h3 className="mb-1 font-semibold hover:text-primary">
                                  {entry.name || entry.username}
                                </h3>
                                <p className="mb-2 text-sm text-muted-foreground">@{entry.username}</p>
                                <div className="text-2xl font-bold text-primary">
                                  {type.key === "points" ? `Level ${getPowerLevelFromPoints(entry.score)}` : formatNumber(entry.score)}
                                </div>
                                <div className="text-sm text-muted-foreground">{type.label}</div>

                                {/* Additional user info */}
                                {entry.bio && (
                                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{entry.bio}</p>
                                )}
                                {entry.location && (
                                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {entry.location}
                                  </div>
                                )}
                              </ProfileCardTrigger>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Full Leaderboard */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Full Rankings - {type.label}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {currentLeaderboard.pagination.totalCount} total developers •
                          Last updated: {formatDate(currentLeaderboard.lastUpdated)}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {currentLeaderboard.entries.map((entry, index) => (
                              <motion.div
                                key={entry.username}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.02 }}
                                className={`flex items-center gap-4 rounded-lg p-4 transition-all hover:bg-muted/50 ${entry.rank <= 3 ? "bg-primary/5" : ""
                                  }`}
                              >
                                <div className="flex w-12 items-center justify-center">
                                  {entry.rank <= 3 ? (
                                    getRankIcon(entry.rank)
                                  ) : (
                                    <span className="text-sm font-medium text-muted-foreground">#{entry.rank}</span>
                                  )}
                                </div>

                                <ProfileCardTrigger
                                  username={entry.username}
                                  className="flex flex-1 items-center gap-4"
                                >
                                  <Avatar className="h-12 w-12 border border-border">
                                    <AvatarImage src={entry.avatar_url || "/placeholder.svg"} alt={entry.username} />
                                    <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                                  </Avatar>

                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium hover:text-primary truncate">
                                      {entry.name || entry.username}
                                    </div>
                                    <div className="text-sm text-muted-foreground">@{entry.username}</div>

                                    {/* Extended user info */}
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                      {entry.followers !== undefined && (
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          {formatNumber(entry.followers)} followers
                                        </div>
                                      )}
                                      {entry.publicRepos !== undefined && (
                                        <div className="flex items-center gap-1">
                                          <BookOpen className="h-3 w-3" />
                                          {formatNumber(entry.publicRepos)} repos
                                        </div>
                                      )}
                                      {entry.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {entry.location}
                                        </div>
                                      )}
                                      {entry.createdAt && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          Joined {formatDate(entry.createdAt)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </ProfileCardTrigger>

                                <div className="text-right">
                                  <div className="text-lg font-bold">
                                    {type.key === "points" ? `Level ${getPowerLevelFromPoints(entry.score)}` : formatNumber(entry.score)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{type.label}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {entry.rank <= 10 && (
                                    <Flame className="h-4 w-4 text-orange-400" />
                                  )}
                                  {entry.githubUrl && (
                                    <a
                                      href={entry.githubUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>

                        {currentLeaderboard.entries.length === 0 && (
                          <div className="py-12 text-center text-muted-foreground">
                            <Trophy className="mx-auto mb-4 h-12 w-12" />
                            <p>No rankings available yet.</p>
                            <p className="text-sm">Be the first to get ranked!</p>
                          </div>
                        )}

                        {/* Load More Button */}
                        {currentLeaderboard.pagination && currentLeaderboard.pagination.hasNextPage && (
                          <div className="mt-6 flex justify-center">
                            <Button
                              variant="outline"
                              onClick={() => handleLoadMore(activeTab)}
                              disabled={loadingMore[activeTab]}
                              className="gap-2"
                            >
                              {loadingMore[activeTab] ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  Load More
                                  <ChevronRight className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Results Info */}
                        {currentLeaderboard.pagination && (
                          <div className="mt-4 text-center text-sm text-muted-foreground">
                            Showing {currentLeaderboard.entries.length} of {currentLeaderboard.pagination.totalCount} developers
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No leaderboard data available.</p>
                      <p className="text-sm text-muted-foreground">
                        Search for some profiles to populate the rankings!
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => window.location.href = '/explore'}
                      >
                        Explore Profiles
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>


        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {leaderboardTypes.map((type, index) => {
            const data = leaderboards[type.key]
            const topScore = data?.entries[0]?.score || 0

            return (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group transition-all hover:scale-105 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20`}
                      >
                        <type.icon className={`h-5 w-5 ${type.color}`} />
                      </div>
                      <div>
                        <div className="text-lg font-bold">
                          {type.key === "points" ? `Level ${getPowerLevelFromPoints(topScore)}` : formatNumber(topScore)}
                        </div>
                        <div className="text-xs text-muted-foreground">{type.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}