# 🗄️ Database Setup Guide for Addressify

## ⚠️ QUAN TRỌNG: Shared Database Strategy

Vì bạn đang dùng **chung database** cho nhiều projects, chúng ta **KHÔNG dùng Prisma Migrate** mà sẽ **chạy SQL thủ công** để tránh xóa nhầm tables của projects khác.

---

## 🚀 Cách 1: Dùng Supabase SQL Editor (KHUYẾN NGHỊ)

### Bước 1: Mở SQL Editor
1. Vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project: `yzeuoubfqtpnsqyvrukc`
3. Click **SQL Editor** ở sidebar bên trái
4. Click **New query**

### Bước 2: Copy & Paste SQL
1. Mở file `database-setup.sql` trong VS Code
2. **Copy toàn bộ nội dung** (Ctrl+A, Ctrl+C)
3. **Paste vào SQL Editor** trong Supabase
4. Click **Run** (hoặc Ctrl+Enter)

### Bước 3: Kiểm tra kết quả
Bạn sẽ thấy output:
```
✅ CREATE TABLE (x3)
✅ CREATE INDEX (x2)
✅ ALTER TABLE (RLS enabled)
✅ CREATE POLICY (x7)
```

Cuối cùng sẽ hiện danh sách tables:
```
addressify_users
addressify_shops
addressify_quote_histories
```

---

## 🚀 Cách 2: Dùng psql (Terminal)

Nếu bạn có `psql` installed:

```bash
# Kết nối đến Supabase
psql "postgresql://postgres:Cuongnv@123@db.yzeuoubfqtpnsqyvrukc.supabase.co:5432/postgres"

# Trong psql prompt, chạy file:
\i database-setup.sql

# Hoặc chạy trực tiếp từ terminal:
psql "postgresql://postgres:Cuongnv@123@db.yzeuoubfqtpnsqyvrukc.supabase.co:5432/postgres" < database-setup.sql
```

---

## 🚀 Cách 3: Dùng Node.js Script

Tôi có thể tạo script Node.js để chạy SQL:

```bash
npm install -D pg
node scripts/setup-database.js
```

---

## ✅ Sau khi chạy SQL thành công

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Verify connection
```bash
npx prisma studio
```

Bạn sẽ thấy 3 tables:
- `addressify_users`
- `addressify_shops`
- `addressify_quote_histories`

---

## 🔍 Kiểm tra tables đã tạo

Chạy query này trong SQL Editor:

```sql
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE tablename LIKE 'addressify_%'
ORDER BY tablename;
```

Expected output:
```
| tablename                      | schemaname |
|--------------------------------|------------|
| addressify_quote_histories     | public     |
| addressify_shops               | public     |
| addressify_users               | public     |
```

---

## 📋 Database Structure

### Table: `addressify_users`
- `id` (TEXT, PK) - User ID từ Supabase Auth
- `email` (TEXT, UNIQUE) - Email address
- `name` (TEXT, nullable) - User name
- `createdAt`, `updatedAt` - Timestamps

### Table: `addressify_shops`
- `id` (TEXT, PK) - Shop UUID
- `userId` (TEXT, FK) - Owner user ID
- `name` (TEXT) - Shop name
- `senderAddress`, `senderDistrict`, `senderProvince` - Địa chỉ gửi hàng
- `ghnProvinceId`, `ghnDistrictId`, `ghnWardCode`, `ghnShopId` - GHN config
- `ghtkPickAddress`, `ghtkPickProvince`, `ghtkPickDistrict`, `ghtkPickWard` - GHTK config
- `createdAt`, `updatedAt` - Timestamps

### Table: `addressify_quote_histories`
- `id` (TEXT, PK) - Quote UUID
- `shopId` (TEXT, FK) - Shop ID
- `recipientName`, `recipientPhone`, `recipientAddress` - Thông tin người nhận
- `normalizedAddress`, `province`, `district`, `ward`, `wardCode` - Địa chỉ chuẩn hóa
- `confidence` (FLOAT) - Độ chính xác chuẩn hóa
- `quotes` (JSONB) - Kết quả báo giá từ các nhà vận chuyển
- `weight`, `value`, `note` - Metadata
- `createdAt` - Timestamp

---

## 🔐 Row Level Security (RLS)

Script tự động enable RLS và tạo policies:
- ✅ Users chỉ thấy được dữ liệu của mình
- ✅ Users chỉ quản lý được shops của mình
- ✅ Users chỉ thấy quote histories của shops mình sở hữu

---

## 🎯 Next Steps

Sau khi setup database xong:

1. ✅ Chạy `npx prisma generate`
2. ✅ Test với `npx prisma studio`
3. ✅ Tiếp tục Phase 2: Frontend Components

---

## ❓ Troubleshooting

### Lỗi: "permission denied"
- Kiểm tra user có quyền CREATE TABLE trong schema public
- Chạy query: `GRANT ALL ON SCHEMA public TO postgres;`

### Lỗi: "table already exists"
- Tables đã được tạo rồi, skip error này
- Script dùng `IF NOT EXISTS` nên an toàn chạy nhiều lần

### Lỗi: "password authentication failed"
- Kiểm tra password trong connection string
- Reset password nếu cần

---

Bạn muốn tôi hướng dẫn cách nào? (1, 2, hay 3?)
