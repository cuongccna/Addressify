# 📧 HƯỚNG DẪN TEST EMAIL VỚI RESEND

**Date:** October 4, 2025  
**Status:** ✅ **SẴN SÀNG TEST**

---

## 🎉 CẤU HÌNH HOÀN TẤT

### ✅ Đã cài đặt:
- Resend API Key: `re_eBDcxRJc_KPai3LVCfy3nTkKCDrViUqwz`
- Email From: `Addressify <onboarding@resend.dev>`
- App URL: `http://localhost:3000`

### ✅ Build Status:
```
✓ Compiled successfully
✓ 29 pages generated
✓ 2 new pages: /settings, /test-email
✓ 1 new API: /api/test-email
```

---

## 🚀 CÁCH TEST EMAIL

### **Phương pháp 1: Sử dụng Test UI** (Khuyến nghị)

1. **Mở trình duyệt:**
   ```
   http://localhost:3000/test-email
   ```

2. **Đăng nhập** (nếu chưa đăng nhập)

3. **Chọn template:**
   - 🎉 **Welcome** - Email chào mừng
   - 📦 **Quote** - Email báo giá với so sánh giá
   - 📊 **Weekly** - Email báo cáo tuần

4. **Nhập email người nhận** (hoặc để trống để gửi cho chính bạn)

5. **Click "Gửi Email Test"**

6. **Kiểm tra inbox** (có thể trong thư mục Spam)

---

### **Phương pháp 2: Sử dụng API trực tiếp**

#### Test với cURL:

**Welcome Email:**
```bash
curl "http://localhost:3000/api/test-email?template=welcome"
```

**Quote Email:**
```bash
curl "http://localhost:3000/api/test-email?template=quote"
```

**Weekly Summary:**
```bash
curl "http://localhost:3000/api/test-email?template=weekly"
```

**Gửi đến email cụ thể:**
```bash
curl "http://localhost:3000/api/test-email?template=welcome&to=youremail@example.com"
```

---

### **Phương pháp 3: Test trong code**

Tạo file test:
```typescript
// test-send-email.ts
import { sendEmail } from '@/lib/email/resend'
import WelcomeEmail from '@/lib/email/templates/WelcomeEmail'

async function test() {
  const result = await sendEmail({
    to: 'your-email@example.com',
    subject: 'Test Email',
    react: WelcomeEmail({
      name: 'Test User',
      email: 'your-email@example.com',
    }),
  })
  
  console.log(result)
}

test()
```

---

## 📬 EMAIL TEMPLATES AVAILABLE

### 1. **Welcome Email** 🎉
- **Mục đích:** Chào mừng người dùng mới
- **Nội dung:**
  - Lời chào thân thiện
  - Danh sách tính năng (5 features)
  - Nút CTA "Bắt đầu ngay"
  - Thông tin support

### 2. **Quote Generated Email** 📦
- **Mục đích:** Thông báo báo giá mới
- **Nội dung:**
  - Địa chỉ giao hàng
  - So sánh giá từ 3 NVC (GHN, GHTK, VTP)
  - Highlight giá tốt nhất (màu xanh)
  - Link xem chi tiết

### 3. **Weekly Summary Email** 📊
- **Mục đích:** Báo cáo hoạt động tuần
- **Nội dung:**
  - 4 thống kê chính (grid 2x2)
  - Top nhà vận chuyển
  - Top shop
  - Mẹo tuần
  - Link xem dashboard

---

## 🔍 KIỂM TRA KẾT QUẢ

### **Trong Console/Terminal:**
```
✅ Email sent: msg_xxxxxxxxxxxxx
```

### **Trong Resend Dashboard:**
1. Truy cập: https://resend.com/emails
2. Đăng nhập với API key
3. Xem danh sách emails đã gửi
4. Kiểm tra trạng thái: Delivered / Bounced / Failed

### **Trong Email Inbox:**
- **From:** Addressify <onboarding@resend.dev>
- **Subject:** (theo template)
- **Content:** HTML responsive đẹp mắt
- **Links:** Hoạt động đúng

---

## 🎨 PREVIEW EMAIL TEMPLATES

### **Cách xem preview không cần gửi:**

1. **Sử dụng React Email Dev Server:**
```bash
# Cài đặt React Email CLI
npm install -g react-email

# Chạy dev server
npx react-email dev
```

2. **Mở trình duyệt:**
```
http://localhost:3000
```

3. **Xem tất cả templates và edit realtime**

---

## 📊 EMAIL TRACKING

### **Xem logs trong database:**

```sql
-- Xem 10 emails gần nhất
SELECT * FROM addressify_email_logs 
ORDER BY "sentAt" DESC 
LIMIT 10;

-- Thống kê theo loại email
SELECT 
  type,
  status,
  COUNT(*) as count
FROM addressify_email_logs
GROUP BY type, status;

-- Emails thất bại
SELECT * FROM addressify_email_logs 
WHERE status = 'failed'
ORDER BY "sentAt" DESC;
```

