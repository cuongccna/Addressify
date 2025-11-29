import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateWebhookSecret } from '@/lib/webhooks/signature';
import { WEBHOOK_EVENTS } from '@/lib/webhooks/events';

// GET /api/webhooks - List all webhooks
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhooks = await prisma.webhook.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Mask secrets (only show first 8 chars)
    const maskedWebhooks = webhooks.map(webhook => ({
      ...webhook,
      secret: webhook.secret.substring(0, 8) + '...'.repeat(8),
    }));

    return NextResponse.json({ webhooks: maskedWebhooks });
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Create new webhook
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, events } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Validate events
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'At least one event is required' },
        { status: 400 }
      );
    }

    const validEvents = Object.values(WEBHOOK_EVENTS);
    const invalidEvents = events.filter(e => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    // Check URL uniqueness
    const existing = await prisma.webhook.findFirst({
      where: {
        userId: user.id,
        url,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Webhook with this URL already exists' },
        { status: 400 }
      );
    }

    // Generate secret
    const secret = generateWebhookSecret();

    // Create webhook
    const webhook = await prisma.webhook.create({
      data: {
        id: `whk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        userId: user.id,
        url,
        events,
        secret,
        isActive: true,
      },
    });

    // Return webhook with full secret (only shown once)
    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Failed to create webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
