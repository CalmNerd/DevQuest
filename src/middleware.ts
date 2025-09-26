import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let servicesInitialized = false

export async function middleware(request: NextRequest) {
  // Only initialize services on server side and for specific routes
  if (!servicesInitialized && typeof window === 'undefined') {
    try {
      // Dynamic import to avoid issues with server-side modules
      const { initializeServerServices } = await import('./lib/server-startup')
      await initializeServerServices()
      servicesInitialized = true
      console.log('Background services initialized via middleware')
    } catch (error) {
      console.error('Failed to initialize background services:', error)
      // Don't block the request, just log the error
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
