# 🔐 Hướng dẫn lấy Database Password từ Supabase

## Bước 1: Lấy Database Password

1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project: `yzeuoubfqtpnsqyvrukc`
3. Vào **Project Settings** (⚙️ icon bên trái dưới)
4. Chọn tab **Database**
5. Scroll xuống phần **Connection string**

### Option A: Copy connection string có sẵn

Bạn sẽ thấy 2 loại connection string:

**1. Connection pooling (Port 5432)** - Dùng cho DATABASE_URL
```
postgresql://postgres.yzeuoubfqtpnsqyvrukc:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**2. Session mode (Port 6543)** - Dùng cho DIRECT_URL  
```
postgresql://postgres.yzeuoubfqtpnsqyvrukc:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Option B: Reset password nếu quên

1. Vào **Project Settings > Database**
2. Tìm section **Database password**
3. Click **Reset database password**
4. Copy password mới (chỉ hiện 1 lần!)
5. Thay `[YOUR-PASSWORD]` trong `.env`

---

## Bước 2: Cập nhật .env

Mở file `.env` và thay `[YOUR_PASSWORD]` bằng password thật:

```bash
# Connection Pooler (Port 5432) - Runtime
DATABASE_URL=postgresql://postgres:[PASTE_PASSWORD_HERE]@db.yzeuoubfqtpnsqyvrukc.supabase.co:5432/postgres

# Direct Connection (Port 6543) - Migrations
DIRECT_URL=postgresql://postgres:[PASTE_PASSWORD_HERE]@db.yzeuoubfqtpnsqyvrukc.supabase.co:6543/postgres
```

⚠️ **Lưu ý:** 
- Password phải giống nhau cho cả 2 URL
- Không được có dấu `[ ]` xung quanh password
- Không có dấu cách trước/sau password

---

## Bước 3: Test connection

Sau khi cập nhật `.env`, chạy:

```bash
npx prisma db push
```

Nếu thành công, bạn sẽ thấy:
```
✔ Your database is now in sync with your Prisma schema.
```

---

## 📊 So sánh 2 loại URL:

| Tính năng | DATABASE_URL (Port 5432) | DIRECT_URL (Port 6543) |
|-----------|--------------------------|------------------------|
| **Mục đích** | Runtime queries | Migrations |
| **Connection** | Pooled (PgBouncer) | Direct (PostgreSQL) |
| **Hiệu năng** | ⚡ Cao (reuse connections) | 🐢 Thấp hơn |
| **Migrations** | ❌ Không hỗ trợ | ✅ Hỗ trợ |
| **Prisma Client** | ✅ Sử dụng | ❌ Không dùng |
| **Prisma Migrate** | ❌ Không dùng | ✅ Sử dụng |

---

## 🚀 Các lệnh Prisma thường dùng:

```bash
# Tạo migration mới (dùng DIRECT_URL)
npx prisma migrate dev --name init

# Push schema lên database (dùng DIRECT_URL) 
npx prisma db push

# Generate Prisma Client (sau khi migrate)
npx prisma generate

# Mở Prisma Studio để xem data
npx prisma studio

# Reset database (xóa hết data)
npx prisma migrate reset
```

---

## ❓ Troubleshooting

### Lỗi: "Can't reach database server"
- Kiểm tra password đã đúng chưa
- Kiểm tra project-ref: `yzeuoubfqtpnsqyvrukc`
- Kiểm tra network/firewall

### Lỗi: "prepared statements not supported"
- Đang dùng DATABASE_URL (pooled) cho migrations
- Chuyển sang dùng DIRECT_URL

### Lỗi: "Connection pool timeout"
- Quá nhiều connections đang mở
- Restart app hoặc đợi vài giây

---

Need help? Check: https://supabase.com/docs/guides/database/connecting-to-postgres
