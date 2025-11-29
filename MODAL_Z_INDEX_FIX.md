# Modal Z-Index Fix

**Date:** October 4, 2025  
**Issue:** Shop Management Dialog bị che khuất bởi modal khác  
**Page:** `/normalize`

---

## Problem

User clicked "Tạo Shop mới" button, but the Shop Management Dialog was hidden behind another modal overlay.

### Root Cause

Two modals had the same `z-index`:

1. **SenderConfigDialog**: `z-50` (Line 31)
2. **ShopManagementDialog**: `z-50` (Line 119)

When both are potentially rendered on the same page, they have the same stacking order, causing the second one to be obscured by the first.

---

## Solution

**File:** `src/components/shops/ShopManagementDialog.tsx`

**Before (Line 119):**
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
```

**After:**
```tsx
<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
```

**Change:** `z-50` → `z-[60]`

---

## Z-Index Hierarchy

Now the stacking order is:

- **Base UI Elements**: `z-0` to `z-40`
- **SenderConfigDialog**: `z-50` (configuration modal)
- **ShopManagementDialog**: `z-60` ✅ (higher priority, always on top)
- **Toast/Notifications**: `z-[100]` (should be highest)

---

## Testing

1. Go to `/normalize` page
2. Click "Tạo Shop mới" button
3. ✅ Shop Management Dialog should appear on top
4. ✅ Can see form inputs clearly
5. ✅ Can interact with all buttons

---

## Related Files

- `src/components/shops/ShopManagementDialog.tsx` - Shop management UI
- `src/components/features/SenderConfigDialog.tsx` - Sender configuration UI (z-50)
- `src/components/features/AddressNormalizeAndCompare.tsx` - Parent component

---

## Status

✅ **FIXED** - ShopManagementDialog now appears above all other modals on the page.
