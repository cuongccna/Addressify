import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// POST /api/webhooks/[id]/toggle - Toggle webhook active status
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Verify ownership
    const webhook = await prisma.webhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    if (webhook.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Toggle active status
    const updated = await prisma.webhook.update({
      where: { id },
      data: {
        isActive: !webhook.isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ webhook: updated });
  } catch (error) {
    console.error('Failed to toggle webhook:', error);
    return NextResponse.json(
      { error: 'Failed to toggle webhook' },
      { status: 500 }
    );
  }
}
