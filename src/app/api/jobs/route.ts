import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSchedulerStatus } from '@/lib/jobs/scheduler';

// GET /api/jobs - Get status of all scheduled jobs
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users (you can add admin check here)
    // For now, any authenticated user can view job status
    
    const jobs = getSchedulerStatus();

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Failed to get job status:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}
