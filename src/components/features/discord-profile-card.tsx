"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { BadgeDisplay } from "./badge-display"
import type { UserProfile } from "@/types/github.types"

interface DiscordProfileCardProps {
  profile: UserProfile
  isOpen: boolean
  onClose: () => void
  position?: { x: number; y: number }
}

export function DiscordProfileCard({ profile, isOpen, onClose, position }: DiscordProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  const getStatusColor = () => {
    // Simulate online status based on recent activity
    const lastUpdate = new Date(profile.user.updated_at)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceUpdate < 1) return "bg-green-400"
    if (daysSinceUpdate < 7) return "bg-yellow-400"
    return "bg-gray-400"
  }

  const getStatusText = () => {
    const lastUpdate = new Date(profile.user.updated_at)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceUpdate < 1) return "Active today"
    if (daysSinceUpdate < 7) return "Active this week"
    return "Away"
  }

  const topLanguages = Object.entries(profile.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed z-50 w-full max-w-sm"
            style={{
              left: position ? Math.min(position.x, window.innerWidth - 400) : "50%",
              top: position ? Math.min(position.y, window.innerHeight - 600) : "50%",
              transform: position ? "none" : "translate(-50%, -50%)",
            }}
          >
            <Card className="overflow-hidden border-2 border-primary/20 bg-card/95 backdrop-blur-md shadow-2xl shadow-primary/10">
              {/* Header with Banner */}
              <div className="relative h-20 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/20 p-0 hover:bg-black/40"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="relative p-6 pt-0">
                {/* Avatar with Status */}
                <div className="relative -mt-10 mb-4">
                  <div className="relative inline-block">
                    <Avatar className="h-20 w-20 border-4 border-card ring-2 ring-primary/20">
                      <AvatarImage src={profile.user.avatar_url || "/placeholder.svg"} alt={profile.user.login} />
                      <AvatarFallback className="text-xl">{profile.user.login[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-card ${getStatusColor()}`}
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4 space-y-2">
                  <div>
                    <h3 className="text-xl font-bold">{profile.user.name || profile.user.login}</h3>
                    <p className="text-sm text-muted-foreground">@{profile.user.login}</p>
                  </div>

                  {profile.user.bio && <p className="text-sm text-muted-foreground line-clamp-2">{profile.user.bio}</p>}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
                    <span>{getStatusText()}</span>
                  </div>
                </div>

                {/* Badges */}
                {profile.achievements.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Achievements
                    </p>
                    <BadgeDisplay badgeIds={profile.achievements} size="sm" maxDisplay={6} />
                  </div>
                )}

                <Separator className="my-4" />

                {/* Stats Grid */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Star className="h-4 w-4" />
                      <span className="font-bold">{profile.totalStars.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Stars</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-accent">
                      <Users className="h-4 w-4" />
                      <span className="font-bold">{profile.user.followers.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-secondary">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-bold">{profile.user.public_repos}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Repos</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-chart-1">
                      <Zap className="h-4 w-4" />
                      <span className="font-bold">{profile.contributionStreak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Streak</p>
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
                  {profile.user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{profile.user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {new Date(profile.user.created_at).toLocaleDateString()}</span>
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
                    <a href={`https://github.com/${profile.user.login}`} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* View Full Profile */}
                <Button variant="ghost" size="sm" className="mt-3 w-full gap-2" asChild>
                  <a href={`/profile/${profile.user.login}`}>
                    <ExternalLink className="h-4 w-4" />
                    View Full Profile
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ProfileCardTriggerProps {
  username: string
  children: React.ReactNode
  profile?: UserProfile
  className?: string
}

export function ProfileCardTrigger({ username, children, profile, className }: ProfileCardTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number } | undefined>()
  const [profileData, setProfileData] = useState<UserProfile | null>(profile || null)
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: rect.right + 10,
      y: rect.top,
    })

    if (!profileData) {
      setLoading(true)
      try {
        const response = await fetch(`/api/github/${username}`)
        if (response.ok) {
          const data = await response.json()
          console.log("data.................", data)
          setProfileData(data)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }

    setIsOpen(true)
  }

  return (
    <>
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        {children}
      </div>

      {profileData && (
        <DiscordProfileCard
          profile={profileData}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          position={position}
        />
      )}

      {loading && isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-50 w-full max-w-sm"
          style={{
            left: position ? Math.min(position.x, window.innerWidth - 400) : "50%",
            top: position ? Math.min(position.y, window.innerHeight - 200) : "50%",
            transform: position ? "none" : "translate(-50%, -50%)",
          }}
        >
          <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  )
}
