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
import Loader from "@/components/ui/loader"

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
      <div className="relative min-h-screen bg-background">
        <div className="absolute inset-0 bg-radial from-background from-40% to-violet-500 to-90% opacity-10" />
        <div className="container mx-auto h-screen flex items-center justify-center">
            <Loader className="w-full" />
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
          <Card className="relative overflow-hidden bg-card/80 backdrop-blur-sm border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <CardContent className="relative p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <Avatar className="h-32 w-32 border-4 border-primary/30 shadow-lg">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.login} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {profile.login && profile.login.length > 0 ? profile.login[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-foreground">{profile.name || profile.login}</h1>
                    <p className="text-lg text-muted-foreground">@{profile.login}</p>
                    {profile.bio && <p className="mt-3 text-muted-foreground leading-relaxed">{profile.bio}</p>}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-lg">Power Level {profile.powerLevel}</span>
                        <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/30">
                          {profile.points.toLocaleString()} points
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress to Level {profile.powerLevel + 1}</span>
                        <span className="font-medium">
                          {profile.pointsToNext.toLocaleString()} / {profile.nextLevelCost.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={profile.powerProgress} className="h-2" />
                    </div>
                  </div>

                  {/* GitHub Native Achievements Preview */}
                  {profile.githubNativeAchievements && profile.githubNativeAchievements.length > 0 && (
                    <div className="mb-6">
                      <p className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                          <Github className="h-3 w-3 text-primary" />
                        </div>
                        GitHub Achievements
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.githubNativeAchievements.slice(0, 4).map((achievement) => (
                          <div
                            key={achievement.slug}
                            className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
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
                            <span className="font-medium text-foreground">{achievement.name}</span>
                            {achievement.tier && (
                              <span className="text-muted-foreground text-[10px] bg-muted/30 px-1.5 py-0.5 rounded-full">
                                {achievement.tier}
                              </span>
                            )}
                          </div>
                        ))}
                        {profile.githubNativeAchievements.length > 4 && (
                          <div className="flex items-center rounded-xl border border-dashed border-muted px-3 py-2 text-xs text-muted-foreground bg-muted/20">
                            +{profile.githubNativeAchievements.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Trending Developer Badges */}
                  {profile.trendingDeveloperBadges && profile.trendingDeveloperBadges.length > 0 && (
                    <div className="mb-6">
                      <p className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20">
                          <Flame className="h-3 w-3 text-orange-500" />
                        </div>
                        Trending Developer
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.trendingDeveloperBadges.map((badge) => {
                          const displayRank = badge.isCurrent ? badge.currentRank : badge.bestRank
                          return (
                            <div
                              key={badge.timePeriod}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all duration-200 ${badge.isCurrent
                                ? 'border-orange-500/50 bg-orange-500/10 hover:border-orange-500 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                                : 'border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50'
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
                    <div className="mb-6">
                      <p className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20">
                          <Award className="h-3 w-3 text-accent" />
                        </div>
                        Top Custom Achievements
                      </p>
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
                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all duration-200 hover:scale-105 ${rarityColor}`}
                                title={`${achievement.achievement.name} - ${achievement.achievement.description}`}
                              >
                                <IconComponent className="h-4 w-4" />
                                <span className="font-medium">{achievement.achievement.name}</span>
                                <span className="text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-full text-[10px]">
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

                  <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted/30">
                          <MapPin className="h-3 w-3" />
                        </div>
                        {profile.location}
                      </div>
                    )}
                    {profile.blog && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted/30">
                          <LinkIcon className="h-3 w-3" />
                        </div>
                        <a
                          href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {profile.blog}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted/30">
                        <Calendar className="h-3 w-3" />
                      </div>
                      Joined {formatProfileDate(profile.created_at)}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
                    <Button variant="outline" className="border-border/50 hover:bg-muted/50">Follow</Button>
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
          <Card className="group transition-all hover:scale-105 hover:shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.totalStars.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Stars</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105 hover:shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 group-hover:bg-accent/30 transition-colors">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.followers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105 hover:shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.public_repos.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Public Repos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105 hover:shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/20 group-hover:bg-chart-1/30 transition-colors">
                  <TrendingUp className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.totalCommits.toLocaleString()}</div>
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
          <Card className="group transition-all hover:scale-105 hover:shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <GitFork className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.totalForks.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Forks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105 hover:shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.totalWatchers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Watchers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105 hover:shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.totalPRs.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Pull Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:scale-105 hover:shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.totalIssues.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-card/80 backdrop-blur-sm border-border/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Overview</TabsTrigger>
              <TabsTrigger value="repositories" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Repositories</TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Insights</TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Achievements</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Languages */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
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
                            <span className="text-foreground">{language}</span>
                            <span className="text-muted-foreground">{count} repos</span>
                          </div>
                          <Progress value={percentage} className="h-2 bg-muted/30" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Contribution Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Streak</span>
                      <span className="font-semibold text-foreground">{profile.contributionStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Longest Streak</span>
                      <span className="font-semibold text-foreground">{profile.longestStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Contributions</span>
                      <span className="font-semibold text-foreground">{profile.totalContributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Year</span>
                      <span className="font-semibold text-foreground">{profile.thisYearContributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last 365 Days</span>
                      <span className="font-semibold text-foreground">{profile.last365Contributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-semibold text-foreground">{profile.monthlyContributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Week</span>
                      <span className="font-semibold text-foreground">{profile.weeklyContributions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Today</span>
                      <span className="font-semibold text-foreground">{profile.dailyContributions.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Activity Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total PRs</span>
                      <span className="font-semibold text-foreground">{profile.totalPRs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Merged PRs</span>
                      <span className="font-semibold text-foreground">{profile.mergedPullRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Issues</span>
                      <span className="font-semibold text-foreground">{profile.totalIssues.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closed Issues</span>
                      <span className="font-semibold text-foreground">{profile.closedIssues.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code Reviews</span>
                      <span className="font-semibold text-foreground">{profile.totalReviews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Following</span>
                      <span className="font-semibold text-foreground">{profile.following.toLocaleString()}</span>
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
                    <Card key={repo.id} className="transition-all hover:shadow-lg hover:scale-[1.02] bg-card/80 backdrop-blur-sm border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-2 font-semibold text-foreground">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                              >
                                {repo.name}
                              </a>
                            </h3>
                            {repo.description && <p className="mb-3 text-sm text-muted-foreground leading-relaxed">{repo.description}</p>}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {repo.language && (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                  <span className="text-foreground">{repo.language}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Star className="h-3 w-3" />
                                <span className="text-foreground">{repo.stargazers_count}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <GitFork className="h-3 w-3" />
                                <span className="text-foreground">{repo.forks_count}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-semibold text-foreground">No Repositories Found</h3>
                      <p className="text-muted-foreground">This user doesn't have any public repositories yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Repository Insights */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Repository Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Repos with Stars</span>
                      <span className="font-semibold text-foreground">{profile.reposWithStars.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Repos with Forks</span>
                      <span className="font-semibold text-foreground">{profile.reposWithForks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contributed To</span>
                      <span className="font-semibold text-foreground">{profile.contributedTo.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">External Contributors</span>
                      <span className="font-semibold text-foreground">{profile.externalContributors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dependency Usage</span>
                      <span className="font-semibold text-foreground">{profile.dependencyUsage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language Count</span>
                      <span className="font-semibold text-foreground">{profile.languageCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Top Language %</span>
                      <span className="font-semibold text-foreground">{profile.topLanguagePercentage.toLocaleString()}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rare Language Repos</span>
                      <span className="font-semibold text-foreground">{profile.rareLanguageRepos.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Language Distribution */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
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
                            <span className="text-foreground">{language}</span>
                            <span className="text-muted-foreground">{count} repos ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2 bg-muted/30" />
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
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Trending Developer Badges
                      <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-500 border-orange-500/30">
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
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Github className="h-5 w-5 text-primary" />
                      GitHub Native Achievements
                      <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/30">
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
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="mx-auto mb-4 h-12 w-12" />
                    <p className="text-foreground">Activity timeline coming soon!</p>
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
