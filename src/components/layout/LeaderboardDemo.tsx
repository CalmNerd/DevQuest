import { motion } from "framer-motion"
import { Badge, Button, Card, CardContent } from "../ui"
import { ProfileCardTrigger } from "../features/discord-profile-card"
import { Trophy } from "lucide-react"
import Link from "next/link"


const LeaderboardDemo = () => {
    const mockLeaderboard = [
        { rank: 1, username: "torvalds", avatar: "/placeholder.svg?height=40&width=40", score: 2847, metric: "commits" },
        { rank: 2, username: "gaearon", avatar: "/placeholder.svg?height=40&width=40", score: 2156, metric: "commits" },
        {
            rank: 3,
            username: "sindresorhus",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1923,
            metric: "commits",
        },
        { rank: 4, username: "tj", avatar: "/placeholder.svg?height=40&width=40", score: 1847, metric: "commits" },
        { rank: 5, username: "addyosmani", avatar: "/placeholder.svg?height=40&width=40", score: 1654, metric: "commits" },
    ]
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
                            <Badge variant="secondary" className="animate-pulse">
                                Live
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            {mockLeaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.username}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-4 rounded-lg bg-muted/50 p-3"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                        {entry.rank}
                                    </div>
                                    <ProfileCardTrigger username={entry.username} className="flex flex-1 items-center gap-4">
                                        <img
                                            src={entry.avatar || "/placeholder.svg"}
                                            alt={entry.username}
                                            className="h-10 w-10 rounded-full border-2 border-border"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium hover:text-primary">{entry.username}</div>
                                            <div className="text-sm text-muted-foreground">{entry.score} commits</div>
                                        </div>
                                    </ProfileCardTrigger>
                                    <Trophy className="h-5 w-5 text-secondary" />
                                </motion.div>
                            ))}
                        </div>

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

export default LeaderboardDemo