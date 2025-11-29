# Contact Form Email Integration - Setup Guide

## ✅ Completed Implementation

### 1. API Endpoint Created
**File:** `src/app/api/contact/route.ts`

**Features:**
- ✅ POST endpoint for form submissions
- ✅ Input validation with Zod schema
- ✅ Email sending via Resend
- ✅ Beautiful HTML email template
- ✅ Error handling and logging
- ✅ Reply-to field set to user's email

**Email Template Includes:**
- User name and email (with reply link)
- Daily order volume (optional)
- Message content
- Professional styling with gradient header
- Quick reply button

### 2. Contact Page Updated
**File:** `src/app/contact/page.tsx`

**Changes:**
- ✅ Converted from server to client component (`'use client'`)
- ✅ Added form state management (useState)
- ✅ Form validation (required fields)
- ✅ Submit handler with fetch to `/api/contact`
- ✅ Loading state with spinner
- ✅ Success/error messages with styled alerts
- ✅ Auto-reset form after successful submission

**Form Fields:**
- `name` (required): Họ & tên
- `email` (required): Email address
- `orderVolume` (optional): Số lượng đơn/ngày
- `message` (required): Nội dung cần hỗ trợ

---

## 🔧 Setup Instructions

### Step 1: Get Resend API Key

1. Go to https://resend.com
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `re_...`)

### Step 2: Add API Key to Environment

Create or edit `.env.local` file in project root:

```bash
# Required for contact form emails
RESEND_API_KEY=re_your_actual_key_here
```

**Important:**
- `.env.local` is gitignored (safe to store secrets)
- Never commit API keys to git
- Restart dev server after adding env vars

### Step 3: Verify Email Sender

**For Testing (Default):**
- Sender: `onboarding@resend.dev`
- No verification needed
- Works immediately
- ⚠️ May go to spam folder

**For Production:**
1. Add your domain to Resend dashboard
2. Add DNS records (MX, TXT, CNAME)
3. Wait for verification (usually 5-30 minutes)
4. Update API endpoint `from` field:

```typescript
// In src/app/api/contact/route.ts
from: 'Addressify <contact@your-domain.com>', // Replace onboarding@resend.dev
```

---

## 🧪 Testing the Contact Form

### Manual Test

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to contact page:**
   ```
   http://localhost:3000/contact
   ```

3. **Fill out form:**
   - Họ & tên: `Test User`
   - Email: `your-email@example.com`
   - Số lượng đơn/ngày: `100` (optional)
   - Nội dung: `This is a test message`

4. **Click "Gửi yêu cầu tư vấn"**

5. **Expected behavior:**
   - Button shows "Đang gửi..." with spinner
   - Success message appears (green background)
   - Form resets to empty
   - Email arrives at `cuong.vhcc@gmail.com`

6. **Check email:**
   - Check inbox for cuong.vhcc@gmail.com
   - If not there, check spam folder
   - Email subject: `[Addressify] Yêu cầu tư vấn từ Test User`

### Test Cases

**✅ Valid Submission:**
- All required fields filled
- Valid email format
- Should succeed

**❌ Invalid Submissions:**
- Empty name → Error: "Tên phải có ít nhất 2 ký tự"
- Invalid email → Error: "Email không hợp lệ"
- Short message → Error: "Nội dung phải có ít nhất 10 ký tự"
- Network error → Error: "Không thể kết nối đến server"

---

## 🎨 Email Template Preview

```
╔══════════════════════════════════════════════╗
║  📧 Yêu cầu tư vấn mới                      ║
║  Từ trang liên hệ Addressify               ║
╠══════════════════════════════════════════════╣
║                                              ║
║  👤 Họ & Tên                                ║
║  Test User                                   ║
║                                              ║
║  📧 Email                                    ║
║  test@example.com                            ║
║                                              ║
║  📦 Số lượng đơn/ngày                       ║
║  100                                         ║
║                                              ║
║  💬 Nội dung cần hỗ trợ                     ║
║  This is a test message                      ║
║                                              ║
╠══════════════════════════════════════════════╣
║  Email này được gửi tự động từ form liên hệ ║
║  → Trả lời khách hàng (link to reply)       ║
╚══════════════════════════════════════════════╝
```

---

## 🚀 Production Deployment

### Vercel Setup

