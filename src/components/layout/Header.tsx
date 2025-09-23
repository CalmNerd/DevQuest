import { Github } from 'lucide-react'
import { Button } from '../ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '../ui/sidebar'
import { useSidebar } from '../ui/sidebar'
import { useContext } from 'react'
import { motion } from 'framer-motion'

// context error fix
const useSidebarSafe = () => {
    try {
        return useSidebar()
    } catch {
        return null
    }
}

const Header = () => {
    const pathname = usePathname()
    const sidebarContext = useSidebarSafe()

    return (
        <nav className="w-full border-b border-border bg-card/50 sticky top-0 z-50 backdrop-blur-sm">
            <div className="px-2 py-4">
                <div className="flex items-center justify-between">
                    {(pathname === '/repositories' && sidebarContext?.state === "collapsed") ?
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}>

                            <SidebarTrigger />
                        </motion.div>
                        : <div>
                            {(pathname !== '/repositories') &&
                                <div className="flex items-center gap-2 pl-8">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                        <Github className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xl font-bold text-foreground">DevQuest</span>
                                </div>
                            }
                        </div>
                    }


                    <div className="flex items-center gap-4 pr-8">
                        <Button variant="ghost" asChild>
                            <Link href="/leaderboards">Leaderboards</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/repositories">Explore Repos</Link>
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