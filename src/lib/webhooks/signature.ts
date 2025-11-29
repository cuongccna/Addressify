/**
 * Webhook Signature System
 * HMAC-SHA256 signatures để verify webhook authenticity
 */

import crypto from 'crypto';

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function generateSignature(
  payload: string,
  secret: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  
  // Timing-safe comparison để prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Generate webhook secret for new webhook
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create webhook headers with signature
 */
export function createWebhookHeaders(
  payload: string,
  secret: string,
  eventId: string,
  eventType: string
): Record<string, string> {
  const signature = generateSignature(payload, secret);
  const timestamp = Date.now().toString();
  
  return {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': signature,
    'X-Webhook-ID': eventId,
    'X-Webhook-Event': eventType,
    'X-Webhook-Timestamp': timestamp,
    'User-Agent': 'Addressify-Webhooks/1.0',
  };
}

/**
 * Validate webhook request from receiver's perspective
 * @param body - The request body as a string
 * @param signature - The X-Webhook-Signature header value
 * @param secret - The webhook secret key
 * @returns Validation result with valid flag and optional error message
 */
export function validateWebhookRequest(
  body: string,
  signature: string | null,
  secret: string
): { valid: boolean; error?: string } {
  if (!signature) {
    return { valid: false, error: 'Missing signature' };
  }

  // Verify signature
  if (!verifySignature(body, signature, secret)) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true };
}

/**
 * Example usage documentation
 */
export const WEBHOOK_SIGNATURE_EXAMPLE = `
// Receiver side validation (Node.js):
const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  // Generate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  // Verify
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  console.log('Webhook verified:', req.body);
  res.status(200).send('OK');
});
`;
