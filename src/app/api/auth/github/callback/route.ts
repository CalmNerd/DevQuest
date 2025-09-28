import { NextRequest, NextResponse } from 'next/server'
import { drizzleService } from '@/services/database/drizzle.service'
import { tokenEncryption } from '@/lib/encryption'

export async function GET(request: NextRequest) {
  try {
    // Get parameters directly from URL
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    console.log('OAuth callback received:', {
      code: code ? code.substring(0, 10) + '...' : 'undefined',
      state,
      fullUrl: request.url,
      searchParams: Object.fromEntries(url.searchParams)
    })

    if (!code) {
      console.error('No code received in OAuth callback')
      return NextResponse.redirect(new URL('/?error=oauth_cancelled', request.url))
    }

    // Check environment variables
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      console.error('Missing GitHub OAuth environment variables')
      return NextResponse.redirect(new URL('/?error=missing_env_vars', request.url))
    }

    // Exchange code for access token
    console.log('Exchanging code for access token...')
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', tokenResponse.statusText)
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange response:', {
      hasAccessToken: !!tokenData.access_token,
      error: tokenData.error,
      errorDescription: tokenData.error_description
    })

    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error_description)
      return NextResponse.redirect(new URL('/?error=oauth_error', request.url))
    }

    if (!tokenData.access_token) {
      console.error('No access token received from GitHub')
      return NextResponse.redirect(new URL('/?error=no_access_token', request.url))
    }

    const accessToken = tokenData.access_token

    // Fetch user profile from GitHub
    console.log('Fetching user profile from GitHub...')
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevQuest',
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to fetch user profile:', userResponse.status, userResponse.statusText)
      return NextResponse.redirect(new URL('/?error=profile_fetch_failed', request.url))
    }

    const profile = await userResponse.json()
    console.log('User profile fetched:', {
      id: profile.id,
      login: profile.login,
      name: profile.name
    })

    // Extract user data from GitHub profile
    const githubId = profile.id.toString()
    const username = profile.login
    const email = profile.email || null
    const name = profile.name || profile.login
    const bio = profile.bio || null
    const profileImageUrl = profile.avatar_url
    const githubUrl = profile.html_url
    const location = profile.location || null
    const blogUrl = profile.blog || null
    const twitterUsername = profile.twitter_username || null

    // Parse GitHub creation date
    let githubCreatedAt: Date | undefined
    if (profile.created_at) {
      githubCreatedAt = new Date(profile.created_at)
    }

    // Encrypt the access token before storing
    console.log('Encrypting access token...')
    const encryptedToken = tokenEncryption.encryptToken(accessToken)

    // Check if user already exists
    console.log('Checking if user exists in database...')
    let existingUser = await drizzleService.getUserByGithubId(githubId)

    let userId: string

    if (existingUser) {
      // Update existing user with new token and data
      console.log(`Updating existing user: ${username}`)
      userId = existingUser.id
      await drizzleService.upsertUser({
        id: existingUser.id,
        githubId,
        username,
        email,
        name,
        bio,
        profileImageUrl,
        githubToken: encryptedToken, // Store encrypted token
        githubUrl,
        blogUrl,
        linkedinUrl: extractLinkedInUrl(blogUrl) || extractLinkedInUrl(bio),
        twitterUsername,
        location,
        githubCreatedAt,
      })
    } else {
      // Create new user
      console.log(`Creating new user: ${username}`)
      userId = `github_${githubId}` // Generate unique ID
      await drizzleService.upsertUser({
        id: userId,
        githubId,
        username,
        email,
        name,
        bio,
        profileImageUrl,
        githubToken: encryptedToken, // Store encrypted token
        githubUrl,
        blogUrl,
        linkedinUrl: extractLinkedInUrl(blogUrl) || extractLinkedInUrl(bio),
        twitterUsername,
        location,
        githubCreatedAt,
      })
    }

    // Get return URL from state or default
    const returnUrl = state || '/'
    console.log('OAuth flow completed successfully, redirecting to:', returnUrl)

    // Create response with redirect (use absolute URL)
    const response = NextResponse.redirect(new URL(returnUrl, request.url))

    // Set session cookie (simplified - in production use proper session management)
    response.cookies.set('user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    console.log('Session cookie set for user:', userId)

    return response

  } catch (error) {
    console.error('Error in GitHub OAuth callback:', error)
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url))
  }
}

/**
 * Extract LinkedIn URL from text
 */
function extractLinkedInUrl(input?: string | null): string | undefined {
  if (!input) return undefined

  const patterns = [
    /https?:\/\/([\w.-]*\.)?linkedin\.com\/[\w\-/?=&#.%]+/i,
    /linkedin\.com\/in\/[\w\-]+/i
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) {
      let url = match[0]
      // Ensure it has protocol
      if (!url.startsWith('http')) {
        url = 'https://' + url
      }
      return url
    }
  }

  return undefined
}
