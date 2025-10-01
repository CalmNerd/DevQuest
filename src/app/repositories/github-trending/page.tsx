"use client"

import TrendingSection from "@/components/layout/TrendingSection"

export default function GitHubTrendingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">GitHub Trending</h1>
          <p className="text-muted-foreground">
            Discover the most popular repositories and developers trending on GitHub right now
          </p>
        </div>
      </div>

      {/* Trending Content */}
      <TrendingSection />
    </div>
  )
}
