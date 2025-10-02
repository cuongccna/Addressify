# 🔧 Fix: Multi-Provider Quotes Not Working

## ❌ Vấn Đề

**Triệu chứng:**
- ✅ Address normalized với GHN IDs
- ✅ Button "Lấy tất cả báo giá" hiển thị
- ❌ Chỉ thấy GHTK với "N/A"
- ❌ Không thấy GHN quotes
- ❌ GHTK leadtime trả 404

**Console logs:**
```
[ShippingAPI] POST /services/shipment/fee status=200 duration=1620ms
[ShippingAPI] POST /services/shipment/leadtime status=404 duration=157ms
```

---

## 🔍 Root Cause Analysis

### **Issue 1: Field Name Mismatch**

**Component gửi:**
```typescript
{
  ghnFromProvinceId: 202,
  ghnFromDistrictId: 1454,
  ghnToProvinceId: 202,
  ghnToDistrictId: 1458,
  ghnToWardCode: "21902"
}
```

**Aggregator expect:**
```typescript
{
  fromDistrictId: 1454,      // ❌ NOT ghnFromDistrictId
  toDistrictId: 1458,        // ❌ NOT ghnToDistrictId
  toWardCode: "21902",       // ❌ NOT ghnToWardCode
  senderDistrictId: 1454,    // ❌ VTP field
  receiverDistrictId: 1458   // ❌ VTP field
}
```

**Result:** Aggregator không gọi GHN/VTP vì thiếu required fields!

---

### **Issue 2: Response Structure Mismatch**

**GHN actual response:**
```typescript
{
  data: {
    ghn: {
      quotes: [                    // ❌ Array, not single quote
        {
          service: { ... },
          fee: { total: 45000 }
        }
      ],
      failures: []
    }
  }
}
```

**Component expected:**
```typescript
{
  data: {
    ghn: {
      quote: { total: 45000 },     // ❌ Single quote
      leadtime: { estimatedDays: 3 }
    }
  }
}
```

**Result:** Component không parse được GHN response!

---

### **Issue 3: GHTK Leadtime 404**

**GHTK response:**
```typescript
{
  data: {
    ghtk: {
      quote: { ship_fee_only: 42000 },  // ✅ Has fee
      leadtime: { error: "404" }        // ❌ Leadtime endpoint not found
    }
  }
}
```

**Component expected:**
```typescript
{
  data: {
    ghtk: {
      quote: { total: 42000 },
      leadtime: { estimatedDays: 3 }
    }
  }
}
```

**Result:** GHTK fee parsed wrong (looking for `total` but API returns `ship_fee_only`)

---

## ✅ Giải Pháp

### **Fix 1: Correct Field Names**

**File:** `src/components/features/AddressNormalizeAndCompare.tsx`

**Before:**
```typescript
if (addr.ghnProvinceId && addr.ghnDistrictId) {
  payload.ghnFromProvinceId = sender.ghnProvinceId;
  payload.ghnFromDistrictId = sender.ghnDistrictId;
  payload.ghnToProvinceId = addr.ghnProvinceId;
  payload.ghnToDistrictId = addr.ghnDistrictId;
  if (addr.ghnWardCode) {
    payload.ghnToWardCode = addr.ghnWardCode;
  }
}
```

**After:**
```typescript
if (addr.ghnProvinceId && addr.ghnDistrictId) {
  // GHN fields (match aggregator schema)
  payload.fromDistrictId = sender.ghnDistrictId;
  payload.toDistrictId = addr.ghnDistrictId;
  if (addr.ghnWardCode) {
    payload.toWardCode = addr.ghnWardCode;
  }
  
  // VTP fields (same structure as GHN)
  payload.senderDistrictId = sender.ghnDistrictId;
  payload.receiverDistrictId = addr.ghnDistrictId;
  if (addr.ghnWardCode) {
    payload.receiverWardCode = addr.ghnWardCode;
  }
}
```

---

### **Fix 2: Parse GHN Array Response**

**Before:**
```typescript
if (data.data.ghn.quote) {
  results.push({
    provider: 'GHN',
    amount: data.data.ghn.quote.total,
    days: data.data.ghn.leadtime?.estimatedDays ?? null
  });
}
```

**After:**
```typescript
const ghnData = data.data.ghn as Record<string, unknown>;

if (ghnData.quotes && Array.isArray(ghnData.quotes)) {
  // GHN returns array of quotes
  const ghnQuotes = ghnData.quotes as Array<Record<string, unknown>>;
  if (ghnQuotes.length > 0) {
    const firstQuote = ghnQuotes[0];
    const fee = firstQuote.fee as Record<string, unknown> | undefined;
    const service = firstQuote.service as Record<string, unknown> | undefined;
    results.push({
      provider: 'GHN',
      amount: (fee?.total as number) || (firstQuote.total as number),
      service: (service?.shortName as string),
      days: null // GHN doesn't return leadtime in fee response
    });
  }
}
```

---

### **Fix 3: Parse GHTK Flexible Fields**

**Before:**
```typescript
if (data.data.ghtk.quote) {
  results.push({
    provider: 'GHTK',
    amount: data.data.ghtk.quote.total,
    days: data.data.ghtk.leadtime?.estimatedDays ?? null
  });
}
```

