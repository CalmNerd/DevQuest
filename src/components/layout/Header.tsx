'use client'

import { Button } from '../ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '../ui/sidebar'
import { useSidebar } from '../ui/sidebar'
import { motion } from 'framer-motion'
import { AuthSection } from '../auth'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../ui/sheet'

// Context error fix - safely handle sidebar context
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
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Navigation links configuration
    const navLinks = [
        { href: '/leaderboards', label: 'Leaderboards' },
        { href: '/repositories', label: 'Explore Repos' },
        { href: '/issues-list', label: 'Hunt Issues' },
    ]

    // Check if we should show sidebar trigger
    // On mobile: always show trigger when in repositories section
    // On desktop: show trigger only when sidebar is collapsed
    const shouldShowSidebarTrigger = pathname.startsWith('/repositories') && (
        sidebarContext?.isMobile || sidebarContext?.state === "collapsed"
    )

    return (
        <nav className="w-full border-b border-border bg-card/50 sticky top-0 z-30 backdrop-blur-sm">
            <div className="px-2 sm:px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Left section: Logo or Sidebar Trigger */}
                    {shouldShowSidebarTrigger ? (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="pl-2 sm:pl-4"
                        >
                            <SidebarTrigger />
                        </motion.div>
                    ) : (
                        <div>
                            {(!pathname.startsWith('/repositories')) && (
                                <Link href="/">
                                    <div className="flex items-center pl-2 sm:pl-4 md:pl-8 font-bold text-xl sm:text-2xl">
                                        <span className="text-blue-500">dev</span>
                                        <span className="bg-linear-to-r/longer from-blue-500 to-yellow-400 text-transparent bg-clip-text">quest</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Desktop Navigation - Hidden on small screens */}
                    <div className="hidden lg:flex items-center gap-4 pr-8">
                        {navLinks.map((link) => (
                            <Button key={link.href} variant="ghost" asChild>
                                <Link href={link.href}>{link.label}</Link>
                            </Button>
                        ))}
                        <AuthSection />
                    </div>

                    {/* Mobile Navigation - Visible on small screens */}
                    <div className="flex lg:hidden items-center gap-2 pr-2 sm:pr-4">
                        {/* Auth Section (simplified for mobile) */}
                        <div className="hidden sm:block">
                            <AuthSection />
                        </div>

                        {/* Mobile Menu Sheet */}
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                                <SheetHeader>
                                    <SheetTitle>
                                        <Link href="/" onClick={() => setIsMenuOpen(false)}>
                                            <div className="flex items-center font-bold text-2xl">
                                                <span className="text-blue-500">dev</span>
                                                <span className="bg-linear-to-r/longer from-blue-500 to-yellow-400 text-transparent bg-clip-text">quest</span>
                                            </div>
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-4 mt-8 px-4">
                                    {/* Navigation Links */}
                                    {navLinks.map((link) => (
                                        <Button
                                            key={link.href}
                                            variant={pathname === link.href ? "default" : "ghost"}
                                            asChild
                                            className="w-full justify-start text-base"
                                        >
                                            <Link href={link.href} onClick={() => setIsMenuOpen(false)}>
                                                {link.label}
                                            </Link>
                                        </Button>
                                    ))}

                                    {/* Auth Section for very small screens */}
                                    <div className="sm:hidden mt-4 pt-4 border-t border-border">
                                        <AuthSection />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Header