"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  ExternalLink,
  Tag,
  AlertCircle,
  CheckCircle,
  GitBranch,
  Star,
  CircleDot,
  Bug,
  GitFork,
  Eye,
  MessageSquareText,
  SquarePen,
  Loader2,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MultipleSelector, { Option } from "@/components/ui/multi-select"
import githubColors from "@/lib/github-colors.json"
import Link from "next/link"
import { GitHubIssue } from '@/types/github.types'
import { commonLabels, popularLanguages } from '@/lib/constants'
import { formatIssueBody, getTimeAgo } from "@/lib/utils"
import Header from "@/components/layout/Header"

export default function ExplorePage() {
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_count: 0,
    total_pages: 0,
    has_next_page: false,
    has_prev_page: false,
    next_page: null as number | null,
    prev_page: null as number | null
  })
  const [filters, setFilters] = useState({
    state: "open",
    languages: [] as Option[],
    label: "good first issue",
    sort: "created",
    order: "desc",
  })

  const [repoDetailsCache, setRepoDetailsCache] = useState<Record<string, any>>({})

  const getLanguageColor = (language: string) => {
    return (githubColors as any)[language] || "#6b7280" // Default gray color
  }

  const fetchRepositoryDetails = async (repoFullName: string) => {
    // Check cache first
    if (repoDetailsCache[repoFullName]) {
      return repoDetailsCache[repoFullName]
    }

    try {
      const response = await fetch(`/api/github/repos/${repoFullName}`)
      if (response.ok) {
        const data = await response.json()
        // Cache the result
        setRepoDetailsCache(prev => ({ ...prev, [repoFullName]: data }))
        return data
      }
    } catch (error) {
      console.warn(`Failed to fetch repo details for ${repoFullName}:`, error)
    }
    return null
  }

  const fetchRealIssues = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching real GitHub issues...")

      // Build search query parameters
      const params = new URLSearchParams()

      // Build search query
      let query = "is:issue"
      if (filters.state !== "all") {
        query += ` is:${filters.state}`
      }

      // Handle multiple languages - use the correct format
      if (filters.languages.length > 0) {
        const languageQuery = filters.languages.map(lang => `language:${lang.value}`).join(" ")
        query += ` ${languageQuery}`
      }

      if (filters.label) {
        query += ` label:"${filters.label}"`
      }
      if (searchQuery.trim()) {
        query += ` ${searchQuery.trim()}`
      }

      // If no specific search terms, add some popular repositories for better results
      if (!searchQuery.trim() && filters.languages.length === 0 && !filters.label) {
        query += " repo:microsoft/vscode OR repo:facebook/react OR repo:vercel/next.js OR repo:nodejs/node OR repo:google/tensorflow OR repo:kubernetes/kubernetes"
      }

      params.set("q", query)
      params.set("state", filters.state)
      params.set("label", filters.label)
      params.set("sort", filters.sort)
      params.set("order", filters.order)
      params.set("page", page.toString())
      params.set("per_page", pagination.per_page.toString())

      console.log("Search query:", query)
      console.log("API params:", params.toString())

      // Use the API route instead of direct function call
      const response = await fetch(`/api/issues?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || response.statusText

        if (response.status === 401) {
          setError("GitHub token is missing or invalid. Please check your environment configuration.")
        } else if (response.status === 403) {
          setError("Rate limit exceeded. Please try again later.")
        } else if (response.status === 422) {
          setError("Invalid search query. Please try different search terms.")
        } else {
          setError(`API Error: ${errorMessage}`)
        }

        throw new Error(`API Error: ${response.status} - ${errorMessage}`)
      }

      const data = await response.json()
      console.log("GitHub API response:", data)

      if (data && data.items) {
        // Transform GitHub API response to match our interface
        const transformedIssues = await Promise.all(
          data.items.map(async (item: any) => {
            const repoFullName = item.repository_url?.split("/").slice(-2).join("/") || "unknown/unknown"
            const repoDetails = await fetchRepositoryDetails(repoFullName)

            return {
              id: item.id,
              number: item.number,
              title: item.title,
              body: item.body || "",
              state: item.state,
              created_at: item.created_at,
              updated_at: item.updated_at,
              comments: item.comments,
              labels: item.labels || [],
              user: {
                login: item.user?.login || "unknown",
                avatar_url: item.user?.avatar_url || "/placeholder.svg?height=40&width=40",
              },
              assignees: item.assignees?.map((assignee: any) => ({
                login: assignee.login,
                avatar_url: assignee.avatar_url,
                id: assignee.id
              })) || [],
              repository: {
                name: item.repository_url?.split("/").pop() || "unknown",
                full_name: repoFullName,
                owner: {
                  login: item.repository_url?.split("/").slice(-2)[0] || "unknown",
                },
                stargazers_count: repoDetails?.stargazers_count || 0,
                forks_count: repoDetails?.forks_count || 0,
                watchers_count: repoDetails?.watchers_count || 0,
                subscribers_count: repoDetails?.subscribers_count || 0,
                open_issues_count: repoDetails?.open_issues_count || 0,
                language: repoDetails?.language || "Unknown",
                languages: repoDetails?.languages ? Object.keys(repoDetails.languages) : [],
                avatar_url: repoDetails?.owner?.avatar_url,
              },
              html_url: item.html_url,
            }
          })
        )

        setIssues(transformedIssues)

        // Update pagination info
        if (data.pagination) {
          setPagination(data.pagination)
        }

        console.log("Successfully loaded", transformedIssues.length, "issues")
      } else {
        console.warn("No issues found in response")
        setIssues([])
      }
    } catch (error) {
      console.error("Error fetching issues:", error)

      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          console.warn("Unauthorized - GitHub token may be invalid or missing")
        } else if (error.message.includes("403")) {
          console.warn("Rate limited or insufficient permissions")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRealIssues(1) // Reset to page 1 when filters change
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRealIssues(1) // Reset to page 1 when searching
  }

  const handlePageChange = (newPage: number) => {
    fetchRealIssues(newPage)
  }

  const getStateIcon = (state: string) => {
    return state === "open" ? (
      <CircleDot className="h-4 w-4 text-green-400" />
    ) : (
      <CheckCircle className="h-4 w-4 text-purple-400" />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      <div className=" backdrop-blur-sm mx-auto container">
        <div className="container mx-auto py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold">Explore Issues</h1>
              <p className="text-muted-foreground">Discover open source issues and contribute to projects worldwide</p>
            </div>

            {/* Search and Filters */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search issues, repositories, or labels... (e.g., 'bug', 'enhancement', 'good first issue')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value })}>
                  <SelectTrigger className="w-32 bg-transparent dark:bg-input/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-48">
                  <MultipleSelector
                    value={filters.languages}
                    onChange={(options) => setFilters({ ...filters, languages: options })}
                    placeholder="Select languages..."
                    options={popularLanguages.map(lang => ({ value: lang, label: lang }))}
                    maxSelected={5}
                    hidePlaceholderWhenSelected
                    className="min-h-10 bg-transparent dark:bg-input/30"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="mr-1 h-4 w-4" />}
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="gap-3">
            <CardHeader className="">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Popular Labels and tags */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {commonLabels.map((label) => (
                    <Button
                      key={label}
                      variant={filters.label === label ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters({ ...filters, label })}
                      className={`gap-1 h-6 transition-all ${filters.label === label
                        ? 'bg-primary text-primary-foreground shadow-md text-xs px-1 py-0'
                        : 'hover:bg-muted'
                        }`}
                    >
                      <Tag className="size-3" />
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularLanguages.slice(0, 5).map((lang) => {
                    const isSelected = filters.languages.some(l => l.value === lang)
                    return (
                      <Button
                        key={lang}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            setFilters({
                              ...filters,
                              languages: filters.languages.filter(l => l.value !== lang)
                            })
                          } else {
                            setFilters({
                              ...filters,
                              languages: [...filters.languages, { value: lang, label: lang }]
                            })
                          }
                        }}
                        className={`gap-2 h-6 transition-all ${isSelected
                          ? 'bg-primary text-primary-foreground shadow-md text-xs px-1 py-0'
                          : 'hover:bg-muted'
                          }`}
                      >
                        <GitBranch className="size-3" />
                        {lang}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Error Display */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="font-medium">Search Error</p>
                    <p className="text-sm">{error}</p>
                    <p className="text-xs mt-1">Showing mock data as fallback.</p>
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer hover:underline">Debug Info</summary>
                      <div className="mt-1 text-xs font-mono bg-red-100 dark:bg-red-900 p-2 rounded">
                        <p>Search Query: {searchQuery || "(empty)"}</p>
                        <p>Filters: {JSON.stringify(filters)}</p>
                        <p>GitHub Token: {process.env.GITHUB_TOKEN ? "Set" : "Not Set"}</p>
                      </div>
                    </details>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null)
                      fetchRealIssues(1)
                    }}
                    className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Issues List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {pagination.total_count > 0 ? `${pagination.total_count.toLocaleString()}` : issues.length} {filters.state} issues
              {error && <span className="text-sm text-muted-foreground ml-2">(showing mock data)</span>}
            </h2>
            <Select value={filters.sort} onValueChange={(value) => setFilters({ ...filters, sort: value })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Newest</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="comments">Most Commented</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {issues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="transition-all hover:shadow-md py-0 hover:shadow-primary/10 h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex gap-4 h-full">
                      {/* <div className="flex-shrink-0 pt-1">{getStateIcon(issue.state)}</div> */}

                      <div className="flex-1 space-y-3 flex flex-col">

                        {/* Repository Info */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 flex-1">
                            {/* <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" /> */}
                            <Avatar className="h-5 w-5 rounded-sm border">
                              <AvatarImage src={issue.repository.avatar_url || "/placeholder.svg"} alt={issue.repository.owner.login} />
                              <AvatarFallback>{issue.repository.owner.login[0]}</AvatarFallback>
                            </Avatar>
                            <a
                              href={`https://github.com/${issue.repository.full_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary hover:underline line-clamp-1 leading-tight"
                              title={issue.repository.full_name}
                            >
                              {issue.repository.full_name}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>{issue.repository.stargazers_count.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GitFork className="h-4 w-4 text-blue-400" />
                            <span>{issue.repository.forks_count.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4 text-rose-400" />
                            <span>{issue.repository.open_issues_count.toLocaleString()}</span>
                          </div>
                          {/* <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-purple-400" />
                            <span>{issue.repository.watchers_count.toLocaleString()}</span>
                          </div> */}
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-purple-400" />
                            <span>{issue.repository.subscribers_count.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Issue Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-lg leading-tight">
                              <div className="inline-flex items-start gap-1">
                                <span className="mt-[3px] mr-1">
                                  {getStateIcon(issue.state)}
                                </span>
                                <a
                                  href={issue.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary line-clamp-1 break-words"
                                  title={issue.title}
                                >
                                  {issue.title}
                                  <ExternalLink className="h-4 w-4 inline mx-1" />
                                </a>

                              </div>
                            </div>
                            <div className="flex items-center text-xs gap-2 text-sm text-muted-foreground mt-1">
                              <span>#{issue.number}</span>
                              <span>opened {getTimeAgo(issue.created_at)} by</span>
                              <Link href={`https://github.com/${issue.user.login}`} target="_blank" rel="noopener noreferrer" className="flex hover:text-primary items-center gap-0.5">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={issue.user.avatar_url || "/placeholder.svg"} alt={issue.user.login} />
                                  <AvatarFallback>{issue.user.login[0]}</AvatarFallback>
                                </Avatar>
                                <span>{issue.user.login}</span>
                              </Link>
                            </div>
                          </div>
                        </div>

                        <div className="h-[36px]">
                          {issue.body && (
                            <p
                              className="text-sm text-muted-foreground line-clamp-2 h-full overflow-hidden break-words break-all leading-tight"
                              title={formatIssueBody(issue.body)}
                            >
                              {formatIssueBody(issue.body)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 h-[32px]">
                          {/* Assignees */}
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            {issue.assignees && issue.assignees.length > 0 ? (
                              <>
                                <div className="flex items-center -space-x-2">
                                  {issue.assignees.slice(0, 3).map((assignee, index) => (
                                    <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                                      <AvatarImage src={assignee.avatar_url} alt={assignee.login} />
                                      <AvatarFallback className="text-xs">{assignee.login[0]}</AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {issue.assignees.length > 3 && (
                                    <div className="h-6 w-6 z-[10] rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                      <span className="text-xs font-medium">+{issue.assignees.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-muted-foreground">
                                  {issue.assignees.length} assignee{issue.assignees.length !== 1 ? 's' : ''}
                                </span>
                              </>
                            ) : (
                              <span className="text-green-500">No assignee</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageSquareText className="h-4 w-4 text-blue-400" />
                              <span>{issue.comments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <SquarePen className="h-4 w-4" />
                              <span>Updated {getTimeAgo(issue.updated_at)}</span>
                            </div>
                          </div>
                        </div>



                        {/* Labels and Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">


                            {/* {issue.repository.language && (
                              <Badge
                              variant="outline"
                                className="text-xs flex items-center gap-1"
                                style={{
                                  borderColor: getLanguageColor(issue.repository.language),
                                  color: getLanguageColor(issue.repository.language)
                                }}
                                >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: getLanguageColor(issue.repository.language) }}
                                  />
                                {issue.repository.language}
                              </Badge>
                            )} */}


                            {/* Languages - Show max 2 with plus more */}
                            {issue.repository.languages && issue.repository.languages.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {issue.repository.languages.slice(0, 3).map((lang, index) => (
                                  <div
                                    key={lang}
                                    className="inline-block transform -skew-x-20 rounded"
                                    style={{
                                      // borderColor: getLanguageColor(lang),
                                      color: getLanguageColor(lang),
                                      backgroundColor: `${getLanguageColor(lang)}66` // '66' is hex for ~40% opacity
                                    }}>
                                    <span
                                      className="block px-2 font-medium text-sm transform skew-x-20 whitespace-nowrap">
                                      {lang}
                                    </span>
                                  </div>
                                ))}
                                {issue.repository.languages.length > 3 && (
                                  <div
                                    className="inline-block transform -skew-x-20 rounded cursor-help"
                                    style={{
                                      // borderColor: '#6b7280',
                                      color: '#6b7280',
                                      backgroundColor: '#6b728066'
                                    }}
                                    title={issue.repository.languages.slice(3).join(', ')}
                                  >
                                    <span className="block px-2 font-medium text-sm transform skew-x-20 whitespace-nowrap">
                                      +{issue.repository.languages.length - 3} more
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : issue.repository.language ? (
                              <div
                                className="inline-block border transform -skew-x-20 rounded"
                                style={{
                                  borderColor: getLanguageColor(issue.repository.language),
                                  color: getLanguageColor(issue.repository.language),
                                  backgroundColor: `${getLanguageColor(issue.repository.language)}66` // '66' is hex for ~40% opacity
                                }}>
                                <span
                                  className="block px-2 font-medium text-sm transform skew-x-20 whitespace-nowrap">
                                  {issue.repository.language}
                                </span>
                              </div>
                            ) : null}

                            {/* Labels - Show max 2 with plus more */}
                            {issue.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {issue.labels.slice(0, 3).map((label) => (
                                  <Badge
                                    key={label.name}
                                    variant="outline"
                                    className="text-xs rounded-md border-none"
                                    style={{
                                      // borderColor: `#${label.color}`,
                                      color: `#${label.color}`,
                                      backgroundColor: `#${label.color}4D` // '4D' is hex for ~30% opacity
                                    }}
                                  >
                                    {label.name}
                                  </Badge>
                                ))}
                                {issue.labels.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs rounded-md border-none cursor-help"
                                    style={{
                                      color: '#6b7280',
                                      backgroundColor: '#6b72804D'
                                    }}
                                    title={issue.labels.slice(3).map(l => l.name).join(', ')}
                                  >
                                    +{issue.labels.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {issues.length === 0 && !loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No issues found matching your criteria.</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Searching issues...</p>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && issues.length > 0 && pagination.total_pages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{" "}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of{" "}
                    {pagination.total_count.toLocaleString()} issues
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.prev_page!)}
                      disabled={!pagination.has_prev_page}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {/* Show page numbers */}
                      {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.total_pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.current_page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.current_page >= pagination.total_pages - 2) {
                          pageNum = pagination.total_pages - 4 + i;
                        } else {
                          pageNum = pagination.current_page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.current_page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.next_page!)}
                      disabled={!pagination.has_next_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
