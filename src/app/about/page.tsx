"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Trophy,
  Award,
  Zap,
  Users,
  TrendingUp,
  Search,
  BookOpen,
  Target,
  LineChart,
  GitBranch,
  Star,
  Code,
  Sparkles,
  Medal,
  Crown,
  ArrowRight,
  Calculator,
  Activity,
  GitFork,
  Bug,
  GraduationCap,
  BarChart3,
  Settings
} from "lucide-react"

/**
 * About Page - Comprehensive documentation of DevQuest features
 * 
 * This page explains how each feature works, including formulas, algorithms,
 * and implementation details. Follows the project's gaming theme with
 * cyan, amber, and pink accent colors.
 */
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          About DevQuest
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Transform your GitHub profile into an engaging gaming experience with competitive leaderboards,
          achievement systems, and comprehensive analytics.
        </p>
      </motion.div>

      {/* Achievement System Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        id="achievements"
        className="mb-12"
      >
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-3xl">Achievement Badge System</CardTitle>
            </div>
            <CardDescription className="text-base">
              Earn over 90 unique badges across multiple categories with dynamic leveling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                How It Works
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                DevQuest features a sophisticated achievement system with both static and leveled badges.
                Achievements track your GitHub activity across 11 different categories, each with its own
                progression formula. As you earn achievements, you unlock higher tiers and earn more points
                towards your Power Level.
              </p>
            </div>

            <Separator />

            {/* Achievement Categories */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Medal className="h-5 w-5 text-secondary" />
                Leveled Achievement Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Followers",
                    icon: Users,
                    formula: "B=10, p=1.5, t=20, α=0.08",
                    description: "Track your social reach and influence"
                  },
                  {
                    name: "Stars",
                    icon: Star,
                    formula: "B=10, p=1.6, t=22, α=0.08",
                    description: "Total stars received across all repos"
                  },
                  {
                    name: "Contributions",
                    icon: Activity,
                    formula: "B=10, p=1.7, t=25, α=0.08",
                    description: "Overall contribution count"
                  },
                  {
                    name: "Language Diversity",
                    icon: Code,
                    formula: "B=2, p=1.3, t=30, α=0.05",
                    description: "Number of programming languages used"
                  },
                  {
                    name: "Repositories",
                    icon: GitBranch,
                    formula: "B=1, p=1.5, t=20, α=0.08",
                    description: "Total repositories created"
                  },
                  {
                    name: "Streak",
                    icon: TrendingUp,
                    formula: "B=7, p=1.4, t=30, α=0.06",
                    description: "Longest contribution streak in days"
                  },
                  {
                    name: "Account Age",
                    icon: Crown,
                    formula: "1 year = 1 level (linear)",
                    description: "GitHub account longevity"
                  },
                  {
                    name: "Issues",
                    icon: Bug,
                    formula: "B=5, p=1.4, t=15, α=0.08",
                    description: "Issues created and closed"
                  },
                  {
                    name: "Pull Requests",
                    icon: GitFork,
                    formula: "B=5, p=1.5, t=20, α=0.08",
                    description: "PRs merged across repositories"
                  },
                  {
                    name: "Reviews",
                    icon: Search,
                    formula: "B=10, p=1.6, t=25, α=0.08",
                    description: "Code reviews completed"
                  },
                  {
                    name: "External Contributions",
                    icon: Target,
                    formula: "B=3, p=1.4, t=10, α=0.08",
                    description: "Contributions to other repos"
                  }
                ].map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 mt-1">
                            <category.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{category.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {category.description}
                            </p>
                            <Badge variant="outline" className="text-xs font-mono">
                              {category.formula}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Formula Explanation */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-accent" />
                Leveling Formula Explained
              </h3>
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Base Formula</h4>
                  <code className="block bg-card p-3 rounded border text-sm">
                    requirement(n) = ⌊B × n^p × log₂(n + 1) × (1 + α)^max(0, n - t)⌋
                  </code>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold text-primary">n</span> = Target level number
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-secondary">B</span> = Base scaling factor (varies by category)
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-accent">p</span> = Polynomial exponent (controls growth rate)
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-primary">α</span> = Late-game acceleration (exponential growth)
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-secondary">t</span> = Threshold level where acceleration kicks in
                  </p>
                </div>
                <div className="bg-card/50 p-4 rounded border-l-4 border-primary">
                  <p className="text-sm leading-relaxed">
                    This formula creates a balanced progression curve: early levels are achievable to maintain
                    engagement, middle levels require moderate effort, and late levels become prestige achievements
                    requiring significant dedication. The logarithmic component ensures smooth transitions between levels.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tier System */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
                Tier & Rarity System
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    tier: "Bronze",
                    levels: "0-4",
                    rarity: "Common",
                    multiplier: "1x points",
                    color: "from-orange-400 to-orange-600",
                    animation: "0.1",
                    description: "Entry level achievements"
                  },
                  {
                    tier: "Silver",
                    levels: "5-9",
                    rarity: "Rare",
                    multiplier: "2x points",
                    color: "from-gray-300 to-gray-500",
                    animation: "0.2",
                    description: "Consistent contribution"
                  },
                  {
                    tier: "Gold",
                    levels: "10-19",
                    rarity: "Epic",
                    multiplier: "3x points",
                    color: "from-yellow-400 to-yellow-600",
                    animation: "0.4",
                    description: "Expert-level achievements"
                  },
                  {
                    tier: "Platinum",
                    levels: "20-29",
                    rarity: "Epic",
                    multiplier: "5x points",
                    color: "from-cyan-400 to-cyan-600",
                    animation: "0.6",
                    description: "Advanced mastery"
                  },
                  {
                    tier: "Diamond",
                    levels: "30-49",
                    rarity: "Legendary",
                    multiplier: "7x points",
                    color: "from-blue-400 to-purple-600",
                    animation: "0.8",
                    description: "Elite tier achievements"
                  },
                  {
                    tier: "Legendary",
                    levels: "50+",
                    rarity: "Legendary",
                    multiplier: "10x points",
                    color: "from-pink-500 via-purple-500 to-yellow-500",
                    animation: "1.0",
                    description: "Ultimate prestige"
                  }
                ].map((tier, index) => (
                  <motion.div
                    key={tier.tier}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div
                          className={`bg-gradient-to-r ${tier.color} text-white px-3 py-2 rounded-lg mb-3 text-center font-bold`}
                        >
                          {tier.tier}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Levels:</span>
                            <span className="font-semibold">{tier.levels}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rarity:</span>
                            <Badge variant="secondary" className="text-xs">{tier.rarity}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Points:</span>
                            <span className="font-semibold text-primary">{tier.multiplier}</span>
                          </div>
                          <p className="text-xs text-muted-foreground pt-2 border-t">
                            {tier.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* GitHub Native Achievements */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                GitHub Native Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Quickdraw",
                    description: "First to comment on an issue or PR",
                    criteria: "Be the first responder"
                  },
                  {
                    name: "Pair Extraordinaire",
                    description: "Co-authored commits with others",
                    criteria: "Collaborative coding"
                  },
                  {
                    name: "Pull Shark",
                    description: "Merged pull requests",
                    criteria: "Successful PR merges"
                  },
                  {
                    name: "Galaxy Brain",
                    description: "Answered discussions",
                    criteria: "Help community members"
                  },
                  {
                    name: "YOLO",
                    description: "Merged PR without review",
                    criteria: "Confident merges"
                  },
                  {
                    name: "Public Sponsor",
                    description: "Sponsoring open source",
                    criteria: "Financial support"
                  }
                ].map((achievement, index) => (
                  <motion.div
                    key={achievement.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1 text-primary">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {achievement.criteria}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Power Level System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        id="power-level"
        className="mb-12"
      >
        <Card className="border-secondary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-3xl">Power Level System</CardTitle>
            </div>
            <CardDescription className="text-base">
              RPG-inspired progression system with quadratic growth formula
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                How Power Levels Work
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your Power Level is the ultimate metric of your GitHub prowess. It's calculated from all
                the points you earn through achievements, contributions, and activities. Unlike traditional
                leveling systems, Power Levels use a quadratic formula that ensures meaningful progression
                at all stages while making higher levels prestigious achievements.
              </p>
            </div>

            <Separator />

            {/* Formula */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-accent" />
                Leveling Formula
              </h3>
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Points Required Per Level</h4>
                  <code className="block bg-card p-3 rounded border text-sm">
                    cost(n) = 100 + 20n + 3n²
                  </code>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold text-primary">n</span> = Current level number
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-secondary">100</span> = Base cost (constant)
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-accent">20n</span> = Linear growth component
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-primary">3n²</span> = Quadratic growth component
                  </p>
                </div>
                <div className="bg-card/50 p-4 rounded border-l-4 border-secondary">
                  <h4 className="font-semibold mb-2">Example Progression</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>Level 1: <span className="text-primary font-semibold">123 pts</span></div>
                    <div>Level 5: <span className="text-primary font-semibold">275 pts</span></div>
                    <div>Level 10: <span className="text-primary font-semibold">500 pts</span></div>
                    <div>Level 20: <span className="text-primary font-semibold">1,700 pts</span></div>
                    <div>Level 50: <span className="text-primary font-semibold">8,600 pts</span></div>
                    <div>Level 100: <span className="text-primary font-semibold">32,100 pts</span></div>
                    <div>Level 200: <span className="text-primary font-semibold">124,100 pts</span></div>
                    <div>Level 500: <span className="text-primary font-semibold">760,100 pts</span></div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Point Sources */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                How to Earn Points
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    source: "Achievement Unlocks",
                    points: "10-1000 points",
                    description: "Base achievement points multiplied by tier (1x-10x)",
                    icon: Award
                  },
                  {
                    source: "Leveled Achievements",
                    points: "Variable (exponential)",
                    description: "Higher levels grant exponentially more points",
                    icon: TrendingUp
                  },
                  {
                    source: "Contribution Milestones",
                    points: "50-500 points",
                    description: "Reaching contribution thresholds",
                    icon: Activity
                  },
                  {
                    source: "Streak Bonuses",
                    points: "10-100 points/day",
                    description: "Daily contribution streaks with multipliers",
                    icon: Trophy
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.source}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-secondary/10">
                            <item.icon className="h-5 w-5 text-secondary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.source}</h4>
                            <Badge variant="secondary" className="mb-2">{item.points}</Badge>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leaderboard System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        id="leaderboards"
        className="mb-12"
      >
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-3xl">Leaderboard System</CardTitle>
            </div>
            <CardDescription className="text-base">
              Competitive rankings across multiple timeframes and metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                How Leaderboards Work
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                DevQuest features a sophisticated multi-dimensional leaderboard system that tracks user
                performance across different time periods and metrics. Leaderboards auto-refresh every 5
                minutes and use session-based contest cycles to ensure fair competition and historical tracking.
              </p>
            </div>

            <Separator />

            {/* Time Periods */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                Time-Based Sessions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    period: "Daily",
                    description: "Today's contributions",
                    reset: "Midnight UTC",
                    icon: "🌅"
                  },
                  {
                    period: "Weekly",
                    description: "This week's activity",
                    reset: "Monday 00:00 UTC",
                    icon: "📅"
                  },
                  {
                    period: "Monthly",
                    description: "Current month",
                    reset: "1st of month",
                    icon: "📊"
                  },
                  {
                    period: "Yearly",
                    description: "This year's total",
                    reset: "January 1st",
                    icon: "🎯"
                  },
                  {
                    period: "All-Time",
                    description: "Lifetime stats",
                    reset: "Never resets",
                    icon: "👑"
                  }
                ].map((period, index) => (
                  <motion.div
                    key={period.period}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full text-center hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="text-3xl mb-2">{period.icon}</div>
                        <h4 className="font-semibold mb-1">{period.period}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {period.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {period.reset}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Ranking Metrics */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-accent" />
                Ranking Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    metric: "Power Points",
                    description: "Total achievement points earned",
                    calculation: "Sum of all achievement points with tier multipliers",
                    icon: Zap,
                    color: "text-secondary"
                  },
                  {
                    metric: "Total Stars",
                    description: "Stars across all repositories",
                    calculation: "Cumulative stargazers_count from all repos",
                    icon: Star,
                    color: "text-yellow-500"
                  },
                  {
                    metric: "Commits",
                    description: "Total commits in time period",
                    calculation: "Contribution graph data aggregation",
                    icon: GitBranch,
                    color: "text-primary"
                  },
                  {
                    metric: "Streak Days",
                    description: "Longest contribution streak",
                    calculation: "Consecutive days with contributions",
                    icon: TrendingUp,
                    color: "text-orange-500"
                  },
                  {
                    metric: "Repositories",
                    description: "Total public repositories",
                    calculation: "Count of public repos owned",
                    icon: BookOpen,
                    color: "text-accent"
                  },
                  {
                    metric: "Followers",
                    description: "GitHub follower count",
                    calculation: "Direct from GitHub API",
                    icon: Users,
                    color: "text-pink-500"
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.metric}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                            <metric.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{metric.metric}</h4>
                            <p className="text-sm text-muted-foreground">
                              {metric.description}
                            </p>
                          </div>
                        </div>
                        <div className="bg-muted/30 p-2 rounded text-xs">
                          <span className="text-muted-foreground">Calculation: </span>
                          <span className="font-mono">{metric.calculation}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Session System */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Automated Session Management
              </h3>
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Leaderboards use session-based contests that automatically create, track, and rotate.
                  Each session has a unique key (e.g., "daily-2024-10-10", "weekly-2024-W41") and stores
                  historical rankings. When a session ends, a new one begins automatically.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded border">
                    <h4 className="font-semibold mb-2 text-primary">Update Frequency</h4>
                    <p className="text-sm text-muted-foreground">
                      Background service refreshes all leaderboards every 5 minutes. Batch processing
                      handles multiple users efficiently while respecting GitHub API rate limits.
                    </p>
                  </div>
                  <div className="bg-card p-4 rounded border">
                    <h4 className="font-semibold mb-2 text-secondary">Rank Calculation</h4>
                    <p className="text-sm text-muted-foreground">
                      Ranks are calculated by sorting users by their metric score in descending order.
                      Ties are resolved by timestamp (earlier achievement gets better rank).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Repository Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        id="repositories"
        className="mb-12"
      >
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">Repository Discovery</CardTitle>
            </div>
            <CardDescription className="text-base">
              Advanced search, trending analysis, and repository recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Repository Features
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                DevQuest provides comprehensive repository discovery tools including GitHub's official
                trending page data, advanced search with multiple filters, and algorithmic trend scoring
                to help you find the most relevant and active projects.
              </p>
            </div>

            <Separator />

            {/* Trending Algorithm */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Trend Score Algorithm
              </h3>
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Composite Scoring Formula</h4>
                  <code className="block bg-card p-3 rounded border text-sm">
                    trend_score = (position × 0.3) + (stars × 0.3) + (forks × 0.2) + (recency × 0.2)
                  </code>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="bg-card p-3 rounded border">
                      <h5 className="font-semibold text-sm mb-1 text-primary">Position Score (30%)</h5>
                      <p className="text-xs text-muted-foreground">
                        Normalized ranking position: <code>(30 - index) / 30</code>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher positions get better scores
                      </p>
                    </div>
                    <div className="bg-card p-3 rounded border">
                      <h5 className="font-semibold text-sm mb-1 text-secondary">Stars Score (30%)</h5>
                      <p className="text-xs text-muted-foreground">
                        Logarithmic scaling: <code>log(stars + 1) / 10</code>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prevents mega-repos from dominating
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-card p-3 rounded border">
                      <h5 className="font-semibold text-sm mb-1 text-accent">Forks Score (20%)</h5>
                      <p className="text-xs text-muted-foreground">
                        Logarithmic scaling: <code>log(forks + 1) / 10</code>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Indicates active development community
                      </p>
                    </div>
                    <div className="bg-card p-3 rounded border">
                      <h5 className="font-semibold text-sm mb-1 text-primary">Recency Score (20%)</h5>
                      <p className="text-xs text-muted-foreground">
                        Time decay: <code>max(0, 1 - days/30)</code>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Favors recently updated repos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Repository Cards */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                Repository Card Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    category: "Basic Info",
                    items: ["Owner avatar & username", "Repository name & description", "Visibility status (public/private/archived)"]
                  },
                  {
                    category: "Statistics",
                    items: ["Star count", "Fork count", "Open issues count", "Repository size"]
                  },
                  {
                    category: "Metadata",
                    items: ["Primary language with color coding", "License type", "Last update timestamp", "Creation date"]
                  },
                  {
                    category: "Engagement",
                    items: ["Topics/tags for categorization", "Homepage URL if available", "Watchers count", "Default branch"]
                  }
                ].map((section, index) => (
                  <motion.div
                    key={section.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3 text-primary">{section.category}</h4>
                        <ul className="space-y-1">
                          {section.items.map((item) => (
                            <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Search Filters */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Advanced Search Filters
              </h3>
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Language", "Stars Range", "Forks Range", "Topics",
                    "License", "Created Date", "Updated Date", "Size",
                    "Owner Type", "Is Fork", "Has Issues", "Has Wiki",
                    "Has Projects", "Has Pages", "Archived", "Template"
                  ].map((filter, index) => (
                    <motion.div
                      key={filter}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Badge variant="secondary" className="w-full justify-center">
                        {filter}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* GitHub Trending */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        id="trending"
        className="mb-12"
      >
        <Card className="border-secondary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-3xl">GitHub Trending</CardTitle>
            </div>
            <CardDescription className="text-base">
              Real-time trending repositories and developers from GitHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                How It Works
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Since GitHub doesn't provide an official API for trending repositories, DevQuest uses
                advanced web scraping with Cheerio to parse GitHub's trending page. The data is cached
                for 10 minutes to minimize requests and respect GitHub's servers.
              </p>
            </div>

            <Separator />

            {/* Scraping Details */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-accent" />
                Data Extraction Process
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    step: "1. Fetch HTML",
                    description: "Request trending page with proper headers",
                    details: "User-Agent spoofing to avoid blocking"
                  },
                  {
                    step: "2. Parse Structure",
                    description: "Use Cheerio to extract article.Box-row elements",
                    details: "Each element represents one trending repo"
                  },
                  {
                    step: "3. Extract Data",
                    description: "Parse owner, name, description, language, stars",
                    details: "Convert string numbers to integers"
                  },
                  {
                    step: "4. Extract Contributors",
                    description: "Parse 'Built by' section for contributor avatars",
                    details: "Create contributor objects with profiles"
                  },
                  {
                    step: "5. Cache Results",
                    description: "Store in memory with 10-minute TTL",
                    details: "Reduce load and improve response time"
                  },
                  {
                    step: "6. Filter & Sort",
                    description: "Apply language filters and period selection",
                    details: "Support daily, weekly, monthly views"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.step}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.details}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Period Options */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                Trending Periods
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    period: "Daily",
                    description: "Hottest repos today",
                    icon: "🔥",
                    timeframe: "Last 24 hours"
                  },
                  {
                    period: "Weekly",
                    description: "This week's top picks",
                    icon: "📈",
                    timeframe: "Last 7 days"
                  },
                  {
                    period: "Monthly",
                    description: "Best of the month",
                    icon: "🌟",
                    timeframe: "Last 30 days"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.period}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-4xl mb-3">{item.icon}</div>
                        <h4 className="font-semibold text-lg mb-1">{item.period}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {item.timeframe}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issue Explorer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        id="issues"
        className="mb-12"
      >
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Bug className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-3xl">Issue Explorer</CardTitle>
            </div>
            <CardDescription className="text-base">
              Discover contribution opportunities and bounty-paying issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Finding Issues to Contribute
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                The Issue Explorer helps developers find meaningful contribution opportunities across
                all of GitHub. It supports advanced filtering by labels, languages, difficulty levels,
                and can identify issues with monetary bounties attached.
              </p>
            </div>

            <Separator />

            {/* Bounty Detection */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-secondary" />
                Bounty Detection System
              </h3>
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  DevQuest automatically identifies issues that offer financial compensation by searching
                  for specific label patterns commonly used by projects offering bounties.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded border">
                    <h4 className="font-semibold mb-3 text-primary">Bounty Label Patterns</h4>
                    <div className="space-y-2">
                      {[
                        "bounty",
                        "paid",
                        "$ reward",
                        "💰",
                        "compensation",
                        "funding",
                        "prize"
                      ].map((label) => (
                        <Badge key={label} variant="secondary" className="mr-2">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded border">
                    <h4 className="font-semibold mb-3 text-secondary">Search Strategy</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Case-insensitive label matching</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Parse issue descriptions for dollar amounts</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Check for bounty platform integrations</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Highlight bounty amount if specified</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Difficulty Levels */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-accent" />
                        Issue Difficulty Classification
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            level: "Beginner",
                            labels: ["good first issue", "beginner friendly", "easy", "starter"],
                            color: "from-green-400 to-green-600",
                            description: "Perfect for first-time contributors"
                          },
                          {
                            level: "Intermediate",
                            labels: ["help wanted", "medium", "enhancement", "feature"],
                            color: "from-yellow-400 to-yellow-600",
                            description: "Requires some project knowledge"
                          },
                          {
                            level: "Advanced",
                            labels: ["hard", "complex", "architecture", "core"],
                            color: "from-red-400 to-red-600",
                            description: "For experienced contributors"
                          }
                        ].map((difficulty, index) => (
                          <motion.div
                            key={difficulty.level}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="h-full">
                              <CardContent className="p-4">
                                <div
                                  className={`bg-gradient-to-r ${difficulty.color} text-white px-3 py-2 rounded-lg mb-3 text-center font-bold`}
                                >
                                  {difficulty.level}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {difficulty.description}
                                </p>
                                <div className="space-y-1">
                                  {difficulty.labels.map((label) => (
                                    <Badge key={label} variant="outline" className="mr-1 text-xs">
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Search Filters */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Available Search Filters
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            category: "State Filters",
                            filters: ["Open issues", "Closed issues", "All issues"]
                          },
                          {
                            category: "Label Filters",
                            filters: ["Custom labels", "Difficulty labels", "Bounty labels", "Help wanted"]
                          },
                          {
                            category: "Language Filters",
                            filters: ["Any language", "Specific language", "Multiple languages"]
                          },
                          {
                            category: "Sort Options",
                            filters: ["Created date", "Updated date", "Comments", "Reactions"]
                          }
                        ].map((section, index) => (
                          <motion.div
                            key={section.category}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="h-full hover:bg-muted/50 transition-colors">
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-3 text-primary">{section.category}</h4>
                                <ul className="space-y-1">
                                  {section.filters.map((filter) => (
                                    <li key={filter} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <ArrowRight className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                                      <span>{filter}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Issue Card Information */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-secondary" />
                        Issue Card Details
                      </h3>
                      <div className="bg-muted/30 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              section: "Basic Info",
                              items: ["Issue title & number", "Repository name", "Author avatar & username", "Creation date"]
                            },
                            {
                              section: "Content",
                              items: ["Formatted description preview", "Markdown cleanup", "Code block handling", "Link preservation"]
                            },
                            {
                              section: "Metadata",
                              items: ["State (open/closed)", "All issue labels", "Comment count", "Reaction counts"]
                            }
                          ].map((section) => (
                            <div key={section.section}>
                              <h4 className="font-semibold mb-2 text-accent">{section.section}</h4>
                              <ul className="space-y-1">
                                {section.items.map((item) => (
                                  <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* GSoC Organizations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                id="gsoc"
                className="mb-12"
              >
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-3xl">GSoC Organizations</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      Discover Google Summer of Code participating organizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overview */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        What is GSoC?
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Google Summer of Code is a global program that brings student developers into open source
                        software development. DevQuest provides a comprehensive browser for GSoC organizations,
                        allowing you to explore historical participation data, technologies used, and project ideas.
                      </p>
                    </div>

                    <Separator />

                    {/* Data Coverage */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-secondary" />
                        Data Coverage
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {["2024", "2023", "2022", "2021", "2020"].map((year, index) => (
                          <motion.div
                            key={year}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="text-center hover:bg-muted/50 transition-colors">
                              <CardContent className="p-4">
                                <div className="text-3xl font-bold text-primary mb-1">{year}</div>
                                <p className="text-xs text-muted-foreground">Full data</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Organization Details */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-accent" />
                        Organization Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            category: "Basic Profile",
                            items: ["Organization name & logo", "Description & category", "Official website", "Background color theme"],
                            icon: Users
                          },
                          {
                            category: "Participation",
                            items: ["Years participated", "Total projects hosted", "Historical chart data", "Participation trends"],
                            icon: Activity
                          },
                          {
                            category: "Technology Stack",
                            items: ["Programming languages", "Frameworks & tools", "Technology tags", "Topic categories"],
                            icon: Code
                          },
                          {
                            category: "Resources",
                            items: ["Project ideas list", "Contribution guidelines", "IRC channel info", "Contact email"],
                            icon: BookOpen
                          }
                        ].map((section, index) => (
                          <motion.div
                            key={section.category}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="h-full hover:bg-muted/50 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <section.icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <h4 className="font-semibold flex-1">{section.category}</h4>
                                </div>
                                <ul className="space-y-1">
                                  {section.items.map((item) => (
                                    <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <ArrowRight className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Data Aggregation */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-primary" />
                        Data Aggregation & Processing
                      </h3>
                      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                          DevQuest loads and aggregates GSoC data from JSON files for each year, combining
                          information about organizations that participated multiple times and providing
                          comprehensive views of their involvement.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-card p-4 rounded border">
                            <h4 className="font-semibold mb-2 text-primary">Multi-Year Aggregation</h4>
                            <p className="text-sm text-muted-foreground">
                              Organizations are merged across years with combined project counts, deduplicated
                              technology lists, and sorted participation years for easy viewing.
                            </p>
                          </div>
                          <div className="bg-card p-4 rounded border">
                            <h4 className="font-semibold mb-2 text-secondary">Chart Generation</h4>
                            <p className="text-sm text-muted-foreground">
                              Interactive charts show project counts per year, participation trends, and
                              organization growth over time using Recharts library.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Use Cases */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-accent" />
                        Use Cases
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            title: "Student Applications",
                            description: "Research organizations before applying to GSoC",
                            icon: "🎓",
                            benefits: ["See participation history", "Find matching skills", "Review project ideas"]
                          },
                          {
                            title: "Organization Discovery",
                            description: "Find open-source organizations by technology",
                            icon: "🔍",
                            benefits: ["Filter by language", "Browse by category", "Explore new domains"]
                          },
                          {
                            title: "Community Engagement",
                            description: "Connect with active open-source communities",
                            icon: "🤝",
                            benefits: ["Join IRC channels", "Read project guides", "Access mailing lists"]
                          }
                        ].map((useCase, index) => (
                          <motion.div
                            key={useCase.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="h-full hover:shadow-lg transition-shadow">
                              <CardContent className="p-5">
                                <div className="text-4xl mb-3 text-center">{useCase.icon}</div>
                                <h4 className="font-semibold mb-2 text-center">{useCase.title}</h4>
                                <p className="text-sm text-muted-foreground text-center mb-3">
                                  {useCase.description}
                                </p>
                                <ul className="space-y-1">
                                  {useCase.benefits.map((benefit) => (
                                    <li key={benefit} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Closing Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center py-8"
              >
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                      Ready to Level Up?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                      DevQuest transforms your GitHub journey into an engaging adventure. Track your progress,
                      compete with peers, and showcase your achievements to the world.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Badge variant="secondary" className="text-base px-4 py-2">
                        90+ Achievements
                      </Badge>
                      <Badge variant="secondary" className="text-base px-4 py-2">
                        6 Leaderboard Types
                      </Badge>
                      <Badge variant="secondary" className="text-base px-4 py-2">
                        Real-time Updates
                      </Badge>
                      <Badge variant="secondary" className="text-base px-4 py-2">
                        Global Rankings
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )
        }

