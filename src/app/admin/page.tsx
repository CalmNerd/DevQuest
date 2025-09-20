"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ServiceStatus {
  isRunning: boolean
  isUpdating: boolean
  nextUpdateIn: number
  nextUpdateInSeconds: number
}

interface ServiceConfig {
  updateIntervalSeconds: number
  batchSize: number
  batchDelaySeconds: number
}

interface BackgroundServiceData {
  service: ServiceStatus
  config: ServiceConfig
}

interface AnalyticsData {
  platform: {
    totalUsers: number
    totalPoints: number
    totalStars: number
    totalCommits: number
    averagePointsPerUser: number
  }
  achievements: {
    totalAchievements: number
    totalUnlocked: number
    mostCommonAchievement: { name: string } | null
  }
}

export default function BackgroundServiceAdmin() {
  const [data, setData] = useState<BackgroundServiceData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/background-service")
      const result = await response.json()
      if (result.status === "success") {
        setData(result)
      } else {
        console.error("Failed to fetch status:", result.message)
      }
    } catch (error) {
      console.error("Error fetching status:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/drizzle-analytics?type=overview")
      const result = await response.json()
      if (result.status === "success") {
        setAnalytics(result.data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const performAction = async (action: string) => {
    setActionLoading(action)
    try {
      const response = await fetch("/api/background-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })
      const result = await response.json()
      if (result.status === "success") {
        // Refresh status after action
        await fetchStatus()
      } else {
        console.error("Action failed:", result.message)
      }
    } catch (error) {
      console.error("Error performing action:", error)
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchAnalytics()
    // Refresh status every 10 seconds
    const interval = setInterval(() => {
      fetchStatus()
      fetchAnalytics()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin panel...</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Failed to load admin panel data
        </div>
      </div>
    )
  }

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Drizzle ORM Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Manage the gamified GitHub profiles system with Drizzle ORM
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="service">Background Service</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Statistics */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.platform.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.platform.totalPoints.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.platform.totalStars.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Points/User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.platform.averagePointsPerUser}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>Current state of the background service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={data.service.isRunning ? "default" : "secondary"}>
                    {data.service.isRunning ? "Running" : "Stopped"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Updating:</span>
                  <Badge variant={data.service.isUpdating ? "destructive" : "outline"}>
                    {data.service.isUpdating ? "In Progress" : "Idle"}
                  </Badge>
                </div>

                {data.service.isRunning && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Next Update:</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(data.service.nextUpdateIn)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drizzle ORM Status</CardTitle>
                <CardDescription>Database operations status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Database:</span>
                  <Badge variant="default">Connected</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">ORM:</span>
                  <Badge variant="default">Drizzle</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Type Safety:</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="service" className="space-y-6">
          {/* Service Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Service Configuration</CardTitle>
              <CardDescription>Current service settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Update Interval:</span>
                <span className="text-sm">{data.config.updateIntervalSeconds}s</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Batch Size:</span>
                <span className="text-sm">{data.config.batchSize} users</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Batch Delay:</span>
                <span className="text-sm">{data.config.batchDelaySeconds}s</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Service Actions</CardTitle>
              <CardDescription>Control the background service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => performAction("start")}
                  disabled={data.service.isRunning || actionLoading === "start"}
                  variant="default"
                >
                  {actionLoading === "start" ? "Starting..." : "Start Service"}
                </Button>

                <Button
                  onClick={() => performAction("stop")}
                  disabled={!data.service.isRunning || actionLoading === "stop"}
                  variant="destructive"
                >
                  {actionLoading === "stop" ? "Stopping..." : "Stop Service"}
                </Button>

                <Button
                  onClick={() => performAction("trigger")}
                  disabled={actionLoading === "trigger"}
                  variant="outline"
                >
                  {actionLoading === "trigger" ? "Triggering..." : "Trigger Update"}
                </Button>

                <Button
                  onClick={fetchStatus}
                  disabled={loading}
                  variant="outline"
                >
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Drizzle Analytics</CardTitle>
              <CardDescription>Advanced analytics using Drizzle ORM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/drizzle-analytics?type=top-users&limit=10")
                      const result = await response.json()
                      if (result.status === "success") {
                        console.log("Top users:", result.data)
                        alert(`Retrieved top users data`)
                      }
                    } catch (error) {
                      alert(`Analytics error: ${error}`)
                    }
                  }}
                  variant="outline"
                >
                  Get Top Users
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/drizzle-analytics?type=languages")
                      const result = await response.json()
                      if (result.status === "success") {
                        console.log("Language distribution:", result.data)
                        alert(`Retrieved language distribution`)
                      }
                    } catch (error) {
                      alert(`Analytics error: ${error}`)
                    }
                  }}
                  variant="outline"
                >
                  Get Language Stats
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/drizzle-analytics?type=growth&days=7")
                      const result = await response.json()
                      if (result.status === "success") {
                        console.log("User growth:", result.data)
                        alert(`Retrieved user growth data`)
                      }
                    } catch (error) {
                      alert(`Analytics error: ${error}`)
                    }
                  }}
                  variant="outline"
                >
                  Get Growth Data
                </Button>

                <Button
                  onClick={fetchAnalytics}
                  variant="outline"
                >
                  Refresh Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          {/* Database Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Database Operations</CardTitle>
              <CardDescription>Test and manage database operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/test-database")
                      const result = await response.json()
                      if (result.status === "success") {
                        alert(`Database test passed: ${result.summary.passedTests}/${result.summary.totalTests} tests`)
                      } else {
                        alert(`Database test failed: ${result.message}`)
                      }
                    } catch (error) {
                      alert(`Database test error: ${error}`)
                    }
                  }}
                  variant="outline"
                >
                  Test Database Operations
                </Button>

                <Button
                  onClick={() => {
                    alert("Drizzle Studio: Run 'npm run db:studio' to open Drizzle Studio")
                  }}
                  variant="outline"
                >
                  Open Drizzle Studio
                </Button>

                <Button
                  onClick={() => {
                    alert("Migrations: Run 'npm run db:generate' to generate migrations")
                  }}
                  variant="outline"
                >
                  Generate Migrations
                </Button>

                <Button
                  onClick={() => {
                    alert("Push Schema: Run 'npm run db:push' to push schema changes")
                  }}
                  variant="outline"
                >
                  Push Schema
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Drizzle Commands */}
          <Card>
            <CardHeader>
              <CardTitle>Drizzle Commands</CardTitle>
              <CardDescription>Available Drizzle ORM commands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <div><code>npm run db:generate</code> - Generate migrations</div>
                <div><code>npm run db:migrate</code> - Run migrations</div>
                <div><code>npm run db:push</code> - Push schema changes</div>
                <div><code>npm run db:studio</code> - Open Drizzle Studio</div>
                <div><code>npm run db:test</code> - Test Drizzle operations</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
