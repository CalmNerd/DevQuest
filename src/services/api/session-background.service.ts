import { sessionManagementService } from './session.service'
import { backgroundUpdateService } from './background.service'

//  Session-aware background service that coordinates with session management
//  and provides different update intervals for different session types

class SessionBackgroundService {
  private isRunning = false
  private sessionService = sessionManagementService
  private backgroundService = backgroundUpdateService

  //  Start the session-aware background service
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Session background service is already running')
      return
    }

    console.log('Starting session-aware background service...')
    this.isRunning = true

    try {
      // Start the session management service first
      await this.sessionService.start()
      
      // Start the regular background service for user data updates
      this.backgroundService.start()
      
      console.log('Session-aware background service started successfully')
    } catch (error) {
      console.error('Error starting session background service:', error)
      this.isRunning = false
      throw error
    }
  }

  //  Stop the session-aware background service
  stop(): void {
    if (!this.isRunning) {
      console.log('Session background service is not running')
      return
    }

    console.log('Stopping session-aware background service...')
    
    // Stop session management service
    this.sessionService.stop()
    
    // Stop regular background service
    this.backgroundService.stop()
    
    this.isRunning = false
    console.log('Session background service stopped')
  }

  //  Trigger manual update for all sessions
  async triggerAllSessionsUpdate(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Session background service is not running')
    }

    console.log('Manually triggering update for all sessions...')
    
    const sessionTypes = ['daily', 'weekly', 'monthly', 'yearly', 'overall'] as const
    
    for (const sessionType of sessionTypes) {
      try {
        await this.sessionService.triggerSessionUpdate(sessionType)
      } catch (error) {
        console.error(`Error updating ${sessionType} session:`, error)
      }
    }
    
    console.log('All sessions update triggered')
  }

  //  Trigger update for a specific session type
  async triggerSessionUpdate(sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall'): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Session background service is not running')
    }

    console.log(`Manually triggering update for ${sessionType} session...`)
    await this.sessionService.triggerSessionUpdate(sessionType)
  }

  //  Get comprehensive service status
  getStatus(): {
    isRunning: boolean
    sessionService: {
      isRunning: boolean
      activeSessions: Array<{
        type: string
        sessionKey: string
        startDate: Date
        endDate: Date
        nextUpdate: Date | null
      }>
    }
    backgroundService: {
      isRunning: boolean
      isUpdating: boolean
      nextUpdateIn: number
    }
  } {
    return {
      isRunning: this.isRunning,
      sessionService: this.sessionService.getStatus(),
      backgroundService: this.backgroundService.getStatus(),
    }
  }

  //  Get leaderboard data for a specific session
  async getSessionLeaderboard(
    sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall',
    limit: number = 50
  ): Promise<any[]> {
    return await this.sessionService.getSessionLeaderboard(sessionType, limit)
  }

  //  Get all active sessions with their leaderboards
  async getAllSessionLeaderboards(limit: number = 10): Promise<Record<string, any[]>> {
    const sessionTypes = ['daily', 'weekly', 'monthly', 'yearly', 'overall'] as const
    const leaderboards: Record<string, any[]> = {}

    for (const sessionType of sessionTypes) {
      try {
        leaderboards[sessionType] = await this.getSessionLeaderboard(sessionType, limit)
      } catch (error) {
        console.error(`Error getting ${sessionType} leaderboard:`, error)
        leaderboards[sessionType] = []
      }
    }

    return leaderboards
  }

  //  Force refresh all user data and update all sessions
  async forceRefreshAllData(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Session background service is not running')
    }

    console.log('Force refreshing all user data and sessions...')
    
    try {
      // Trigger background service update
      this.backgroundService.triggerUpdate()
      
      // Wait a bit for the background service to complete
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Update all sessions
      await this.triggerAllSessionsUpdate()
      
      console.log('Force refresh completed')
    } catch (error) {
      console.error('Error during force refresh:', error)
      throw error
    }
  }

  //  Get service configuration
  getConfig(): {
    sessionService: {
      sessionTypes: string[]
      updateIntervals: Record<string, number>
    }
    backgroundService: {
      updateIntervalMs: number
      batchSize: number
      batchDelayMs: number
    }
  } {
    return {
      sessionService: {
        sessionTypes: ['daily', 'weekly', 'monthly', 'yearly', 'overall'],
        updateIntervals: {
          daily: 5, // 5 minutes
          weekly: 360, // 6 hours
          monthly: 720, // 12 hours
          yearly: 1440, // 24 hours
          overall: 10080, // weekly
        },
      },
      backgroundService: this.backgroundService.getConfig(),
    }
  }
}

// Export singleton instance
export const sessionBackgroundService = new SessionBackgroundService()

// Note: Auto-start is handled by the admin panel or manual initialization
// This prevents issues with server-side module loading
