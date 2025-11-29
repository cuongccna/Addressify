import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { runJobManually } from '@/lib/jobs/scheduler';

// POST /api/jobs/[name]/run - Run a job manually
export async function POST(
  _request: Request,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users (you can add admin check here)
    // For now, any authenticated user can run jobs manually
    
    const { name } = await context.params;

    await runJobManually(name);

    return NextResponse.json({ 
      success: true,
      message: `Job ${name} completed successfully` 
    });
  } catch (error) {
    console.error('Failed to run job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run job',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
