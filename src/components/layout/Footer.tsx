import Link from 'next/link'
import { Github } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="border-t border-border py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-2">
                        {/* <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                            <Github className="h-4 w-4 text-primary-foreground" />
                        </div> */}
                        <span className="font-semibold">DevQuest</span>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        {/* <Link href="/privacy" className="hover:text-foreground">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-foreground">
                            Terms
                        </Link> */}
                        <Link href="/about" className="hover:text-foreground">
                            About
                        </Link>
                        <span className="flex items-center">
                            Built by&nbsp;
                            <a
                                href="https://x.com/CalmNrd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground underline"
                                aria-label="Mohit on Twitter"
                            >
                                Mohit
                            </a>
                            . The source code is available on&nbsp;
                            <a
                                href="https://github.com/CalmNerd/DevQuest"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground underline flex items-center gap-1"
                                aria-label="DevQuest GitHub Repository"
                            >
                                {/* <Github className="inline h-4 w-4" /> */}
                                GitHub
                            </a>
                            .
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer