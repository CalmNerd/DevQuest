'use client'

import React from 'react'
import GitHubAchievementsBadge from '@/components/achievements/GitHubAchievementsBadge'

/**
 * GitHub Achievements Demo Page
 * 
 * This page demonstrates the GitHub Achievements scraper functionality
 * Users can search for any GitHub username and view their achievements
 */
export default function GitHubAchievementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            GitHub Achievements Viewer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover and showcase GitHub achievements from any user profile. 
            Search for a username to see their earned badges and milestones.
          </p>
        </div>

        {/* Main Achievement Component */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
          <GitHubAchievementsBadge 
            showSearch={true}
            limit={0}
          />
        </div>

        {/* Information Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            title="Real-time Scraping"
            description="Fetches achievements directly from GitHub profiles using web scraping technology"
            icon="🔍"
          />
          <InfoCard
            title="Cached Results"
            description="Smart caching (30 min TTL) reduces API calls and improves performance"
            icon="⚡"
          />
          <InfoCard
            title="Force Refresh"
            description="Use the refresh button to clear cache and get the latest achievement data"
            icon="🔄"
          />
        </div>

        {/* Example Users */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Try These Examples
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {EXAMPLE_USERS.map((username) => (
              <ExampleUserButton key={username} username={username} />
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🔧 Technical Implementation
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✓ Built with Next.js 14 App Router and TypeScript</li>
            <li>✓ Web scraping using Axios + Cheerio</li>
            <li>✓ Follows SOLID principles and clean code practices</li>
            <li>✓ In-memory caching with TTL for rate limit protection</li>
            <li>✓ Comprehensive error handling and validation</li>
            <li>✓ RESTful API routes (GET, POST, DELETE)</li>
            <li>✓ Responsive UI with Tailwind CSS</li>
          </ul>
        </div>

        {/* API Endpoints */}
        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            📡 API Endpoints
          </h3>
          <div className="space-y-3 text-sm font-mono">
            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
              <span className="text-green-600 dark:text-green-400 font-bold">GET</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                /api/github-achievements/[username]
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">
                Fetch achievements for a user (uses cache if available)
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
              <span className="text-blue-600 dark:text-blue-400 font-bold">POST</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                /api/github-achievements/[username]
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">
                Force refresh achievements (clears cache and fetches fresh data)
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
              <span className="text-red-600 dark:text-red-400 font-bold">DELETE</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                /api/github-achievements/[username]
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">
                Clear cache for a specific user
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Example users to try
 */
const EXAMPLE_USERS = [
  'torvalds',
  'gaearon',
  'tj',
  'sindresorhus',
  'benbalter',
  'octocat',
]

/**
 * Info Card Component
 */
function InfoCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}

/**
 * Example User Button Component
 */
function ExampleUserButton({ username }: { username: string }) {
  const handleClick = () => {
    // Trigger search by setting input value and clicking search
    const input = document.querySelector('input[placeholder*="GitHub username"]') as HTMLInputElement
    const searchButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
    
    if (input && searchButton) {
      input.value = username
      input.dispatchEvent(new Event('input', { bubbles: true }))
      searchButton.click()
      
      // Scroll to achievements
      setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' })
      }, 100)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium text-sm"
    >
      @{username}
    </button>
  )
}

