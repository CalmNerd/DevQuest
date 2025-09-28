'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu'
import { Loader2, LogOutIcon } from 'lucide-react'

interface User {
    id: string
    username: string
    name: string
    profileImageUrl: string
    githubUrl: string
    blogUrl?: string
    bio?: string
    location?: string
    email?: string
    githubCreatedAt?: string
    createdAt?: string
    updatedAt?: string
}

interface UserProfileProps {
    user?: User
    onLogout?: () => void
    className?: string
}

export function UserProfile({ user: propUser, onLogout, className }: UserProfileProps) {
    const [user, setUser] = useState<User | null>(propUser || null)
    const [isLoading, setIsLoading] = useState(!propUser)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        if (propUser) {
            setUser(propUser)
            setIsLoading(false)
        } else {
            fetchUser()
        }
    }, [propUser])

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include' // Include cookies in the request
            })

            console.log('User profile fetch response:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('User data received:', data)
                setUser(data.user)
            } else {
                console.log('User not authenticated, status:', response.status)
            }
        } catch (error) {
            console.error('Error fetching user:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        setIsLoggingOut(true)

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include' // Include cookies in the request
            })

            if (response.ok) {
                // Clear user state and call onLogout callback
                setUser(null)
                onLogout?.()
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Error logging out:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    if (isLoading) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl} alt={user.name} />
                    <AvatarFallback>
                        {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
            </Button>

            <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="ghost"
            >
                {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOutIcon className="w-4 h-4" />}
            </Button>


            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal bg-gray-50 dark:bg-gray-700">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                                {user.name || user.username}
                            </p>
                            <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                                @{user.username}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <a
                            href={user.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                            </svg>
                            View GitHub Profile
                        </a>
                    </DropdownMenuItem>
                    {user.blogUrl && (
                        <DropdownMenuItem asChild>
                            <a
                                href={user.blogUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Visit Website
                            </a>
                        </DropdownMenuItem>
                    )}
                    {user.location && (
                        <DropdownMenuItem disabled className="text-gray-500 dark:text-gray-400">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {user.location}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu> */}
        </div>
    )
}
