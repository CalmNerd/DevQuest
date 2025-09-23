import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui'
import { Trophy, Users, Star, GitBranch, Search, Database, Zap, Github } from "lucide-react"

const Features = () => {

    const features = [
        {
            icon: Trophy,
            title: "Dynamic Leaderboards",
            description: "Compete on daily, weekly, monthly, and yearly contribution leaderboards with power levels and rankings",
        },
        {
            icon: Star,
            title: "Achievement Badges",
            description: "Earn unique badges for milestones, streaks, and special accomplishments with rarity levels",
        },
        {
            icon: Users,
            title: "Rich GitHub Profiles",
            description: "Comprehensive profile cards with contribution graphs, stats, and detailed GitHub analytics",
        },
        {
            icon: GitBranch,
            title: "Repository Discovery",
            description: "Advanced search and filtering for GitHub repositories by language, topic, and license",
        },
        {
            icon: Search,
            title: "Issue Explorer",
            description: "Discover and filter GitHub issues across repositories with advanced search capabilities",
        },
        {
            icon: Database,
            title: "Drizzle ORM Backend",
            description: "Type-safe database operations with real-time analytics and background services",
        },
    ]
    return (
        <section className="py-10">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Game-Changing Features</h2>
                    <p className="text-lg text-muted-foreground">
                        Everything you need to gamify your GitHub experience and compete with developers worldwide
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="group h-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features