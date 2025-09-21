"use client"

import React from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import RepositorySidebar from './components/repository-sidebar'

interface RepositoryLayoutProps {
  children: React.ReactNode
}

export default function RepositoryLayout({ children }: RepositoryLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <RepositorySidebar />
      <SidebarInset>
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
