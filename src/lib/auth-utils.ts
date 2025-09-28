import { NextRequest } from 'next/server'
import { drizzleService } from '@/services/database/drizzle.service'
import { tokenEncryption } from './encryption'

export async function getCurrentUser(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return null
    }

    const user = await drizzleService.getUserById(userId)
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Get the current user's GitHub token (decrypted)
export async function getUserGitHubToken(request: NextRequest): Promise<string | null> {
  try {
    const user = await getCurrentUser(request)

    if (!user || !user.githubToken) {
      return null
    }

    return tokenEncryption.safeDecryptToken(user.githubToken)
  } catch (error) {
    console.error('Error getting user GitHub token:', error)
    return null
  }
}

// Check if a user is authenticated
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request)
  return user !== null
}

// Require authentication middleware
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

// Get user ID from request
export function getUserId(request: NextRequest): string | null {
  return request.cookies.get('user_id')?.value || null
}
