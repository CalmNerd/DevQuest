import { sessionBackgroundService } from '../services/api/session-background.service'

// Server startup configuration
// This module handles automatic startup of background services
let isInitialized = false
let initializationPromise: Promise<void> | null = null


//  Initialize server services - This should be called when the server starts 
export async function initializeServerServices(): Promise<void> {
  // If already initialized, return immediately
  if (isInitialized) {
    console.log('✓ Server services already initialized')
    return
  }

  // If initialization is in progress, wait for it to complete
  if (initializationPromise) {
    console.log('⏳ Server services initialization already in progress, waiting...')
    await initializationPromise
    return
  }

  // Create a new initialization promise to track this operation
  initializationPromise = doInitialize()
  
  try {
    await initializationPromise
  } finally {
    initializationPromise = null
  }
}

//  Internal initialization method - only called once
async function doInitialize(): Promise<void> {
  try {
    console.log('🚀 Initializing server services...')

    // Start the session background service
    await sessionBackgroundService.start()

    isInitialized = true
    console.log('✅ Server services initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize server services:', error)
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
