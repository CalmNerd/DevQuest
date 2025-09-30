import { db } from '../database/db-http.service'
import { leaderboardSessions, leaderboards, users, githubStats } from '../../lib/schema'
import { eq, and, sql } from 'drizzle-orm'
import { LeaderboardSession, InsertLeaderboardSession } from '../../lib/schema'
import { timezoneService } from '../../lib/timezone'

//  Session types and their configurations
export const SESSION_CONFIGS = {
  daily: {
    updateIntervalMinutes: 5, // 5 minutes
    cronPattern: '*/5 * * * *', // Every 5 minutes
    durationHours: 24,
  },
  weekly: {
    updateIntervalMinutes: 360, // 6 hours
    cronPattern: '0 */6 * * *', // Every 6 hours
    durationHours: 168, // 7 days
  },
  monthly: {
    updateIntervalMinutes: 720, // 12 hours
    cronPattern: '0 */12 * * *', // Every 12 hours
    durationHours: 744, // 31 days (approximate)
  },
  yearly: {
    updateIntervalMinutes: 1440, // 24 hours
    cronPattern: '0 0 * * *', // Daily at midnight
    durationHours: 8760, // 365 days
  },
  overall: {
    updateIntervalMinutes: 10080, // Weekly
    cronPattern: '0 0 * * 0', // Weekly on Sunday
    durationHours: 8760 * 10, // 10 years (effectively permanent)
  },
} as const

export type SessionType = keyof typeof SESSION_CONFIGS

//  Session Management Service
//  Handles leaderboard sessions with contest-like behavior
class SessionManagementService {
  private cronJobs: Map<string, any> = new Map()
  private isRunning = false
  private activeSessions: Map<string, LeaderboardSession> = new Map()
  private initializing = false // Prevent concurrent initialization