1. **Add environment variable:**
   - Go to Vercel project settings
   - Environment Variables tab
   - Add `RESEND_API_KEY` with your key
   - Apply to Production, Preview, Development

2. **Verify domain (recommended):**
   - Add your domain in Resend dashboard
   - Update `from` email in API endpoint
   - Test with production domain

3. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: add contact form email integration"
   git push
   ```

### Post-Deployment Testing

1. Visit production URL: `https://your-domain.com/contact`
2. Submit a test inquiry
3. Verify email arrives at cuong.vhcc@gmail.com
4. Check email formatting and links

---

## 📊 Monitoring

### Check Email Logs

1. Go to Resend Dashboard
2. Navigate to **Emails** tab
3. View sent emails, delivery status, and errors

### Common Issues

**Issue:** Emails not arriving
- ✅ Check Resend dashboard for errors
- ✅ Verify API key is correct
- ✅ Check spam folder
- ✅ Ensure `RESEND_API_KEY` is set in environment

**Issue:** 500 Server Error
- ✅ Check console logs: `npm run dev` output
- ✅ Verify Resend API key format (`re_...`)
- ✅ Check API endpoint logs in terminal

**Issue:** Validation Errors
- ✅ Open browser console (F12)
- ✅ Check Network tab for API response
- ✅ Verify field names match schema

---

## 🔒 Security Best Practices

1. **API Key:**
   - ✅ Stored in `.env.local` (gitignored)
   - ✅ Never in client-side code
   - ✅ Only accessible in API routes

2. **Input Validation:**
   - ✅ Zod schema validates all inputs
   - ✅ Email format verified
   - ✅ Minimum length checks

3. **Rate Limiting (Future Enhancement):**
   - Add rate limiting to prevent spam
   - Use Vercel Edge Config or Redis
   - Limit to 3 submissions per IP per hour

4. **CAPTCHA (Future Enhancement):**
   - Add reCAPTCHA or hCaptcha
   - Prevent bot submissions

---

## 📝 Code Reference

### API Endpoint Structure

```typescript
// src/app/api/contact/route.ts
POST /api/contact
{
  name: string,        // min 2 chars
  email: string,       // valid email
  orderVolume?: string, // optional
  message: string      // min 10 chars
}

Response (Success):
{
  success: true,
  message: "Email đã được gửi thành công!",
  emailId: "xxx"
}

Response (Error):
{
  success: false,
  error: "Error message",
  errors?: [] // Validation errors
}
```

### Environment Variables

```bash
# Required
RESEND_API_KEY=re_...

# Optional (defaults to onboarding@resend.dev)
EMAIL_FROM="Addressify <contact@your-domain.com>"
```

---

## ✨ Features

### Current
- ✅ Beautiful HTML email template
- ✅ Instant form validation
- ✅ Loading states
- ✅ Success/error messages
- ✅ Auto-reset after submission
- ✅ Reply-to field set to user email
- ✅ Responsive design

### Future Enhancements
- ⏳ CAPTCHA integration
- ⏳ Rate limiting
- ⏳ Store submissions in database
- ⏳ Send confirmation email to user
- ⏳ Admin dashboard for inquiries
- ⏳ Email templates with @react-email
- ⏳ Attachment support

---

## 🎯 Testing Checklist

- [ ] Form loads correctly at `/contact`
- [ ] All fields render properly
- [ ] Validation works (empty fields)
- [ ] Loading state shows during submission
- [ ] Success message displays after send
- [ ] Form resets after success
- [ ] Email arrives at cuong.vhcc@gmail.com
- [ ] Email contains all form data
- [ ] Reply-to field is user's email
- [ ] Error handling works (invalid data)
- [ ] Mobile responsive
- [ ] Production deployment works

---

## 📞 Support

**Email Issues:**
- Resend Documentation: https://resend.com/docs
- Resend Discord: https://resend.com/discord

**Application Issues:**
- Check terminal logs: `npm run dev`
- Check browser console (F12)
- Verify environment variables

---

## 🎉 Ready to Test!

The contact form is now fully functional. Just add your `RESEND_API_KEY` to `.env.local` and test it out!

**Quick start:**
```bash
# 1. Add API key to .env.local
echo "RESEND_API_KEY=re_your_key_here" >> .env.local

# 2. Restart dev server
npm run dev

# 3. Test at http://localhost:3000/contact
```

**Emails will be sent to:** cuong.vhcc@gmail.com

Good luck! 🚀
