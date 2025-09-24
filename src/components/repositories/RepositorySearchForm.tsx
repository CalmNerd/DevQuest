"use client"

import React from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Search type options for the dropdown
export type SearchType = 'general' | 'organization' | 'language' | 'topic'

interface RepositorySearchFormProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearch: (query: string) => void
  loading?: boolean
  placeholder?: string
  className?: string
  searchType?: SearchType
  setSearchType?: (type: SearchType) => void
  showSearchTypeSelector?: boolean
}

export function RepositorySearchForm({
  searchQuery,
  setSearchQuery,
  onSearch,
  loading = false,
  placeholder = "Search repositories...",
  className,
  searchType = 'general',
  setSearchType,
  showSearchTypeSelector = false
}: RepositorySearchFormProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      let finalQuery = searchQuery.trim()

      // Add appropriate prefix based on search type
      if (showSearchTypeSelector && searchType !== 'general') {
        switch (searchType) {
          case 'organization':
            finalQuery = `org:${finalQuery}`
            break
          case 'language':
            finalQuery = `language:${finalQuery}`
            break
          case 'topic':
            finalQuery = `topic:${finalQuery}`
            break
        }
      }

      onSearch(finalQuery)
    }
  }

  const handleSearchTypeChange = (newType: SearchType) => {
    if (setSearchType) {
      setSearchType(newType)
    }
  }

  const getPlaceholderText = () => {
    if (!showSearchTypeSelector) return placeholder

    switch (searchType) {
      case 'organization':
        return 'Enter organization name (e.g., microsoft, google)...'
      case 'language':
        return 'Enter programming language (e.g., javascript, python)...'
      case 'topic':
        return 'Enter topic (e.g., machine-learning, web-framework)...'
      default:
        return 'Search repositories by name, description, or topic...'
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 w-full max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={getPlaceholderText()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            {/* Search Type Selector - only show when enabled */}
            {showSearchTypeSelector && setSearchType && (
              <div className="w-40">
                <Select value={searchType} onValueChange={handleSearchTypeChange}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Search type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                    <SelectItem value="topic">Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}


          </div>

          {/* Search Button */}
          <Button
            type="submit"
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search Repositories
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
