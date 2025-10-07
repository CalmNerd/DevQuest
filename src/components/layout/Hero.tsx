import React, { useState } from 'react'
import WorldMap from '../ui/icons/WorldMap'
import { motion } from 'framer-motion'
import { Search, Zap } from 'lucide-react'
import { Button, Input } from '../ui'

const Hero = () => {
    const [searchQuery, setSearchQuery] = useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/profile/${searchQuery.trim()}`
        }
    }
    return (
        <section className="relative container mx-auto h-dvh w-full flex items-center justify-center">
            <div className="absolute inset-0 mt-4">
                <WorldMap
                    responsive={true}
                    fillColor="#262626"
                    className="opacity-60 w-full h-full"
                    enableRainbowPulse={true}
                    maxAnimatedElements={8}
                    animationDuration={8000}
                />
            </div>
            {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" /> */}
            <div className="relative w-full max-w-7xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mx-auto max-w-5xl flex flex-col items-center justify-center min-h-full"
                >
                    <h1 className="mb-6 text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-semibold text-balance">
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 items-center justify-center">
                            <span className="text-[#F34B7D] px-4 py-2 -skew-x-20 rounded-md bg-[#F34B7D]/40 inline-block  backdrop-blur-xs"><span className="skew-x-20 rounded inline-block">Compete.</span></span>
                            <span className="text-[#4B68FE] px-4 py-2 -skew-x-20 rounded-md bg-[#4B68FE]/40 inline-block  backdrop-blur-xs"><span className="skew-x-20 rounded inline-block">Contribute.</span></span>
                            <span className="text-[#22E26F] px-4 py-2 -skew-x-20 rounded-md bg-[#22E26F]/40 inline-block  backdrop-blur-xs"><span className="skew-x-20 rounded inline-block">Hunt Bounties.</span></span>
                        </div>
                    </h1>
                    <p className="mb-8 text-md text-muted-foreground/80 text-pretty max-w-xl mx-auto">
                        Make <span className='font-bold text-muted-foreground p-1'>open-source</span> contributions, discover <span className='font-bold text-muted-foreground p-1 rounded-md'>bounty-paying</span> issue/repositories and <span className='font-bold text-muted-foreground p-1 rounded-md'>rank</span> among developers across <span className='font-bold text-muted-foreground p-1 rounded-md'>the globe.</span>
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mx-auto mb-12 max-w-md">
                        <div className="flex gap-2">
                            <div className="relative flex-1 backdrop-blur-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Enter GitHub username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" className="px-1">
                                <Zap className=" h-4 w-4" />
                                Rank Up
                            </Button>
                        </div>
                    </form>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-lg bg-card/50 p-4 backdrop-blur-sm"
                        >
                            <div className="text-2xl font-bold text-primary">10K+</div>
                            <div className="text-sm text-muted-foreground">Developers Ranked</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-lg bg-card/50 p-4 backdrop-blur-sm"
                        >
                            <div className="text-2xl font-bold text-accent">500K+</div>
                            <div className="text-sm text-muted-foreground">Commits Tracked</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-lg bg-card/50 p-4 backdrop-blur-sm"
                        >
                            <div className="text-2xl font-bold text-cyan-500">30+</div>
                            <div className="text-sm text-muted-foreground">Achievement Badges</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-lg bg-card/50 p-4 backdrop-blur-sm"
                        >
                            <div className="text-2xl font-bold text-chart-1">24/7</div>
                            <div className="text-sm text-muted-foreground">Live Updates</div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default Hero