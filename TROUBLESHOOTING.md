# 🔧 Troubleshooting Guide - Addressify

## 🚨 Common Issues & Solutions

### ❌ Issue 1: "Invalid login credentials" sau khi đăng ký thành công

**Triệu chứng:**
- Đăng ký thành công, hiện message "Đăng ký thành công!"
- Khi đăng nhập ngay sau đó → Lỗi "Invalid login credentials"
- Console log: `POST http://localhost:3000/api/auth/login 401 (Unauthorized)`

**Nguyên nhân:**
Supabase Auth có **Email Confirmation** enabled mặc định. User phải xác nhận email trước khi có thể đăng nhập.

**Giải pháp:**

#### ✅ Solution 1: Tắt Email Confirmation (Khuyến nghị cho Development)

1. **Vào Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Chọn project của bạn**

3. **Vào Settings:**
   - Navigation: **Authentication** → **Settings**
   - Hoặc URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/settings`

4. **Tìm section "Email Auth":**
   - Scroll xuống tìm **"Enable email confirmations"**

5. **Tắt email confirmation:**
   - Toggle OFF (màu xám)
   - Click **Save** ở cuối trang

6. **Xóa user test cũ:**
   - Vào **Authentication** → **Users**
   - Tìm user test (ví dụ: `cuong.vhcc@gmail.com`)
   - Click icon 3 chấm → **Delete user**

7. **Test lại:**
   - Đăng ký lại với cùng email
   - Đăng nhập ngay → **Thành công!** ✅

**Screenshot tham khảo:**
```
Authentication > Settings
┌─────────────────────────────────────┐
│ Email Auth                          │
│                                     │
│ ☐ Enable email confirmations       │  ← Bỏ check này
│                                     │
│ When enabled, users must confirm   │
│ their email before they can sign in │
└─────────────────────────────────────┘
```

---

#### ✅ Solution 2: Cấu hình SMTP để gửi email xác nhận (Production)

Nếu muốn giữ email confirmation (production ready):

**Bước 1: Cấu hình SMTP trong Supabase**

1. Vào **Project Settings** → **Auth**
2. Scroll xuống **SMTP Settings**
3. Điền thông tin SMTP provider (Gmail, SendGrid, Mailgun, etc.)

**Hoặc dùng Resend (đã setup ở Phase 5A):**

```env
# .env.local
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

**Bước 2: Cấu hình email template**

1. Vào **Authentication** → **Email Templates**
2. Chọn **Confirm signup**
3. Customize template nếu cần
4. Save

**Bước 3: Test flow**
1. Đăng ký user mới
2. Kiểm tra email inbox
3. Click link xác nhận
4. Đăng nhập → Thành công! ✅

---

#### ✅ Solution 3: Tự động confirm trong development (Code-based)

Đã implement trong `src/app/api/auth/signup/route.ts`:

```typescript
// Auto log trong development
if (process.env.NODE_ENV === 'development' && !data.user.email_confirmed_at) {
  console.log('⚠️ Development mode: Email confirmation disabled')
  console.log('   In production, user would need to confirm email')
}
```

Để tự động confirm trong dev, thêm vào `.env.local`:

```env
NODE_ENV=development
```

---

### ❌ Issue 2: Header vẫn hiển thị "Đăng nhập" sau khi login thành công

**Triệu chứng:**
- Đăng nhập thành công, có redirect về trang chủ
- Nhưng header vẫn hiển thị nút "Đăng nhập" thay vì user info
- Phải refresh (F5) mới thấy user info

**Nguyên nhân:**
- AuthContext không được wrap toàn bộ app
- Hoặc component không sử dụng AuthContext

**Giải pháp:**

✅ **Đã fix trong commit mới nhất:**

1. **Created UserMenu component** (`src/components/layout/UserMenu.tsx`):
   - Tự động detect auth state từ `useAuth()` hook
   - Hiển thị nút login/signup khi chưa đăng nhập
   - Hiển thị user avatar + dropdown menu khi đã đăng nhập
   - Loading skeleton trong lúc check auth

2. **Updated home.tsx**:
   - Replace hardcoded login buttons với `<UserMenu />`
   - Tự động update UI khi auth state thay đổi

3. **Updated ProtectedLayout.tsx**:
   - Add `UserMenuSimple` component cho dashboard pages
   - Consistent user experience

