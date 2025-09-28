import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the return URL from query params
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/'

    // Store return URL in session for after authentication
    // Note: In a real implementation, you'd store this in a secure session
    const response = NextResponse.redirect('/api/auth/github/redirect')
    response.cookies.set('returnUrl', returnUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    return response
  } catch (error) {
    console.error('Error initiating GitHub OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate GitHub OAuth' },
      { status: 500 }
    )
  }
}

// Redirect to GitHub OAuth
export async function POST(request: NextRequest) {
  try {
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/'

    // In a real Next.js app with Passport, you'd use middleware
    // For now, we'll redirect to GitHub directly
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
    githubAuthUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!)
    githubAuthUrl.searchParams.set('redirect_uri', process.env.GITHUB_CALLBACK_URL || `${process.env.NEXTAUTH_URL}/api/auth/github/callback`)
    githubAuthUrl.searchParams.set('scope', 'read:user user:email repo read:org')
    githubAuthUrl.searchParams.set('state', returnUrl) // Store return URL in state

    return NextResponse.redirect(githubAuthUrl.toString())
  } catch (error) {
    console.error('Error redirecting to GitHub OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to redirect to GitHub OAuth' },
      { status: 500 }
    )
  }
}