**After:**
```typescript
const ghtkData = data.data.ghtk as Record<string, unknown>;

if (ghtkData.quote) {
  const ghtkQuote = ghtkData.quote as Record<string, unknown>;
  const fee = ghtkQuote.fee as Record<string, unknown> | undefined;
  const leadtime = ghtkData.leadtime as Record<string, unknown> | undefined;
  
  results.push({
    provider: 'GHTK',
    amount: (fee?.total as number) || 
            (ghtkQuote.total as number) || 
            (ghtkQuote.ship_fee_only as number),  // ✅ Fallback to API field
    days: (leadtime?.estimatedDays as number) ?? null
  });
}
```

---

### **Fix 4: Add Debug Logging**

```typescript
console.log('[AddressNormalize] Aggregator response:', {
  success: data.success,
  providers: Object.keys(data.data || {}),
  ghn: data.data?.ghn ? 'present' : 'missing',
  ghtk: data.data?.ghtk ? 'present' : 'missing',
  vtp: data.data?.vtp ? 'present' : 'missing'
});

console.log('[AddressNormalize] GHN data:', data.data.ghn);
console.log('[AddressNormalize] GHTK data:', data.data.ghtk);
```

---

## 🧪 Testing Steps

### **1. Refresh trang normalize**

http://localhost:3000/normalize

---

### **2. Open DevTools Console**

Press F12 → Console tab

---

### **3. Paste test address**

```
34 ten lua, an lac, binh tan, hcm
```

Click "Xử lý địa chỉ"

---

### **4. Check normalized result**

Verify:
- ✅ GHN IDs present: P:202, D:1458, Ward code
- ✅ Confidence 100%

---

### **5. Click "Lấy tất cả báo giá"**

---

### **6. Check Console Logs**

Should see:
```
[AddressNormalize] Aggregator response: {
  success: true,
  providers: ["ghn", "ghtk", "vtp"],
  ghn: "present",
  ghtk: "present",
  vtp: "present"
}

[AddressNormalize] GHN data: {
  quotes: [
    { service: {...}, fee: { total: 45000 } }
  ],
  failures: []
}

[AddressNormalize] GHTK data: {
  quote: { ship_fee_only: 42000 },
  leadtime: { error: "404" }
}
```

---

### **7. Check UI Display**

Should see 3 cards:

```
┌──────────────────┐
│ 🟠 GHN          │
│ 45,000 VND      │
│ Express         │
└──────────────────┘

┌──────────────────┐
│ 🔵 GHTK         │
│ 42,000 VND      │
└──────────────────┘

┌──────────────────┐
│ 🟢 VTP          │
│ 48,000 VND      │
└──────────────────┘
```

---

## 📊 Expected vs Actual

| Test | Before | After |
|------|--------|-------|
| **GHN field names** | ❌ Wrong (`ghnFromDistrictId`) | ✅ Correct (`fromDistrictId`) |
| **GHN response parsing** | ❌ Expect single quote | ✅ Parse quotes array |
| **GHTK fee field** | ❌ Expect `total` | ✅ Fallback to `ship_fee_only` |
| **Providers called** | ❌ Only GHTK | ✅ GHN + GHTK + VTP |
| **UI display** | ❌ 1 card with N/A | ✅ 3 cards with prices |

---

## 🐛 Known Issues

### **Issue: GHTK Leadtime 404**

**Problem:** GHTK leadtime endpoint trả 404

**Impact:** No delivery time estimate for GHTK

**Workaround:** Display fee only, skip leadtime

**Status:** API issue, not fixable client-side

---

### **Issue: Missing Ward Code**

**Problem:** Một số addresses không có ward code → GHN yêu cầu ward

**Impact:** GHN quote không available cho addresses thiếu ward

**Workaround:** Master data matching cải thiện ward detection

**Status:** Improve master data coverage

---

## ✅ Validation Checklist

- [x] Field names match aggregator schema
- [x] GHN array response parsed correctly
- [x] GHTK flexible field handling
- [x] Debug logging added
- [x] TypeScript compiles
- [x] ESLint passes
- [ ] Manual testing (PENDING - user to test)
- [ ] All 3 providers return quotes (PENDING - needs valid tokens)

---

## 📚 Related Files

- `src/components/features/AddressNormalizeAndCompare.tsx` - Fixed field names + parsing
- `src/app/api/shipping/quotes/route.ts` - Aggregator schema (reference)
- `src/lib/shipping-apis/ghnQuoteService.ts` - GHN service (returns array)
- `src/lib/shipping-apis/ghtkQuoteService.ts` - GHTK service

---

## 🔮 Future Improvements

1. **Type-safe response schemas**
   ```typescript
   // Define aggregator response types
   interface GHNAggregatorResponse {
     quotes: Array<{ service: {...}, fee: {...} }>;
     failures: Array<{...}>;
   }
   ```

2. **Handle multiple GHN services**
   ```typescript
   // Show all GHN services, not just first
   ghnQuotes.forEach(quote => {
     results.push({ provider: 'GHN', ... })
   })
   ```

3. **Retry failed providers**
   ```typescript
   // If GHN fails, retry with exponential backoff
   ```

4. **Cache quotes client-side**
   ```typescript
   // Cache quotes for 5 minutes to avoid duplicate calls
   ```

---

**Fixed By:** GitHub Copilot  
**Date:** Oct 2, 2025  
**Status:** ✅ Ready for Testing  
**Next:** User testing với real GHN/GHTK/VTP tokens
