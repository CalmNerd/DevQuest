'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginWithPermissionsProps {
  returnUrl?: string
}

export function LoginWithPermissions({ returnUrl = '/' }: LoginWithPermissionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<'basic' | 'enhanced' | null>(null)

  const handleLogin = async (includeRepoAccess: boolean, type: 'basic' | 'enhanced') => {
    setIsLoading(true)
    setLoadingType(type)

    try {
      // Build scope based on user preference
      const baseScopes = 'read:user user:email'
      const scopes = includeRepoAccess ? `${baseScopes} repo` : baseScopes

      const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
      githubAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!)
      githubAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/github/callback`)
      githubAuthUrl.searchParams.set('scope', scopes)
      githubAuthUrl.searchParams.set('state', returnUrl)

      window.location.href = githubAuthUrl.toString()
    } catch (error) {
      console.error('Error initiating GitHub OAuth:', error)
      setIsLoading(false)
      setLoadingType(null)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
      {/* Basic Access Card */}
      <Card className="relative md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Basic Access
          </CardTitle>
          <CardDescription>
            Access your public GitHub data and compete on leaderboards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">What we access:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Public profile information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Email address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Public repositories and contributions</span>
              </li>
            </ul>
            <p className="font-medium pt-2">What we don't access:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">✗</span>
                <span>Private repositories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">✗</span>
                <span>Organization data</span>
              </li>
            </ul>
          </div>
          <Button
            onClick={() => handleLogin(false, 'basic')}
            disabled={isLoading}
            className="w-full"
            variant="default"
          >
            {isLoading && loadingType === 'basic' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                Sign in with Basic Access
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Access Card - Coming Soon */}
      <Card className="relative border-muted-foreground/20 opacity-75 md:col-span-2">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Enhanced Access
          </CardTitle>
          <CardDescription>
            Private repository tracking (in development)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-medium text-muted-foreground">Upcoming features:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🔒</span>
                <span>Private repository statistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📊</span>
                <span>Private contributions tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🎯</span>
                <span>Complete analytics across all repos</span>
              </li>
            </ul>
            <div className="bg-muted p-3 rounded-md mt-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Coming Soon:</span> We're working on bringing private repository 
                tracking to DevQuest. This will include all your private contributions for more accurate statistics. 
                Stay tuned!
              </p>
            </div>
          </div>
          <Button
            disabled
            className="w-full"
            variant="outline"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
