/**
 * Scheduler Initialization Module
 * Auto-starts the scheduled jobs scheduler when the application starts
 */

import { startScheduler } from './scheduler'

let isInitialized = false

/**
 * Initialize the scheduler (called once on app startup)
 */
export function initializeScheduler() {
  // Prevent multiple initializations
  if (isInitialized) {
    console.log('⏰ Scheduler already initialized')
    return
  }

  try {
    console.log('⏰ Initializing scheduled jobs...')
    
    const startedCount = startScheduler()
    
    console.log(`✅ Scheduler initialized successfully with ${startedCount} active jobs`)
    isInitialized = true
  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error)
    throw error
  }
}

/**
 * Check if scheduler is initialized
 */
export function isSchedulerInitialized(): boolean {
  return isInitialized
}
