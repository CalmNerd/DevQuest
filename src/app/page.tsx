"use client"

import Header from "@/components/layout/Header"
import Hero from "@/components/layout/Hero"
import Features from "@/components/layout/Features"
import LeaderboardDemo from "@/components/layout/LeaderboardDemo"
import Footer from "@/components/layout/Footer"
import CTA from "@/components/layout/CTA"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Live Leaderboard Preview */}
      <LeaderboardDemo />

      {/* CTA Section */}
      <CTA />

      {/* Footer */}
      <Footer />
    </div>
  )
}
