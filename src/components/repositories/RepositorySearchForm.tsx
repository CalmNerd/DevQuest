"use client"

import React from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface RepositorySearchFormProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearch: (query: string) => void
  loading?: boolean
  placeholder?: string
  className?: string
}

export function RepositorySearchForm({
  searchQuery,
  setSearchQuery,
  onSearch,
  loading = false,
  placeholder = "Search repositories...",
  className
}: RepositorySearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Repositories
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