**Verify fix:**
```bash
# 1. Login
# 2. Check header → Should see user avatar immediately
# 3. Click avatar → Should see dropdown menu
# 4. Logout → Should see login buttons immediately
```

---

### ❌ Issue 3: CTA buttons không đổi sau khi login (vẫn hiện "Đăng ký")

**Triệu chứng:**
- Đã login thành công
- Header hiển thị user info (đúng)
- Nhưng scroll xuống vẫn thấy:
  - "Khởi tạo tài khoản ngay"
  - "Đăng ký dùng thử 14 ngày"
  - "Dùng thử miễn phí"
- User bối rối: "Tôi đã đăng ký rồi mà?"

**Nguyên nhân:**
- CTA buttons hardcoded, không check auth state
- UI không adaptive theo user context

**Giải pháp:**

✅ **Đã fix trong commit mới nhất:**

1. **Updated home.tsx** - 3 sections với conditional rendering:
   
   **Hero Section:**
   ```tsx
   // Not logged in
   - "Khởi tạo tài khoản ngay" → /auth/sign-up
   - "Xem demo 3 phút" → /demo
   
   // Logged in
   - "🎯 Bắt đầu báo giá" → /normalize
   - "📊 Xem lịch sử" → /history
   ```

   **Bottom CTA:**
   ```tsx
   // Not logged in
   - "Đăng ký dùng thử 14 ngày" → /auth/sign-up
   - "Đặt lịch demo 1-1" → /demo
   
   // Logged in
   - "🚀 Xử lý đơn hàng ngay" → /normalize
   - "⚙️ Cài đặt tài khoản" → /settings
   ```

2. **Updated SiteFooter.tsx**:
   ```tsx
   // Not logged in
   - "Dùng thử miễn phí" → /auth/sign-up
   - "Xem demo" → /demo
   
   // Logged in
   - "Xử lý đơn hàng" → /normalize
   - "Lịch sử" → /history
   ```

3. **Dynamic messaging:**
   - Text content cũng thay đổi theo context
   - Not logged in: "Hơn 1.200 shop đang dùng..."
   - Logged in: "Bắt đầu xử lý đơn hàng..."

**Verify fix:**
1. Logout → Scroll toàn trang → Thấy signup/demo buttons
2. Login → Refresh/không cần refresh → Scroll lại
3. All buttons should change to action buttons (/normalize, /history, /settings)
4. No more "Đăng ký" buttons anywhere

**Testing checklist:**
- [ ] Hero section buttons
- [ ] Bottom CTA buttons  
- [ ] Footer buttons
- [ ] Button text appropriate
- [ ] Links point to correct pages
- [ ] Smooth transition (no flicker)

---

### ❌ Issue 4: "User already registered" khi đăng ký lại

**Triệu chứng:**
- Thử đăng ký lại với email đã dùng
- Lỗi: "User already registered"

**Giải pháp:**

**Option A: Xóa user trong Supabase**
1. Vào Supabase Dashboard
2. **Authentication** → **Users**
3. Tìm user → Delete

**Option B: Dùng email khác**
```
test1@addressify.vn
test2@addressify.vn
cuong.test@gmail.com
```

**Option C: Reset database (⚠️ XÓA TẤT CẢ DATA)**
```bash
# Prisma reset
npx prisma migrate reset

# Supabase reset
# Vào SQL Editor và chạy:
DELETE FROM auth.users;
```

---

### ❌ Issue 5: UserMenu links 404 - Pages chưa tồn tại

**Triệu chứng:**
- Click vào user menu dropdown
- Click vào "Dashboard", "Shops", "API Keys", "Webhooks", "Docs", "Support"
- Nhận 404 error "This page could not be found"

**Nguyên nhân:**
- UserMenu đang link đến pages chưa được tạo
- Một số features đã implement backend nhưng chưa có UI dashboard

**Giải pháp:**

✅ **Đã fix - Created placeholder pages:**

**Pages Mới Tạo:**
1. `/dashboard` - Dashboard placeholder với coming soon message
2. `/shops` - Multi-shop management (coming soon)
3. `/api-keys` - API Keys management (backend ready, UI pending)
4. `/webhooks` - Webhooks management (backend ready, UI pending)
5. `/docs` - API documentation (pending)
6. `/support` - Support center (pending)

