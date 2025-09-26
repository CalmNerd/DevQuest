import { NextRequest, NextResponse } from "next/server"
import { sessionBackgroundService } from '@/services/api/session-background.service'

export async function GET(request: NextRequest) {
  try {
    const status = sessionBackgroundService.getStatus()
    const config = sessionBackgroundService.getConfig()

    return NextResponse.json({
      status: "success",
      service: {
        isRunning: status.isRunning,
        sessionService: status.sessionService,
        backgroundService: status.backgroundService,
      },
      config: {
        sessionService: config.sessionService,
        backgroundService: config.backgroundService,
      },
    })
  } catch (error) {
    console.error("Error getting background service status:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to get background service status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionType } = body

    switch (action) {
      case "start":
        await sessionBackgroundService.start()
        return NextResponse.json({
          status: "success",
          message: "Session background service started",
        })

      case "stop":
        sessionBackgroundService.stop()
        return NextResponse.json({
          status: "success",
          message: "Session background service stopped",
        })

      case "trigger":
        if (sessionType) {
          await sessionBackgroundService.triggerSessionUpdate(sessionType)
          return NextResponse.json({
            status: "success",
            message: `Manual update triggered for ${sessionType} session`,
          })
        } else {
          await sessionBackgroundService.triggerAllSessionsUpdate()
          return NextResponse.json({
            status: "success",
            message: "Manual update triggered for all sessions",
          })
        }

      case "refresh":
        await sessionBackgroundService.forceRefreshAllData()
        return NextResponse.json({
          status: "success",
          message: "Force refresh completed for all data and sessions",
        })

      default:
        return NextResponse.json(
          {
            status: "error",
            message: "Invalid action. Use 'start', 'stop', 'trigger', or 'refresh'",
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error managing background service:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to manage background service",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