  //  Start the session management service
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Session management service is already running')
      return
    }

    console.log('Starting session management service...')
    this.isRunning = true

    // Initialize or create active sessions
    await this.initializeSessions()
    
    // Start cron jobs for each session type
    await this.startCronJobs()
    
    console.log('Session management service started successfully')
  }

  //  Stop the session management service   
  stop(): void {
    if (!this.isRunning) {
      console.log('Session management service is not running')
      return
    }

    console.log('Stopping session management service...')
    
    // Stop all cron jobs
    this.cronJobs.forEach((job, sessionType) => {
      job.stop()
      console.log(`Stopped cron job for ${sessionType} sessions`)
    })
    
    this.cronJobs.clear()
    this.activeSessions.clear()
    this.isRunning = false
    
    console.log('Session management service stopped')
  }

  //  Initialize or create active sessions
    
  private async initializeSessions(): Promise<void> {
    if (this.initializing) {
      console.log('Session initialization already in progress, skipping...')
      return
    }
    
    this.initializing = true
    console.log('Initializing leaderboard sessions...')
    
    try {
      for (const [sessionType, config] of Object.entries(SESSION_CONFIGS)) {
        await this.ensureActiveSession(sessionType as SessionType)
      }
    } finally {
      this.initializing = false
    }
  }

  //  Ensure there's an active session for the given session type
  private async ensureActiveSession(sessionType: SessionType): Promise<void> {
    const config = SESSION_CONFIGS[sessionType as keyof typeof SESSION_CONFIGS]
    
    // Generate expected session key based on current timezone
    const expectedSessionKey = timezoneService.getSessionKey(sessionType)
    const expectedStartDate = timezoneService.getSessionStartDate(sessionType)
    const expectedEndDate = timezoneService.getSessionEndDate(sessionType)
    
    // Check if there's already an ACTIVE session with the CORRECT session key
    // This prevents duplicate sessions for the same period
    const existingSession = await db
      .select()
      .from(leaderboardSessions)
      .where(
        and(
          eq(leaderboardSessions.sessionType, sessionType),
          eq(leaderboardSessions.sessionKey, expectedSessionKey), // Match exact session key
          eq(leaderboardSessions.isActive, true)
        )
      )
      .limit(1)

    if (existingSession.length > 0) {
      const session = existingSession[0]
      this.activeSessions.set(sessionType, session)
      console.log(`Found existing active ${sessionType} session: ${session.sessionKey}`)
      return
    }

    // This prevents duplicate sessions from multiple initialization attempts
    await db
      .update(leaderboardSessions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(leaderboardSessions.sessionType, sessionType),
          eq(leaderboardSessions.isActive, true)
        )
      )

    console.log(`Deactivated any existing ${sessionType} session before creating new one`)

    const newSession: InsertLeaderboardSession = {
      sessionType,
      sessionKey: expectedSessionKey,
      startDate: expectedStartDate,
      endDate: expectedEndDate,
      isActive: true,
      updateIntervalMinutes: config.updateIntervalMinutes,
      nextUpdateAt: new Date(Date.now() + config.updateIntervalMinutes * 60 * 1000),
    }

    const [createdSession] = await db
      .insert(leaderboardSessions)
      .values(newSession)
      .returning()

    this.activeSessions.set(sessionType, createdSession)
    console.log(`Created new ${sessionType} session: ${expectedSessionKey}`)
  }

  //  Start interval-based scheduling for all session types
    
  private async startCronJobs(): Promise<void> {
    console.log('Starting interval-based scheduling for session updates')
    
    // Daily: every 5 minutes
    const dailyInterval = setInterval(() => {
      this.updateSession('daily')
    }, 5 * 60 * 1000)
    this.cronJobs.set('daily', { stop: () => clearInterval(dailyInterval) })

    // Weekly: every 6 hours
    const weeklyInterval = setInterval(() => {
      this.updateSession('weekly')
    }, 6 * 60 * 60 * 1000)
    this.cronJobs.set('weekly', { stop: () => clearInterval(weeklyInterval) })

    // Monthly: every 12 hours
    const monthlyInterval = setInterval(() => {
      this.updateSession('monthly')
    }, 12 * 60 * 60 * 1000)
    this.cronJobs.set('monthly', { stop: () => clearInterval(monthlyInterval) })

    // Yearly: every 24 hours
    const yearlyInterval = setInterval(() => {
      this.updateSession('yearly')
    }, 24 * 60 * 60 * 1000)
    this.cronJobs.set('yearly', { stop: () => clearInterval(yearlyInterval) })

    // Overall: every 7 days
    const overallInterval = setInterval(() => {
      this.updateSession('overall')
    }, 7 * 24 * 60 * 60 * 1000)
    this.cronJobs.set('overall', { stop: () => clearInterval(overallInterval) })

    console.log('Interval-based scheduling started for all session types')
  }

  //  Update a specific session
    
  private async updateSession(sessionType: string): Promise<void> {
    try {
      console.log(`Updating ${sessionType} session...`)
      
      const session = this.activeSessions.get(sessionType)
      if (!session) {
        console.log(`No active ${sessionType} session found`)
        return
      }

      // Check if session has expired
      const now = new Date()
      if (now > session.endDate) {
        console.log(`${sessionType} session has expired, creating new session`)
        await this.createNewSession(sessionType as SessionType)
        return
      }

      // Update leaderboards for this session
      await this.updateSessionLeaderboards(session)

      // Update session metadata
      await this.updateSessionMetadata(session)

      console.log(`Successfully updated ${sessionType} session`)
    } catch (error) {
      console.error(`Error updating ${sessionType} session:`, error)
    }
  }

  //  Update leaderboards for a specific session
    
  private async updateSessionLeaderboards(session: LeaderboardSession): Promise<void> {
    console.log(`Updating leaderboards for session ${session.sessionKey}...`)

    // Get all users with their stats
    const usersWithStats = await db
      .select({
        userId: users.id,
        username: users.username,
        points: githubStats.points,
        totalCommits: githubStats.totalCommits,
        totalStars: githubStats.totalStars,
        dailyContributions: githubStats.dailyContributions,
        weeklyContributions: githubStats.weeklyContributions,
        monthlyContributions: githubStats.monthlyContributions,
        yearlyContributions: githubStats.yearlyContributions,
        overallContributions: githubStats.overallContributions,
      })
      .from(users)
      .innerJoin(githubStats, eq(users.id, githubStats.userId))
      .where(eq(users.username, sql`${users.username} IS NOT NULL`))

    if (usersWithStats.length === 0) {
      console.log('No users found for leaderboard update')
      return
    }

    // Calculate scores based on session type
    const userScores = usersWithStats.map(user => ({
      ...user,
      score: this.calculateSessionScore(user, session.sessionType as SessionType),
    }))

    // Sort by score (descending)
    userScores.sort((a, b) => b.score - a.score)

    // Update or insert leaderboard entries
    for (let i = 0; i < userScores.length; i++) {
      const user = userScores[i]
      const rank = i + 1

      await db
        .insert(leaderboards)
        .values({
          userId: user.userId,
          sessionId: session.id,
          period: session.sessionType,
          periodDate: timezoneService.getPeriodDate(session.sessionType as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'global'),
          commits: this.getCommitsForSession(user, session.sessionType as SessionType),
          score: user.score,
          rank,
        })
        .onConflictDoUpdate({
          target: [leaderboards.userId, leaderboards.sessionId],
          set: {
            commits: this.getCommitsForSession(user, session.sessionType as SessionType),
            score: user.score,
            rank,
            updatedAt: new Date(),
          },
        })
    }

    console.log(`Updated leaderboards for ${userScores.length} users in session ${session.sessionKey}`)
  }

  //  Calculate score for a user based on session type
    
  private calculateSessionScore(user: any, sessionType: SessionType): number {
    const baseScore = user.points || 0
    
    switch (sessionType) {
      case 'daily':
        return baseScore + (user.dailyContributions || 0) * 10
      case 'weekly':
        return baseScore + (user.weeklyContributions || 0) * 5
      case 'monthly':
        return baseScore + (user.monthlyContributions || 0) * 3
      case 'yearly':
        return baseScore + (user.yearlyContributions || 0) * 2
      case 'overall':
        return baseScore + (user.overallContributions || 0)
      default:
        return baseScore
    }
  }

  //  Get commits for a specific session type
    
  private getCommitsForSession(user: any, sessionType: SessionType): number {
    switch (sessionType) {
      case 'daily':
        return user.dailyContributions || 0
      case 'weekly':
        return user.weeklyContributions || 0
      case 'monthly':
        return user.monthlyContributions || 0
      case 'yearly':
        return user.yearlyContributions || 0
      case 'overall':
        return user.overallContributions || 0
      default:
        return 0
    }
  }

  //  Update session metadata
    
  private async updateSessionMetadata(session: LeaderboardSession): Promise<void> {
    const config = SESSION_CONFIGS[session.sessionType as keyof typeof SESSION_CONFIGS]
    const nextUpdate = new Date(Date.now() + config.updateIntervalMinutes * 60 * 1000)

    await db
      .update(leaderboardSessions)
      .set({
        lastUpdateAt: new Date(),
        nextUpdateAt: nextUpdate,
        updatedAt: new Date(),
      })
      .where(eq(leaderboardSessions.id, session.id))
  }

  //  Create a new session when the current one expires
  private async createNewSession(sessionType: SessionType): Promise<void> {
    const config = SESSION_CONFIGS[sessionType as keyof typeof SESSION_CONFIGS]
    
    // Use timezone service for consistent date handling
    const sessionKey = timezoneService.getSessionKey(sessionType)
    const startDate = timezoneService.getSessionStartDate(sessionType)
    const endDate = timezoneService.getSessionEndDate(sessionType)

    // Get old active sessions before deactivating
    const oldActiveSessions = await db
      .select()
      .from(leaderboardSessions)
      .where(
        and(
          eq(leaderboardSessions.sessionType, sessionType),
          eq(leaderboardSessions.isActive, true)
        )
      )

    // Deactivate old sessions
    await db
      .update(leaderboardSessions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(leaderboardSessions.sessionType, sessionType),
          eq(leaderboardSessions.isActive, true)
        )
      )

    // Clean up old leaderboard entries from deactivated sessions
    if (oldActiveSessions.length > 0) {
      console.log(`Cleaning up entries from ${oldActiveSessions.length} old ${sessionType} sessions...`)
      for (const oldSession of oldActiveSessions) {
        const deletedCount = await db
          .delete(leaderboards)
          .where(eq(leaderboards.sessionId, oldSession.id))
        
        console.log(`Deleted entries from old ${sessionType} session ${oldSession.sessionKey} (session ID: ${oldSession.id})`)
      }
    }

    // Create new session
    const newSession: InsertLeaderboardSession = {
      sessionType,
      sessionKey,
      startDate,
      endDate,
      isActive: true,
      updateIntervalMinutes: config.updateIntervalMinutes,
      nextUpdateAt: new Date(Date.now() + config.updateIntervalMinutes * 60 * 1000),
    }

    const [createdSession] = await db
      .insert(leaderboardSessions)
      .values(newSession)
      .returning()

    this.activeSessions.set(sessionType, createdSession)
    console.log(`Created new ${sessionType} session: ${sessionKey}`)
  }


  //  Get service status
  getStatus(): {
    isRunning: boolean
    activeSessions: Array<{
      type: string
      sessionKey: string
      startDate: Date
      endDate: Date
      nextUpdate: Date | null
    }>
  } {
    return {
      isRunning: this.isRunning,
      activeSessions: Array.from(this.activeSessions.values()).map(session => ({
        type: session.sessionType,
        sessionKey: session.sessionKey,
        startDate: session.startDate,
        endDate: session.endDate,
        nextUpdate: session.nextUpdateAt,
      })),
    }
  }

  //  Trigger manual update for a specific session type
    
  async triggerSessionUpdate(sessionType: string): Promise<void> {
    console.log(`Manually triggering update for ${sessionType} session`)
    await this.updateSession(sessionType)
  }

  //  Get leaderboard data for a specific session
    
  async getSessionLeaderboard(sessionType: SessionType, limit: number = 50): Promise<any[]> {
    const session = this.activeSessions.get(sessionType)
    if (!session) {
      throw new Error(`No active session found for type: ${sessionType}`)
    }

    return await db
      .select({
        rank: leaderboards.rank,
        username: users.username,
        commits: leaderboards.commits,
        score: leaderboards.score,
        profileImageUrl: users.profileImageUrl,
      })
      .from(leaderboards)
      .innerJoin(users, eq(leaderboards.userId, users.id))
      .where(eq(leaderboards.sessionId, session.id))
      .orderBy(leaderboards.rank)
      .limit(limit)
  }
}

// Export singleton instance
export const sessionManagementService = new SessionManagementService()
