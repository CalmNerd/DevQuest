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
  ChevronDown,
  Download,
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
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/Header"

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
      {/* <div className="border-b border-border bg-card/50 backdrop-blur-sm">
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
      </div> */}

      <Header />


      <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="">
          {/* <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Year in a nutshell</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <span>this year</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download Stats
              </Button>
            </div>
          </div> */}

          <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-0 group transition-all hover:shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex flex-col gap-2">
                  <Avatar className="h-32 w-32 border-4 border-primary/30 shadow-lg">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.login} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {profile.login && profile.login.length > 0 ? profile.login[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {profile.name || profile.login}
                      </span>
                      <div
                        className="flex items-center justify-center rounded-full bg-primary/20"
                        title={`Power Level total ${profile.points.toLocaleString()} points | Progress to Level ${profile.powerLevel + 1} - ${profile.pointsToNext.toLocaleString()} / ${profile.nextLevelCost.toLocaleString()}`}>
                        <div className="px-2 py-1">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="size-8 flex items-center justify-center shrink-0 bg-primary/10 text-primary text-xl border-primary/30">
                          {profile.powerLevel}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">@{profile.login}</span>
                  </div>
                  {profile.bio && (
                    <div>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {profile.bio}
                      </span>
                    </div>
                  )}
                  <div>
                    {/* GitHub Native/ custom Achievements Preview */}
                    <div className="flex flex-wrap gap-1">
                      {profile.githubNativeAchievements && profile.githubNativeAchievements.length > 0 && (
                        <>
                          {profile.githubNativeAchievements.map((achievement: any, index: number) => (
                            <div
                              key={`${achievement.slug}-${index}`}
                              className="relative group"
                              title={`${achievement.name}${achievement.tier ? ` (${achievement.tier})` : ''}${achievement.description ? ` - ${achievement.description}` : ''}`}
                            >
                              <img
                                src={achievement.image}
                                alt={achievement.name}
                                className="h-6 w-6 rounded-sm border border-border/50 hover:border-primary/50 transition-colors"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              {achievement.tier && (
                                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-yellow-400 text-[6px] flex items-center justify-center font-bold text-black">
                                  {achievement.tier}
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}

                      {profile.achievementProgress && profile.achievementProgress.length > 0 && (
                        <>
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
                            .filter(achievement => achievement.sortLevel > 0)
                            .map((achievement) => {
                              const IconComponent = getIconComponent(achievement.achievement.icon)
                              const rarityColor = getRarityColor(achievement.achievement.rarity)

                              return (
                                <div
                                  key={achievement.achievement.id}
                                  className={`relative flex items-center gap-2 rounded-sm border p-1.5 ${rarityColor}`}
                                  title={`${achievement.achievement.name} | ${achievement.achievement.description}`}
                                >
                                  <IconComponent className="h-3 w-3" />

                                  {achievement.currentLevel && (
                                    <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full text-[6px] font-bold bg-yellow-400 flex items-center justify-center font-bold text-black">
                                      {achievement.currentLevel}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                        </>
                      )}
                    </div>

                    {/* Trending Developer Badges */}
                    {profile.trendingDeveloperBadges && profile.trendingDeveloperBadges.length > 0 && (
                      <div className="mt-4">
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
                  </div>

                  <div className="flex gap-2 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted/30">
                          <MapPin className="h-3 w-3" />
                        </div>
                        {profile.location}
                      </div>
                    )}
                    {profile.blog && (
                      <div className="flex items-center gap-1">
                        <Link
                          href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted/30">
                            <LinkIcon className="h-3 w-3" />
                          </div>
                        </Link>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted/30">
                        <Calendar className="h-3 w-3" />
                      </div>
                      Joined {formatProfileDate(profile.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/20 group-hover:bg-chart-1/30 transition-colors">
                    <TrendingUp className="h-6 w-6 text-chart-1" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{profile.totalContributions.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Contributions</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{profile.totalStars.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Stars</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{profile.followers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{profile.public_repos.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Public Repos</div>
                  </div>
                </div>
              </div>

              {/* Contribution Graph */}
              {profile.contributionGraph && (
                <ContributionGraph contributionGraph={profile.contributionGraph} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="">
          {/* <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Year in a nutshell</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <span>this year</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download Stats
              </Button>
            </div>
          </div> */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-0 group transition-all hover:shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Streaks */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 group transition-all hover:bg-card/60 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                        <Flame className="h-4 w-4 text-orange-500" />
                      </div>
                      Streaks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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

                {/* 2. Top Languages */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 group transition-all hover:bg-card/60 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      Top Languages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {topLanguages.slice(0, 5).map(([language, count]) => {
                        const percentage = totalLanguageRepos > 0 ? ((count as number) / totalLanguageRepos) * 100 : 0
                        return (
                          <div key={language} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-foreground">{language}</span>
                              <span className="text-muted-foreground">{count} repos ({percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-1.5 bg-muted/30" />
                          </div>
                        )
                      })}
                    </div>
                    <div className="pt-2 border-t border-border/50 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Languages</span>
                        <span className="font-semibold text-foreground">{profile.languageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Top Language %</span>
                        <span className="font-semibold text-foreground">{profile.topLanguagePercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rare Language Repos</span>
                        <span className="font-semibold text-foreground">{profile.rareLanguageRepos}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Repositories */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 group transition-all hover:bg-card/60 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                        <GitFork className="h-4 w-4 text-green-500" />
                      </div>
                      Top Repositories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 overflow-y-auto max-h-[300px] hide-scrollbar">
                    {profile.repos && profile.repos.length > 0 ? (
                      profile.repos.map((repo) => (
                        <div key={repo.id} className="p-3 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground hover:text-primary transition-colors">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {repo.name}
                              </a>
                            </h4>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {repo.description || 'No description available'}
                          </p>
                          {repo.language && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span>{repo.language}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                <span>{repo.stargazers_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GitFork className="h-3 w-3" />
                                <span>{repo.forks_count}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <BookOpen className="mx-auto mb-2 h-8 w-8" />
                        <p className="text-sm">No repositories available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 4. Rank & Stats */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 group transition-all hover:bg-card/60 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                        <Trophy className="h-4 w-4 text-purple-500" />
                      </div>
                      Rank & Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Stars</span>
                      <span className="font-semibold text-foreground">{profile.totalStars.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Forks</span>
                      <span className="font-semibold text-foreground">{profile.totalForks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Watchers</span>
                      <span className="font-semibold text-foreground">{profile.totalWatchers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Followers</span>
                      <span className="font-semibold text-foreground">{profile.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Following</span>
                      <span className="font-semibold text-foreground">{profile.following.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Public Repos</span>
                      <span className="font-semibold text-foreground">{profile.public_repos.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 5. Contributions & Activity */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 group transition-all hover:bg-card/60 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                        <GitBranch className="h-4 w-4 text-blue-500" />
                      </div>
                      Contributions & Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Commits</span>
                      <span className="font-semibold text-foreground">{profile.totalCommits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pull Requests</span>
                      <span className="font-semibold text-foreground">{profile.totalPRs.toLocaleString()} (Merged: {profile.mergedPullRequests.toLocaleString()})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issues</span>
                      <span className="font-semibold text-foreground">{profile.totalIssues.toLocaleString()} (Closed: {profile.closedIssues.toLocaleString()})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code Reviews</span>
                      <span className="font-semibold text-foreground">{profile.totalReviews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contributed To</span>
                      <span className="font-semibold text-foreground">{profile.contributedTo.toLocaleString()} repos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">External Contributors</span>
                      <span className="font-semibold text-foreground">{profile.externalContributors.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 6. More Insights */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 group transition-all hover:bg-card/60 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 group-hover:bg-accent/30 transition-colors">
                        <TrendingUp className="h-4 w-4 text-accent" />
                      </div>
                      More Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Repos with Stars</span>
                      <span className="font-semibold text-foreground">{profile.reposWithStars.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Repos with Forks</span>
                      <span className="font-semibold text-foreground">{profile.reposWithForks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dependency Usage</span>
                      <span className="font-semibold text-foreground">{profile.dependencyUsage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language Count</span>
                      <span className="font-semibold text-foreground">{profile.languageCount.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Top Languages</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {topLanguages.slice(0, 5).map(([lang]) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* <div className="grid grid-cols-3 gap-4">
            <div>streaks</div>
            <div>top language</div>
            <div>repo list- top repo on top</div>
            <div>Rank</div>
            <div>Contribution,commit Issues and pr</div>
            <div>more</div>
          </div> */}
        </div>
      </div>

    </div>
  )
}
