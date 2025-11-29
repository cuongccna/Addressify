import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { deliverWebhook } from '@/lib/webhooks/delivery';
import { WebhookEvent } from '@/lib/webhooks/events';

// POST /api/webhooks/[id]/test - Send test webhook
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
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

    if (!webhook.isActive) {
      return NextResponse.json(
        { error: 'Webhook is not active' },
        { status: 400 }
      );
    }

    // Create test event
    const testEvent: WebhookEvent = {
      id: `test_${Date.now()}`,
      type: 'quote.created',
      data: {
        quoteId: 'test_quote_123',
        shopId: 'test_shop_456',
        recipient: {
          name: 'Nguyễn Văn Test',
          phone: '0901234567',
          address: '123 Test Street, District 1, Ho Chi Minh City',
          normalizedAddress: '123 Test Street, Ward 1, District 1, Ho Chi Minh City',
        },
        weight: 1000,
        value: 500000,
        quotes: [
          {
            service: 'Express',
            provider: 'GHN',
            price: 25000,
            estimatedDays: '1-2 ngày',
          },
          {
            service: 'Standard',
            provider: 'GHTK',
            price: 20000,
            estimatedDays: '2-3 ngày',
          },
        ],
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      userId: user.id,
    };

    // Send test webhook
    const result = await deliverWebhook(
      webhook.id,
      webhook.url,
      webhook.secret,
      testEvent,
      1 // Only 1 attempt for test
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test webhook sent successfully',
        statusCode: result.statusCode,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Failed to send test webhook:', error);
    return NextResponse.json(
      { error: 'Failed to send test webhook' },
      { status: 500 }
    );
  }
}
