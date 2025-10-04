# 🧪 PHASE 2 TESTING GUIDE

## 📋 Test Checklist

### ✅ TEST 1: Authentication Flow

#### 1.1 Test Signup API
```bash
# Tạo user mới
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@addressify.vn",
    "password": "Test123456!",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@addressify.vn",
    "name": "Test User"
  },
  "message": "Please check your email to confirm your account"
}
```

#### 1.2 Test Login API
```bash
# Login với user vừa tạo
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@addressify.vn",
    "password": "Test123456!"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@addressify.vn",
    "name": "Test User"
  }
}
```

#### 1.3 Test Get User API
```bash
# Lấy thông tin user hiện tại (cần có cookie session)
curl -X GET http://localhost:3000/api/auth/user \
  -H "Cookie: sb-access-token=your-token-here"
```

---

### ✅ TEST 2: Shop Management

#### 2.1 Test Create Shop
```bash
# Tạo shop mới (phải login trước)
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your-token-here" \
  -d '{
    "name": "Shop Test 1",
    "senderAddress": "123 Nguyễn Huệ",
    "senderDistrict": "Quận 1",
    "senderProvince": "Hồ Chí Minh",
    "ghnProvinceId": "202",
    "ghnDistrictId": "1451",
    "ghnWardCode": "20101",
    "ghnShopId": "6034259"
  }'
```

**Expected Response:**
```json
{
  "shop": {
    "id": "uuid-here",
    "name": "Shop Test 1",
    "userId": "user-uuid",
    "senderAddress": "123 Nguyễn Huệ",
    ...
  }
}
```

#### 2.2 Test Get Shops
```bash
# Lấy danh sách shops của user
curl -X GET http://localhost:3000/api/shops \
  -H "Cookie: sb-access-token=your-token-here"
```

**Expected Response:**
```json
{
  "shops": [
    {
      "id": "uuid-here",
      "name": "Shop Test 1",
      "userId": "user-uuid",
      ...
    }
  ]
}
```

#### 2.3 Test Update Shop
```bash
# Cập nhật shop
curl -X PATCH http://localhost:3000/api/shops/SHOP_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your-token-here" \
  -d '{
    "name": "Shop Test 1 - Updated",
    "senderAddress": "456 Lê Lợi"
  }'
```

#### 2.4 Test Delete Shop
```bash
# Xóa shop
curl -X DELETE http://localhost:3000/api/shops/SHOP_ID_HERE \
  -H "Cookie: sb-access-token=your-token-here"
```

---

### ✅ TEST 3: UI Testing (Manual)

#### 3.1 Test Signup Page
1. ✅ Mở http://localhost:3000/auth/sign-up
2. ✅ Nhập email: test@addressify.vn
3. ✅ Nhập password: Test123456!
4. ✅ Nhập name: Test User
5. ✅ Click "Đăng ký"
6. ✅ Verify message: "Vui lòng kiểm tra email..."

#### 3.2 Test Login Page
1. ✅ Mở http://localhost:3000/auth/sign-in
2. ✅ Nhập email: test@addressify.vn
3. ✅ Nhập password: Test123456!
4. ✅ Click "Đăng nhập"
5. ✅ Verify redirect to /normalize

#### 3.3 Test Protected Route
1. ✅ Mở http://localhost:3000/normalize (chưa login)
2. ✅ Verify auto redirect to /auth/sign-in
3. ✅ Login successfully
4. ✅ Verify redirect back to /normalize

#### 3.4 Test Shop Management
1. ✅ Vào /normalize (đã login)
2. ✅ Click "Quản lý Shops" trong header
3. ✅ Click "Tạo Shop Mới"
4. ✅ Nhập thông tin shop:
   - Tên shop: Shop Test 1
   - Địa chỉ: 123 Nguyễn Huệ
   - Quận/Huyện: Quận 1
   - Tỉnh/Thành: Hồ Chí Minh
   - GHN Province ID: 202
   - GHN District ID: 1451
   - GHN Ward Code: 20101
   - GHN Shop ID: 6034259
5. ✅ Click "Tạo Shop"
6. ✅ Verify shop xuất hiện trong list
7. ✅ Test Edit shop
8. ✅ Test Delete shop

