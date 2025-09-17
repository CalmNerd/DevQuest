import { NextRequest, NextResponse } from "next/server"
import { backgroundUpdateService } from "@/lib/background-service"

/**
 * Background service management API
 * GET /api/background-service - Get service status
 * POST /api/background-service - Start/stop service
 */
export async function GET(request: NextRequest) {
  try {
    const status = backgroundUpdateService.getStatus()
    const config = backgroundUpdateService.getConfig()

    return NextResponse.json({
      status: "success",
      service: {
        isRunning: status.isRunning,
        isUpdating: status.isUpdating,
        nextUpdateIn: status.nextUpdateIn,
        nextUpdateInSeconds: Math.round(status.nextUpdateIn / 1000),
      },
      config: {
        updateIntervalSeconds: config.updateIntervalSeconds,
        batchSize: config.batchSize,
        batchDelaySeconds: config.batchDelaySeconds,
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
    const { action } = body

    switch (action) {
      case "start":
        backgroundUpdateService.start()
        return NextResponse.json({
          status: "success",
          message: "Background service started",
        })

      case "stop":
        backgroundUpdateService.stop()
        return NextResponse.json({
          status: "success",
          message: "Background service stopped",
        })

      case "trigger":
        backgroundUpdateService.triggerUpdate()
        return NextResponse.json({
          status: "success",
          message: "Manual update triggered",
        })

      default:
        return NextResponse.json(
          {
            status: "error",
            message: "Invalid action. Use 'start', 'stop', or 'trigger'",
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
