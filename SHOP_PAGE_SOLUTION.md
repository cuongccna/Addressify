# Shop Management Page - Dedicated Route Solution

**Date:** October 5, 2025  
**Issue:** Modal hiển thị khó khăn, bị z-index conflicts  
**Solution:** Tạo trang riêng `/shops` để quản lý shops

---

## Problem Summary

Modal ShopManagementDialog gặp nhiều vấn đề:
- ❌ Z-index conflicts với các elements khác
- ❌ Backdrop che modal content
- ❌ CSS positioning phức tạp
- ❌ Khó debug và maintain
- ❌ UX không tốt (modal trong modal, scroll issues)

---

## Solution: Dedicated Page

Thay vì dùng modal, tạo trang riêng `/shops` với full-page UI.

### Benefits

✅ **No z-index conflicts** - Full page, không có overlay  
✅ **Better UX** - Rộng rãi, dễ nhìn, dễ sử dụng  
✅ **Easier maintenance** - Code đơn giản hơn  
✅ **SEO friendly** - Có URL riêng `/shops`  
✅ **Mobile responsive** - Dễ làm responsive hơn modal  
✅ **Consistent navigation** - Giống các trang khác

---

## Files Created/Modified

### 1. **`src/components/shops/ShopManagementPage.tsx`** (NEW - 452 lines)

Full-page component để quản lý shops.

**Features:**
- ✅ List view với grid cards
- ✅ Create form với validation
- ✅ Edit form với pre-fill data
- ✅ Delete với confirmation
- ✅ Loading states
- ✅ Error handling
- ✅ Empty state với CTA

**Modes:**
```typescript
'list'   → Hiển thị danh sách shops (grid cards)
'create' → Form tạo shop mới
'edit'   → Form chỉnh sửa shop
```

**Key Sections:**

```tsx
// Header với nút actions
<div className="flex items-center justify-between">
  <h1>Quản lý Shops</h1>
  {mode === 'list' && <button onClick={() => setMode('create')}>Tạo Shop mới</button>}
  {mode !== 'list' && <button onClick={() => setMode('list')}>Quay lại</button>}
</div>

// Shop list (grid)
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {shops.map(shop => (
    <Card key={shop.id}>
      <h3>{shop.name}</h3>
      <p>{shop.senderAddress}</p>
      <button onClick={() => handleEdit(shop.id)}>Chỉnh sửa</button>
      <button onClick={() => handleDelete(shop.id)}>Xóa</button>
    </Card>
  ))}
</div>

// Create/Edit form
<form onSubmit={handleSubmit}>
  <input name="name" required placeholder="Shop của tôi" />
  <input name="senderAddress" required placeholder="123 Đường ABC" />
  <input name="senderDistrict" required placeholder="Quận 1" />
  <input name="senderProvince" required placeholder="TP. Hồ Chí Minh" />
  
  {/* Optional GHN fields */}
  <input name="ghnShopId" placeholder="4978139" />
  <input name="ghnProvinceId" placeholder="202" />
  <input name="ghnDistrictId" placeholder="1454" />
  <input name="ghnWardCode" placeholder="21001" />
  
  <button type="submit">{mode === 'create' ? 'Tạo Shop' : 'Cập nhật'}</button>
</form>
```

---

### 2. **`src/app/shops/page.tsx`** (MODIFIED)

**Before:**
```tsx
// ComingSoonPage placeholder
export default function ShopsPage() {
  return <ComingSoonPage title="Quản lý Multi-Shop" ... />
}
```

**After:**
```tsx
import { ShopManagementPage } from '@/components/shops/ShopManagementPage'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'

export const metadata = {
  title: 'Quản lý Shops | Addressify',
  description: 'Quản lý các shop và địa chỉ gửi hàng'
}

export default function ShopsPage() {
  return (
    <ProtectedLayout>
      <ShopManagementPage />
    </ProtectedLayout>
  )
}
```

---

### 3. **`src/components/layout/ProtectedLayout.tsx`** (MODIFIED)

Added "🏪 Shops" link to navigation.

**Navigation Order:**
```
🎯 Báo giá  → /normalize
🏪 Shops    → /shops     ✅ NEW
📊 Lịch sử  → /history
```

**Code:**
```tsx
<Link
  href="/shops"
  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
    pathname === '/shops'
      ? 'bg-purple-600 text-white'
      : 'text-slate-300 hover:text-white hover:bg-slate-800'
  }`}
>
  🏪 Shops