#### 3.5 Test Shop Selector
1. ✅ Tạo 2-3 shops
2. ✅ Click dropdown "Chọn Shop" trong header
3. ✅ Chọn shop khác
4. ✅ Verify selected shop được highlight
5. ✅ Refresh page
6. ✅ Verify shop vẫn được selected (localStorage)

---

### ✅ TEST 4: Database Verification

#### 4.1 Check Tables in Prisma Studio
```bash
npx prisma studio
```
1. ✅ Mở http://localhost:5555
2. ✅ Verify 3 tables hiển thị:
   - User (0 hoặc có data)
   - Shop (0 hoặc có data)
   - QuoteHistory (0)

#### 4.2 Check Data in Supabase
1. ✅ Vào Supabase Dashboard
2. ✅ Table Editor > addressify_users
3. ✅ Verify user record tồn tại
4. ✅ Table Editor > addressify_shops
5. ✅ Verify shop records tồn tại

---

### ✅ TEST 5: Security Testing

#### 5.1 Test RLS Policies
```sql
-- Trong Supabase SQL Editor, test với user khác
SELECT * FROM addressify_shops WHERE "userId" = 'other-user-id';
-- Should return empty (RLS blocks)
```

#### 5.2 Test API Authorization
```bash
# Test API without auth cookie (should return 401)
curl -X GET http://localhost:3000/api/shops

# Expected: {"error": "Unauthorized"}
```

#### 5.3 Test Shop Ownership
```bash
# Try to access other user's shop (should return 403)
curl -X GET http://localhost:3000/api/shops/OTHER_USER_SHOP_ID \
  -H "Cookie: sb-access-token=your-token-here"

# Expected: {"error": "Forbidden"}
```

---

### ✅ TEST 6: Error Handling

#### 6.1 Test Invalid Email
- ✅ Signup với email không hợp lệ: "notanemail"
- ✅ Verify error message hiển thị

#### 6.2 Test Duplicate Email
- ✅ Signup với email đã tồn tại
- ✅ Verify error: "User already registered"

#### 6.3 Test Missing Fields
```bash
# Create shop without required fields
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your-token-here" \
  -d '{
    "name": "Shop Test"
  }'

# Expected: {"error": "Missing required fields: senderAddress, senderDistrict, senderProvince"}
```

---

## 🐛 Known Issues & Workarounds

### Issue 1: Supabase Email Confirmation
**Problem:** Email confirmation chậm hoặc không nhận được
**Workaround:** 
1. Vào Supabase Dashboard > Authentication > Users
2. Click user mới tạo
3. Manually confirm email

### Issue 2: Cookie Not Persisting
**Problem:** Cookie session bị clear sau refresh
**Workaround:**
1. Check browser settings allow cookies
2. Try incognito mode
3. Clear cache & cookies

### Issue 3: RLS Blocking Queries
**Problem:** Queries return empty despite data exists
**Workaround:**
1. Check auth.uid() matching userId in RLS policies
2. Temporarily disable RLS for testing:
```sql
ALTER TABLE addressify_shops DISABLE ROW LEVEL SECURITY;
```

---

## ✅ Success Criteria

### Phase 2 is PASSED if:
- [x] ✅ User can signup & login
- [x] ✅ Protected routes redirect correctly
- [x] ✅ User can create/edit/delete shops
- [x] ✅ Shop selector works
- [x] ✅ Data persists in database
- [x] ✅ RLS policies work correctly
- [x] ✅ No console errors
- [x] ✅ Build passes without errors

---

## 📊 Test Results Template

```
Date: 2025-10-04
Tester: [Your Name]

TEST RESULTS:
✅ Test 1: Authentication Flow - PASSED
✅ Test 2: Shop Management - PASSED
✅ Test 3: UI Testing - PASSED
✅ Test 4: Database Verification - PASSED
✅ Test 5: Security Testing - PASSED
✅ Test 6: Error Handling - PASSED

ISSUES FOUND: 0
CRITICAL BUGS: 0
MINOR BUGS: 0

OVERALL STATUS: ✅ PHASE 2 PASSED
```

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Commit changes to git
2. ✅ Create PR for review
3. ✅ Proceed to Phase 3: AddressNormalizeAndCompare Integration

If tests fail:
1. ❌ Document failing test cases
2. ❌ Debug & fix issues
3. ❌ Re-run tests
4. ❌ Repeat until all pass
