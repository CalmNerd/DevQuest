import { NextRequest, NextResponse } from 'next/server'
import { drizzleService } from '@/services/database/drizzle.service'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session cookie
    const userId = request.cookies.get('user_id')?.value

    console.log('Auth me route - userId from cookie:', userId)

    if (!userId) {
      console.log('No user_id cookie found')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user from database
    console.log('Fetching user from database with ID:', userId)
    const user = await drizzleService.getUserById(userId)

    console.log('User found in database:', user ? 'Yes' : 'No')

    // If user not found by ID, try to find by GitHub ID
    if (!user && userId.startsWith('github_')) {
      const githubId = userId.replace('github_', '')
      console.log('Trying to find user by GitHub ID:', githubId)
      const userByGithubId = await drizzleService.getUserByGithubId(githubId)
      console.log('User found by GitHub ID:', userByGithubId ? 'Yes' : 'No')

      if (userByGithubId) {
        console.log('Found user by GitHub ID, actual user ID:', userByGithubId.id)
        // Return user data without sensitive information
        const { githubToken, ...safeUser } = userByGithubId

        return NextResponse.json({
          success: true,
          user: safeUser
        })
      }
    }

    if (!user) {
      console.log('User not found in database for ID:', userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data without sensitive information
    const { githubToken, ...safeUser } = user

    return NextResponse.json({
      success: true,
      user: safeUser
    })

  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    )
  }
}
