"use client"

import type React from "react"
import { motion } from "framer-motion"
import {
  Star,
  GitFork,
  ExternalLink,
  Calendar,
  Archive,
  Lock,
  Globe,
  Package,
  Bug,
  Scale,
  SquarePen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GitHubSearchRepo } from '@/types/github.types'
import { formatMarkdownPreview, formatSize, getLanguageColor, getTimeAgo } from "@/lib/utils"

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
      <Card className="transition-all hover:bg-muted/50 py-0 h-full min-h-[280px]">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex gap-4 h-full">
            <div className="flex-1 flex flex-col justify-between min-h-full">
              {/* Main Content Area */}
              <div className="space-y-3 flex-1">
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
                        </a>
                      </div>
                    </div>

                    {/* Description */}
                    {repository.description ? (
                      <p className="text-sm text-muted-foreground h-10 line-clamp-2">
                        {formatMarkdownPreview(repository.description)}
                      </p>
                    ) : (
                      /* Placeholder for consistent spacing */
                      <div className="h-8" />
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

                  {/* <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-purple-400" />
                    ----NOT SUPPORTED BY THIS API, NEED TO MAKE 1 EXTRA API REQUEST TO FETCH THIS----
                    <span className="font-medium">{(repository.subscribers_count ?? 0).toLocaleString()}</span>
                  </div> */}
                  <div className="flex items-center gap-1">
                    <Bug className="h-4 w-4 text-rose-400" />
                    <span className="font-medium">{repository.open_issues_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-indigo-400" />
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
                    <SquarePen className="h-4 w-4" />
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

                {/* Language and License */}
                <div className="flex flex-wrap gap-2 h-6">
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
                    <Badge variant="outline" className="group text-muted-foreground relative text-xs rounded-none border-none">
                      <span className="absolute inset-0 border-yellow-300/60 bg-yellow-400/10 group-hover:bg-yellow-400/15 dark:border-yellow-300/30"></span>
                      {/* <svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] left-[-2px] fill-yellow-300 dark:fill-yellow-300/50">
                          <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
                        </svg>
                        <svg width="5" height="5" viewBox="0 0 5 5" className="absolute top-[-2px] right-[-2px] fill-yellow-300 dark:fill-yellow-300/50">
                          <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
                        </svg>
                        <svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] left-[-2px] fill-yellow-300 dark:fill-yellow-300/50">
                          <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
                        </svg>
                        <svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] right-[-2px] fill-yellow-300 dark:fill-yellow-300/50">
                          <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
                        </svg> */}
                      <div className="size-1 border-l border-t absolute left-0 top-0 border-yellow-400/80" />
                      <div className="size-1 border-r border-t absolute right-0 top-0 border-yellow-400/80" />
                      <div className="size-1 border-l border-b absolute left-0 bottom-0 border-yellow-400/80" />
                      <div className="size-1 border-r border-b absolute right-0 bottom-0 border-yellow-400/80" />
                      <Scale className="h-3 w-3 mr-1" />
                      {repository.license.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Footer Area - Topics and Homepage */}
              <div className="mt-4 space-y-2">
                {/* Topics */}
                {repository.topics && repository.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {repository.topics.slice(0, 3).map((topic, topicIndex) => (
                      <Badge
                        key={topicIndex}
                        variant="outline"
                        className="text-xs border-none hover:bg-[#4493f8] hover:text-primary-foreground text-[#4493f8] bg-[#4493f8]/10 transition-color"
                      >
                        {/* <Tag className="h-3 w-3 mr-1" /> */}
                        {topic}
                      </Badge>
                    ))}
                    {repository.topics.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-none cursor-help"
                        style={{
                          color: '#6b7280',
                          backgroundColor: '#6b72804D'
                        }}
                        title={repository.topics.slice(3).join(', ')}
                      >
                        +{repository.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Homepage Link */}
                <div className="flex items-center h-6">
                  {repository.homepage && (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
