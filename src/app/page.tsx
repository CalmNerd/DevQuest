"use client"

import { useEffect, useState } from "react"
import Header from "@/components/layout/Header"
import Hero from "@/components/layout/Hero"
import Features from "@/components/layout/Features"
import LeaderboardPreview from "@/components/layout/LeaderboardPreview"
import Testimonials from "@/components/layout/Testimonials"
import Footer from "@/components/layout/Footer"
import CTA from "@/components/layout/CTA"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        setIsLoggedIn(response.ok)
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsLoggedIn(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Live Leaderboard Preview */}
      <LeaderboardPreview />

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section - Only show if user is NOT logged in */}
      {!isCheckingAuth && !isLoggedIn && <CTA />}

      {/* Footer */}
      <Footer />
    </div>
  )
}
