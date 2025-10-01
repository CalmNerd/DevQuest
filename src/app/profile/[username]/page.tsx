"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Github,
  MapPin,
  LinkIcon,
  Calendar,
  Star,
  GitFork,
  Users,
  BookOpen,
  RefreshCw,
  ExternalLink,
  Trophy,
  TrendingUp,
  Zap,
  Crown,
  Award,
  Target,
  GitBranch,
  Flame,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContributionGraph } from '@/components/features/contribution-graph'
import { AchievementProgressDisplay } from '@/components/features/achievement-progress'
import { ProfileData } from "@/types"
import { formatCacheDate, formatProfileDate } from "@/lib/date-formatter"

// Helper functions for achievements
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    "trophy": Trophy,
    "star": Star,
    "zap": Zap,
    "crown": Crown,
    "award": Award,
    "target": Target,
    "users": Users,
    "git-branch": GitBranch,
    "flame": Flame,
    "shield": Shield,
    "git-commit": GitBranch,
    "calendar": Target,
    "heart": Star,
    "sparkles": Star,
    "folder-plus": GitBranch,
    "layers": GitBranch,
    "code": GitBranch,
    "languages": GitBranch,
    "book-open": GitBranch,
    "check-circle": Target,
    "git-merge": GitBranch,
    "eye": Target,
    "trending-up": Zap,
    "rocket": Zap,
    "graduation-cap": Award,
    "sunrise": Star,
    "moon": Star,
    "medal": Award,
    "brain": Award,
    "skull": Award,
  }
  return iconMap[iconName] || Trophy
}