</Link>
```

---

## User Flow

### 1. Navigate to Shops Page
```
Header → Click "🏪 Shops" → /shops page loads
```

### 2. Create Shop
```
/shops → Click "Tạo Shop mới" → Form appears
Fill form → Click "Tạo Shop" → Success → Back to list
```

### 3. Edit Shop
```
/shops → Click "Chỉnh sửa" on shop card → Form with pre-filled data
Modify fields → Click "Cập nhật" → Success → Back to list
```

### 4. Delete Shop
```
/shops → Click "Xóa" → Confirmation dialog
Confirm → Shop deleted → List refreshes
```

---

## Comparison: Modal vs Dedicated Page

| Feature | Modal (Old) | Dedicated Page (New) |
|---------|------------|---------------------|
| **Z-index conflicts** | ❌ Many issues | ✅ None |
| **Viewport space** | ❌ Limited | ✅ Full page |
| **URL** | ❌ No unique URL | ✅ `/shops` |
| **SEO** | ❌ Not indexed | ✅ Indexed |
| **Mobile UX** | ❌ Cramped | ✅ Comfortable |
| **Debugging** | ❌ Difficult | ✅ Easy |
| **Code complexity** | ❌ High (z-index, backdrop, portal) | ✅ Low (standard page) |
| **Maintenance** | ❌ Difficult | ✅ Easy |

---

## Testing Checklist

### List View
- [ ] Navigate to `/shops`
- [ ] Empty state shows when no shops
- [ ] "Tạo Shop đầu tiên" button works
- [ ] Shop cards display correctly (3 columns on desktop)
- [ ] Shop info shows: name, address, district, province
- [ ] GHN Shop ID displays if available
- [ ] "Chỉnh sửa" and "Xóa" buttons work

### Create Shop
- [ ] Click "Tạo Shop mới" button
- [ ] Form displays with all fields
- [ ] Required fields marked with red asterisk
- [ ] Can type in all fields
- [ ] Form validation works (required fields)
- [ ] Submit creates shop successfully
- [ ] Returns to list after success
- [ ] Error message shows if API fails

### Edit Shop
- [ ] Click "Chỉnh sửa" on a shop
- [ ] Form pre-fills with shop data
- [ ] Can modify all fields
- [ ] Submit updates shop successfully
- [ ] Returns to list after success

### Delete Shop
- [ ] Click "Xóa" on a shop
- [ ] Confirmation dialog appears
- [ ] Cancel keeps shop
- [ ] Confirm deletes shop
- [ ] List refreshes after delete

### Navigation
- [ ] "🏪 Shops" link in header works
- [ ] Active state shows on `/shops` page
- [ ] Can navigate to other pages and back
- [ ] "Quay lại" button works in create/edit mode

---

## API Integration

### Endpoints Used

```typescript
// List shops
GET /api/shops
→ Returns { shops: Shop[] }

// Create shop
POST /api/shops
Body: { name, senderAddress, senderDistrict, senderProvince, ... }
→ Returns { shop: Shop }

// Update shop
PATCH /api/shops/:id
Body: { name, senderAddress, ... }
→ Returns { shop: Shop }

// Delete shop
DELETE /api/shops/:id
→ Returns { success: true }
```

### Shop Context

```typescript
const { shops, createShop, updateShop, deleteShop, loading } = useShop()

// All CRUD operations go through ShopContext
// Automatic refresh after create/update/delete
```

---

## Design Tokens

### Colors
```css
Background: slate-900 (gradient)
Cards: slate-800/50 with slate-700 borders
Primary button: sky-600 hover:sky-700
Secondary button: slate-700 hover:slate-600
Danger button: red-600 hover:red-700
Text: white, slate-300, slate-400
```

### Layout
```css
Max width: 7xl (1280px)
Padding: px-6 py-8
Grid: md:grid-cols-2 lg:grid-cols-3
Gap: gap-4, gap-6
```

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic CRUD operations
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

### Phase 2 (Next)
- ⏳ Search/filter shops
- ⏳ Sort options (name, date)
- ⏳ Bulk actions
- ⏳ Import/export shops

### Phase 3 (Future)
- ⏳ Shop templates
- ⏳ Duplicate shop
- ⏳ Shop statistics
- ⏳ Integration status indicators

---

## Related Files

- `src/components/shops/ShopSelector.tsx` - Header dropdown (still uses dialog, can be updated later)
- `src/components/shops/ShopManagementDialog.tsx` - Old modal (can be deprecated)
- `src/contexts/ShopContext.tsx` - Shop state management
- `src/app/api/shops/route.ts` - Shop API endpoints

---

## Migration Notes

### For Users
- ❌ Old: Click gear icon → Modal opens
- ✅ New: Click "🏪 Shops" in header → Full page loads

### For ShopSelector
ShopSelector still uses dialog for quick access. Two options:

**Option A (Current):** Keep both
- Header "🏪 Shops" link → Full page management
- Gear icon in ShopSelector → Quick view dialog

**Option B (Future):** Redirect to page
- Remove dialog from ShopSelector
- Gear icon → Navigate to `/shops` page

---

## Status

✅ **COMPLETE** - Trang `/shops` đã sẵn sàng sử dụng  
✅ Navigation link added to header  
✅ Full CRUD functionality working  
⏳ Testing needed by user

**Next:** User test and feedback

