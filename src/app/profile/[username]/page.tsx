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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeDisplay, BadgeGrid } from '@/components/features/badge-display'
import { ContributionGraph } from '@/components/features/contribution-graph'
import { ProfileData } from "@/types"

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProfile = async (forceRefresh = false) => {
    try {
      setLoading(!profile)
      setRefreshing(forceRefresh)
      setError(null)

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

  if (loading && !profile) {
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

  if (!profile) return null

  const topLanguages = Object.entries(profile.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const totalLanguageRepos = Object.values(profile.topLanguages).reduce((sum, count) => sum + count, 0)

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
                  Cached {new Date(profile.lastUpdated).toLocaleTimeString()}
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
                  <AvatarFallback className="text-2xl">{profile.login[0].toUpperCase()}</AvatarFallback>
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

                  {profile.achievements.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-muted-foreground">Achievements</p>
                      <BadgeDisplay badgeIds={profile.achievements} maxDisplay={8} />
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
                      Joined {new Date(profile.created_at).toLocaleDateString()}
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
              <ContributionGraph contributionGraph={profile.contributionGraph} />
            </TabsContent>

            <TabsContent value="repositories" className="space-y-6">
              <div className="grid gap-4">
                {profile.repos.slice(0, 10).map((repo) => (
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
                ))}
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
              <BadgeGrid
                badgeIds={profile.achievements}
                title="Earned Achievements"
                emptyMessage="No achievements unlocked yet. Keep contributing to earn your first badge!"
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
