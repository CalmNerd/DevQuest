"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatContributionDate } from "@/lib/date-formatter"

interface ContributionDay {
  date: string
  contributionCount: number
  level: number
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionGraph {
  weeks: ContributionWeek[]
  totalContributions: number
}

interface ContributionGraphProps {
  contributionGraph: ContributionGraph
  className?: string
}

export function ContributionGraph({ contributionGraph, className = "" }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)

  useEffect(() => {
    if (contributionGraph?.weeks) {
      calculateStreaks()
    }
  }, [contributionGraph])

  const calculateStreaks = () => {
    const allDays: ContributionDay[] = []
    contributionGraph.weeks.forEach(week => {
      allDays.push(...week.contributionDays)
    })

    // Calculate current streak (from today backwards)
    let currentStreakCount = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = allDays.length - 1; i >= 0; i--) {
      const dayDate = new Date(allDays[i].date)
      dayDate.setHours(0, 0, 0, 0)
      
      if (dayDate.getTime() > today.getTime()) continue
      if (dayDate.getTime() === today.getTime() || allDays[i].contributionCount > 0) {
        currentStreakCount++
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreakCount = 0
    let tempStreak = 0

    for (const day of allDays) {
      if (day.contributionCount > 0) {
        tempStreak++
        longestStreakCount = Math.max(longestStreakCount, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    setCurrentStreak(currentStreakCount)
    setLongestStreak(longestStreakCount)
  }

  const getContributionLevel = (count: number): number => {
    if (count === 0) return 0
    if (count <= 3) return 1
    if (count <= 6) return 2
    if (count <= 9) return 3
    return 4
  }

  const getContributionColor = (level: number): string => {
    const colors = [
      "bg-gray-800", // No contributions
      "bg-green-900", // 1-3 contributions
      "bg-green-700", // 4-6 contributions
      "bg-green-500", // 7-9 contributions
      "bg-green-400", // 10+ contributions
    ]
    return colors[level] || colors[0]
  }

  const formatDate = (dateString: string): string => {
    return formatContributionDate(dateString)
  }

  const getMonthLabels = () => {
    const months = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    if (contributionGraph?.weeks) {
      const firstWeek = contributionGraph.weeks[0]
      if (firstWeek?.contributionDays?.length > 0) {
        const firstDate = new Date(firstWeek.contributionDays[0].date)
        const currentMonth = firstDate.getMonth()
        
        for (let i = 0; i < 12; i++) {
          const monthIndex = (currentMonth + i) % 12
          months.push(monthNames[monthIndex])
        }
      }
    }
    
    return months
  }

  if (!contributionGraph?.weeks || contributionGraph.weeks.length === 0) {
    return (
      <Card className={className}>
        {/* <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contribution Graph
          </CardTitle>
        </CardHeader> */}
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12" />
              <p>No contribution data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        {/* <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Contribution Graph
        </CardTitle> */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{contributionGraph.totalContributions}</span>
            <span>contributions in the last year</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-orange-400" />
              <span className="font-semibold text-foreground">{currentStreak}</span>
              <span>day streak</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="font-semibold text-foreground">{longestStreak}</span>
              <span>longest streak</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            {/* Month labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              {getMonthLabels().map((month, index) => (
                <span key={index} className="w-12 text-center">
                  {month}
                </span>
              ))}
            </div>

            {/* Contribution grid */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, index) => (
                  <div key={index} className="h-3 flex items-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Contribution squares */}
              <div className="flex gap-1 overflow-x-auto">
                {contributionGraph.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.contributionDays.map((day, dayIndex) => {
                      const level = getContributionLevel(day.contributionCount)
                      const colorClass = getContributionColor(level)
                      
                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={`h-3 w-3 rounded-sm ${colorClass} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
                              whileHover={{ scale: 1.1 }}
                              onMouseEnter={() => setHoveredDay(day)}
                              onMouseLeave={() => setHoveredDay(null)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <div className="font-semibold">
                                {day.contributionCount} {day.contributionCount === 1 ? 'contribution' : 'contributions'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(day.date)}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-3 w-3 rounded-sm ${getContributionColor(level)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
