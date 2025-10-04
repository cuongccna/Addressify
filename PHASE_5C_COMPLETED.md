# 🪝 PHASE 5C: WEBHOOK INTEGRATIONS - COMPLETED!

**Date:** October 4, 2025  
**Status:** ✅ **BUILD SUCCESSFUL**

---

## 🎉 BUILD RESULTS

```
✓ Compiled successfully in 14.4s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (31/31)
✓ 5 new API endpoints for webhooks
✓ Settings page size: 130 kB (includes Webhook Manager UI)
```

---

## ✅ IMPLEMENTED FEATURES

### **1. Webhook Event System** 📡
- **11 predefined event types** across 4 categories:
  - **Quote Events (4):** created, updated, deleted, failed
  - **Shop Events (3):** created, updated, deleted
  - **Address Events (2):** normalized, validation_failed
  - **Analytics Events (2):** daily_summary, weekly_summary
- Structured payload for each event type
- Event categorization for UI grouping
- Vietnamese descriptions for all events

### **2. HMAC-SHA256 Signature** 🔐
- Secure webhook signature generation
- Timing-safe signature verification
- Auto-generated 64-char hex secrets
- Standard webhook headers:
  - `X-Webhook-Signature` - HMAC signature
  - `X-Webhook-ID` - Event ID
  - `X-Webhook-Event` - Event type
  - `X-Webhook-Timestamp` - Timestamp
- Example validation code for receivers

### **3. Webhook Delivery System** 🚀
- Automatic retry with exponential backoff
- Max 3 attempts (delays: 1s, 2s, 4s)
- 30-second timeout per request
- Smart retry logic:
  - Skip 4xx errors (except 429)
  - Retry 5xx and network errors
- Parallel delivery to multiple webhooks
- Comprehensive delivery logging

### **4. Webhook Management UI** 🎨
- Create webhooks with URL validation
- Multi-select event subscription
- Category-based event grouping
- Toggle webhook active/inactive
- Delete webhooks
- Test webhook functionality
- View delivery logs (last 50)
- Secret shown once at creation

### **5. Webhook Logs & Monitoring** 📊
- Track every delivery attempt
- Store:
  - Event type & payload
  - HTTP status code
  - Attempt number
  - Success/failure status
  - Error messages
- View recent deliveries per webhook
- Automatic cleanup (30 days)
- Retry failed deliveries

---

## 📁 FILES CREATED

```
src/lib/webhooks/
├── events.ts                   # Event types & payloads
├── signature.ts                # HMAC-SHA256 signing
├── delivery.ts                 # Delivery with retry
└── trigger.ts                  # Helper functions

src/components/settings/
└── WebhookManager.tsx          # Full-featured UI

src/app/api/webhooks/
├── route.ts                    # GET (list), POST (create)
└── [id]/
    ├── route.ts                # DELETE (delete webhook)
    ├── toggle/
    │   └── route.ts           # POST (toggle active)
    ├── logs/
    │   └── route.ts           # GET (delivery logs)
    └── test/
        └── route.ts           # POST (send test)

PHASE_5C_COMPLETED.md          # This file
```

---

## 🔌 API ENDPOINTS

### **Management Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/webhooks` | List all webhooks | User |
| POST | `/api/webhooks` | Create new webhook | User |
| DELETE | `/api/webhooks/{id}` | Delete webhook | User |
| POST | `/api/webhooks/{id}/toggle` | Toggle active status | User |
| GET | `/api/webhooks/{id}/logs` | Get delivery logs | User |
| POST | `/api/webhooks/{id}/test` | Send test webhook | User |

---

## 📡 WEBHOOK EVENTS

### **Quote Events:**
```typescript
// quote.created
{
  quoteId: string;
  shopId: string;
  recipient: { name, phone, address, normalizedAddress };
  weight: number;
  value: number;
  quotes: Array<{ service, provider, price, estimatedDays }>;
  createdAt: string;
}

// quote.failed
{
  shopId: string;
  recipient: { name, phone, address };
  error: string;
  failedAt: string;
}
```

### **Shop Events:**
```typescript
// shop.created
{
  shopId: string;
  name: string;
  description?: string;
  createdAt: string;
}

// shop.updated
{
  shopId: string;
  changes: Record<string, unknown>;
  updatedAt: string;
}
```

### **Address Events:**
```typescript
// address.normalized
{
  original: string;
  normalized: string;
  confidence: number;
  components: { street?, ward?, district?, province? };
  normalizedAt: string;
}
```

### **Analytics Events:**
```typescript
// analytics.daily_summary
{
  date: string;
  totalQuotes: number;
  successfulQuotes: number;
  failedQuotes: number;
  totalValue: number;
  averageWeight: number;
  topProviders: Array<{ provider, count }>;
}

// analytics.weekly_summary
{
  weekStart: string;
  weekEnd: string;
  totalQuotes: number;
  // ... same stats as daily
  topDestinations: Array<{ province, count }>;
}
```

---

