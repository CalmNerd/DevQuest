import { Github } from 'lucide-react'
import { Button } from '../ui'
import Link from 'next/link'

const Header = () => {
    return (
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Github className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">DevQuest</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/leaderboards">Leaderboards</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/issues-list">Hunt Issues</Link>
                        </Button>
                        <Button variant="outline">Sign In</Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Header