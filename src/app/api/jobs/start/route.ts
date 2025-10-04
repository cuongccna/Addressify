import { NextResponse } from 'next/server'
import { startScheduler, getSchedulerStatus } from '@/lib/jobs/scheduler'

/**
 * API Route: POST /api/jobs/start
 * Start the scheduled jobs scheduler
 * Called on application startup
 */
export async function POST() {
  try {
    // Check if scheduler is already running
    const status = getSchedulerStatus()
    const isRunning = status.some(job => job.running)
    
    if (isRunning) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Scheduler is already running',
          jobCount: status.filter(job => job.running).length
        },
        { status: 200 }
      )
    }

    // Start the scheduler
    const startedCount = startScheduler()

    return NextResponse.json(
      { 
        success: true, 
        message: `Scheduler started successfully with ${startedCount} jobs`,
        jobCount: startedCount
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error starting scheduler:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start scheduler' 
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: GET /api/jobs/start
 * Check scheduler status
 */
export async function GET() {
  try {
    const status = getSchedulerStatus()
    const runningCount = status.filter(job => job.running).length
    const isRunning = runningCount > 0

    return NextResponse.json(
      { 
        isRunning,
        runningCount,
        totalJobs: status.length,
        jobs: status
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error checking scheduler status:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to check scheduler status' 
      },
      { status: 500 }
    )
  }
}
