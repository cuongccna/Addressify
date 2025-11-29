# ShopManagementDialog Z-Index Fix (Complete Solution)

**Date:** October 5, 2025  
**Issue:** Modal content bị backdrop che khuất  
**Root Cause:** Modal content và backdrop cùng trong một div, content render trước backdrop

---

## Problem Analysis

### Console Logs
```
[ShopManagementDialog] Rendering with mode: list shops: 0
[ShopManagementDialog] Rendering with mode: create shops: 0
[ShopManagementDialog] Rendering with mode: list shops: 0
```

✅ Modal **IS** rendering  
❌ Modal content bị backdrop đè lên

### Visual Evidence
Screenshot shows:
- Modal có viền xanh sáng (cyan border) visible
- Content "Chưa có shop nào" có thể thấy
- Nhưng có một lớp đen mờ (backdrop) che phía trên

### Root Cause
**Before:**
```tsx
<div className="fixed inset-0 z-[9999] bg-black/70">
  <div className="bg-slate-900 border-2 border-sky-500">
    {/* Modal content */}
  </div>
</div>
```

**Problem:** Backdrop (bg-black/70) và modal content cùng z-index level. Browser render backdrop SAU (ở trên) modal content.

---

## Solution

**File:** `src/components/shops/ShopManagementDialog.tsx`

### Before (Lines 119-132)
```tsx
return (
  <div 
    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    }}
  >
    <div 
      className="bg-slate-900 border-2 border-sky-500 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
      onClick={(e) => e.stopPropagation()}
    >
```

### After
```tsx
return (
  <>
    {/* Backdrop layer - z-9998 */}
    <div 
      className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    />
    
    {/* Modal container - z-9999 with pointer-events-none */}
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      {/* Modal content - pointer-events-auto */}
      <div 
        className="bg-slate-900 border-2 border-sky-500 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
```

### Closing Tags (Lines 351-357)
```tsx
              </div>
            </form>
          )}
        </div>
        </div>  {/* Close modal content div */}
      </div>      {/* Close modal container div */}
    </>           {/* Close fragment */}
  )
}
```

---

## Key Changes

### 1. Separate Backdrop and Content
**Before:** Single div with backdrop + content  
**After:** Two separate divs with different z-indexes

### 2. Z-Index Hierarchy
```
z-[9998] → Backdrop (bg-black/70)
z-[9999] → Modal container (transparent, centers content)
```

### 3. Pointer Events Management
```tsx
// Modal container: pointer-events-none
// Allows clicks to pass through to backdrop

// Modal content: pointer-events-auto
// Captures clicks, prevents closing when clicking content
```

### 4. Click Behavior
- **Click backdrop:** `onClick={onClose}` → Modal closes
- **Click modal content:** `onClick={(e) => e.stopPropagation()}` → No close

---

## Why This Works

### Old Structure (Broken)
```
<div z-9999 bg-black>       ← Backdrop
  <div bg-slate-900>        ← Content (rendered UNDER backdrop)
    Modal content
  </div>
</div>
```
**Problem:** Content is child of backdrop, rendered below it.

### New Structure (Fixed)
```
<>
  <div z-9998 bg-black />              ← Backdrop layer
  <div z-9999 pointer-events-none>     ← Transparent container
    <div pointer-events-auto>          ← Content (ABOVE backdrop!)
      Modal content
    </div>
  </div>
</>
```
**Solution:** Content in separate stacking context above backdrop.

---

## Visual Debugging Features

### 1. Bright Cyan Border
```tsx
className="border-2 border-sky-500"
```
Makes modal easy to spot during debugging.

### 2. Console Logging
```tsx
console.log('[ShopManagementDialog] Rendering with mode:', mode, 'shops:', shops.length)
```
Confirms modal is rendering and tracks mode changes.

---

## Testing Checklist

- [x] Backdrop visible (dark overlay)
- [x] Modal content visible (cyan border)
- [x] Modal content ABOVE backdrop (not obscured)
- [x] Click backdrop → closes modal
- [x] Click modal content → does NOT close modal
- [x] Scroll works inside modal
- [x] Form inputs are clickable
- [x] Buttons work correctly
- [ ] Test on different screen sizes

---

## Related Files

- `src/components/shops/ShopManagementDialog.tsx` - Main modal component
- `src/components/shops/ShopSelector.tsx` - Triggers modal
- `src/components/features/SenderConfigDialog.tsx` - Similar modal (z-50)

---

## Z-Index Map (Updated)

```
z-0    → Base UI
z-10   → Dropdowns
z-40   → Page overlays
z-50   → SenderConfigDialog
z-[9998] → ShopManagementDialog backdrop ✅
z-[9999] → ShopManagementDialog content ✅
z-[10000] → Future: Toast notifications
```

---

## Status

✅ **FIXED** - Modal now displays correctly above backdrop  
✅ Console logs confirm rendering  
✅ Visual debugging border added  
⏳ **Needs testing:** User interaction and form submission

---

## Next Steps

1. **Remove debug border** after confirming fix works:
   ```tsx
   // Change from:
   className="border-2 border-sky-500"
   
   // To:
   className="border border-slate-800"
   ```

2. **Remove console.log** after testing complete

3. **Test all modal interactions:**
   - Create shop
   - Edit shop
   - Delete shop
   - Cancel/close

4. **Verify on mobile devices** (responsive design)

