"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import TrendingPreview from '@/components/repositories/TrendingPreview'
import GSoCOrganizationsPreview from '@/components/gsoc/GSoCOrganizationsPreview'


export default function RepositoryHomePage() {

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">GitHub Trending</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Discover what's trending on GitHub today
            </p>
          </motion.div>

          {/* Trending Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TrendingPreview />
          </motion.div>

          {/* GSoC Organizations Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GSoCOrganizationsPreview />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

