"use client"

import type React from "react"
import { useState } from "react"
import {
  ExternalLink,
  Github,
  MapPin,
  Calendar,
  Star,
  Users,
  BookOpen,
  Zap,
  MessageCircle,
  UserPlus,
  GitCommit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatProfileDate } from "@/lib/date-formatter"
import type { UserProfile } from "@/types/github.types"
import type { AchievementProgress } from "@/services/api/achievement.service"

interface DiscordProfileDialogProps {
  username: string
  children: React.ReactNode
  profile?: UserProfile
  className?: string
}

export function DiscordProfileDialog({ username, children, profile, className }: DiscordProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [profileData, setProfileData] = useState<UserProfile | null>(profile || null)
  const [loading, setLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!profileData) {
      setLoading(true)
      try {
        // Fetch from database instead of GitHub API
        const response = await fetch(`/api/user-profile/${username}`)
        if (response.ok) {
          const data = await response.json()
          console.log("Database profile data:", data)
          const profileResponse = data.data || data
          
          // Validate the profile data before setting it
          if (profileResponse && 
              profileResponse.user && 
              profileResponse.user.login && 
              profileResponse.user.avatar_url !== null && 
              profileResponse.user.avatar_url !== undefined) {
            setProfileData(profileResponse)
            setIsOpen(true)
          } else {
            console.error("Invalid profile data received:", profileResponse)
          }
        } else {
          console.error("Failed to fetch profile from database:", response.statusText)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    } else {
      // Profile data already exists, validate it before opening
      if (profileData.user && 
          profileData.user.login && 
          profileData.user.avatar_url !== null && 
          profileData.user.avatar_url !== undefined) {
        setIsOpen(true)
      } else {
        console.error("Existing profile data is invalid:", profileData)
      }
    }
  }

  // Generate last 7 days contribution data
  const getLast7DaysContributions = () => {
    if (!profileData?.contributionGraph || !profileData.contributionGraph.weeks) {
      return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: 0
      }))
    }

    const today = new Date()
    const last7Days = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]

      // Find contribution for this date in the graph
      let count = 0
      for (const week of profileData.contributionGraph.weeks) {
        for (const day of week.contributionDays) {
          if (day.date === dateStr) {
            count = day.contributionCount
            break
          }
        }
        if (count > 0) break
      }

      last7Days.push({ date: dateStr, count })
    }

    return last7Days
  }

  const topLanguages = profileData ? Object.entries(profileData.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) : []

  // Check if profile data is valid and complete
  const isProfileValid = profileData && 
    profileData.user && 
    profileData.user.login && 
    profileData.user.avatar_url !== null && 
    profileData.user.avatar_url !== undefined

  return (
    <>
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto p-0 border-2 border-primary/20 bg-card/95 backdrop-blur-md shadow-2xl shadow-primary/10" showCloseButton={false}>
          {loading ? (
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </div>
          ) : isProfileValid ? (
            <>
              {/* Header with Banner */}
              <div className="relative h-20 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/20 p-0 hover:bg-black/40"
                >
                  <ExternalLink className="h-4 w-4 rotate-45" />
                </Button>
                <DialogHeader className="sr-only">
                  <DialogTitle>Profile: {profileData.user.name || profileData.user.login}</DialogTitle>
                </DialogHeader>
              </div>

            <div className="relative p-6 pt-0">
              {/* Avatar */}
              <div className="relative -mt-10 mb-4">
                <div className="relative inline-block">
                  <Avatar className="h-20 w-20 border-4 border-card ring-2 ring-primary/20">
                    <AvatarImage src={profileData.user.avatar_url || "/placeholder.svg"} alt={profileData.user.login} />
                    <AvatarFallback className="text-xl">{profileData.user.login[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* User Info */}
              <div className="mb-4 space-y-2">
                <div>
                  <h3 className="text-xl font-bold">{profileData.user.name || profileData.user.login}</h3>
                  <p className="text-sm text-muted-foreground">@{profileData.user.login}</p>
                </div>

                {profileData.user.bio && <p className="text-sm text-muted-foreground line-clamp-2">{profileData.user.bio}</p>}
              </div>

              {/* Achievements Section */}
              {((profileData.achievementProgress && profileData.achievementProgress.length > 0) ||
                (profileData.githubNativeAchievements && profileData.githubNativeAchievements.length > 0) ||
                (profileData.trendingDeveloperBadges && profileData.trendingDeveloperBadges.length > 0)) && (
                <div className="mb-4 space-y-3">
                  {/* Custom Achievements */}
                  {profileData.achievementProgress && profileData.achievementProgress.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Custom Achievements
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {profileData.achievementProgress
                          .filter((achievement: AchievementProgress) => achievement.isUnlocked)
                          .sort((a: AchievementProgress, b: AchievementProgress) => (b.achievement.points || 0) - (a.achievement.points || 0))
                          .slice(0, 3)
                          .map((achievement: AchievementProgress) => (
                            <Badge
                              key={achievement.achievement.id}
                              variant="secondary"
                              className="text-xs"
                              title={`${achievement.achievement.name} - ${achievement.achievement.description}`}
                            >
                              {achievement.achievement.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* GitHub Native Achievements */}
                  {profileData.githubNativeAchievements && profileData.githubNativeAchievements.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        GitHub Achievements
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {profileData.githubNativeAchievements.slice(0, 4).map((achievement: any, index: number) => (
                          <div
                            key={`${achievement.slug}-${index}`}
                            className="relative group"
                            title={`${achievement.name}${achievement.tier ? ` (${achievement.tier})` : ''}${achievement.description ? ` - ${achievement.description}` : ''}`}
                          >
                            <img
                              src={achievement.image}
                              alt={achievement.name}
                              className="h-6 w-6 rounded-full border border-border/50 hover:border-primary/50 transition-colors"
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
                      </div>
                    </div>
                  )}

                  {/* Trending Developer Badges */}
                  {profileData.trendingDeveloperBadges && profileData.trendingDeveloperBadges.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Trending Status
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {profileData.trendingDeveloperBadges
                          .filter((badge: any) => badge.isCurrent)
                          .slice(0, 2)
                          .map((badge: any, index: number) => (
                            <Badge
                              key={`trending-${badge.timePeriod}-${index}`}
                              variant="default"
                              className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
                              title={`Currently trending in ${badge.timePeriod} leaderboard${badge.language ? ` (${badge.language})` : ''} - Rank #${badge.currentRank || 'N/A'}`}
                            >
                              🔥 {badge.timePeriod.charAt(0).toUpperCase() + badge.timePeriod.slice(1)}
                              {badge.currentRank && ` #${badge.currentRank}`}
                            </Badge>
                          ))}
                        {profileData.trendingDeveloperBadges
                          .filter((badge: any) => !badge.isCurrent)
                          .slice(0, 1)
                          .map((badge: any, index: number) => (
                            <Badge
                              key={`past-trending-${badge.timePeriod}-${index}`}
                              variant="outline"
                              className="text-xs"
                              title={`Previously trended in ${badge.timePeriod} leaderboard${badge.language ? ` (${badge.language})` : ''} - Best rank #${badge.bestRank || 'N/A'}`}
                            >
                              ⭐ {badge.timePeriod.charAt(0).toUpperCase() + badge.timePeriod.slice(1)}
                              {badge.bestRank && ` #${badge.bestRank}`}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-4" />

              {/* Stats Grid */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <Star className="h-4 w-4" />
                    <span className="font-bold">{(profileData.totalStars || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-accent">
                    <Users className="h-4 w-4" />
                    <span className="font-bold">{(profileData.user.followers || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-secondary">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-bold">{profileData.user.public_repos || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Repos</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-chart-1">
                    <GitCommit className="h-4 w-4" />
                    <span className="font-bold">{(profileData.totalContributions || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contributions</p>
                </div>
              </div>

              {/* Last 7 Days Contribution Graph */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Last 7 Days
                </p>
                <div className="flex gap-1 justify-center">
                  {getLast7DaysContributions().map((day, index) => {
                    const maxContributions = Math.max(...getLast7DaysContributions().map(d => d.count), 1)
                    const intensity = day.count === 0 ? 0 : Math.min(4, Math.ceil((day.count / maxContributions) * 4))
                    const bgColor = intensity === 0 ? 'bg-gray-100 dark:bg-gray-800' :
                      intensity === 1 ? 'bg-green-200 dark:bg-green-900' :
                        intensity === 2 ? 'bg-green-300 dark:bg-green-700' :
                          intensity === 3 ? 'bg-green-400 dark:bg-green-600' : 'bg-green-500 dark:bg-green-500'

                    return (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${bgColor} border border-border/20`}
                        title={`${day.date}: ${day.count} contributions`}
                      />
                    )
                  })}
                </div>
                <div className="mt-1 text-center text-xs text-muted-foreground">
                  {getLast7DaysContributions().reduce((sum, day) => sum + day.count, 0)} contributions this week
                </div>
              </div>

              {/* Top Languages */}
              {topLanguages.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Top Languages
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {topLanguages.map(([language, count]) => (
                      <Badge key={language} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="mb-4 space-y-2 text-xs text-muted-foreground">
                {profileData.user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{profileData.user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {formatProfileDate(profileData.user.created_at || profileData.user.updated_at)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  <UserPlus className="h-4 w-4" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
                  <a href={`https://github.com/${profileData.user.login}`} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* View Full Profile */}
              <Button variant="ghost" size="sm" className="mt-3 w-full gap-2" asChild>
                <a href={`/profile/${profileData.user.login}`}>
                  <ExternalLink className="h-4 w-4" />
                  View Full Profile
                </a>
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Failed to load profile data.</p>
          </div>
        )}
      </DialogContent>
      </Dialog>
    </>
  )
}
