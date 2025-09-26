import { NextRequest, NextResponse } from "next/server"
import { sessionBackgroundService } from '@/services/api/session-background.service'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing session service...')
    
    // Get service status
    const status = sessionBackgroundService.getStatus()
    
    // Try to get leaderboards
    const leaderboards = await sessionBackgroundService.getAllSessionLeaderboards(5)
    
    return NextResponse.json({
      status: "success",
      message: "Session service test completed",
      serviceStatus: status,
      leaderboards: leaderboards,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing session service:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Session service test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
