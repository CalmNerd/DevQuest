"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Home,
  TrendingUp,
  Search,
  Filter,
  Github,
  Star,
  GitFork,
  Code,
} from 'lucide-react'

interface SidebarNavItem {
  title: string
  href: string
  icon: React.ReactNode
  description: string
}

export default function RepositorySidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  const navigationItems: SidebarNavItem[] = [
    {
      title: 'Home',
      href: '/repositories',
      icon: <Home className="h-4 w-4" />,
      description: 'Repository overview and search'
    },
    {
      title: 'Discover',
      href: '/repositories/discover',
      icon: <Search className="h-4 w-4" />,
      description: 'Discover repositories by topics and languages'
    },
    {
      title: 'Advanced',
      href: '/repositories/advanced',
      icon: <Filter className="h-4 w-4" />,
      description: 'Advanced repository filtering options'
    },
    {
      title: 'Trending',
      href: '/repositories/trending',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Trending repositories by time period'
    }
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-3">
          <Link href="/" className='size-7'>
            <Github className="" />
          </Link>
          <AnimatePresence mode="wait">
            {state === "expanded" && (
              <motion.div
                key="header-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="w-full font-semibold flex items-center justify-between gap-2">
                <Link href="/">
                  <motion.span>
                    DevQuest
                  </motion.span>
                </Link>
                <SidebarTrigger />
              </motion.div>

            )}
          </AnimatePresence>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        {item.icon}
                        <AnimatePresence mode="wait">
                          {state === "expanded" && (
                            <motion.span
                              key={`nav-${item.href}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='px-0'>
        <SidebarGroup>
          <AnimatePresence mode="wait">
            {state === "expanded" && (
              <motion.div
                key="quick-access-label"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
              </motion.div>
            )}
          </AnimatePresence>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Most Starred"
                >
                  <Link href="/repositories?q=stars:>1000">
                    <Star className="h-4 w-4" />
                    <AnimatePresence mode="wait">
                      {state === "expanded" && (
                        <motion.span
                          key="most-starred"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          Most Starred
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Most Forked"
                >
                  <Link href="/repositories?q=forks:>100">
                    <GitFork className="h-4 w-4" />
                    <AnimatePresence mode="wait">
                      {state === "expanded" && (
                        <motion.span
                          key="most-forked"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          Most Forked
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="By Language"
                >
                  <Link href="/repositories?q=language:javascript">
                    <Code className="h-4 w-4" />
                    <AnimatePresence mode="wait">
                      {state === "expanded" && (
                        <motion.span
                          key="by-language"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          By Language
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
