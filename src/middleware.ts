import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let servicesInitialized = false
let initializationPromise: Promise<void> | null = null

function verifyAdminSession(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('admin_session')
  
  if (!sessionCookie) {
    return false
  }

  try {
    // Verify the session token matches expected format
    // Note: The actual verification against ADMIN_KEY is done in the API route
    // Here we just check if the cookie exists and has a value
    return sessionCookie.value.length > 0
  } catch (error) {
    console.error('Admin session verification error:', error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow API routes for authentication
    if (request.nextUrl.pathname.startsWith('/admin/api')) {
      return NextResponse.next()
    }

    // Check if user has valid admin session
    const isAuthenticated = verifyAdminSession(request)
    
    // If not authenticated, the page component will handle showing the login form
    // We don't redirect here to allow the client-side auth check to work
  }

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
