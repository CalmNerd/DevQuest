import { db } from '../database/db-http.service'
import { leaderboardSessions, leaderboards, users, githubStats } from '../../lib/schema'
import { eq, and, sql } from 'drizzle-orm'
import { LeaderboardSession, InsertLeaderboardSession } from '../../lib/schema'

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
    console.log('Initializing leaderboard sessions...')
    
    for (const [sessionType, config] of Object.entries(SESSION_CONFIGS)) {
      await this.ensureActiveSession(sessionType as SessionType)
    }
  }

  //  Ensure there's an active session for the given session type
  private async ensureActiveSession(sessionType: SessionType): Promise<void> {
    const config = SESSION_CONFIGS[sessionType as keyof typeof SESSION_CONFIGS]
    const now = new Date()
    
    // Check if there's already an active session
    const existingSession = await db
      .select()
      .from(leaderboardSessions)
      .where(
        and(
          eq(leaderboardSessions.sessionType, sessionType),
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

    // Create new session
    const sessionKey = this.generateSessionKey(sessionType, now)
    const startDate = this.getSessionStartDate(sessionType, now)
    const endDate = this.getSessionEndDate(sessionType, startDate)

    const newSession: InsertLeaderboardSession = {
      sessionType,
      sessionKey,
      startDate,
      endDate,
      isActive: true,
      updateIntervalMinutes: config.updateIntervalMinutes,
      nextUpdateAt: new Date(now.getTime() + config.updateIntervalMinutes * 60 * 1000),
    }

    const [createdSession] = await db
      .insert(leaderboardSessions)
      .values(newSession)
      .returning()

    this.activeSessions.set(sessionType, createdSession)
    console.log(`Created new ${sessionType} session: ${sessionKey}`)
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
          periodDate: this.getPeriodDate(session.sessionType as SessionType, session.startDate),
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
    const now = new Date()
    const sessionKey = this.generateSessionKey(sessionType, now)
    const startDate = this.getSessionStartDate(sessionType, now)
    const endDate = this.getSessionEndDate(sessionType, startDate)
    const config = SESSION_CONFIGS[sessionType as keyof typeof SESSION_CONFIGS]

    // Deactivate old session
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

    // Create new session
    const newSession: InsertLeaderboardSession = {
      sessionType,
      sessionKey,
      startDate,
      endDate,
      isActive: true,
      updateIntervalMinutes: config.updateIntervalMinutes,
      nextUpdateAt: new Date(now.getTime() + config.updateIntervalMinutes * 60 * 1000),
    }

    const [createdSession] = await db
      .insert(leaderboardSessions)
      .values(newSession)
      .returning()

    this.activeSessions.set(sessionType, createdSession)
    console.log(`Created new ${sessionType} session: ${sessionKey}`)
  }

    //  Generate a unique session key
    
  private generateSessionKey(sessionType: SessionType, date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const week = this.getWeekNumber(date)
    
    switch (sessionType) {
      case 'daily':
        return `${sessionType}-${year}-${month}-${day}`
      case 'weekly':
        return `${sessionType}-${year}-W${week}`
      case 'monthly':
        return `${sessionType}-${year}-${month}`
      case 'yearly':
        return `${sessionType}-${year}`
      case 'overall':
        return `${sessionType}-all-time`
      default:
        return `${sessionType}-${year}-${month}-${day}`
    }
  }

  //  Get session start date based on type
  private getSessionStartDate(sessionType: SessionType, date: Date): Date {
    const newDate = new Date(date)
    
    switch (sessionType) {
      case 'daily':
        // Start at midnight
        newDate.setHours(0, 0, 0, 0)
        return newDate
      case 'weekly':
        // Start on Monday at midnight
        const dayOfWeek = newDate.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        newDate.setDate(newDate.getDate() - daysToMonday)
        newDate.setHours(0, 0, 0, 0)
        return newDate
      case 'monthly':
        // Start on first day of month
        newDate.setDate(1)
        newDate.setHours(0, 0, 0, 0)
        return newDate
      case 'yearly':
        // Start on January 1st
        newDate.setMonth(0, 1)
        newDate.setHours(0, 0, 0, 0)
        return newDate
      case 'overall':
        // Start from a fixed date (e.g., 2020-01-01)
        return new Date('2020-01-01T00:00:00Z')
      default:
        return newDate
    }
  }

  //  Get session end date based on type
    
  private getSessionEndDate(sessionType: SessionType, startDate: Date): Date {
    const endDate = new Date(startDate)
    const config = SESSION_CONFIGS[sessionType as keyof typeof SESSION_CONFIGS]
    
    endDate.setTime(endDate.getTime() + config.durationHours * 60 * 60 * 1000)
    
    // For daily, weekly, monthly, yearly - end at 23:59:59
    if (sessionType !== 'overall') {
      endDate.setHours(23, 59, 59, 999)
    }
    
    return endDate
  }

  //  Get period date string for leaderboard
    
  private getPeriodDate(sessionType: SessionType, startDate: Date): string {
    const year = startDate.getFullYear()
    const month = String(startDate.getMonth() + 1).padStart(2, '0')
    const day = String(startDate.getDate()).padStart(2, '0')
    const week = this.getWeekNumber(startDate)
    
    switch (sessionType) {
      case 'daily':
        return `${year}-${month}-${day}`
      case 'weekly':
        return `${year}-W${week}`
      case 'monthly':
        return `${year}-${month}`
      case 'yearly':
        return `${year}`
      case 'overall':
        return 'all-time'
      default:
        return `${year}-${month}-${day}`
    }
  }

  //  Get week number of the year
    
  private getWeekNumber(date: Date): string {
    const start = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    return String(Math.ceil((days + start.getDay() + 1) / 7)).padStart(2, '0')
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
