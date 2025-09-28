import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug route to check OAuth environment variables
 * Remove this in production
 */
export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
      NEXT_PUBLIC_GITHUB_CLIENT_ID: !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment variables check'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check environment' },
      { status: 500 }
    )
  }
}