const getRarityColor = (rarity: string) => {
  const rarityColors = {
    common: "border-gray-400 bg-gray-400/10 text-gray-400",
    rare: "border-blue-400 bg-blue-400/10 text-blue-400",
    epic: "border-purple-400 bg-purple-400/10 text-purple-400",
    legendary: "border-yellow-400 bg-yellow-400/10 text-yellow-400",
  }
  return rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [dataReady, setDataReady] = useState(false)

  const fetchProfile = async (forceRefresh = false) => {
    try {
      setLoading(!profile)
      setRefreshing(forceRefresh)
      setError(null)
      setDataReady(false) // Reset data ready state when starting new fetch

      const url = `/api/github/${username}${forceRefresh ? "?refresh=true" : ""}`
      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found")
        }
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setProfile(data)
      // Only set dataReady to true when we have all required data
      if (data && data.login && data.avatar_url) {
        setDataReady(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  // Show loading state until data is ready
  if (loading || !dataReady || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Card className="max-w-md">
              <CardContent className="p-6 text-center">
                <div className="mb-4 text-4xl">😵</div>
                <h2 className="mb-2 text-xl font-semibold">Profile Not Found</h2>
                <p className="mb-4 text-muted-foreground">{error}</p>
                <Button onClick={() => fetchProfile()} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // At this point, we know profile exists and dataReady is true, so we can safely access properties
  // Safely handle topLanguages with fallback for undefined/null values
  const topLanguages = profile.topLanguages && typeof profile.topLanguages === 'object'
    ? Object.entries(profile.topLanguages)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
    : []

  const totalLanguageRepos = profile.topLanguages && typeof profile.topLanguages === 'object'
    ? Object.values(profile.topLanguages).reduce((sum, count) => sum + (count as number), 0)
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => window.history.back()}>
              ← Back
            </Button>
            <div className="flex items-center gap-2">
              {profile.cached && (
                <Badge variant="secondary" className="text-xs">
                  Cached {formatCacheDate(profile.lastUpdated)}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchProfile(true)}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            <CardContent className="relative p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.login} />
                  <AvatarFallback className="text-2xl">
                    {profile.login && profile.login.length > 0 ? profile.login[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-4">
                    <h1 className="mb-2 text-3xl font-bold">{profile.name || profile.login}</h1>
                    <p className="text-lg text-muted-foreground">@{profile.login}</p>
                    {profile.bio && <p className="mt-2 text-muted-foreground">{profile.bio}</p>}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">Power Level {profile.powerLevel}</span>
                      <Badge variant="secondary">{profile.points.toLocaleString()} points</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress to Level {profile.powerLevel + 1}</span>
                        <span>
                          {profile.pointsToNext.toLocaleString()} / {profile.nextLevelCost.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={profile.powerProgress} className="h-2" />
                    </div>
                  </div>

                  {/* GitHub Native Achievements Preview */}
                  {profile.githubNativeAchievements && profile.githubNativeAchievements.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Github className="h-3 w-3" />
                        GitHub Achievements
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.githubNativeAchievements.slice(0, 4).map((achievement) => (
                          <div
                            key={achievement.slug}
                            className="flex items-center gap-2 rounded-lg border-2 border-primary/30 bg-primary/5 px-3 py-2 text-xs hover:border-primary/50 transition-colors"
                            title={achievement.description || achievement.name}
                          >
                            <img
                              src={achievement.image}
                              alt={achievement.name}
                              className="h-4 w-4 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                            <span className="font-medium">{achievement.name}</span>
                            {achievement.tier && (
                              <span className="text-muted-foreground text-[10px]">
                                {achievement.tier}
                              </span>
                            )}
                          </div>
                        ))}
                        {profile.githubNativeAchievements.length > 4 && (
                          <div className="flex items-center rounded-lg border-2 border-dashed border-muted px-3 py-2 text-xs text-muted-foreground">
                            +{profile.githubNativeAchievements.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Trending Developer Badges */}
                  {profile.trendingDeveloperBadges && profile.trendingDeveloperBadges.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        Trending Developer
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.trendingDeveloperBadges.map((badge) => {
                          const displayRank = badge.isCurrent ? badge.currentRank : badge.bestRank
                          return (
                            <div
                              key={badge.timePeriod}
                              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs transition-colors ${badge.isCurrent
                                  ? 'border-orange-500/50 bg-orange-500/10 hover:border-orange-500 text-orange-600 dark:text-orange-400'
                                  : 'border-muted bg-muted/30 text-muted-foreground'
                                }`}
                              title={`${badge.isCurrent ? 'Currently' : 'Was'} trending ${badge.timePeriod}${displayRank ? ` at rank #${displayRank}` : ''}${badge.language ? ` in ${badge.language}` : ''}`}
                            >
                              <TrendingUp className="h-3 w-3" />
                              <span className="font-medium capitalize">{badge.timePeriod}</span>
                              {displayRank && (
                                <span className="rounded-full bg-current/20 px-1.5 text-[10px] font-bold">
                                  #{displayRank}
                                </span>
                              )}
                              {badge.level > 1 && (
                                <span className="rounded-full bg-current/20 px-1.5 text-[10px] font-bold">
                                  Lv.{badge.level}
                                </span>
                              )}
                              {!badge.isCurrent && (
                                <span className="text-[10px]">(Past)</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Achievements Preview */}
                  {profile.achievementProgress && profile.achievementProgress.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-muted-foreground">Top Custom Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.achievementProgress
                          .filter(achievement => achievement.isUnlocked)
                          .map(achievement => ({
                            ...achievement,
                            // Use level for sorting (non-leveled achievements get level 1 for sorting)
                            sortLevel: achievement.isLeveled && achievement.currentLevel !== undefined
                              ? achievement.currentLevel
                              : 1
                          }))
                          .sort((a, b) => b.sortLevel - a.sortLevel)
                          .slice(0, 6)
                          .map((achievement) => {
                            const IconComponent = getIconComponent(achievement.achievement.icon)
                            const rarityColor = getRarityColor(achievement.achievement.rarity)

                            return (
                              <div
                                key={achievement.achievement.id}
                                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs ${rarityColor}`}
                                title={`${achievement.achievement.name} - ${achievement.achievement.description}`}
                              >
                                <IconComponent className="h-4 w-4" />
                                <span className="font-medium">{achievement.achievement.name}</span>
                                <span className="text-muted-foreground">
                                  {(achievement as any).isLeveled && (achievement as any).currentLevel !== undefined
                                    ? `Lv.${(achievement as any).currentLevel}`
                                    : ''}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.blog && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        <a
                          href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          {profile.blog}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {formatProfileDate(profile.created_at)}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button asChild>
                      <a
                        href={`https://github.com/${profile.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Github className="h-4 w-4" />
                        View on GitHub
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button variant="outline">Follow</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Primary Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="group transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.totalStars.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Stars</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.followers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 group-hover:bg-secondary/20">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.public_repos.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Public Repos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10 group-hover:bg-chart-1/20">
                  <TrendingUp className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.totalCommits.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Commits</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="group transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20">
                  <GitFork className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.totalForks.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Forks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.totalWatchers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Watchers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.totalPRs.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Pull Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.totalIssues.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="repositories">Repositories</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Languages */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Top Languages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topLanguages.map(([language, count]) => {
                      const percentage = (count / totalLanguageRepos) * 100
                      return (
                        <div key={language} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{language}</span>
                            <span className="text-muted-foreground">{count} repos</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Contribution Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Current Streak</span>
                      <span className="font-semibold">{profile.contributionStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Longest Streak</span>
                      <span className="font-semibold">{profile.longestStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Contributions</span>
                      <span className="font-semibold">{profile.totalContributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Year</span>
                      <span className="font-semibold">{profile.thisYearContributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last 365 Days</span>
                      <span className="font-semibold">{profile.last365Contributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month</span>
                      <span className="font-semibold">{profile.monthlyContributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week</span>
                      <span className="font-semibold">{profile.weeklyContributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Today</span>
                      <span className="font-semibold">{profile.dailyContributions.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Activity Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total PRs</span>
                      <span className="font-semibold">{profile.totalPRs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Merged PRs</span>
                      <span className="font-semibold">{profile.mergedPullRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Issues</span>
                      <span className="font-semibold">{profile.totalIssues.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Closed Issues</span>
                      <span className="font-semibold">{profile.closedIssues.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Code Reviews</span>
                      <span className="font-semibold">{profile.totalReviews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meaningful Commits</span>
                      <span className="font-semibold">{profile.meaningfulCommits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Following</span>
                      <span className="font-semibold">{profile.following.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contribution Graph */}
              {profile.contributionGraph && (
                <ContributionGraph contributionGraph={profile.contributionGraph} />
              )}
            </TabsContent>

            <TabsContent value="repositories" className="space-y-6">
              <div className="grid gap-4">
                {profile.repos && profile.repos.length > 0 ? (
                  profile.repos.slice(0, 10).map((repo) => (
                    <Card key={repo.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-2 font-semibold">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary"
                              >
                                {repo.name}
                              </a>
                            </h3>
                            {repo.description && <p className="mb-3 text-sm text-muted-foreground">{repo.description}</p>}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {repo.language && (
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                  {repo.language}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {repo.stargazers_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <GitFork className="h-3 w-3" />
                                {repo.forks_count}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-semibold">No Repositories Found</h3>
                      <p className="text-muted-foreground">This user doesn't have any public repositories yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Repository Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Repository Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Repos with Stars</span>
                      <span className="font-semibold">{profile.reposWithStars.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Repos with Forks</span>
                      <span className="font-semibold">{profile.reposWithForks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contributed To</span>
                      <span className="font-semibold">{profile.contributedTo.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>External Contributors</span>
                      <span className="font-semibold">{profile.externalContributors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dependency Usage</span>
                      <span className="font-semibold">{profile.dependencyUsage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language Count</span>
                      <span className="font-semibold">{profile.languageCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top Language %</span>
                      <span className="font-semibold">{profile.topLanguagePercentage.toLocaleString()}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rare Language Repos</span>
                      <span className="font-semibold">{profile.rareLanguageRepos.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Language Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      Language Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topLanguages.map(([language, count]) => {
                      const percentage = (count / totalLanguageRepos) * 100
                      return (
                        <div key={language} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{language}</span>
                            <span className="text-muted-foreground">{count} repos ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                    {topLanguages.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No language data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              {/* Trending Developer Badges Section */}
              {profile.trendingDeveloperBadges && profile.trendingDeveloperBadges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Trending Developer Badges
                      <Badge variant="secondary" className="ml-2">
                        {profile.trendingDeveloperBadges.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {profile.trendingDeveloperBadges.map((badge) => {
                        const badgeDate = new Date(badge.lastTrendingAt)
                        const formattedDate = badgeDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })

                        return (
                          <motion.div
                            key={badge.timePeriod}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`relative overflow-hidden rounded-lg border-2 p-5 transition-all ${badge.isCurrent
                                ? 'border-orange-500 bg-gradient-to-br from-orange-500/10 to-orange-500/5 shadow-lg shadow-orange-500/20'
                                : 'border-muted bg-muted/30'
                              }`}
                          >
                            {/* Current Badge Indicator */}
                            {badge.isCurrent && (
                              <div className="absolute top-2 right-2">
                                <div className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={`flex-shrink-0 rounded-lg p-3 ${badge.isCurrent ? 'bg-orange-500/20' : 'bg-muted'
                                }`}>
                                <TrendingUp className={`h-6 w-6 ${badge.isCurrent ? 'text-orange-500' : 'text-muted-foreground'
                                  }`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold capitalize text-base">
                                    {badge.timePeriod} Trending
                                  </h4>
                                  {badge.level > 1 && (
                                    <Badge variant={badge.isCurrent ? "default" : "secondary"} className="text-xs">
                                      Level {badge.level}
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-1 text-sm">
                                  <p className={badge.isCurrent ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-muted-foreground'}>
                                    {badge.isCurrent ? '🔥 Currently Trending!' : '📊 Past Achievement'}
                                  </p>

                                  {/* Show current rank if trending, best rank if past */}
                                  {badge.isCurrent && badge.currentRank && (
                                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                                      Current Rank: <span className="text-base">#{badge.currentRank}</span>
                                    </p>
                                  )}

                                  {!badge.isCurrent && badge.bestRank && (
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Best Rank: <span className="text-sm font-semibold">#{badge.bestRank}</span>
                                    </p>
                                  )}

                                  {badge.language && (
                                    <p className="text-xs text-muted-foreground">
                                      Language: <span className="font-medium">{badge.language}</span>
                                    </p>
                                  )}

                                  <p className="text-xs text-muted-foreground">
                                    {badge.isCurrent ? 'Last seen' : 'Last trending'}: {formattedDate}
                                  </p>

                                  {badge.level > 1 && (
                                    <p className="text-xs text-muted-foreground">
                                      Achieved {badge.level} times
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Progress bar for level */}
                            {badge.level > 1 && (
                              <div className="mt-3 pt-3 border-t border-current/10">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Achievements</span>
                                  <span className={badge.isCurrent ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-muted-foreground'}>
                                    {badge.level}
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${badge.isCurrent ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-muted-foreground/50'
                                      }`}
                                    style={{ width: `${Math.min(100, badge.level * 10)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* GitHub Native Achievements Section */}
              {profile.githubNativeAchievements && profile.githubNativeAchievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Github className="h-5 w-5 text-primary" />
                      GitHub Native Achievements
                      <Badge variant="secondary" className="ml-2">
                        {profile.githubNativeAchievements.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {profile.githubNativeAchievements.map((achievement) => (
                        <motion.div
                          key={achievement.slug}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="group relative overflow-hidden rounded-lg border-2 border-primary/20 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg"
                        >
                          <div className="flex items-start gap-3">
                            {/* Achievement Image */}
                            <div className="relative flex-shrink-0">
                              <img
                                src={achievement.image}
                                alt={achievement.name}
                                className="h-16 w-16 rounded-lg object-contain"
                                onError={(e) => {
                                  // Fallback to Trophy icon if image fails to load
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const fallback = target.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = 'flex'
                                }}
                              />
                              <div className="hidden h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                                <Trophy className="h-8 w-8 text-primary" />
                              </div>
                            </div>

                            {/* Achievement Info */}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">{achievement.name}</h4>
                                {achievement.tier && (
                                  <Badge variant="outline" className="text-xs">
                                    {achievement.tier}
                                  </Badge>
                                )}
                              </div>
                              {achievement.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {achievement.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Hover effect gradient */}
                          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Custom Achievement Progress */}
              <AchievementProgressDisplay
                achievements={profile.achievementProgress as any || []}
                title="Custom Achievements"
                showProgress={true}
                groupBy="category"
              />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="mx-auto mb-4 h-12 w-12" />
                    <p>Activity timeline coming soon!</p>
                    <p className="text-sm">We're working on bringing you detailed contribution insights.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