### **Xem stats trong code:**

```typescript
import { getEmailStats } from '@/lib/email/resend'

const stats = await getEmailStats(userId, 30) // Last 30 days

console.log(stats)
// {
//   total: 150,
//   sent: 148,
//   failed: 2,
//   pending: 0,
//   successRate: 98.67,
//   byType: {
//     welcome: 10,
//     quote_generated: 120,
//     weekly_summary: 20
//   }
// }
```

---

## 🐛 TROUBLESHOOTING

### **Email không gửi được**

**Lỗi:** `RESEND_API_KEY not set`
- **Giải pháp:** Kiểm tra file `.env` có key chưa
- Restart dev server: `npm run dev`

**Lỗi:** `Invalid API key`
- **Giải pháp:** Verify API key tại https://resend.com/api-keys
- Đảm bảo copy đúng key: `re_eBDcxRJc_KPai3LVCfy3nTkKCDrViUqwz`

**Lỗi:** `Unauthorized`
- **Giải pháp:** Đăng nhập vào ứng dụng trước
- Kiểm tra session cookie

---

### **Email vào Spam**

**Nguyên nhân:**
- Domain `resend.dev` chưa được tin tưởng bởi email provider
- Nội dung email có từ ngữ spam

**Giải pháp:**
1. Kiểm tra thư mục Spam/Junk
2. Đánh dấu "Not Spam"
3. Thêm sender vào contact
4. **Production:** Sử dụng custom domain verified

---

### **Email chậm**

**Thời gian gửi bình thường:** 1-5 giây

**Nếu chậm hơn:**
- Kiểm tra network connection
- Verify Resend service status: https://status.resend.com
- Kiểm tra rate limit (100 emails/day free tier)

---

## 📈 RESEND DASHBOARD

### **Thông tin quan trọng:**

**API Key:** `re_eBDcxRJc_KPai3LVCfy3nTkKCDrViUqwz`

**Free Tier Limits:**
- 100 emails/day
- 3,000 emails/month
- 1 verified domain

**Dashboard URL:** https://resend.com/emails

**Xem được:**
- Danh sách emails đã gửi
- Delivery status
- Open rates (nếu enable tracking)
- Click rates
- Bounce rates

---

## 💡 TIPS & BEST PRACTICES

### **1. Testing:**
- ✅ Test với email thật trước
- ✅ Kiểm tra trên nhiều email client (Gmail, Outlook, Yahoo)
- ✅ Test responsive trên mobile
- ✅ Verify tất cả links hoạt động

### **2. Production:**
- ⚠️ Sử dụng custom domain (không dùng `resend.dev`)
- ⚠️ Verify domain với SPF, DKIM, DMARC
- ⚠️ Add unsubscribe link
- ⚠️ Monitor delivery rates

### **3. Content:**
- ✅ Subject line ngắn gọn (<50 chars)
- ✅ Personalize với tên người dùng
- ✅ Clear CTA (call-to-action)
- ✅ Mobile-friendly design

### **4. Performance:**
- ✅ Send emails async (không block API)
- ✅ Queue emails nếu volume lớn
- ✅ Log tất cả emails
- ✅ Retry failed sends

---

## 🔄 NEXT STEPS

### **Immediate:**
- [x] Test gửi email
- [ ] Verify emails received
- [ ] Check spam folder
- [ ] Test all 3 templates

### **Integration:**
- [ ] Add welcome email to signup flow
- [ ] Add quote email to quote creation
- [ ] Setup weekly summary cron job
- [ ] Add email preferences to user profile

### **Production:**
- [ ] Get custom domain
- [ ] Verify domain in Resend
- [ ] Update EMAIL_FROM in .env
- [ ] Setup email analytics
- [ ] Add unsubscribe functionality

---

## 📞 SUPPORT

**Resend Documentation:** https://resend.com/docs  
**React Email Docs:** https://react.email/docs  
**Status Page:** https://status.resend.com

**Need Help?**
- Check console logs for errors
- Review database email_logs table
- Verify .env configuration
- Test with different email addresses

---

## ✅ CHECKLIST

- [x] Resend API key configured
- [x] Email templates created (3)
- [x] Test UI page built
- [x] API endpoint working
- [x] Build successful
- [x] Dev server running
- [ ] **TEST EMAIL SENT** ← Next step!
- [ ] **EMAIL RECEIVED** ← Verify!

---

**🎉 SẴN SÀNG TEST!**

**URL Test:** http://localhost:3000/test-email  
**API Test:** http://localhost:3000/api/test-email?template=welcome  
**Settings:** http://localhost:3000/settings

---

*Hãy thử gửi email test ngay bây giờ!* 📧
