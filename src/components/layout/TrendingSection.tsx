"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge, Card, CardContent } from "../ui"
import { TrendingUp, Star, GitFork, ArrowRight, ExternalLink, Users, FolderOpen, Flame } from "lucide-react"
import { Button } from "../ui/button"
import { ScrapedTrendingRepo, ScrapedTrendingDeveloper } from "@/types/github.types"
import Link from "next/link"
import { getLanguageColor } from "@/lib/utils"

const TrendingSection = () => {
  // State management
  const [activeTab, setActiveTab] = useState<"repos" | "developers">("repos")
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [repos, setRepos] = useState<ScrapedTrendingRepo[]>([])
  const [developers, setDevelopers] = useState<ScrapedTrendingDeveloper[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrendingRepos = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/trending/repos?since=${timePeriod}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch trending repositories")
      }

      const data = await response.json()
      setRepos(data.data?.repos || [])
    } catch (err) {
      console.error("Error fetching trending repos:", err)
      setError("Failed to load trending repositories")
      setRepos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingDevelopers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/trending/developers?since=${timePeriod}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch trending developers")
      }

      const data = await response.json()
      setDevelopers(data.data?.developers || [])
    } catch (err) {
      console.error("Error fetching trending developers:", err)
      setError("Failed to load trending developers")
      setDevelopers([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when tab or time period changes
  useEffect(() => {
    if (activeTab === "repos") {
      fetchTrendingRepos()
    } else {
      fetchTrendingDevelopers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, timePeriod])

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold md:text-4xl">Trending on GitHub</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Discover the most popular repositories and developers right now
            </p>
          </motion.div>
        </div>

        {/* Tab and Time Period Selection */}
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* Tab Selection */}
          <div className="flex gap-2 rounded-lg bg-background p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("repos")}
              className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${activeTab === "repos"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Repositories
            </button>
            <button
              onClick={() => setActiveTab("developers")}
              className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${activeTab === "developers"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Developers
            </button>
          </div>

          {/* Time Period Selection */}
          <div className="flex gap-2 rounded-lg bg-background p-1 shadow-sm">
            {(["daily", "weekly", "monthly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-all ${timePeriod === period
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mx-auto max-w-md rounded-lg bg-destructive/10 p-4 text-center text-destructive">
            {error}
          </div>
        )}

        {/* Trending Repositories List */}
        {activeTab === "repos" && !loading && !error && (
          <div className="max-w-4xl mx-auto space-y-3">
            {repos.map((repo, index) => (
              <motion.div
                key={repo.url}
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
                </div>

                {/* Repository Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-sm text-muted-foreground">
                      {repo.owner}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <Link
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:text-primary line-clamp-1 break-words"
                      title={repo.name}
                    >
                      {repo.name}
                    </Link>
                  </div>

                  {repo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {repo.language && (
                      <div
                        className="inline-block border transform -skew-x-20 rounded"
                        style={{
                          borderColor: getLanguageColor(repo.language),
                          color: getLanguageColor(repo.language),
                          backgroundColor: `${getLanguageColor(repo.language)}66`
                        }}
                      >
                        <span className="block px-2 font-medium text-sm transform skew-x-20 whitespace-nowrap">
                          {repo.language}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span><Star className="h-4 w-4 text-yellow-400" /></span>
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span><GitFork className="h-4 w-4 text-blue-400" /></span>
                      <span>{repo.forks}</span>
                    </div>
                    {/* Built by Contributors */}
                    {repo.builtBy && repo.builtBy.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Built by</span>
                        <div className="flex -space-x-1.5">
                          {repo.builtBy.slice(0, 3).map((contributor, idx) => (
                            <a
                              key={idx}
                              href={contributor.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block transition-transform hover:z-10 hover:scale-110"
                              title={`@${contributor.username}`}
                            >
                              <img
                                src={contributor.avatarUrl}
                                alt={`@${contributor.username}`}
                                className="h-5 w-5 rounded-full border-2 border-background"
                              />
                            </a>
                          ))}
                          {repo.builtBy.length > 3 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                              +{repo.builtBy.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stars earned today */}
                <div className="hidden md:flex flex-wrap gap-1 max-w-1/3">
                  <Badge variant="outline"
                    className="text-xs border-none hover:bg-[#4493f8] hover:text-primary-foreground text-[#4493f8] bg-[#4493f8]/10 transition-color"
                  >
                    {repo.todayStars}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Trending Developers List */}
        {activeTab === "developers" && !loading && !error && (
          <div className="max-w-4xl mx-auto space-y-3">
            {developers.map((dev, index) => (
              <motion.div
                key={dev.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="min-w-0 group flex items-center justify-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                {/* Name and Username */}
                <div className="flex items-center gap-4 w-5/12 min-w-0">
                  {/* Ranking */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <div className={`text-lg font-bold ${index < 3 ? 'text-yellow-500' : 'text-muted-foreground'
                      }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Developer Avatar */}
                    {dev.avatarUrl && (
                      <img
                        src={dev.avatarUrl}
                        alt={dev.username}
                        className="h-14 w-14 rounded-full border-2 border-primary/10 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={dev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-medium hover:text-primary truncate"
                        title={dev.name}>
                        {dev.name}
                      </Link>
                      <Link
                        href={dev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary hover:underline truncate block"
                      >
                        @{dev.username}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Popular Repository */}
                {dev.repoName && (
                  <div className="relative repo rounded-md bg-gradient-to-r from-muted/50 to-muted/20 p-2 w-7/12">
                    <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
                      <Flame className="h-2.5 w-2.5" />
                      <span>Popular repo</span>
                    </div>
                    {dev.repoUrl ? (
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-4 w-4 inline" />
                        <Link
                          href={dev.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-xs font-semibold hover:text-primary hover:underline truncate block"
                        >
                          {dev.repoName}
                        </Link>
                      </div>
                    ) : (
                      <div className="font-medium text-xs truncate">{dev.repoName}</div>
                    )}
                    {dev.repoDescription && (
                      <p className="line-clamp-1 text-[10px] text-muted-foreground mt-0.5">
                        {dev.repoDescription}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* View More Button */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Button
              onClick={() => window.open("https://github.com/trending", "_blank")}
              size="lg"
              variant="outline"
              className="group"
            >
              View All on GitHub
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default TrendingSection
