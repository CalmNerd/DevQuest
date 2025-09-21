"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  GitBranch,
  Tag,
  Shield,
  Calendar,
  Star,
  GitFork,
  TrendingUp,
  Code,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MultipleSelector, { Option } from "@/components/ui/multi-select"
import {
  repositorySortOptions,
  repositoryOrderOptions,
  repositoryLicenseOptions,
  trendingTopics,
  popularOrganizations,
  popularLanguages
} from '@/lib/constants'
import { RepositorySearchFilters } from '@/types/github.types'

interface RepositoryFiltersProps {
  filters: RepositorySearchFilters
  onFiltersChange: (filters: RepositorySearchFilters) => void
  onSearch: () => void
  loading: boolean
}

export default function RepositoryFilters({
  filters,
  onFiltersChange,
  onSearch,
  loading
}: RepositoryFiltersProps) {

  const [localFilters, setLocalFilters] = useState<RepositorySearchFilters>(filters)

  const handleFilterChange = (key: keyof RepositorySearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleLanguageChange = (languages: Option[]) => {
    // For now, we'll use the first language selected
    const language = languages.length > 0 ? languages[0].value : undefined
    handleFilterChange('language', language)
  }

  const handleQuickFilter = (type: string, value: string) => {
    switch (type) {
      case 'language':
        handleFilterChange('language', value)
        break
      case 'topic':
        handleFilterChange('topic', value)
        break
      case 'org':
        handleFilterChange('org', value)
        break
      case 'license':
        handleFilterChange('license', value)
        break
      case 'sort':
        handleFilterChange('sort', value)
        break
      case 'created':
        handleFilterChange('created', value)
        break
      case 'stars':
        handleFilterChange('stars', value)
        break
      case 'forks':
        handleFilterChange('forks', value)
        break
      case 'size':
        handleFilterChange('size', value)
        break
    }
    onSearch()
  }

  const clearFilters = () => {
    const clearedFilters: RepositorySearchFilters = {
      query: '',
      sort: 'stars',
      order: 'desc',
      page: 1,
      per_page: 10
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return !!(
      localFilters.query ||
      localFilters.language ||
      localFilters.license ||
      localFilters.topic ||
      localFilters.user ||
      localFilters.org ||
      localFilters.archived !== undefined ||
      localFilters.fork !== undefined ||
      localFilters.created ||
      localFilters.pushed ||
      localFilters.size ||
      localFilters.stars ||
      localFilters.forks
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Search and Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Repositories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search repositories, topics, or keywords... (e.g., 'machine learning', 'react', 'blockchain')"
                value={localFilters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort and Order */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Select
                  value={localFilters.sort}
                  onValueChange={(value) => handleFilterChange('sort', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositorySortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Select
                  value={localFilters.order}
                  onValueChange={(value) => handleFilterChange('order', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {repositoryOrderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="px-6">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <MultipleSelector
                value={localFilters.language ? [{ value: localFilters.language, label: localFilters.language }] : []}
                onChange={handleLanguageChange}
                placeholder="Select languages..."
                options={popularLanguages.map(lang => ({ value: lang, label: lang }))}
                maxSelected={1}
                hidePlaceholderWhenSelected
                className="min-h-10"
              />
            </div>

            {/* License Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">License</label>
              <Select
                value={localFilters.license || "any"}
                onValueChange={(value) => handleFilterChange('license', value === "any" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select license" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any License</SelectItem>
                  {repositoryLicenseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User/Organization Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">User or Organization</label>
              <Input
                type="text"
                placeholder="e.g., microsoft, facebook, username"
                value={localFilters.user || localFilters.org || ""}
                onChange={(e) => {
                  const value = e.target.value
                  // Simple heuristic: if it looks like an org (no spaces, common org patterns), use org
                  if (value && !value.includes(' ') && value.length > 2) {
                    handleFilterChange('org', value)
                    handleFilterChange('user', undefined)
                  } else {
                    handleFilterChange('user', value)
                    handleFilterChange('org', undefined)
                  }
                }}
              />
            </div>

            {/* Topic Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Topic</label>
              <Input
                type="text"
                placeholder="e.g., machine-learning, react, blockchain"
                value={localFilters.topic || ""}
                onChange={(e) => handleFilterChange('topic', e.target.value)}
              />
            </div>

            {/* Date Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Created Date</label>
              <Select
                value={localFilters.created || "any"}
                onValueChange={(value) => handleFilterChange('created', value === "any" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value=">2024-01-01 <2025-01-01">Year 2024</SelectItem>
                  <SelectItem value=">2023-01-01 <2024-01-01">Year 2023</SelectItem>
                  <SelectItem value=">2022-01-01 <2023-01-01">Year 2022</SelectItem>
                  <SelectItem value=">2021-01-01 <2022-01-01">Year 2021</SelectItem>
                  <SelectItem value=">2020-01-01 <2021-01-01">Year 2020</SelectItem>
                  <SelectItem value=">2024-01-01">This year</SelectItem>
                  <SelectItem value=">2023-01-01">Last 2 years</SelectItem>
                  <SelectItem value=">2020-01-01">Last 5 years</SelectItem>
                  <SelectItem value=">2015-01-01">Last 10 years</SelectItem>
                  <SelectItem value="<2020-01-01">Older than 5 years</SelectItem>
                  <SelectItem value="<2015-01-01">Older than 10 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stars Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Stars</label>
              <Select
                value={localFilters.stars || "any"}
                onValueChange={(value) => handleFilterChange('stars', value === "any" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any amount</SelectItem>
                  <SelectItem value=">1000">More than 1K</SelectItem>
                  <SelectItem value=">10000">More than 10K</SelectItem>
                  <SelectItem value=">100000">More than 100K</SelectItem>
                  <SelectItem value=">1000000">More than 1M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Repository Type Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="archived"
                checked={localFilters.archived === true}
                onChange={(e) => handleFilterChange('archived', e.target.checked ? true : undefined)}
                className="rounded border-gray-300"
              />
              <label htmlFor="archived" className="text-sm">Include archived</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fork"
                checked={localFilters.fork === true}
                onChange={(e) => handleFilterChange('fork', e.target.checked ? true : undefined)}
                className="rounded border-gray-300"
              />
              <label htmlFor="fork" className="text-sm">Include forks</label>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Popular Languages */}
          <div>
            <h4 className="text-sm font-medium mb-2">Popular Languages</h4>
            <div className="flex flex-wrap gap-2">
              {popularLanguages.slice(0, 8).map((lang) => (
                <Button
                  key={lang}
                  variant={localFilters.language === lang ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter('language', lang)}
                  className="gap-1 h-7 text-xs"
                >
                  <GitBranch className="h-3 w-3" />
                  {lang}
                </Button>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div>
            <h4 className="text-sm font-medium mb-2">Trending Topics</h4>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.slice(0, 10).map((topic) => (
                <Button
                  key={topic}
                  variant={localFilters.topic === topic ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter('topic', topic)}
                  className="gap-1 h-7 text-xs"
                >
                  <Tag className="h-3 w-3" />
                  {topic}
                </Button>
              ))}
            </div>
          </div>

          {/* Popular Organizations */}
          <div>
            <h4 className="text-sm font-medium mb-2">Popular Organizations</h4>
            <div className="flex flex-wrap gap-2">
              {popularOrganizations.slice(0, 8).map((org) => (
                <Button
                  key={org}
                  variant={localFilters.org === org ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter('org', org)}
                  className="gap-1 h-7 text-xs"
                >
                  <Code className="h-3 w-3" />
                  {org}
                </Button>
              ))}
            </div>
          </div>

          {/* Popular Licenses */}
          <div>
            <h4 className="text-sm font-medium mb-2">Popular Licenses</h4>
            <div className="flex flex-wrap gap-2">
              {repositoryLicenseOptions.slice(0, 6).map((license) => (
                <Button
                  key={license.value}
                  variant={localFilters.license === license.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter('license', license.value)}
                  className="gap-1 h-7 text-xs"
                >
                  <Shield className="h-3 w-3" />
                  {license.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Time Periods */}
          <div>
            <h4 className="text-sm font-medium mb-2">Individual Years</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={localFilters.created === ">2024-01-01 <2025-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2024-01-01 <2025-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                2024
              </Button>
              <Button
                variant={localFilters.created === ">2023-01-01 <2024-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2023-01-01 <2024-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                2023
              </Button>
              <Button
                variant={localFilters.created === ">2022-01-01 <2023-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2022-01-01 <2023-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                2022
              </Button>
              <Button
                variant={localFilters.created === ">2021-01-01 <2022-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2021-01-01 <2022-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                2021
              </Button>
              <Button
                variant={localFilters.created === ">2020-01-01 <2021-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2020-01-01 <2021-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                2020
              </Button>
            </div>
          </div>

          {/* Time Ranges */}
          <div>
            <h4 className="text-sm font-medium mb-2">Time Ranges</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={localFilters.created === ">2024-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2024-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                This Year
              </Button>
              <Button
                variant={localFilters.created === ">2023-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2023-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                Last 2 Years
              </Button>
              <Button
                variant={localFilters.created === ">2020-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2020-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                Last 5 Years
              </Button>
              <Button
                variant={localFilters.created === ">2015-01-01" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter('created', ">2015-01-01")}
                className="gap-1 h-7 text-xs"
              >
                <Calendar className="h-3 w-3" />
                Last 10 Years
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
