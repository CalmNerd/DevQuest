import { db } from "../database/db-http.service"
import { leaderboards, users, leaderboardSessions, githubStats } from "../../lib/schema"
import { eq, and, sql, desc } from "drizzle-orm"
import { timezoneService } from "../../lib/timezone"


//  Session-aware leaderboard service
class SessionLeaderboardService {

    // Get leaderboard for a specific session type
    async getSessionLeaderboard(
        sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall',
        limit: number = 50,
        offset: number = 0,
        leaderboardType: 'points' | 'commits' | 'stars' | 'streak' | 'repos' | 'followers' = 'points'
    ): Promise<any[]> {
        try {
            // Get the active session for this type
            const activeSession = await this.getActiveSession(sessionType)
            if (!activeSession) {
                throw new Error(`No active session found for type: ${sessionType}`)
            }

            // Get leaderboard entries for this session
            // Order by the appropriate metric based on leaderboard type
            let orderByClause: any[]
            
            switch (leaderboardType) {
                case 'points':
                    orderByClause = [desc(leaderboards.score), desc(leaderboards.commits)]
                    break
                case 'commits':
                    orderByClause = [desc(leaderboards.commits), desc(leaderboards.score)]
                    break
                case 'stars':
                    orderByClause = [desc(githubStats.totalStars), desc(leaderboards.score)]
                    break
                case 'streak':
                    orderByClause = [desc(githubStats.longestStreak), desc(leaderboards.score)]
                    break
                case 'repos':
                    orderByClause = [desc(githubStats.totalRepositories), desc(leaderboards.score)]
                    break
                case 'followers':
                    orderByClause = [desc(githubStats.followers), desc(leaderboards.score)]
                    break
                default:
                    orderByClause = [desc(leaderboards.score), desc(leaderboards.commits)]
            }

            const result = await db
                .select({
                    rank: leaderboards.rank,
                    commits: leaderboards.commits,
                    score: leaderboards.score,
                    totalStars: githubStats.totalStars,
                    longestStreak: githubStats.longestStreak,
                    totalRepositories: githubStats.totalRepositories,
                    followers: githubStats.followers,
                    userId: leaderboards.userId,
                    username: users.username,
                    name: users.name,
                    profileImageUrl: users.profileImageUrl,
                    githubUrl: users.githubUrl,
                    bio: users.bio,
                    location: users.location,
                    createdAt: users.createdAt,
                    updatedAt: leaderboards.updatedAt,
                })
                .from(leaderboards)
                .innerJoin(users, eq(leaderboards.userId, users.id))
                .innerJoin(githubStats, eq(leaderboards.userId, githubStats.userId))
                .where(eq(leaderboards.sessionId, activeSession.id))
                .orderBy(...orderByClause)
                .limit(limit)
                .offset(offset)

            return result.map((entry, index) => ({
                ...entry,
                rank: offset + index + 1, // Calculate correct rank based on position
                sessionKey: activeSession.sessionKey,
                sessionType: activeSession.sessionType,
                sessionStartDate: activeSession.startDate,
                sessionEndDate: activeSession.endDate,
            }))
        } catch (error) {
            console.error(`Error getting ${sessionType} session leaderboard:`, error)
            return []
        }
    }

    // Get all session leaderboards

    async getAllSessionLeaderboards(limit: number = 10, leaderboardType: 'points' | 'commits' | 'stars' | 'streak' | 'repos' | 'followers' = 'points'): Promise<Record<string, any[]>> {
        const sessionTypes = ['daily', 'weekly', 'monthly', 'yearly', 'overall'] as const
        const leaderboards: Record<string, any[]> = {}

        for (const sessionType of sessionTypes) {
            try {
                leaderboards[sessionType] = await this.getSessionLeaderboard(sessionType, limit, 0, leaderboardType)
            } catch (error) {
                console.error(`Error getting ${sessionType} leaderboard:`, error)
                leaderboards[sessionType] = []
            }
        }

        return leaderboards
    }

    // Get user's position in a specific session leaderboard

