'use client'

import { useState, useEffect } from 'react'
import { LoginButton } from './LoginButton'
import { UserProfile } from './UserProfile'

interface AuthSectionProps {
  returnUrl?: string
}

// Authentication section that shows either login button or user profile
export function AuthSection({ returnUrl = '/' }: AuthSectionProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      console.log('Auth section - user fetch status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Auth section - user data:', data)
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user in auth section:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (user) {
    // User is logged in - show profile with logout
    return <UserProfile user={user} onLogout={() => setUser(null)} />
  }

  // User is not logged in - show login button
  return <LoginButton returnUrl={returnUrl} />
}