## 🔐 WEBHOOK SECURITY

### **HMAC-SHA256 Signature:**
```
Signature = HMAC-SHA256(payload, secret)
```

### **Receiver Validation (Node.js):**
```javascript
const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  // Generate expected signature
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  // Timing-safe comparison
  if (!crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  )) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  console.log('Event:', req.body.type);
  console.log('Data:', req.body.data);
  res.status(200).send('OK');
});
```

### **Receiver Validation (Python/Flask):**
```python
import hmac
import hashlib
from flask import request

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    secret = os.environ['WEBHOOK_SECRET']
    
    # Generate expected signature
    payload = request.get_data()
    expected_sig = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    # Compare
    if not hmac.compare_digest(signature, expected_sig):
        return 'Invalid signature', 401
    
    # Process webhook
    data = request.json
    print(f"Event: {data['type']}")
    print(f"Data: {data['data']}")
    return 'OK', 200
```

---

## 💡 USAGE EXAMPLES

### **1. Create Webhook (UI):**
```
1. Go to /settings
2. Scroll to Webhooks section
3. Click "➕ Tạo Webhook"
4. Enter URL: https://your-app.com/webhook
5. Select events:
   ✓ quote.created
   ✓ quote.failed
   ✓ address.normalized
6. Click "✨ Tạo Webhook"
7. COPY THE SECRET (shown once!)
8. Save secret to your .env file
```

### **2. Trigger Webhook (Code):**
```typescript
// In your quote creation code
import { triggerQuoteCreated } from '@/lib/webhooks/trigger';

// After creating quote
await triggerQuoteCreated(userId, {
  id: quote.id,
  shopId: quote.shopId,
  recipient: quote.recipient,
  weight: quote.weight,
  value: quote.value,
  quotes: quote.quotes,
  createdAt: quote.createdAt,
});
```

### **3. Receive Webhook:**
```typescript
// your-app/pages/api/webhook.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  // Get signature
  const signature = request.headers.get('x-webhook-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 401 }
    );
  }
  
  // Verify signature
  const body = await request.text();
  const secret = process.env.WEBHOOK_SECRET!;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  if (signature !== expectedSig) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }
  
  // Parse & process event
  const event = JSON.parse(body);
  
  switch (event.type) {
    case 'quote.created':
      // Handle quote created
      console.log('New quote:', event.data.quoteId);
      await sendSlackNotification(event.data);
      break;
      
    case 'quote.failed':
      // Handle quote failed
      console.error('Quote failed:', event.data.error);
      await alertTeam(event.data);
      break;
      
    // ... handle other events
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 🔄 RETRY LOGIC

### **Delivery Flow:**
```
Attempt 1 → Fail → Wait 1s
Attempt 2 → Fail → Wait 2s
Attempt 3 → Fail → Give up

OR

Attempt 1 → Success → Done ✓
```

### **Retry Rules:**
- ✅ Retry on: 5xx, network errors, 429 (rate limit)
- ❌ Don't retry on: 4xx (except 429)
- ⏱️ Max wait: 10 seconds
- 🔢 Max attempts: 3

### **Manual Retry:**
```typescript
import { retryFailedWebhooks } from '@/lib/webhooks/delivery';

// Retry failed deliveries from last 24h
const retried = await retryFailedWebhooks();
console.log(`Retried ${retried} webhooks`);
```

---

## 📊 WEBHOOK LOGS

### **Log Structure:**
```typescript
{
  id: string;
  webhookId: string;
  event: string;           // 'quote.created'
  payload: object;         // Full event data
  statusCode: number;      // 200, 404, 500, etc.
  attempt: number;         // 1, 2, 3
  success: boolean;        // true/false
  error: string | null;    // Error message if failed
  timestamp: Date;         // When attempt was made
}
```

### **View Logs (UI):**
```
1. Go to /settings → Webhooks
2. Find webhook
3. Click "📋 Logs"
4. See last 50 deliveries with:
   - ✅/❌ Success/Fail icon
   - Event type
   - Status code
   - Attempt number
   - Timestamp
   - Error message (if failed)
```

---

## 🧪 TESTING

### **Test via UI:**
```
1. Create webhook at /settings
2. Click "🧪 Test" button
3. Test event sent to your URL:
   - Type: quote.created
   - Mock data (test_quote_123)
   - Real signature
