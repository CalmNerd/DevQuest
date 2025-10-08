import { motion } from "framer-motion"
import { Badge, Button, Card, CardContent } from "../ui"
import { DiscordProfileDialog } from "../features/discord-profile-dialog"
import { Trophy, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface LeaderboardEntry {
    rank: number
    username: string
    name?: string | null
    avatar_url: string | null
    score: number
    metric: string
}

const LeaderboardPreview = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch real leaderboard data from API
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true)
                // Fetch top 5 users by commits for weekly period
                const response = await fetch('/api/leaderboards?type=commits&period=weekly&limit=5')

                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard data')
                }

                const data = await response.json()

                // Set the leaderboard data from API response
                if (data.data && Array.isArray(data.data)) {
                    setLeaderboard(data.data)
                } else {
                    // Fallback to empty array if data structure is unexpected
                    setLeaderboard([])
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err)
                setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
                // Set empty array on error
                setLeaderboard([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchLeaderboard()
    }, [])
    return (
        <section className="py-10">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Live Leaderboard</h2>
                    <p className="text-lg text-muted-foreground">See who's dominating the GitHub rankings right now</p>
                </div>

                <Card className="mx-auto max-w-2xl">
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Top Contributors This Week</h3>
                            {!isLoading && !error && (
                                <Badge variant="secondary" className="animate-pulse">
                                    Live
                                </Badge>
                            )}
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">{error}</p>
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    Retry
                                </Button>
                            </div>
                        )}

                        {/* Leaderboard Data */}
                        {!isLoading && !error && leaderboard.length > 0 && (
                            <div className="space-y-4">
                                {leaderboard.map((entry, index) => (
                                    <motion.div
                                        key={entry.username || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-4 rounded-lg bg-muted/50 p-3"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                            {entry.rank}
                                        </div>
                                        <DiscordProfileDialog username={entry.username} className="flex flex-1 items-center gap-4">
                                            <img
                                                src={entry.avatar_url || "/placeholder.png"}
                                                alt={entry.username}
                                                className="h-10 w-10 rounded-full border-2 border-border"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium hover:text-primary">
                                                    {entry.name || entry.username}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {entry.score.toLocaleString()} {entry.metric}
                                                </div>
                                            </div>
                                        </DiscordProfileDialog>
                                        <Trophy className="h-5 w-5 text-secondary" />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && leaderboard.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No leaderboard data available yet</p>
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <Button asChild>
                                <Link href="/leaderboards">View Full Leaderboards</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

export default LeaderboardPreview