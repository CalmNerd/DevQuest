"use client"

import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import RepositorySidebar from './components/repository-sidebar'
import Header from '@/components/layout/Header'

interface RepositoryLayoutProps {
  children: React.ReactNode
}

export default function RepositoryLayout({ children }: RepositoryLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <RepositorySidebar />
      <SidebarInset>
        <Header />
        <main>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
