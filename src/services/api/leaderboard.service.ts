import { storage } from "../../lib/storage"
import { db } from "../database/db-http.service"
import { leaderboards, users } from "../../lib/schema"
import { eq, and, sql } from "drizzle-orm"

class LeaderboardService {
  async updateUserLeaderboards(userId: string, stats: any) {
    const periods = ["daily", "weekly", "monthly", "yearly", "global"]
    const now = new Date()

    for (const period of periods) {
      let periodDate: string
      let commits = 0

      switch (period) {
        case "daily": {
          const todayStr = now.toISOString().split("T")[0]
          periodDate = todayStr
          commits = this.calculateDailyCommits(stats.contributionGraph, todayStr)
          break
        }
        case "weekly": {
          const weekStart = this.getWeekStartUtcDate(now)
          const weekEnd = this.addDaysUtc(weekStart, 6)
          const weekStartStr = weekStart.toISOString().split("T")[0]
          periodDate = weekStartStr
          const weekEndStr = weekEnd.toISOString().split("T")[0]
          commits = this.calculateWeeklyCommits(stats.contributionGraph, weekStartStr, weekEndStr)
          break
        }
        case "monthly": {
          periodDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
          commits = this.calculateMonthlyCommits(stats.contributionGraph, now.getFullYear(), now.getMonth())
          break
        }
        case "yearly": {
          periodDate = String(now.getFullYear())
          commits = this.calculateYearlyCommits(stats.contributionGraph, now.getFullYear())
          break
        }
        case "global": {
          periodDate = "all-time"
          // For global, use the overall contributions across all years
          commits = stats.overallContributions || 0
          break
        }
        default:
          continue
      }

      // For global period, use lifetime points for power level calculation
      // For other periods, use regular points
      const score =
        period === "global"
          ? (stats.last365Contributions || 0) +
            (stats.totalStars || 0) * 2 +
            (stats.currentStreak || 0) * 5 +
            (stats.totalRepositories || 0) * 3
          : stats.points || 0

      await storage.updateLeaderboardEntry({
        userId,
        period,
        periodDate,
        commits,
        score,
      })
    }

    await this.updateRanks()
  }

  private getWeekStartUtcDate(date: Date): Date {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    const day = d.getUTCDay()
    const diff = day
    d.setUTCDate(d.getUTCDate() - diff)
    return d
  }

  private addDaysUtc(date: Date, days: number): Date {
    const d = new Date(date)
    d.setUTCDate(d.getUTCDate() + days)
    return d
  }

  private calculateDailyCommits(contributionGraph: any, dateStr: string): number {
    if (!contributionGraph?.weeks) return 0
    for (const week of contributionGraph.weeks) {
      for (const day of week.contributionDays) {
        if (day.date === dateStr) {
          return day.contributionCount || 0
        }
      }
    }
    return 0
  }

  private calculateWeeklyCommits(contributionGraph: any, weekStartStr: string, weekEndStr: string): number {
    if (!contributionGraph?.weeks) return 0
    let totalCommits = 0
    for (const week of contributionGraph.weeks) {
      for (const day of week.contributionDays) {
        const ds = day.date as string
        if (ds >= weekStartStr && ds <= weekEndStr) {
          totalCommits += day.contributionCount || 0
        }
      }
    }
    return totalCommits
  }

  private calculateMonthlyCommits(contributionGraph: any, year: number, monthIndex: number): number {
    if (!contributionGraph?.weeks) return 0
    let totalCommits = 0
    for (const week of contributionGraph.weeks) {
      for (const day of week.contributionDays) {
        const dayDate = new Date(day.date)
        if (dayDate.getUTCFullYear() === year && dayDate.getUTCMonth() === monthIndex) {
          totalCommits += day.contributionCount || 0
        }
      }
    }
    return totalCommits
  }

  private calculateYearlyCommits(contributionGraph: any, year: number): number {
    if (!contributionGraph?.weeks) return 0
    let totalCommits = 0
    for (const week of contributionGraph.weeks) {
      for (const day of week.contributionDays) {
        const dayDate = new Date(day.date)
        if (dayDate.getUTCFullYear() === year) {
          totalCommits += day.contributionCount || 0
        }
      }
    }
    return totalCommits
  }

  private async updateRanksForPeriod(period: string, periodDate: string) {
    await db.execute(sql`
      WITH ordered AS (
        SELECT id, commits as rank_value,
          ROW_NUMBER() OVER (ORDER BY commits DESC, updated_at ASC) AS new_rank
        FROM ${leaderboards}
        WHERE period = ${period} AND period_date = ${periodDate}
      )
      UPDATE ${leaderboards} AS l
      SET rank = o.new_rank
      FROM ordered o
      WHERE l.id = o.id;
    `)
  }

  async updateRanks() {
    const periods = ["daily", "weekly", "monthly", "yearly", "global"]

    for (const period of periods) {
      const now = new Date()
      let periodDate: string

      switch (period) {
        case "daily":
          periodDate = now.toISOString().split("T")[0]
          break
        case "weekly": {
          const weekStart = this.getWeekStartUtcDate(now)
          periodDate = weekStart.toISOString().split("T")[0]
          break
        }
        case "monthly":
          periodDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
          break
        case "yearly":
          periodDate = String(now.getFullYear())
          break
        case "global":
          periodDate = "all-time"
          break
        default:
          continue
      }

      await this.updateRanksForPeriod(period, periodDate)
    }
  }

  async getLeaderboardWithUsers(period: string, limit = 50) {
    const now = new Date()
    let periodDate: string

    switch (period) {
      case "daily":
        periodDate = now.toISOString().split("T")[0]
        break
      case "weekly": {
        const weekStart = this.getWeekStartUtcDate(now)
        periodDate = weekStart.toISOString().split("T")[0]
        break
      }
      case "monthly":
        periodDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        break
      case "yearly":
        periodDate = String(now.getFullYear())
        break
      case "global":
        periodDate = "all-time"
        break
      default:
        periodDate = now.toISOString().split("T")[0]
    }

    const result = await db
      .select({
        rank: leaderboards.rank,
        commits: leaderboards.commits,
        score: leaderboards.score,
        userId: leaderboards.userId,
        username: users.username,
        profileImageUrl: users.profileImageUrl,
        updatedAt: leaderboards.updatedAt,
      })
      .from(leaderboards)
      .leftJoin(users, eq(leaderboards.userId, users.id))
      .where(and(eq(leaderboards.period, period), eq(leaderboards.periodDate, periodDate)))
      .orderBy(leaderboards.rank)
      .limit(limit)

    return result.map((entry) => ({
      ...entry,
      rank: entry.rank || 0,
    }))
  }

  async getTopPerformers(period: string, limit = 10) {
    return await this.getLeaderboardWithUsers(period, limit)
  }

  async getUserLeaderboardPosition(userId: string, period: string) {
    const rank = await storage.getUserRank(userId, period)
    return { rank: rank || null }
  }

  async getLeaderboard(period: string, limit: number = 50) {
    return await this.getLeaderboardWithUsers(period, limit)
  }

  private getPeriodDate(period: string): string {
    const now = new Date()
    switch (period) {
      case 'daily':
        return now.toISOString().split('T')[0] // YYYY-MM-DD
      case 'weekly':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        return weekStart.toISOString().split('T')[0]
      case 'monthly':
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      case 'yearly':
        return now.getFullYear().toString()
      case 'overall':
      default:
        return 'all-time'
    }
  }
}

export const leaderboardService = new LeaderboardService()
