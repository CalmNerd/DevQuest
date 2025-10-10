import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { cookies } from 'next/headers'

/**
 * Admin Authentication API Route
 * 
 * Handles admin authentication using ADMIN_KEY from environment variables.
 * Uses secure HTTP-only cookies for session management.
 */

// POST: Validate admin key and set authentication cookie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminKey } = body

    // Validate admin key
    if (!adminKey) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Admin key is required' 
        },
        { status: 400 }
      )
    }

    // Check if admin key matches environment variable
    if (adminKey !== env.ADMIN_KEY) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid admin key' 
        },
        { status: 401 }
      )
    }

    // Create secure session token (using a simple approach with the admin key hash)
    // In production, you might want to use JWT or a more sophisticated session management
    const sessionToken = Buffer.from(env.ADMIN_KEY).toString('base64')

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return NextResponse.json({
      status: 'success',
      message: 'Admin authentication successful',
    })
  } catch (error) {
    console.error('Admin authentication error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// GET: Verify if user is authenticated
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')

    if (!sessionToken) {
      return NextResponse.json(
        { 
          status: 'error', 
          authenticated: false,
          message: 'Not authenticated' 
        },
        { status: 401 }
      )
    }

    // Verify session token
    const expectedToken = Buffer.from(env.ADMIN_KEY).toString('base64')
    
    if (sessionToken.value !== expectedToken) {
      return NextResponse.json(
        { 
          status: 'error', 
          authenticated: false,
          message: 'Invalid session' 
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      status: 'success',
      authenticated: true,
      message: 'Admin is authenticated',
    })
  } catch (error) {
    console.error('Admin session verification error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        authenticated: false,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// DELETE: Logout (clear session cookie)
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')

    return NextResponse.json({
      status: 'success',
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

