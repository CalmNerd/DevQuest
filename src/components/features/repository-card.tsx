"use client"

import type React from "react"
import { motion } from "framer-motion"
import {
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Calendar,
  Code,
  Tag,
  Users,
  Shield,
  Archive,
  Lock,
  Globe,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GitHubSearchRepo } from '@/types/github.types'
import githubColors from "@/lib/github-colors.json"
import Link from "next/link"

interface RepositoryCardProps {
  repository: GitHubSearchRepo
  index?: number
  showTrending?: boolean
  trendScore?: number
}

export default function RepositoryCard({
  repository,
  index = 0,
  showTrending = false,
  trendScore
}: RepositoryCardProps) {

  const getLanguageColor = (language: string) => {
    return (githubColors as any)[language] || "#6b7280"
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInHours < 1) {
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInDays < 365) {
      return `${diffInDays}d ago`
    } else {
      return `${diffInYears}y ago`
    }
  }

  const formatDescription = (description: string | null) => {
    if (!description) return ""

    // Clean up description
    let cleaned = description.replace(/\n/g, ' ')
    cleaned = cleaned.replace(/\s+/g, ' ')
    cleaned = cleaned.trim()

    // Limit to reasonable length for preview
    if (cleaned.length > 150) {
      cleaned = cleaned.substring(0, 150) + '...'
    }

    return cleaned
  }

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} KB`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} MB`
    return `${(size / (1024 * 1024)).toFixed(1)} GB`
  }

  const getVisibilityIcon = () => {
    if (repository.archived) return <Archive className="h-4 w-4 text-orange-400" />
    if (repository.disabled) return <Lock className="h-4 w-4 text-red-400" />
    if (repository.private) return <Lock className="h-4 w-4 text-red-400" />
    return <Globe className="h-4 w-4 text-green-400" />
  }

  const getVisibilityText = () => {
    if (repository.archived) return "Archived"
    if (repository.disabled) return "Disabled"
    if (repository.private) return "Private"
    return "Public"
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="transition-all hover:shadow-md py-0 hover:shadow-primary/10 h-full">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex gap-4 h-full">
            <div className="flex-1 space-y-3 flex flex-col">

              {/* Repository Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6 rounded-sm border">
                      <AvatarImage src={repository.owner.avatar_url} alt={repository.owner.login} />
                      <AvatarFallback>{repository.owner.login[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm text-muted-foreground">
                        {repository.owner.login}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <a
                        href={repository.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-lg hover:text-primary line-clamp-1 break-words"
                        title={repository.full_name}
                      >
                        {repository.name}
                        <ExternalLink className="h-4 w-4 inline mx-1" />
                      </a>
                    </div>
                  </div>

                  {/* Description */}
                  {repository.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {formatDescription(repository.description)}
                    </p>
                  )}
                </div>

                {/* Trending Badge */}
                {showTrending && trendScore && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    🔥 Trending
                  </Badge>
                )}
              </div>

              {/* Repository Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium">{repository.stargazers_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">{repository.forks_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-purple-400" />
                  <span className="font-medium">{repository.watchers_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Code className="h-4 w-4 text-green-400" />
                  <span className="font-medium">{repository.open_issues_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <span className="font-medium">{formatSize(repository.size)}</span>
                </div>
              </div>

              {/* Repository Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {getTimeAgo(repository.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {getTimeAgo(repository.updated_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getVisibilityIcon()}
                  <span>{getVisibilityText()}</span>
                </div>
                {repository.fork && (
                  <Badge variant="outline" className="text-xs">
                    Fork
                  </Badge>
                )}
              </div>

              {/* Language and Topics */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {/* Primary Language */}
                  {repository.language && (
                    <div
                      className="inline-block border transform -skew-x-20 rounded"
                      style={{
                        borderColor: getLanguageColor(repository.language),
                        color: getLanguageColor(repository.language),
                        backgroundColor: `${getLanguageColor(repository.language)}66`
                      }}
                    >
                      <span className="block px-2 font-medium text-sm transform skew-x-20 whitespace-nowrap">
                        {repository.language}
                      </span>
                    </div>
                  )}

                  {/* License */}
                  {repository.license && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {repository.license.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Topics */}
              {repository.topics && repository.topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {repository.topics.slice(0, 5).map((topic, topicIndex) => (
                    <Badge
                      key={topicIndex}
                      variant="outline"
                      className="text-xs rounded-md border-none"
                      style={{
                        color: '#6b7280',
                        backgroundColor: '#6b72804D'
                      }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {topic}
                    </Badge>
                  ))}
                  {repository.topics.length > 5 && (
                    <Badge
                      variant="outline"
                      className="text-xs rounded-md border-none cursor-help"
                      style={{
                        color: '#6b7280',
                        backgroundColor: '#6b72804D'
                      }}
                      title={repository.topics.slice(5).join(', ')}
                    >
                      +{repository.topics.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Homepage Link */}
              {repository.homepage && (
                <div className="pt-2">
                  <a
                    href={repository.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-4 w-4" />
                    Visit homepage
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
