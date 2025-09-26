import { sessionBackgroundService } from '../services/api/session-background.service'

// Server startup configuration
// This module handles automatic startup of background services
let isInitialized = false


//  Initialize server services - This should be called when the server starts 
export async function initializeServerServices(): Promise<void> {
  if (isInitialized) {
    console.log('Server services already initialized')
    return
  }

  try {
    console.log('Initializing server services...')

    // Start the session background service
    await sessionBackgroundService.start()

    isInitialized = true
    console.log('Server services initialized successfully')
  } catch (error) {
    console.error('Failed to initialize server services:', error)
    throw error
  }
}

//  Graceful shutdown of server services
export async function shutdownServerServices(): Promise<void> {
  if (!isInitialized) {
    console.log('Server services not initialized')
    return
  }

  try {
    console.log('Shutting down server services...')

    // Stop the session background service
    sessionBackgroundService.stop()

    isInitialized = false
    console.log('Server services shut down successfully')
  } catch (error) {
    console.error('Error shutting down server services:', error)
  }
}

//  Get initialization status
export function getInitializationStatus(): boolean {
  return isInitialized
}
