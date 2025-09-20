"use client"

import type React from "react"

import { useState } from "react"
import { Search, Trophy, Users, Star, GitBranch, Zap, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ProfileCardTrigger } from "@/components/features/discord-profile-card"
import Link from "next/link"
import WorldMap from "@/components/ui/icons/WorldMap"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/profile/${searchQuery.trim()}`
    }
  }

  const features = [
    {
      icon: Trophy,
      title: "Dynamic Leaderboards",
      description: "Compete on daily, weekly, monthly, and yearly contribution leaderboards",
    },
    {
      icon: Star,
      title: "Achievement Badges",
      description: "Earn unique badges for milestones, streaks, and special accomplishments",
    },
    {
      icon: Users,
      title: "Discord-Style Profiles",
      description: "Rich, interactive profile cards with GitHub stats and achievements",
    },
    {
      icon: GitBranch,
      title: "Issue Explorer",
      description: "Discover and filter GitHub issues across repositories and organizations",
    },
  ]

  const mockLeaderboard = [
    { rank: 1, username: "torvalds", avatar: "/placeholder.svg?height=40&width=40", score: 2847, metric: "commits" },
    { rank: 2, username: "gaearon", avatar: "/placeholder.svg?height=40&width=40", score: 2156, metric: "commits" },
    {
      rank: 3,
      username: "sindresorhus",
      avatar: "/placeholder.svg?height=40&width=40",
      score: 1923,
      metric: "commits",
    },
    { rank: 4, username: "tj", avatar: "/placeholder.svg?height=40&width=40", score: 1847, metric: "commits" },
    { rank: 5, username: "addyosmani", avatar: "/placeholder.svg?height=40&width=40", score: 1654, metric: "commits" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Github className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">DevQuest</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/leaderboards">Leaderboards</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/explore">Explore</Link>
              </Button>
              <Button variant="outline">Sign In</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 ">
          <WorldMap
            responsive={true}
            fillColor="#262626"
            className="opacity-15"
          />
        </div>
        {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" /> */}
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl"
          >
            <h1 className="mb-6 text-4xl font-semibold text-balance space-x-4 whitespace-nowrap">
              <span className="text-[#F34B7D] px-4 py-2 -skew-x-20 rounded-md bg-[#F34B7D]/40 inline-block"><span className="skew-x-20 rounded inline-block">Compete.</span> </span>
              <span className="text-[#4B68FE] px-4 py-2 -skew-x-20 rounded-md bg-[#4B68FE]/40 inline-block"><span className="skew-x-20 rounded inline-block">Contribute.</span> </span>
              <span className="text-[#22E26F] px-4 py-2 -skew-x-20 rounded-md bg-[#22E26F]/40 inline-block"><span className="skew-x-20 rounded inline-block">Hunt Bounties.</span></span>
            </h1>
            <p className="mb-8 text-md text-muted-foreground text-pretty max-w-xl mx-auto">
              Make open-source contributions, discover bounty-paying issue/repositories and rank among developers across the globe.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mx-auto mb-12 max-w-md">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter GitHub username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="animate-glow">
                  <Zap className="mr-2 h-4 w-4" />
                  Rank Up
                </Button>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-card/50 p-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Developers Ranked</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg bg-card/50 p-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-accent">500K+</div>
                <div className="text-sm text-muted-foreground">Commits Tracked</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-lg bg-card/50 p-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-secondary">50+</div>
                <div className="text-sm text-muted-foreground">Achievement Badges</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-lg bg-card/50 p-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-chart-1">24/7</div>
                <div className="text-sm text-muted-foreground">Live Updates</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Game-Changing Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to gamify your GitHub experience and compete with developers worldwide
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group h-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Leaderboard Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Live Leaderboard</h2>
            <p className="text-lg text-muted-foreground">See who's dominating the GitHub rankings right now</p>
          </div>

          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top Contributors This Week</h3>
                <Badge variant="secondary" className="animate-pulse">
                  Live
                </Badge>
              </div>

              <div className="space-y-4">
                {mockLeaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {entry.rank}
                    </div>
                    <ProfileCardTrigger username={entry.username} className="flex flex-1 items-center gap-4">
                      <img
                        src={entry.avatar || "/placeholder.svg"}
                        alt={entry.username}
                        className="h-10 w-10 rounded-full border-2 border-border"
                      />
                      <div className="flex-1">
                        <div className="font-medium hover:text-primary">{entry.username}</div>
                        <div className="text-sm text-muted-foreground">{entry.score} commits</div>
                      </div>
                    </ProfileCardTrigger>
                    <Trophy className="h-5 w-5 text-secondary" />
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button asChild>
                  <Link href="/leaderboards">View Full Leaderboards</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="mx-auto max-w-2xl bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-12">
              <h2 className="mb-4 text-3xl font-bold">Ready to Rank Up?</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join thousands of developers who are already gamifying their GitHub experience
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="animate-glow">
                  <Github className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline">
                  View Demo Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Github className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">DevQuest</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