    async getUserSessionPosition(
        userId: string,
        sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall'
    ): Promise<{ rank: number | null; score: number; commits: number } | null> {
        try {
            const activeSession = await this.getActiveSession(sessionType)
            if (!activeSession) {
                return null
            }

            const result = await db
                .select({
                    rank: leaderboards.rank,
                    score: leaderboards.score,
                    commits: leaderboards.commits,
                })
                .from(leaderboards)
                .where(
                    and(
                        eq(leaderboards.userId, userId),
                        eq(leaderboards.sessionId, activeSession.id)
                    )
                )
                .limit(1)

            if (result.length === 0) {
                return null
            }

            return {
                rank: result[0].rank ?? 0,
                score: result[0].score ?? 0,
                commits: result[0].commits ?? 0,
            }
        } catch (error) {
            console.error(`Error getting user position for ${sessionType} session:`, error)
            return null
        }
    }

    // Get session statistics

    async getSessionStats(sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall'): Promise<{
        totalParticipants: number
        sessionInfo: any
        topPerformer: any | null
    }> {
        try {
            const activeSession = await this.getActiveSession(sessionType)
            if (!activeSession) {
                throw new Error(`No active session found for type: ${sessionType}`)
            }

            // Get total participants
            const totalResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(leaderboards)
                .where(eq(leaderboards.sessionId, activeSession.id))

            const totalParticipants = totalResult[0]?.count || 0

            // Get top performer
            const topPerformerResult = await db
                .select({
                    rank: leaderboards.rank,
                    commits: leaderboards.commits,
                    score: leaderboards.score,
                    username: users.username,
                    name: users.name,
                    profileImageUrl: users.profileImageUrl,
                })
                .from(leaderboards)
                .innerJoin(users, eq(leaderboards.userId, users.id))
                .where(eq(leaderboards.sessionId, activeSession.id))
                .orderBy(leaderboards.rank)
                .limit(1)

            return {
                totalParticipants,
                sessionInfo: {
                    sessionKey: activeSession.sessionKey,
                    sessionType: activeSession.sessionType,
                    startDate: activeSession.startDate,
                    endDate: activeSession.endDate,
                    isActive: activeSession.isActive,
                    lastUpdateAt: activeSession.lastUpdateAt,
                    nextUpdateAt: activeSession.nextUpdateAt,
                },
                topPerformer: topPerformerResult.length > 0 ? topPerformerResult[0] : null,
            }
        } catch (error) {
            console.error(`Error getting ${sessionType} session stats:`, error)
            return {
                totalParticipants: 0,
                sessionInfo: null,
                topPerformer: null,
            }
        }
    }

    // Get all session statistics

    async getAllSessionStats(): Promise<Record<string, any>> {
        const sessionTypes = ['daily', 'weekly', 'monthly', 'yearly', 'overall'] as const
        const stats: Record<string, any> = {}

        for (const sessionType of sessionTypes) {
            try {
                stats[sessionType] = await this.getSessionStats(sessionType)
            } catch (error) {
                console.error(`Error getting ${sessionType} session stats:`, error)
                stats[sessionType] = {
                    totalParticipants: 0,
                    sessionInfo: null,
                    topPerformer: null,
                }
            }
        }

        return stats
    }