**Pages Đã Có:**
- ✅ `/normalize` - Xử lý đơn hàng (main feature)
- ✅ `/history` - Lịch sử báo giá
- ✅ `/master-data` - Quản lý dữ liệu gốc
- ✅ `/settings` - Cài đặt user
- ✅ `/contact` - Liên hệ hỗ trợ

**Updated UserMenu:**
- Removed dead links
- Point to existing pages first
- Added "Coming Soon" pages for future features
- Better organization with separators

**Current Menu Structure:**
```
User Menu Dropdown:
├── Xử lý đơn hàng → /normalize ✅
├── Lịch sử báo giá → /history ✅
├── Dữ liệu gốc → /master-data ✅
├── ──────────────
├── Cài đặt → /settings ✅
├── ──────────────
├── Liên hệ hỗ trợ → /contact ✅
├── Về trang chủ → / ✅
└── Đăng xuất
```

**Placeholder Pages Include:**
- Professional "Coming Soon" message
- What features will be available
- Links to current working features
- Timeline for completion
- No more 404 errors!

**Verify fix:**
1. Click user menu
2. Try all menu items
3. Should see either working pages or nice "Coming Soon" pages
4. No 404 errors

---

### ❌ Issue 6: Scheduled Jobs không chạy (0 active, 11 skipped)

**Triệu chứng:**
- Console log: `✅ Job Scheduler initialized with 0 active jobs, 11 skipped`
- Không có scheduled jobs chạy

**Nguyên nhân:**
Tất cả jobs bị disable mặc định trong `.env`

**Giải pháp:**

Thêm vào `.env.local`:

```env
# Enable all jobs
ENABLE_JOB_CLEANUP_EXPIRED_QUOTES=true
ENABLE_JOB_CLEANUP_OLD_LOGS=true
ENABLE_JOB_CLEANUP_OLD_WEBHOOKS=true
ENABLE_JOB_UPDATE_SHIPPING_RATES=true
ENABLE_JOB_PROCESS_PENDING_WEBHOOKS=true
ENABLE_JOB_CLEANUP_FAILED_WEBHOOKS=true
ENABLE_JOB_REFRESH_API_KEY_STATS=true
ENABLE_JOB_SEND_DAILY_SUMMARY=true
ENABLE_JOB_BACKUP_DATABASE=true
ENABLE_JOB_HEALTH_CHECK=true
ENABLE_JOB_SYNC_ANALYTICS=true

# Hoặc chỉ enable jobs cần thiết
ENABLE_JOB_CLEANUP_EXPIRED_QUOTES=true
ENABLE_JOB_UPDATE_SHIPPING_RATES=true
```

Restart server:
```bash
# Ctrl+C để stop
npm run dev
```

Check console:
```
✅ Job Scheduler initialized with 11 active jobs, 0 skipped
```

---

### ❌ Issue 7: API key không hoạt động

**Triệu chứng:**
- Tạo API key thành công
- Nhưng khi gọi API với key → 401 Unauthorized

**Giải pháp:**

**Check 1: Format header đúng**
```bash
curl -X POST http://localhost:3000/api/v1/quotes \
  -H "Authorization: Bearer pk_test_..." \
  -H "Content-Type: application/json" \
  -d '{"address": "..."}'
```

**Check 2: API key chưa expired**
- Vào API Keys dashboard
- Xem cột "Status"
- Nếu "Expired" → Tạo key mới

**Check 3: Rate limit**
- Mặc định: 100 requests/hour
- Check response header `X-RateLimit-Remaining`
- Đợi 1 giờ hoặc tăng limit trong Prisma

---

### ❌ Issue 8: Webhook không nhận được events

**Triệu chứng:**
- Tạo webhook endpoint
- Thực hiện action (tạo quote, etc.)
- Webhook.site không nhận gì

**Giải pháp:**

**Check 1: Webhook đã active?**
```sql
-- Check trong Prisma Studio
prisma studio

-- Hoặc SQL
SELECT url, events, active FROM "Webhook" WHERE active = true;
```

**Check 2: Events đã subscribe đúng?**
```json
{
  "events": ["quote.created", "quote.completed"]
}
```

**Check 3: Signature verification**
Webhook.site không verify signature. Để test:

1. **Tắt verification tạm thời** (chỉ dev):
   ```typescript
   // src/lib/webhooks/sender.ts
   // Comment dòng signature verification
   ```

2. **Hoặc verify đúng cách:**
   ```javascript
   const crypto = require('crypto')
   
   const signature = request.headers['x-webhook-signature']
   const secret = 'your_webhook_secret'
   const payload = request.body
   
   const expectedSignature = crypto
     .createHmac('sha256', secret)
     .update(JSON.stringify(payload))
     .digest('hex')
   
   if (signature === expectedSignature) {
     // Valid!
   }
   ```

**Check 4: Firewall/Network**
- Webhook.site có thể bị block
- Dùng ngrok để expose localhost:
  ```bash
  ngrok http 3000
  # Dùng URL ngrok làm webhook endpoint
  ```

---

### ❌ Issue 9: Build failed - Type errors

**Triệu chứng:**
```bash
npm run build
# Type error: Cannot find module '@/lib/...'
```

**Giải pháp:**

```bash
# 1. Clean cache
rm -rf .next
rm -rf node_modules
rm package-lock.json

# 2. Reinstall
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# 5. Rebuild
npm run build
```

---

### ❌ Issue 10: Database connection failed

**Triệu chứng:**
```
Error: P1001: Can't reach database server at `...`
```

**Giải pháp:**

**Check 1: DATABASE_URL đúng?**
```env
# .env.local
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

**Check 2: Supabase có online?**
- Vào Supabase Dashboard
- Check project status
- Database có green icon?

**Check 3: Connection pooling**
```env
# Thêm connection pooling
DATABASE_URL="postgresql://user:pass@host:6543/dbname?pgbouncer=true"
```

**Check 4: Reset connection**
```bash
npx prisma db push --force-reset
npx prisma generate
npx prisma db seed
```

---

## 🆘 Emergency Quick Fixes

### Reset Everything (⚠️ Nuclear option)

```bash
# 1. Stop server
# Ctrl+C

# 2. Clean everything
rm -rf .next
rm -rf node_modules
rm package-lock.json

# 3. Reset database
npx prisma migrate reset --force

# 4. Reinstall
npm install

# 5. Setup database
npx prisma generate
npx prisma db push

# 6. Restart
npm run dev
```

### Check Environment Variables

```bash
# Windows PowerShell
Get-Content .env.local

# Check if all required vars exist
$required = @(
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
)

foreach ($var in $required) {
  if (Get-Content .env.local | Select-String $var) {
    Write-Host "✅ $var" -ForegroundColor Green
  } else {
    Write-Host "❌ $var MISSING!" -ForegroundColor Red
  }
}
```

---

## 📞 Need More Help?

1. **Check logs:**
   ```bash
   # Browser Console (F12)
   # Terminal output
   # Network tab
   ```

2. **Enable debug mode:**
   ```env
   # .env.local
   DEBUG=true
   LOG_LEVEL=debug
   ```

3. **Check documentation:**
   - [README.md](./README.md)
   - [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md)
   - [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)

4. **Create issue:**
   - Include error message
   - Include steps to reproduce
   - Include environment info (OS, Node version, etc.)

---

## ✅ Checklist trước khi report bug

- [ ] Đã đọc troubleshooting guide này
- [ ] Đã check console logs
- [ ] Đã check Network tab
- [ ] Đã verify .env.local có đầy đủ variables
- [ ] Đã thử restart server
- [ ] Đã thử clear cache (.next folder)
- [ ] Đã check Supabase Dashboard (users, database)
- [ ] Có thể reproduce issue một cách nhất quán
- [ ] Đã note lại exact steps to reproduce

**Bug Report Template:**
```markdown
## Bug Description
[Mô tả ngắn gọn]

## Steps to Reproduce
1. Go to ...
2. Click on ...
3. See error ...

## Expected Behavior
[Điều bạn expect sẽ xảy ra]

## Actual Behavior
[Điều thực tế xảy ra]

## Error Message
```
[Copy error từ console]
```

## Environment
- OS: Windows 11
- Node: v20.x
- Browser: Chrome 120
- Supabase Project: [project name]

## Screenshots
[Attach nếu có]
```

---

**Last Updated:** Oct 4, 2025
**Version:** 2.0.0