4. Check your endpoint logs
5. See result in UI
```

### **Test Event Payload:**
```json
{
  "id": "test_1696377600",
  "type": "quote.created",
  "data": {
    "quoteId": "test_quote_123",
    "shopId": "test_shop_456",
    "recipient": {
      "name": "Nguyễn Văn Test",
      "phone": "0901234567",
      "address": "123 Test Street, District 1, Ho Chi Minh City"
    },
    "weight": 1000,
    "value": 500000,
    "quotes": [
      {
        "service": "Express",
        "provider": "GHN",
        "price": 25000,
        "estimatedDays": "1-2 ngày"
      }
    ],
    "createdAt": "2025-10-04T12:00:00.000Z"
  },
  "timestamp": "2025-10-04T12:00:00.000Z",
  "userId": "user_abc123"
}
```

---

## 🔗 INTEGRATION GUIDE

### **Step 1: Create Receiver Endpoint**
Create endpoint to receive webhooks (see examples above)

### **Step 2: Register Webhook**
- Go to Addressify /settings
- Create webhook with your URL
- Select events to subscribe
- Save webhook secret

### **Step 3: Verify Signature**
Always verify HMAC signature before processing

### **Step 4: Return 200 Fast**
- Return 200 OK quickly (< 30s)
- Process event asynchronously
- Don't wait for long operations

### **Step 5: Handle Idempotency**
- Same event may be delivered multiple times
- Use event.id to detect duplicates
- Make processing idempotent

---

## 🚀 USE CASES

### **1. Slack/Discord Notifications:**
```typescript
// Send quote created to Slack
case 'quote.created':
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🎉 New quote #${event.data.quoteId}`,
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Shop:* ${event.data.shopId}\n` +
                `*Recipient:* ${event.data.recipient.name}\n` +
                `*Best price:* ${Math.min(...event.data.quotes.map(q => q.price)).toLocaleString('vi-VN')} đ`
        }
      }]
    })
  });
```

### **2. CRM Integration:**
```typescript
// Add to CRM when quote created
case 'quote.created':
  await fetch('https://crm.example.com/api/leads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: event.data.recipient.name,
      phone: event.data.recipient.phone,
      address: event.data.recipient.address,
      source: 'addressify',
      value: event.data.value,
    })
  });
```

### **3. Analytics Platform:**
```typescript
// Send to analytics
case 'quote.created':
  await analytics.track({
    userId: event.userId,
    event: 'Quote Created',
    properties: {
      shop_id: event.data.shopId,
      weight: event.data.weight,
      value: event.data.value,
      provider_count: event.data.quotes.length,
    }
  });
```

### **4. Email/SMS Notifications:**
```typescript
// Send SMS to recipient
case 'quote.created':
  const cheapest = event.data.quotes
    .sort((a, b) => a.price - b.price)[0];
  
  await sendSMS(event.data.recipient.phone, 
    `Shipping quote: ${cheapest.price.toLocaleString('vi-VN')} đ ` +
    `via ${cheapest.provider} (${cheapest.estimatedDays})`
  );
```

---

## 📈 STATISTICS

### **Build Stats:**
- **New Routes:** 5 webhook API endpoints
- **Settings Page:** 130 kB (includes webhook UI)
- **Build Time:** 14.4 seconds
- **Total Pages:** 31 (1 more than Phase 5B)

### **Code Stats:**
- **Event System:** ~200 lines
- **Signature System:** ~100 lines
- **Delivery System:** ~250 lines
- **Trigger Helpers:** ~150 lines
- **UI Component:** ~600 lines
- **API Routes:** ~350 lines
- **Total:** ~1,650 lines

---

## 🔧 MAINTENANCE

### **Cleanup Old Logs:**
```typescript
import { cleanupWebhookLogs } from '@/lib/webhooks/delivery';

// Delete logs older than 30 days
const deleted = await cleanupWebhookLogs();
console.log(`Deleted ${deleted} old logs`);
```

### **Retry Failed Deliveries:**
```typescript
import { retryFailedWebhooks } from '@/lib/webhooks/delivery';

// Retry failed deliveries from last 24h
const retried = await retryFailedWebhooks(24 * 60 * 60 * 1000);
console.log(`Retried ${retried} webhooks`);
```

### **Scheduled Jobs (Future):**
```typescript
// Run every hour
cron.schedule('0 * * * *', async () => {
  await retryFailedWebhooks();
  await cleanupWebhookLogs();
});
```

---

## ✅ SUCCESS CRITERIA

- [x] Webhook event system
- [x] HMAC-SHA256 signatures
- [x] Delivery with retry logic
- [x] Webhook management UI
- [x] Test webhook functionality
- [x] Delivery logs viewer
- [x] API endpoints
- [x] Build successful
- [ ] **Database migration** (Required)
- [ ] **Integration testing** (After migration)
- [ ] **Trigger webhooks from quote creation** (Integration)

---

## 🚀 NEXT STEPS

### **Phase 5D: Scheduled Jobs** (Coming Next)
- Cron job scheduler
- Recurring bulk quote processing
- Email summary automation
- Analytics report generation
- Webhook retry scheduler

### **Integration Tasks:**
- Add webhook triggers to quote creation
- Add webhook triggers to shop management
- Add webhook triggers to address normalization
- Setup analytics summary generation

### **Documentation:**
- Create webhook integration guide
- Add code examples for popular platforms
- Create troubleshooting guide

---

**🎉 PHASE 5C COMPLETE!**

**Status:** Ready for database migration & integration  
**Next:** Phase 5D - Scheduled Jobs

---

*Webhook Integrations System - October 4, 2025*