    private async getActiveSession(sessionType: string): Promise<any | null> {
        try {
            // Get all active sessions for this type to check for duplicates
            const activeSessions = await db
                .select()
                .from(leaderboardSessions)
                .where(
                    and(
                        eq(leaderboardSessions.sessionType, sessionType),
                        eq(leaderboardSessions.isActive, true)
                    )
                )

            if (activeSessions.length === 0) {
                console.log(`No active ${sessionType} session found`)
                return null
            }

            // If multiple active sessions exist (shouldn't happen but can due to race conditions)
            if (activeSessions.length > 1) {
                console.warn(`WARNING: Found ${activeSessions.length} active ${sessionType} sessions! Cleaning up duplicates...`)
                
                // Get the expected session key for current period
                const expectedSessionKey = timezoneService.getSessionKey(sessionType as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall')
                
                // Find the session with the correct session key
                const correctSession = activeSessions.find(s => s.sessionKey === expectedSessionKey)
                
                // If no session matches the expected key, keep the most recent one
                const sessionToKeep = correctSession || activeSessions.sort((a, b) => {
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                    return dateB - dateA
                })[0]
                
                // Deactivate all other sessions
                const sessionsToDeactivate = activeSessions.filter(s => s.id !== sessionToKeep.id)
                for (const session of sessionsToDeactivate) {
                    await db
                        .update(leaderboardSessions)
                        .set({ isActive: false, updatedAt: new Date() })
                        .where(eq(leaderboardSessions.id, session.id))
                    console.log(`Deactivated duplicate ${sessionType} session: ${session.sessionKey} (ID: ${session.id})`)
                }
                
                return sessionToKeep
            }

            return activeSessions[0]
        } catch (error) {
            console.error(`Error getting active session for ${sessionType}:`, error)
            return null
        }
    }

    // Get leaderboard history for a user across all sessions
    async getUserSessionHistory(
        userId: string,
        sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall',
        limit: number = 10
    ): Promise<any[]> {
        try {
            const result = await db
                .select({
                    rank: leaderboards.rank,
                    commits: leaderboards.commits,
                    score: leaderboards.score,
                    sessionKey: leaderboardSessions.sessionKey,
                    sessionStartDate: leaderboardSessions.startDate,
                    sessionEndDate: leaderboardSessions.endDate,
                    updatedAt: leaderboards.updatedAt,
                })
                .from(leaderboards)
                .innerJoin(leaderboardSessions, eq(leaderboards.sessionId, leaderboardSessions.id))
                .where(
                    and(
                        eq(leaderboards.userId, userId),
                        eq(leaderboardSessions.sessionType, sessionType)
                    )
                )
                .orderBy(desc(leaderboards.updatedAt))
                .limit(limit)

            return result
        } catch (error) {
            console.error(`Error getting user session history for ${sessionType}:`, error)
            return []
        }
    }

    // Get recent session activity
    async getRecentSessionActivity(limit: number = 20): Promise<any[]> {
        try {
            const result = await db
                .select({
                    sessionType: leaderboardSessions.sessionType,
                    sessionKey: leaderboardSessions.sessionKey,
                    username: users.username,
                    name: users.name,
                    profileImageUrl: users.profileImageUrl,
                    rank: leaderboards.rank,
                    commits: leaderboards.commits,
                    score: leaderboards.score,
                    updatedAt: leaderboards.updatedAt,
                })
                .from(leaderboards)
                .innerJoin(leaderboardSessions, eq(leaderboards.sessionId, leaderboardSessions.id))
                .innerJoin(users, eq(leaderboards.userId, users.id))
                .where(eq(leaderboardSessions.isActive, true))
                .orderBy(desc(leaderboards.updatedAt))
                .limit(limit)

            return result
        } catch (error) {
            console.error('Error getting recent session activity:', error)
            return []
        }
    }

    // Get session leaderboard with pagination
    async getSessionLeaderboardPaginated(
        sessionType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall',
        page: number = 1,
        pageSize: number = 50,
        leaderboardType: 'points' | 'commits' | 'stars' | 'streak' | 'repos' | 'followers' = 'points'
    ): Promise<{
        data: any[]
        pagination: {
            page: number
            pageSize: number
            total: number
            totalPages: number
            hasNext: boolean
            hasPrev: boolean
        }
    }> {
        try {
            const offset = (page - 1) * pageSize
            const data = await this.getSessionLeaderboard(sessionType, pageSize, offset, leaderboardType)

            // Get total count
            const activeSession = await this.getActiveSession(sessionType)
            if (!activeSession) {
                return {
                    data: [],
                    pagination: {
                        page,
                        pageSize,
                        total: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false,
                    },
                }
            }

            const totalResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(leaderboards)
                .where(eq(leaderboards.sessionId, activeSession.id))

            const total = totalResult[0]?.count || 0
            const totalPages = Math.ceil(total / pageSize)

            return {
                data,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            }
        } catch (error) {
            console.error(`Error getting paginated ${sessionType} leaderboard:`, error)
            return {
                data: [],
                pagination: {
                    page,
                    pageSize,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            }
        }
    }
}

// Export singleton instance
export const sessionLeaderboardService = new SessionLeaderboardService()
