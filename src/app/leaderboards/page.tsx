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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DiscordProfileDialog } from '@/components/features/discord-profile-dialog'
import { getPowerLevelFromPoints } from '@/lib/utils'
import Header from "@/components/layout/Header"
import { formatLeaderboardDateOnly, formatSessionDateNoTz } from "@/lib/date-formatter"
import { Globe } from "@/components/ui/globe"

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
  sessionInfo?: {
    sessionKey: string
    sessionType: string
    startDate: string
    endDate: string
    isActive: boolean
    lastUpdateAt?: string
    nextUpdateAt?: string
  }
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
  const [selectedLeaderboardType, setSelectedLeaderboardType] = useState("commits")
  const [timeFilter, setTimeFilter] = useState("overall")
  const [loadingMore, setLoadingMore] = useState<{ [key: string]: boolean }>({})

  const leaderboardTypes = [
    { key: "points", label: "Power Level", icon: Zap, color: "text-purple-400", description: "Overall developer power level" },
    { key: "stars", label: "Stars", icon: Star, color: "text-yellow-400", description: "Total repository stars" },
    { key: "commits", label: "Commits", icon: GitCommit, color: "text-green-400", description: "Total commits made" },
    { key: "streak", label: "Streak", icon: Flame, color: "text-orange-400", description: "Longest contribution streak" },
    { key: "repos", label: "Repositories", icon: BookOpen, color: "text-blue-400", description: "Total repositories" },
    { key: "followers", label: "Followers", icon: Users, color: "text-pink-400", description: "GitHub followers" },
  ]

  const timePeriods = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
    { key: "overall", label: "Overall" },
  ]

  const fetchLeaderboard = async (type: string, page: number = 1, append: boolean = false) => {
    try {
      // Use session-based leaderboards for better data
      const response = await fetch(`/api/session-leaderboards?type=${type}&sessionType=${timeFilter}&page=${page}&limit=30`)
      if (response.ok) {
        const data = await response.json()

        // Extract pagination from headers
        const paginationHeader = response.headers.get('X-Pagination')
        const pagination = paginationHeader ? JSON.parse(paginationHeader) : null

        if (append && leaderboards[type]) {
          // Append new results to existing ones
          const updatedEntries = [...(leaderboards[type].entries || []), ...(data.data?.entries || [])]
          setLeaderboards((prev) => ({
            ...prev,
            [type]: {
              ...data.data,
              entries: updatedEntries,
              pagination: pagination
            }
          }))
        } else {
          // Replace with new results - transform API response to expected format
          setLeaderboards((prev) => ({
            ...prev,
            [type]: {
              ...data.data,
              entries: data.data?.entries || [],
              pagination: pagination
            }
          }))
        }
      } else {
        console.error(`Failed to fetch ${type} leaderboard:`, response.statusText)
      }
    } catch (error) {
      console.error(`Error fetching ${type} leaderboard:`, error)
    }
  }

  const fetchCurrentLeaderboard = async () => {
    setLoading(true)
    setRefreshing(true)

    await fetchLeaderboard(selectedLeaderboardType, 1)

    setLoading(false)
    setRefreshing(false)
  }

  const handleLoadMore = async (type: string) => {
    const currentData = leaderboards[type]
    if (!currentData || !currentData.pagination?.hasNextPage) return

    setLoadingMore((prev) => ({ ...prev, [type]: true }))

    const nextPage = (currentData.pagination?.currentPage || 0) + 1
    await fetchLeaderboard(type, nextPage, true)

    setLoadingMore((prev) => ({ ...prev, [type]: false }))
  }

  const resetLeaderboards = () => {
    setLeaderboards({})
    setLoadingMore({})
  }

  useEffect(() => {
    resetLeaderboards()
    fetchCurrentLeaderboard()
  }, [selectedLeaderboardType, timeFilter])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-200" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-200" />
      case 3:
        return <Award className="h-5 w-5 text-amber-200" />
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
    return formatLeaderboardDateOnly(dateString)
  }

  const formatSessionDateLocal = (dateString?: string) => {
    if (!dateString) return "Unknown"
    return formatSessionDateNoTz(dateString)
  }

  const getSessionTimeRemaining = (endDate?: string) => {
    if (!endDate) return null
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Session ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  const formatNumber = (num?: number) => {
    if (!num) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const currentLeaderboard = leaderboards[selectedLeaderboardType]
  const selectedLeaderboardTypeInfo = leaderboardTypes.find(type => type.key === selectedLeaderboardType)

  return (
    <div className="min-h-screen bg-gradient-to-b from-transparent via-background to-background">
      {/* Header */}
      <Header />
      <div className="relative container mx-auto px-4 py-6 bg-gradient-to-b from-transparent to-background">
        {/* <div className="absolute inset-0 -z-10 container bg-gradient-to-b from-transparent to-black h-screen mx-auto">
          <div className="absolute inset-0 h-screen bg-gradient-to-b from-transparent to-black -z-10 blur-3xl"></div>
        </div> */}
        <Globe className="-z-20 -top-10" />
        <div className="flex flex-col pt-16 gap-6">
          <div className="flex flex-col gap-4 items-center justify-between">
          <h1 className="text-7xl font-bold bg-gradient-to-b from-foreground via-foreground to-background text-transparent bg-clip-text">Leaderboards</h1>
            <p className="text-muted-foreground text-lg">
              <span className="text-[#22E26F] font-semibold">Compete</span> with developers 
              <span className="text-[#FF6B35] font-semibold"> worldwide</span> and 
              <span className="text-[#8B5CF6] font-semibold"> climb</span> the ranks
            </p>
          </div>

          {/* Leaderboard Type Selection */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              {/* <span className="text-sm font-medium">Type:</span> */}
              <Select value={selectedLeaderboardType} onValueChange={setSelectedLeaderboardType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leaderboardTypes.map((type) => (
                    <SelectItem key={type.key} value={type.key}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCurrentLeaderboard}
                disabled={refreshing}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              {/* <span className="text-sm font-medium">Period:</span> */}
              {/* Time Period Tabs - Only show for Commits */}
              {selectedLeaderboardType === 'commits' && (
                <Tabs value={timeFilter} onValueChange={setTimeFilter}>
                  <TabsList className="grid w-full grid-cols-5">
                    {timePeriods.map((period) => (
                      <TabsTrigger key={period.key} value={period.key} className="text-xs">
                        {period.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 bg-background">
        {/* Leaderboard Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="space-y-4">
            {loading && !currentLeaderboard ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentLeaderboard?.entries?.length > 0 ? (
              <>
                {/* Enhanced Session Information Banner */}
                {currentLeaderboard.sessionInfo && selectedLeaderboardType === 'commits' && timeFilter !== 'overall' && (
                  <Card className="mb-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-2 border-purple-400/30 shadow-2xl shadow-purple-500/20 backdrop-blur-sm">
                    <CardContent className="flex relative gap-6 items-center p-6">
                      <div className="flex-1 w-1/3 flex items-center justify-center">
                        <div className="relative">
                          <Trophy className="size-20 text-yellow-400 drop-shadow-2xl animate-pulse" />
                          <div className="absolute inset-0 size-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 w-2/3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-3xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            {currentLeaderboard.sessionInfo.sessionType.charAt(0).toUpperCase() + currentLeaderboard.sessionInfo.sessionType.slice(1)} Session
                          </span>
                          {/* <Badge variant="outline" className="text-xs">
                            {currentLeaderboard.sessionInfo.sessionKey}
                          </Badge> */}
                        </div>
                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div className="flex w-full gap-6">
                            <div>
                              <span className="text-muted-foreground">Started: </span>
                              <span className="font-semibold text-blue-400">{formatSessionDateLocal(currentLeaderboard.sessionInfo.startDate)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ends: </span>
                              <span className="font-semibold text-pink-400">{formatSessionDateLocal(currentLeaderboard.sessionInfo.endDate)}</span>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">Time remaining: </span>
                            <span className="font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                              {getSessionTimeRemaining(currentLeaderboard.sessionInfo.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top 3 Podium */}
                <Card className="mb-8 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Trophy className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
                        <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                          Top Performers
                        </span>
                        <span className="text-muted-foreground">- {selectedLeaderboardTypeInfo?.label}</span>
                      </CardTitle>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {formatDate(currentLeaderboard.lastUpdated)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3 py-8">
                      {currentLeaderboard.entries?.slice(0, 3).map((entry, index) => (
                        <motion.div
                          key={entry.username}
                          initial={{ opacity: 0, y: 30, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className={`relative rounded-2xl p-8 text-center transform transition-all duration-300 ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400/20 via-yellow-500/15 to-orange-500/20 border-2 border-yellow-400/40 shadow-2xl shadow-yellow-500/20"
                              : index === 1
                                ? "bg-gradient-to-br from-gray-400/20 via-gray-500/15 to-slate-500/20 border-2 border-gray-400/40 shadow-2xl shadow-gray-500/20"
                                : "bg-gradient-to-br from-amber-600/20 via-orange-500/15 to-red-500/20 border-2 border-amber-600/40 shadow-2xl shadow-amber-500/20"
                          } backdrop-blur-sm`}
                          style={{
                            transform: index === 0 ? 'translateY(-10px)' : index === 1 ? 'translateY(-5px)' : 'translateY(0px)'
                          }}
                        >
                          {/* Premium rank badge */}
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <div className={`relative px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                              index === 0 
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-2 border-yellow-300"
                                : index === 1
                                  ? "bg-gradient-to-r from-gray-400 to-gray-600 text-white border-2 border-gray-300"
                                  : "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-2 border-amber-400"
                            }`}>
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent"></div>
                              <span className="relative flex items-center gap-1">
                                {getRankIcon(entry.rank)}#{entry.rank}
                              </span>
                            </div>
                          </div>

                          <DiscordProfileDialog username={entry.username}>
                            {/* Enhanced avatar with premium styling */}
                            <div className={`mx-auto mb-6 h-20 w-20 rounded-full border-4 shadow-2xl ${
                              index === 0 
                                ? "border-yellow-400/60 shadow-yellow-500/30"
                                : index === 1
                                  ? "border-gray-400/60 shadow-gray-500/30"
                                  : "border-amber-600/60 shadow-amber-500/30"
                            }`}>
                              <Avatar className="h-full w-full">
                                <AvatarImage src={entry.avatar_url || "/placeholder.svg"} alt={entry.username} />
                                <AvatarFallback className="text-lg font-bold">{entry.username[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </div>

                            <h3 className="mb-2 text-lg font-bold hover:text-primary transition-colors">
                              {entry.name || entry.username}
                            </h3>
                            <p className="mb-3 text-sm text-muted-foreground">@{entry.username}</p>
                            
                            {/* Enhanced score display */}
                            <div className={`text-3xl font-bold mb-2 ${
                              index === 0 
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
                                : index === 1
                                  ? "bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent"
                                  : "bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                            }`}>
                              {selectedLeaderboardType === "points" ? `Level ${getPowerLevelFromPoints(entry.score)}` : formatNumber(entry.score)}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">{selectedLeaderboardTypeInfo?.label}</div>

                            {/* Additional user info with colorful accents */}
                            {entry.bio && (
                              <p className="mt-3 text-xs text-muted-foreground line-clamp-2 rounded-lg">{entry.bio}</p>
                            )}
                            {entry.location && (
                              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground rounded-lg">
                                <MapPin className="h-3 w-3" />
                                {entry.location}
                              </div>
                            )}
                          </DiscordProfileDialog>
                        </motion.div>
                      ))}
                    </div>
                    {/* Full Leaderboard */}
                    <Card className="px-0 border-none">
                      <CardContent className="px-0">
                        <div className="space-y-2">
                          <AnimatePresence>
                            {currentLeaderboard.entries?.map((entry, index) => (
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

                                <DiscordProfileDialog
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
                                    <div className="mt-1 hidden md:flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                                </DiscordProfileDialog>

                                <div className="text-right">
                                  <div className={`text-xl font-bold ${
                                    entry.rank <= 3 
                                      ? entry.rank === 1 
                                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
                                        : entry.rank === 2
                                          ? "bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent"
                                          : "bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                                      : entry.rank <= 10
                                        ? "text-blue-400"
                                        : entry.rank <= 50
                                          ? "text-green-400"
                                          : "text-muted-foreground"
                                  }`}>
                                    {selectedLeaderboardType === "points" ? `Level ${getPowerLevelFromPoints(entry.score)}` : formatNumber(entry.score)}
                                  </div>
                                  <div className="text-sm font-medium text-muted-foreground">{selectedLeaderboardTypeInfo?.label}</div>
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

                        {currentLeaderboard.entries?.length === 0 && (
                          <div className="py-12 text-center text-muted-foreground">
                            <Trophy className="mx-auto mb-4 h-12 w-12" />
                            <p>No rankings available yet.</p>
                            <p className="text-sm">Be the first to get ranked!</p>
                          </div>
                        )}

                        {/* Load More Button */}
                        {currentLeaderboard.pagination?.hasNextPage && (
                          <div className="mt-6 flex justify-center">
                            <Button
                              variant="outline"
                              onClick={() => handleLoadMore(selectedLeaderboardType)}
                              disabled={loadingMore[selectedLeaderboardType]}
                              className="gap-2"
                            >
                              {loadingMore[selectedLeaderboardType] ? (
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
                            Showing {currentLeaderboard.entries?.length || 0} of {currentLeaderboard.pagination?.totalCount || 0} developers
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
          </div>
        </motion.div>


        {/* Enhanced Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {leaderboardTypes.map((type, index) => {
            const data = leaderboards[type.key]
            const topScore = data?.entries?.[0]?.score || 0
            const colors = [
              { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-400/40', shadow: 'shadow-purple-500/20', text: 'text-purple-400' },
              { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-400/40', shadow: 'shadow-yellow-500/20', text: 'text-yellow-400' },
              { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-400/40', shadow: 'shadow-green-500/20', text: 'text-green-400' },
              { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-400/40', shadow: 'shadow-orange-500/20', text: 'text-orange-400' },
              { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-400/40', shadow: 'shadow-blue-500/20', text: 'text-blue-400' },
              { bg: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-400/40', shadow: 'shadow-pink-500/20', text: 'text-pink-400' }
            ]
            const colorScheme = colors[index % colors.length]

            return (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`group transition-all duration-300 cursor-pointer backdrop-blur-sm border-2 ${
                    type.key === selectedLeaderboardType 
                      ? `ring-4 ring-primary/50 bg-gradient-to-br ${colorScheme.bg} ${colorScheme.border} shadow-2xl ${colorScheme.shadow}`
                      : `bg-gradient-to-br ${colorScheme.bg} ${colorScheme.border} hover:shadow-xl ${colorScheme.shadow}`
                  }`}
                  onClick={() => setSelectedLeaderboardType(type.key)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <type.icon className={`h-6 w-6 ${colorScheme.text} drop-shadow-lg`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xl font-black ${colorScheme.text} mb-1`}>
                          {type.key === "points" ? `Level ${getPowerLevelFromPoints(topScore)}` : formatNumber(topScore)}
                        </div>
                        <div className="text-sm font-semibold text-foreground">{type.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {timeFilter === 'overall' ? 'All Time' : timeFilter}
                        </div>
                        {data?.sessionInfo && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatSessionDateLocal(data.sessionInfo.startDate)} - {formatSessionDateLocal(data.sessionInfo.endDate)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Animated background elements */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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