# Addressify

**Biến địa chỉ lộn xộn thành đơn hàng hoàn hảo**

Ứng dụng Next.js chuyên nghiệp giúp người bán hàng online tại Việt Nam chuẩn hóa địa chỉ giao hàng và so sánh phí ship từ các đơn vị vận chuyển hàng đầu.

![Addressify Demo](https://github.com/user-attachments/assets/24941267-0177-4175-a374-e87af63fc1b3)

## ✨ Tính năng chính

### 🎯 Xử lý địa chỉ thông minh
- **Chuẩn hóa địa chỉ Việt Nam**: Tự động tách và chuẩn hóa địa chỉ thành Tỉnh/Quận/Phường
- **Chuyển đổi 2-cấp sang 3-cấp**: Tương thích với API của các hãng vận chuyển (GHN, GHTK)
- **Hỗ trợ đa định dạng**: Nhập địa chỉ qua văn bản thô hoặc file CSV
- **Xử lý hàng loạt**: Có thể xử lý nhiều địa chỉ cùng lúc

### 🚚 So sánh phí vận chuyển
- **4 nhà vận chuyển**: GHN, GHTK, VNPost, J&T Express
- **Tính phí tự động**: Ước tính phí ship dựa trên địa chỉ đã chuẩn hóa
- **Thời gian giao hàng**: Hiển thị thời gian ước tính của từng nhà vận chuyển
- **So sánh trực quan**: Bảng so sánh chi tiết giúp lựa chọn tối ưu

### 📊 Xuất dữ liệu
- **Xuất CSV**: Export kết quả với đầy đủ thông tin phí ship
- **In tem PDF**: Chuẩn bị cho tính năng in tem hàng loạt (đang phát triển)
- **Chọn lọc dữ liệu**: Chỉ xuất những địa chỉ đã chọn

## 🛠 Công nghệ sử dụng

- **Frontend**: Next.js 15.5.3 với App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt
```bash
# Clone repository
git clone https://github.com/cuongccna/Addressify.git
cd Addressify

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### Build cho production
```bash
# Build ứng dụng
npm run build

# Chạy production server
npm start
```

## 📝 Hướng dẫn sử dụng

### 1. Nhập địa chỉ
- **Văn bản thô**: Dán danh sách địa chỉ, mỗi địa chỉ một dòng
- **CSV**: Upload hoặc dán dữ liệu CSV (địa chỉ ở cột đầu tiên)
- **Tải mẫu**: Sử dụng dữ liệu mẫu để test

### 2. Xử lý địa chỉ
- Nhấn "Xử lý địa chỉ" để chuẩn hóa
- Hệ thống sẽ tự động:
  - Trích xuất Tỉnh/Thành phố
  - Xác định Quận/Huyện
  - Tìm Phường/Xã
  - Chuyển đổi định dạng cho API vận chuyển

### 3. So sánh phí ship
- Hệ thống tự động tính phí cho 4 nhà vận chuyển
- Chọn địa chỉ cần so sánh
- Xem chi tiết phí và thời gian giao hàng

### 4. Xuất kết quả
- Chọn địa chỉ cần xuất
- Nhấn "Xuất CSV" để tải file kết quả
- File bao gồm: Địa chỉ gốc, địa chỉ chuẩn hóa, phí ship các nhà vận chuyển

## 🎯 Ví dụ địa chỉ được hỗ trợ

```
123 Nguyễn Văn Linh, Phường Tân Thuận Đông, Quận 7, TP.HCM
456 Lê Duẩn, P. Bến Nghé, Q.1, Hồ Chí Minh
789 Hoàng Hoa Thám, Ba Đình, Hà Nội
321 Trần Hưng Đạo, Quận 1, TPHCM
654 Nguyễn Huệ, Hoàn Kiếm, HN
```

## 🔧 Cấu trúc dự án

```
Addressify/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── AddressProcessor.tsx
│   │   └── ShippingComparison.tsx
│   ├── types/             # TypeScript definitions
│   │   └── address.ts
│   └── utils/             # Utility functions
│       └── addressProcessor.ts
├── public/                # Static assets
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🌟 Tính năng nổi bật

### Thuật toán chuẩn hóa địa chỉ
- **Nhận diện thông minh**: Sử dụng regex và fuzzy matching
- **Database tỉnh thành**: Hỗ trợ đầy đủ 63 tỉnh thành Việt Nam
- **Xử lý viết tắt**: Nhận diện các cách viết tắt phổ biến (HCM, HN, TP.HCM...)
- **Loại bỏ dấu**: Chuẩn hóa Unicode và dấu tiếng Việt

### Tích hợp API vận chuyển (Mock)
- **GHN**: Giao Hàng Nhanh
- **GHTK**: Giao Hàng Tiết Kiệm  
- **VNPost**: Vietnam Post
- **J&T Express**: J&T Express

## 🚧 Roadmap

- [ ] **Tích hợp API thực**: Kết nối với API chính thức của các hãng vận chuyển
- [ ] **In tem PDF**: Tính năng in tem giao hàng hàng loạt
- [ ] **Supabase Database**: Lưu trữ lịch sử xử lý và cài đặt người dùng
- [ ] **Authentication**: Đăng nhập và quản lý tài khoản
- [ ] **Advanced Analytics**: Thống kê chi phí vận chuyển
- [ ] **API Endpoints**: Cung cấp API cho integration
- [ ] **Mobile App**: Ứng dụng di động

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy:
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Email**: support@addressify.vn
- **GitHub**: [@cuongccna](https://github.com/cuongccna)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- Cộng đồng developer Việt Nam

---

**Made with ❤️ for Vietnamese e-commerce sellers**