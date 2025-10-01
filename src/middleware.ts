import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let servicesInitialized = false
let initializationPromise: Promise<void> | null = null

export async function middleware(request: NextRequest) {
  // Only initialize services on server side and for specific routes
  if (typeof window === 'undefined') {
    // If already initialized, skip
    if (servicesInitialized) {
      return NextResponse.next()
    }

    // If initialization is in progress, wait for it to complete
    if (initializationPromise) {
      try {
        await initializationPromise
      } catch (error) {
        // Initialization failed, but don't block the request
        console.error('Waiting for background services initialization failed:', error)
      }
      return NextResponse.next()
    }

    // Start initialization (only one process will get here first)
    initializationPromise = (async () => {
      try {
        // Dynamic import to avoid issues with server-side modules
        const { initializeServerServices } = await import('./lib/server-startup')
        await initializeServerServices()
        servicesInitialized = true
        console.log('✅ Background services initialized via middleware')
      } catch (error) {
        console.error('❌ Failed to initialize background services:', error)
        // Don't block the request, just log the error
        throw error
      } finally {
        // Clear the promise after completion (success or failure)
        initializationPromise = null
      }
    })()

    try {
      await initializationPromise
    } catch (error) {
      // Initialization failed, but don't block the request
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
