# 🧪 Hướng dẫn Test Thủ công Addressify v2.0.0

## 📋 Mục lục
1. [Setup môi trường test](#setup-môi-trường-test)
2. [Phase 1: Authentication & Registration](#phase-1-authentication--registration)
3. [Phase 2: Multi-shop Management](#phase-2-multi-shop-management)
4. [Phase 3: Address Processing & Quotes](#phase-3-address-processing--quotes)
5. [Phase 4: Quote History](#phase-4-quote-history)
6. [Phase 5A: Email Notifications](#phase-5a-email-notifications)
7. [Phase 5B: API Key Management](#phase-5b-api-key-management)
8. [Phase 5C: Webhook Integrations](#phase-5c-webhook-integrations)
9. [Phase 5D: Scheduled Jobs](#phase-5d-scheduled-jobs)
10. [Checklist tổng hợp](#checklist-tổng-hợp)

---

## Setup môi trường test

### Bước 1: Khởi động ứng dụng
```bash
# Terminal 1: Start dev server
npm run dev

# Mở trình duyệt tại: http://localhost:3000
```

### Bước 2: Chuẩn bị dữ liệu test
- **Email test**: `test@addressify.vn` (hoặc email thật của bạn)
- **Password test**: `Test123456!`
- **Webhook test endpoint**: https://webhook.site (tạo endpoint mới)

### Bước 3: Cấu hình Supabase (QUAN TRỌNG!)

⚠️ **Email Confirmation Issue**: Mặc định Supabase yêu cầu xác nhận email trước khi đăng nhập.

**Tùy chọn A - Tắt Email Confirmation (Development):**
1. Vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **Authentication** → **Settings** 
4. Tìm **"Enable email confirmations"**
5. **Tắt** option này (toggle off)
6. Click **Save**
7. Xóa các user test cũ trong **Authentication** → **Users**
8. Đăng ký lại với user mới

**Tùy chọn B - Giữ Email Confirmation (Production):**
- Cấu hình SMTP trong Supabase Settings
- Hoặc dùng Resend API (đã setup ở Phase 5A)
- User phải xác nhận email từ inbox trước khi login

### Bước 4: Kiểm tra console
- Mở DevTools (F12)
- Vào tab Console để xem logs
- Vào tab Network để xem API calls

---

## Phase 1: Authentication & Registration

### Test 1.1: Đăng ký tài khoản mới ✅

**Bước thực hiện:**
1. Truy cập: `http://localhost:3000`
2. Click nút **"Đăng nhập"** ở header
3. Chuyển sang tab **"Đăng ký"**
4. Điền thông tin:
   ```
   Email: test@addressify.vn
   Mật khẩu: Test123456!
   Xác nhận mật khẩu: Test123456!
   ```
5. Click nút **"Đăng ký"**

**Kết quả mong đợi:**
- ✅ Thông báo "Đăng ký thành công"
- ✅ Tự động redirect về trang chủ
- ✅ Header hiển thị tên user (hoặc email)
- ✅ **Email welcome được gửi** (kiểm tra hộp thư)

**Screenshot cần chụp:**
- [ ] Form đăng ký
- [ ] Thông báo thành công
- [ ] Email welcome trong inbox

---

### Test 1.2: User Menu & Profile Display ✅

**Bước thực hiện:**
1. Sau khi đăng nhập thành công, quan sát header
2. Click vào **avatar/tên user** ở góc phải header
3. Kiểm tra dropdown menu

**Kết quả mong đợi:**
- ✅ Header không còn hiển thị nút "Đăng nhập" và "Dùng thử miễn phí"
- ✅ Header hiển thị **avatar** (chữ cái đầu của email) với gradient background
- ✅ Header hiển thị **tên user** (từ profile hoặc email)
- ✅ Click vào user menu → Hiển thị dropdown với:
  - Thông tin user (avatar, tên, email)
  - Dashboard
  - Quản lý Shop
  - Cài đặt
  - API Keys
  - Webhooks
  - Tài liệu API
  - Hỗ trợ
  - Đăng xuất (màu đỏ)
- ✅ Menu có hover effects và transitions mượt mà
- ✅ Click bên ngoài menu → Menu tự đóng

**Screenshot cần chụp:**
- [ ] Header với user avatar
- [ ] Dropdown menu mở ra
- [ ] Hover state của menu items

**API calls cần verify:**
```bash
# Console Network tab
GET /api/auth/session  # Nên có session data
```

---

### Test 1.2b: UI Adaptive Content (Logged In vs Guest) ✅

**Mục đích:** Verify rằng UI thay đổi phù hợp với trạng thái đăng nhập

**Bước thực hiện:**
1. **Khi chưa đăng nhập**, scroll qua toàn bộ homepage và quan sát:
   - Hero section (top)
   - Bottom CTA section
   - Footer
2. **Đăng nhập** vào hệ thống
3. **Scroll lại** qua toàn bộ homepage và so sánh

**Kết quả mong đợi - Khi CHƯA đăng nhập:**

Hero Section:
- ✅ Button 1: "Khởi tạo tài khoản ngay" → Link đến `/auth/sign-up`
- ✅ Button 2: "Xem demo 3 phút" → Link đến `/demo`

Bottom CTA Section ("Sẵn sàng tăng tốc đơn hàng"):
- ✅ Text: "Hơn 1.200 shop đang dùng Addressify..."
- ✅ Button 1: "Đăng ký dùng thử 14 ngày" → `/auth/sign-up`
- ✅ Button 2: "Đặt lịch demo 1-1" → `/demo`

Footer:
- ✅ Button 1: "Dùng thử miễn phí" → `/auth/sign-up`
- ✅ Button 2: "Xem demo" → `/demo`

**Kết quả mong đợi - Khi ĐÃ đăng nhập:**

Hero Section:
- ✅ Button 1: "🎯 Bắt đầu báo giá" → Link đến `/normalize` (main feature)
- ✅ Button 2: "📊 Xem lịch sử" → Link đến `/history`
- ✅ KHÔNG còn buttons signup/demo

Bottom CTA Section:
- ✅ Text thay đổi: "Bắt đầu xử lý đơn hàng và tối ưu vận chuyển ngay hôm nay."
- ✅ Button 1: "🚀 Xử lý đơn hàng ngay" → `/normalize`
- ✅ Button 2: "⚙️ Cài đặt tài khoản" → `/settings`
- ✅ KHÔNG còn buttons signup/demo

Footer:
- ✅ Button 1: "Xử lý đơn hàng" → `/normalize`
- ✅ Button 2: "Lịch sử" → `/history`
- ✅ KHÔNG còn buttons signup/demo

**Why this matters:**
- Tránh user confusion (đã login mà vẫn thấy "Đăng ký")
- Better UX - show relevant actions based on context
- Tăng engagement với logged-in users

**Screenshot cần chụp:**
- [ ] Hero section - Not logged in
- [ ] Hero section - Logged in
- [ ] Bottom CTA - Not logged in
- [ ] Bottom CTA - Logged in
- [ ] Footer - Not logged in
- [ ] Footer - Logged in

**Test variations:**
1. ✅ Test với user mới đăng ký lần đầu
2. ✅ Test với user đã có shops
3. ✅ Test transition: Đăng xuất → UI switch back ngay lập tức
4. ✅ Test transition: Đăng nhập → UI update ngay lập tức (no refresh needed)

---

### Test 1.3: Đăng xuất ✅

**Bước thực hiện:**
1. Click vào user menu (avatar/tên user)
2. Click **"Đăng xuất"** (item cuối cùng, màu đỏ)
3. Quan sát chuyển hướng

**Kết quả mong đợi:**
- ✅ Loading indicator (nếu có)
- ✅ Redirect về trang chủ `/`
- ✅ Header quay lại hiển thị nút "Đăng nhập" và "Dùng thử miễn phí"
- ✅ Session bị xóa (không thể truy cập protected routes)
- ✅ Console không có errors

**Screenshot cần chụp:**
- [ ] Click đăng xuất
- [ ] Header sau khi đăng xuất
- [ ] Console logs

**API calls cần verify:**
```bash
POST /api/auth/logout 200 OK
```

---

### Test 1.4: Đăng nhập lại ✅

**Bước thực hiện:**
1. Sau khi đăng xuất, click **"Đăng nhập"** ở header
2. Điền thông tin:
   ```
   Email: test@addressify.vn  (hoặc email bạn đã đăng ký)
   Mật khẩu: Test123456!
   ```
3. Click **"Đăng nhập"**

**Kết quả mong đợi:**
- ✅ Form validation: Email và password bắt buộc
- ✅ Loading state: Button hiển thị spinner và text "Đang đăng nhập..."
- ✅ Đăng nhập thành công (nếu credentials đúng)
- ✅ Redirect về trang chủ `/`
- ✅ Header **ngay lập tức** hiển thị user info (không cần refresh)
- ✅ User menu hoạt động bình thường
- ✅ Console log: "✅ Đăng nhập thành công:" với user data

**Nếu credentials sai:**
- ✅ Hiển thị error message: "Email hoặc mật khẩu không đúng"
- ✅ Form không bị clear (để user sửa)
- ✅ Button quay lại trạng thái bình thường

**Screenshot cần chụp:**
- [ ] Form đăng nhập
- [ ] Loading state
- [ ] Header sau đăng nhập
- [ ] Error state (nếu nhập sai)

**API calls cần verify:**
```bash
POST /api/auth/login 200 OK
# Response: { user: {...} }
```

---

### Test 1.5: Protected Routes ✅

**Bước thực hiện:**
1. Đăng xuất
2. Thử truy cập các trang:
   - `http://localhost:3000/history`
   - `http://localhost:3000/settings`

**Kết quả mong đợi:**
- ✅ Tự động redirect về trang đăng nhập
- ✅ Thông báo "Vui lòng đăng nhập"

---

## Phase 2: Multi-shop Management

### Test 2.1: Xem danh sách shops (lần đầu) ✅

**Bước thực hiện:**
1. Đăng nhập
2. Click vào **dropdown shop** ở header (hoặc icon shop)

**Kết quả mong đợi:**
- ✅ Hiển thị "Chưa có shop nào"
- ✅ Có nút "Tạo shop mới"

---

### Test 2.2: Tạo shop đầu tiên ✅

**Bước thực hiện:**
1. Click **"Tạo shop mới"**
2. Điền thông tin:
   ```
   Tên shop: Shop Test 1
   Mô tả: Shop thử nghiệm đầu tiên
   Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM
   ```
3. Click **"Tạo"**

**Kết quả mong đợi:**
- ✅ Shop được tạo thành công
- ✅ Shop tự động được chọn làm active
- ✅ Dropdown hiển thị "Shop Test 1"
- ✅ **Webhook `shop.created` được trigger** (nếu đã setup webhook)

**API call kiểm tra:**
- POST `/api/shops` - Status 201

---

### Test 2.3: Tạo thêm shop thứ hai ✅

**Bước thực hiện:**
1. Click dropdown shop
2. Click **"Tạo shop mới"**
3. Điền thông tin:
   ```
   Tên shop: Shop Test 2
   Mô tả: Shop thử nghiệm thứ hai
   Địa chỉ: 456 Lê Văn Việt, Quận 9, TP.HCM
   ```
4. Click **"Tạo"**

**Kết quả mong đợi:**
- ✅ Shop được tạo thành công
- ✅ Dropdown hiển thị 2 shops
- ✅ Shop mới được chọn làm active

---

### Test 2.4: Chuyển đổi giữa các shops ✅

**Bước thực hiện:**
1. Click dropdown shop
2. Chọn "Shop Test 1"
3. Kiểm tra shop name ở header
4. Chuyển sang "Shop Test 2"

**Kết quả mong đợi:**
- ✅ Shop name thay đổi ngay lập tức
- ✅ Context được cập nhật (kiểm tra console)
- ✅ Các thao tác tiếp theo sử dụng shop đã chọn

---

### Test 2.5: Sửa thông tin shop ✅

**Bước thực hiện:**
1. Click dropdown shop
2. Click icon **"Edit"** bên cạnh shop name
3. Sửa thông tin:
   ```
   Tên shop: Shop Test 1 (Đã cập nhật)
   Mô tả: Mô tả mới
   ```
4. Click **"Cập nhật"**

**Kết quả mong đợi:**
- ✅ Shop được cập nhật
- ✅ Dropdown hiển thị tên mới
- ✅ **Webhook `shop.updated` được trigger**

**API call kiểm tra:**
- PATCH `/api/shops/[id]` - Status 200

---

### Test 2.6: Xóa shop ✅

**Bước thực hiện:**
1. Click dropdown shop
2. Click icon **"Delete"** bên cạnh "Shop Test 2"
3. Confirm xóa

**Kết quả mong đợi:**
- ✅ Shop bị xóa
- ✅ Dropdown chỉ còn 1 shop
- ✅ Nếu shop đang active bị xóa, tự động chọn shop khác
- ✅ **Webhook `shop.deleted` được trigger**

**API call kiểm tra:**
- DELETE `/api/shops/[id]` - Status 200

---

## Phase 3: Address Processing & Quotes

### Test 3.1: Chuẩn hóa địa chỉ - Nhập văn bản thô ✅

**Bước thực hiện:**
1. Truy cập: `http://localhost:3000/normalize`
2. Chọn tab **"Văn bản thô"**
3. Paste danh sách địa chỉ:
   ```
   123 Nguyễn Văn Linh, Phường Tân Thuận Đông, Quận 7, TP.HCM
   456 Lê Duẩn, P. Bến Nghé, Q.1, Hồ Chí Minh
   789 Hoàng Hoa Thám, Ba Đình, Hà Nội
   321 Trần Hưng Đạo, Quận 1, TPHCM
   654 Nguyễn Huệ, Hoàn Kiếm, HN
   ```
4. Click **"Chuẩn hóa địa chỉ"**

**Kết quả mong đợi:**
- ✅ Loading indicator hiển thị
- ✅ Bảng kết quả hiển thị 5 địa chỉ
- ✅ Mỗi địa chỉ có:
  - Địa chỉ gốc
  - Tỉnh/Thành phố
  - Quận/Huyện
  - Phường/Xã
  - Status chuẩn hóa
- ✅ Độ chính xác >= 95%

**Screenshot cần chụp:**
- [ ] Form nhập liệu
- [ ] Bảng kết quả

---

### Test 3.2: Chuẩn hóa địa chỉ - Import CSV ✅

**Bước thực hiện:**
1. Tạo file `test_addresses.csv`:
   ```csv
   address,name,phone
   123 Nguyễn Văn Linh Q7 HCM,Nguyễn Văn A,0901234567
   456 Lê Duẩn Q1 HCM,Trần Thị B,0912345678
   789 Hoàng Hoa Thám Ba Đình HN,Lê Văn C,0923456789
   ```
2. Chọn tab **"CSV"**
3. Click **"Tải lên file CSV"** hoặc paste CSV
4. Click **"Chuẩn hóa địa chỉ"**

**Kết quả mong đợi:**
- ✅ CSV được parse đúng (3 dòng)
- ✅ Bảng kết quả hiển thị đầy đủ thông tin
- ✅ Các cột name, phone được giữ nguyên

---

### Test 3.3: Lấy báo giá vận chuyển ✅

**Bước thực hiện:**
1. Sau khi chuẩn hóa địa chỉ, chọn 1-2 địa chỉ
2. Click **"Lấy báo giá"**
3. Điền thông tin gói hàng:
   ```
   Khối lượng: 1000 gram
   Kích thước: 20 x 15 x 10 cm
   Giá trị: 500000 đ
   ```
4. Click **"Lấy báo giá"**

**Kết quả mong đợi:**
- ✅ Loading indicator
- ✅ Bảng so sánh phí từ 3 nhà vận chuyển:
  - GHN (Giao Hàng Nhanh)
  - GHTK (Giao Hàng Tiết Kiệm)
  - VTP (Viettel Post)
- ✅ Mỗi quote hiển thị:
  - Phí vận chuyển
  - Thời gian giao hàng dự kiến
  - Các loại phí (COD, bảo hiểm, ...)
- ✅ **Email quote notification được gửi** (kiểm tra inbox)
- ✅ **Webhook `quote.created` được trigger**

**API calls kiểm tra:**
- POST `/api/shipping/quotes` - Status 200
- POST `/api/quote-history` - Status 201

**Screenshot cần chụp:**
- [ ] Form nhập thông tin gói hàng
- [ ] Bảng so sánh báo giá
- [ ] Email quote notification

---

### Test 3.4: Xuất CSV ✅

**Bước thực hiện:**
1. Sau khi có báo giá, chọn các địa chỉ cần xuất
2. Click **"Xuất CSV"**

**Kết quả mong đợi:**
- ✅ File CSV được tải xuống
- ✅ File chứa:
  - Địa chỉ gốc
  - Địa chỉ đã chuẩn hóa
  - Báo giá các nhà vận chuyển
  - Tên, SĐT (nếu có)

**File cần kiểm tra:**
- [ ] Mở file CSV trong Excel/Notepad
- [ ] Verify dữ liệu đầy đủ

---

### Test 3.5: Lấy báo giá từng nhà vận chuyển ✅

**Bước thực hiện:**
1. Test riêng từng API:
   - GHN: POST `/api/shipping/ghn/quote`
   - GHTK: POST `/api/shipping/ghtk/quote`
   - VTP: POST `/api/shipping/vtp/quote`

2. Dùng Postman/Thunder Client với body:
   ```json
   {
     "fromDistrictId": 1451,
     "fromWardCode": "20608",
     "toDistrictId": 1447,
     "toWardCode": "200101",
     "weightInGrams": 1000,
     "lengthInCm": 20,
     "widthInCm": 15,
     "heightInCm": 10
   }
   ```

**Kết quả mong đợi:**
- ✅ GHN trả về quotes với services
- ✅ GHTK trả về phí + leadtime
- ✅ VTP trả về quotes
- ✅ Tất cả đều có status 200

---

## Phase 4: Quote History

### Test 4.1: Xem lịch sử báo giá ✅

**Bước thực hiện:**
1. Truy cập: `http://localhost:3000/history`
2. Kiểm tra danh sách quotes

**Kết quả mong đợi:**
- ✅ Hiển thị danh sách quotes đã tạo
- ✅ Mỗi quote hiển thị:
  - Shop name
  - Địa chỉ
  - Khối lượng
  - Phí tốt nhất
  - Thời gian tạo
- ✅ Có phân trang (nếu > 10 quotes)

---

### Test 4.2: Xem chi tiết quote ✅

**Bước thực hiện:**
1. Click vào 1 quote trong danh sách
2. Kiểm tra modal/page chi tiết

**Kết quả mong đợi:**
- ✅ Hiển thị đầy đủ thông tin:
  - Địa chỉ gốc + chuẩn hóa
  - Thông tin gói hàng
  - Báo giá từ tất cả nhà vận chuyển
  - Thời gian tạo

---

### Test 4.3: Lọc và tìm kiếm ✅

**Bước thực hiện:**
1. Tại trang History, thử các filter:
   - Lọc theo shop
   - Lọc theo ngày
   - Tìm kiếm theo địa chỉ

**Kết quả mong đợi:**
- ✅ Filter hoạt động chính xác
- ✅ Kết quả cập nhật ngay lập tức
- ✅ URL query params cập nhật

---

## Phase 5A: Email Notifications

### Test 5A.1: Xem cài đặt thông báo ✅

**Bước thực hiện:**
1. Truy cập: `http://localhost:3000/settings`
2. Xem section **"Cài đặt thông báo"**

**Kết quả mong đợi:**
- ✅ Hiển thị các toggle options:
  - Welcome emails
  - Quote notifications
  - Daily summary
  - Weekly summary
- ✅ Mặc định tất cả đều bật

---

### Test 5A.2: Cập nhật cài đặt ✅

**Bước thực hiện:**
1. Toggle **"Daily summary"** thành OFF
2. Click **"Lưu thay đổi"**

**Kết quả mong đợi:**
- ✅ Thông báo "Cập nhật thành công"
- ✅ Setting được lưu vào database

**API call kiểm tra:**
- PATCH `/api/notifications/settings` - Status 200

---

### Test 5A.3: Kiểm tra emails đã nhận ✅

**Bước thực hiện:**
1. Kiểm tra inbox của email test
2. Verify các email:
   - Welcome email (sau khi đăng ký)
   - Quote generated email (sau khi lấy báo giá)

**Email checklist:**
- [ ] Welcome email có đầy đủ:
  - Lời chào
  - Link đến dashboard
  - Hướng dẫn sử dụng
- [ ] Quote email có đầy đủ:
  - Thông tin địa chỉ
  - Báo giá tốt nhất
  - Link xem chi tiết

---

### Test 5A.4: Test gửi email thủ công ✅

**Bước thực hiện:**
1. Truy cập: `http://localhost:3000/test-email`
2. Click **"Send Test Email"**

**Kết quả mong đợi:**
- ✅ Thông báo "Email sent successfully"
- ✅ Email test xuất hiện trong inbox
- ✅ Log được tạo trong database

**API call kiểm tra:**
- POST `/api/test-email` - Status 200

---

## Phase 5B: API Key Management

### Test 5B.1: Xem danh sách API keys ✅

**Bước thực hiện:**
1. Truy cập: `http://localhost:3000/settings`
2. Scroll xuống section **"API Keys"**

**Kết quả mong đợi:**
- ✅ Hiển thị "Chưa có API key nào" (lần đầu)
- ✅ Có nút **"Tạo API Key"**

---

### Test 5B.2: Tạo API key đầu tiên ✅

**Bước thực hiện:**
1. Click **"Tạo API Key"**
2. Điền thông tin:
   ```
   Tên: Test API Key
   Mô tả: API key để test
   Permissions: ☑ Read, ☑ Write
   Hết hạn: 30 ngày
   ```
3. Click **"Tạo"**

**Kết quả mong đợi:**
- ✅ API key được tạo thành công
- ✅ **Modal hiển thị key value** (chỉ hiện 1 lần!)
- ✅ Thông báo "Sao chép và lưu key này, sẽ không hiển thị lại"
- ✅ Key có format: `ak_xxxxxxxxxxxxxxxxxxxxxxxxxx`
- ✅ **Webhook `apikey.created` được trigger**

**Quan trọng:**
- [ ] Sao chép key này để test sau: `_________________`

**API call kiểm tra:**
- POST `/api/api-keys` - Status 201

**Screenshot cần chụp:**
- [ ] Modal hiển thị API key
- [ ] Key value (để test sau)

---

### Test 5B.3: Xem danh sách keys ✅

**Bước thực hiện:**
1. Refresh trang settings
2. Kiểm tra section API Keys

**Kết quả mong đợi:**
- ✅ Hiển thị 1 key vừa tạo
- ✅ Thông tin hiển thị:
  - Tên: Test API Key
  - Permissions: Read, Write
  - Hết hạn: (ngày)
  - Status: Active
  - Key value: `ak_****...****` (bị mask)
  - Last used: Never

---

### Test 5B.4: Sử dụng API key ✅

**Bước thực hiện:**
1. Dùng Postman/Thunder Client
2. Gọi API với header:
   ```
   X-API-Key: <key-vừa-tạo>
   ```
3. Test endpoint:
   ```
   GET http://localhost:3000/api/quote-history
   ```

**Kết quả mong đợi:**
- ✅ API trả về 200 OK
- ✅ Data được trả về đúng
- ✅ Usage được log vào database

---

### Test 5B.5: Kiểm tra usage statistics ✅

**Bước thực hiện:**
1. Sau khi gọi API vài lần
2. Tại settings, click **"View Usage"** trên API key

**Kết quả mong đợi:**
- ✅ Modal hiển thị:
  - Total requests
  - Last used: (thời gian)
  - Recent requests (bảng):
    - Endpoint
    - Method
    - Status code
    - Response time
    - Timestamp

---

### Test 5B.6: Kiểm tra rate limiting ✅

**Bước thực hiện:**
1. Dùng script/tool gọi API > 100 lần/phút
2. Kiểm tra response

**Kết quả mong đợi:**
- ✅ Request thứ 101 trả về 429 (Too Many Requests)
- ✅ Response body chứa:
   ```json
   {
     "error": "Rate limit exceeded",
     "retryAfter": 60
   }
   ```

---

### Test 5B.7: Revoke API key ✅

**Bước thực hiện:**
1. Tại settings, click **"Revoke"** trên API key
2. Confirm revoke
3. Thử gọi API với key đã revoke

**Kết quả mong đợi:**
- ✅ Key status thay đổi thành "Revoked"
- ✅ API call trả về 401 Unauthorized
- ✅ **Webhook `apikey.revoked` được trigger**

**API call kiểm tra:**
- POST `/api/api-keys/[id]/revoke` - Status 200

---

### Test 5B.8: Xóa API key ✅

**Bước thực hiện:**
1. Click **"Delete"** trên key đã revoke
2. Confirm xóa

**Kết quả mong đợi:**
- ✅ Key bị xóa khỏi danh sách
- ✅ Usage logs cũng bị xóa (cascade)

---

### Test 5B.9: Tạo key với Admin permission ✅

**Bước thực hiện:**
1. Tạo key mới với permission **Admin**
2. Dùng key này gọi admin endpoint:
   ```
   GET http://localhost:3000/api/jobs
   X-API-Key: <admin-key>
   ```

**Kết quả mong đợi:**
- ✅ Admin endpoints trả về data
- ✅ Key thường (Read/Write) không được truy cập admin endpoints

---

## Phase 5C: Webhook Integrations

### Test 5C.1: Chuẩn bị webhook endpoint ✅

**Bước thực hiện:**
1. Truy cập: https://webhook.site
2. Copy **"Your unique URL"**
3. Lưu lại: `_________________`

---

### Test 5C.2: Tạo webhook đầu tiên ✅

**Bước thực hiện:**
1. Truy cập: `http://localhost:3000/settings`
2. Scroll xuống section **"Webhooks"**
3. Click **"Add Webhook"**
4. Điền thông tin:
   ```
   URL: <webhook.site-url>
   Events: ☑ quote.created, ☑ shop.created
   ```
5. Click **"Create"**

**Kết quả mong đợi:**
- ✅ Webhook được tạo thành công
- ✅ Hiển thị trong danh sách
- ✅ Status: Active
- ✅ Secret được tạo tự động

**API call kiểm tra:**
- POST `/api/webhooks` - Status 201

---

### Test 5C.3: Test webhook ✅

**Bước thực hiện:**
1. Click **"Test"** button trên webhook vừa tạo
2. Chọn event type: `quote.created`
3. Click **"Send Test"**
4. Kiểm tra webhook.site

**Kết quả mong đợi:**
- ✅ Request xuất hiện trên webhook.site
- ✅ Request chứa:
  - Headers:
    - `X-Webhook-Signature` (HMAC-SHA256)
    - `X-Webhook-Event`
    - `Content-Type: application/json`
  - Body: Test payload với event data
- ✅ Status 200 từ webhook.site

**Screenshot cần chụp:**
- [ ] Request trên webhook.site
- [ ] Headers với signature
- [ ] Payload body

---

### Test 5C.4: Trigger webhook thật - Quote Created ✅

**Bước thực hiện:**
1. Tạo 1 quote mới (theo Test 3.3)
2. Ngay sau khi tạo, kiểm tra webhook.site

**Kết quả mong đợi:**
- ✅ Request mới xuất hiện trên webhook.site
- ✅ Event type: `quote.created`
- ✅ Payload chứa:
  - Quote ID
  - Shop info
  - Address info
  - Quote amounts
  - Timestamp

---

### Test 5C.5: Trigger webhook - Shop Events ✅

**Bước thực hiện:**
1. Tạo shop mới (Test 2.2)
2. Kiểm tra webhook.site → `shop.created`
3. Sửa shop (Test 2.5)
4. Kiểm tra webhook.site → `shop.updated`
5. Xóa shop (Test 2.6)
6. Kiểm tra webhook.site → `shop.deleted`

**Kết quả mong đợi:**
- ✅ 3 webhooks được gửi
- ✅ Mỗi webhook có đúng event type
- ✅ Payload chứa đầy đủ shop data

---

### Test 5C.6: Xem delivery logs ✅

**Bước thực hiện:**
1. Tại settings, click **"View Logs"** trên webhook
2. Kiểm tra bảng logs

**Kết quả mong đợi:**
- ✅ Hiển thị danh sách deliveries:
  - Event type
  - Status (success/failed)
  - Status code (200, 404, 500...)
  - Response time
  - Attempts (số lần retry)
  - Timestamp
- ✅ Click vào log để xem chi tiết:
  - Request headers
  - Request body
  - Response headers
  - Response body
  - Error (nếu có)

---

### Test 5C.7: Test webhook retry - Simulate failure ✅

**Bước thực hiện:**
1. Tạo webhook mới với URL không tồn tại:
   ```
   URL: https://fake-endpoint-that-does-not-exist.com/webhook
   Events: ☑ quote.created
   ```
2. Tạo 1 quote mới
3. Kiểm tra logs sau vài phút

**Kết quả mong đợi:**
- ✅ Webhook delivery failed
- ✅ Status: "failed" hoặc "retrying"
- ✅ Attempts tăng dần (1, 2, 3...)
- ✅ Error message hiển thị: "Connection failed" hoặc "Timeout"

---

### Test 5C.8: Verify HMAC signature ✅

**Bước thực hiện:**
1. Lấy 1 webhook request từ webhook.site
2. Copy:
   - Header `X-Webhook-Signature`
   - Webhook secret từ settings
   - Request body (raw JSON)
3. Dùng tool online hoặc code để verify:
   ```javascript
   const crypto = require('crypto')
   const signature = crypto
     .createHmac('sha256', secret)
     .update(JSON.stringify(body))
     .digest('hex')
   // So sánh với X-Webhook-Signature
   ```

**Kết quả mong đợi:**
- ✅ Signature khớp
- ✅ Verify được tính đúng theo HMAC-SHA256

---

### Test 5C.9: Disable/Enable webhook ✅

**Bước thực hiện:**
1. Click **"Disable"** trên webhook
2. Tạo 1 quote mới
3. Kiểm tra webhook.site (không nhận được request)
4. Click **"Enable"** lại
5. Tạo 1 quote nữa
6. Kiểm tra webhook.site (nhận được request)

**Kết quả mong đợi:**
- ✅ Webhook disabled không gửi requests
- ✅ Webhook enabled lại hoạt động bình thường

---

### Test 5C.10: Xóa webhook ✅

**Bước thực hiện:**
1. Click **"Delete"** trên webhook
2. Confirm xóa

**Kết quả mong đợi:**
- ✅ Webhook bị xóa
- ✅ Logs cũng bị xóa
- ✅ Không còn gửi requests

---

## Phase 5D: Scheduled Jobs

### Test 5D.1: Xem danh sách jobs ✅

**Bước thực hiện:**
1. Truy cập: `http://localhost:3000/settings`
2. Scroll xuống section **"Scheduled Jobs"**

**Kết quả mong đợi:**
- ✅ Hiển thị 11 jobs chia làm 3 categories:
  - 🪝 Webhook Jobs (3 jobs)
  - 📧 Email Jobs (2 jobs)
  - 🗄️ Database Jobs (6 jobs)
- ✅ Mỗi job hiển thị:
  - Name
  - Description (tiếng Việt)
  - Schedule (cron expression)
  - Status: Enabled/Disabled
  - Next run time
  - Run button

**Screenshot cần chụp:**
- [ ] Section Scheduled Jobs đầy đủ

---

### Test 5D.2: Chạy job thủ công - Retry Failed Webhooks ✅

**Bước thực hiện:**
1. Tìm job **"RETRY_FAILED_WEBHOOKS"**
2. Click nút **"Chạy ngay"**
3. Chờ vài giây
4. Kiểm tra console/terminal

**Kết quả mong đợi:**
- ✅ Button disabled trong lúc chạy
- ✅ Loading spinner hiển thị
- ✅ Console logs:
   ```
   [JOB] Starting webhook retry job...
   [JOB] Found X failed webhooks to retry
   [JOB] ✅ Retried X webhooks...
   ```
- ✅ Job completed thông báo thành công

**API call kiểm tra:**
- POST `/api/jobs/RETRY_FAILED_WEBHOOKS/run` - Status 200

---

### Test 5D.3: Chạy job thủ công - Send Daily Summary ✅

**Bước thực hiện:**
1. Tìm job **"SEND_DAILY_SUMMARIES"**
2. Click **"Chạy ngay"**
3. Kiểm tra console

**Kết quả mong đợi:**
- ✅ Console logs:
   ```
   [JOB] Starting daily summary job...
   [JOB] Would send daily summaries to X users
   [JOB] Daily summary date: YYYY-MM-DD
   [JOB] ✅ Daily summary job completed
   ```
- ✅ Job completed (placeholder, không gửi email thật)

---

### Test 5D.4: Chạy job thủ công - Database Optimization ✅

**Bước thực hiện:**
1. Tìm job **"OPTIMIZE_DATABASE"**
2. Click **"Chạy ngay"**
3. Kiểm tra console

**Kết quả mong đợi:**
- ✅ Console logs:
   ```
   [JOB] Starting database optimization...
   [JOB] Running ANALYZE on all tables...
   [JOB] ✅ Database optimized successfully
   ```

---

### Test 5D.5: Verify scheduler status ✅

**Bước thực hiện:**
1. Mở terminal dev server
2. Tìm logs khi app start:
   ```
   ⏰ Initializing scheduled jobs...
   🚀 Starting job scheduler...
   ✅ Started: RETRY_FAILED_WEBHOOKS
   ...
   📊 Scheduler started: 11 jobs active, 0 skipped
   ```

**Kết quả mong đợi:**
- ✅ 11/11 jobs được start
- ✅ Mỗi job hiển thị schedule
- ✅ Không có lỗi

---

### Test 5D.6: Test API - Get jobs status ✅

**Bước thực hiện:**
1. Dùng Postman/Thunder Client
2. Gọi API:
   ```
   GET http://localhost:3000/api/jobs
   Authorization: Bearer <token>
   ```

**Kết quả mong đợi:**
- ✅ Trả về 200 OK (nếu là admin)
- ✅ Response chứa array 11 jobs với:
  - name
  - schedule
  - description
  - enabled
  - running
  - nextRun

**Lưu ý:**
- Cần set `ADMIN_USER_ID` trong .env
- User ID phải khớp với admin

---

### Test 5D.7: Verify auto-refresh ✅

**Bước thực hiện:**
1. Mở settings page, để yên 30 giây
2. Quan sát section Scheduled Jobs

**Kết quả mong đợi:**
- ✅ Sau 30s, danh sách tự động refresh
- ✅ "Next run time" được cập nhật
- ✅ Network tab có request mới GET `/api/jobs`

---

### Test 5D.8: Test job enable/disable via env ✅

**Bước thực hiện:**
1. Stop dev server
2. Sửa `.env.local`:
   ```
   ENABLE_JOB_RETRY_WEBHOOKS=false
   ```
3. Start lại dev server
4. Kiểm tra console logs

**Kết quả mong đợi:**
- ✅ Log hiển thị: "📊 Scheduler started: 10 jobs active, 1 skipped"
- ✅ RETRY_FAILED_WEBHOOKS không được start
- ✅ UI vẫn hiển thị job nhưng status "Disabled"

---

## Checklist tổng hợp

### ✅ Authentication (4 tests)
- [ ] Test 1.1: Đăng ký tài khoản mới
- [ ] Test 1.2: Đăng xuất
- [ ] Test 1.3: Đăng nhập lại
- [ ] Test 1.4: Protected routes

### ✅ Multi-shop (6 tests)
- [ ] Test 2.1: Xem danh sách shops (lần đầu)
- [ ] Test 2.2: Tạo shop đầu tiên
- [ ] Test 2.3: Tạo shop thứ hai
- [ ] Test 2.4: Chuyển đổi giữa các shops
- [ ] Test 2.5: Sửa shop
- [ ] Test 2.6: Xóa shop

### ✅ Address & Quotes (5 tests)
- [ ] Test 3.1: Chuẩn hóa - Văn bản thô
- [ ] Test 3.2: Chuẩn hóa - CSV
- [ ] Test 3.3: Lấy báo giá
- [ ] Test 3.4: Xuất CSV
- [ ] Test 3.5: Test từng API riêng

### ✅ Quote History (3 tests)
- [ ] Test 4.1: Xem lịch sử
- [ ] Test 4.2: Xem chi tiết
- [ ] Test 4.3: Lọc và tìm kiếm

### ✅ Email Notifications (4 tests)
- [ ] Test 5A.1: Xem cài đặt
- [ ] Test 5A.2: Cập nhật cài đặt
- [ ] Test 5A.3: Kiểm tra emails
- [ ] Test 5A.4: Test email thủ công

### ✅ API Keys (9 tests)
- [ ] Test 5B.1: Xem danh sách keys
- [ ] Test 5B.2: Tạo API key
- [ ] Test 5B.3: Xem danh sách sau khi tạo
- [ ] Test 5B.4: Sử dụng API key
- [ ] Test 5B.5: Xem usage statistics
- [ ] Test 5B.6: Kiểm tra rate limiting
- [ ] Test 5B.7: Revoke key
- [ ] Test 5B.8: Xóa key
- [ ] Test 5B.9: Admin permission

### ✅ Webhooks (10 tests)
- [ ] Test 5C.1: Chuẩn bị endpoint
- [ ] Test 5C.2: Tạo webhook
- [ ] Test 5C.3: Test webhook
- [ ] Test 5C.4: Trigger quote.created
- [ ] Test 5C.5: Trigger shop events
- [ ] Test 5C.6: Xem logs
- [ ] Test 5C.7: Test retry
- [ ] Test 5C.8: Verify HMAC signature
- [ ] Test 5C.9: Disable/Enable
- [ ] Test 5C.10: Xóa webhook

### ✅ Scheduled Jobs (8 tests)
- [ ] Test 5D.1: Xem danh sách jobs
- [ ] Test 5D.2: Chạy Retry Webhooks
- [ ] Test 5D.3: Chạy Daily Summary
- [ ] Test 5D.4: Chạy DB Optimization
- [ ] Test 5D.5: Verify scheduler status
- [ ] Test 5D.6: Test jobs API
- [ ] Test 5D.7: Verify auto-refresh
- [ ] Test 5D.8: Test enable/disable via env

---

## 📸 Screenshots cần chụp

### Authentication
- [ ] Sign up form
- [ ] Welcome email

### Multi-shop
- [ ] Shop dropdown với multiple shops
- [ ] Create shop modal

### Address & Quotes
- [ ] Bảng địa chỉ đã chuẩn hóa
- [ ] Bảng so sánh báo giá
- [ ] Quote notification email

### API Keys
- [ ] API key reveal modal
- [ ] Usage statistics modal

### Webhooks
- [ ] Webhook.site với request
- [ ] Webhook delivery logs
- [ ] HMAC signature headers

### Scheduled Jobs
- [ ] Section scheduled jobs đầy đủ
- [ ] Console logs khi chạy job

---

## 🐛 Bug Report Template

Nếu phát hiện lỗi, ghi chép theo format:

```markdown
## Bug: [Tiêu đề ngắn gọn]

**Severity**: Critical / High / Medium / Low

**Test Case**: Test X.Y

**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected Result**:
- ...

**Actual Result**:
- ...

**Screenshots**:
[Attach screenshots]

**Console Errors**:
```
[Paste console errors]
```

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Node: v18.x
```

---

## ✅ Test Completion Summary

Sau khi hoàn thành tất cả tests, điền vào đây:

**Tổng số tests**: 49
**Tests passed**: ___/49
**Tests failed**: ___/49
**Bugs found**: ___

**Ngày test**: ___________
**Người test**: ___________
**Thời gian test**: ___ giờ

---

**🎉 Chúc bạn test thành công! Nếu có câu hỏi, tham khảo docs trong folder project.**
