# Addressify

**Biến địa chỉ lộn xộn thành đơn hàng hoàn hảo**

![Status](https://img.shields.io/badge/Status-MVP%20Complete-green)
![Progress](https://img.shields.io/badge/Progress-70%25-blue)
![Version](https://img.shields.io/badge/Version-v1.0.0-success)

> **🎉 Phiên bản MVP đã hoàn thành!** Ứng dụng đã sẵn sàng để sử dụng với đầy đủ tính năng cơ bản.

Ứng dụng Next.js chuyên nghiệp giúp người bán hàng online tại Việt Nam chuẩn hóa địa chỉ giao hàng và so sánh phí ship từ các đơn vị vận chuyển hàng đầu.

## 🎮 Demo trực tuyến

Ứng dụng hiện đang chạy ở chế độ development và có thể được deploy lên:
- **Vercel**: Deploy tự động từ repository GitHub
- **Netlify**: Hỗ trợ build Next.js
- **Local**: `npm run dev` để chạy tại localhost:3000

### Thử nghiệm với dữ liệu mẫu
1. Mở ứng dụng
2. Nhấn "Tải mẫu" để load dữ liệu địa chỉ Việt Nam
3. Nhấn "Xử lý địa chỉ" để xem kết quả chuẩn hóa
4. Chọn địa chỉ và nhấn "Xuất CSV" để tải file kết quả

![Addressify Demo](https://github.com/user-attachments/assets/24941267-0177-4175-a374-e87af63fc1b3)

## 🎯 Trạng thái hiện tại

### ✅ Tính năng đã hoàn thành và có thể sử dụng
1. **Chuẩn hóa địa chỉ Việt Nam** - Hoạt động hoàn hảo với 63 tỉnh thành
2. **Xử lý đa định dạng** - Nhập văn bản thô hoặc CSV
3. **Chuyển đổi 2-cấp sang 3-cấp** - Tương thích với API vận chuyển
4. **So sánh phí ship demo** - 4 nhà vận chuyển với thuật toán mock
5. **Xuất CSV** - Export đầy đủ thông tin
6. **Giao diện responsive** - Hoạt động tốt trên mọi thiết bị

### 🚧 Tính năng đang phát triển  
1. **In tem PDF** - UI đã sẵn sàng, cần hoàn thiện logic
2. **Tích hợp API thực** - Chuẩn bị kết nối với API chính thức

### 📋 Tính năng chưa bắt đầu
1. **Authentication** - Đăng nhập và quản lý tài khoản
2. **Database integration** - Lưu trữ lịch sử và cài đặt
3. **Advanced Analytics** - Thống kê và báo cáo

## ✨ Tính năng chính

### 🎯 Xử lý địa chỉ thông minh
- **Chuẩn hóa địa chỉ Việt Nam**: Tự động tách và chuẩn hóa địa chỉ thành Tỉnh/Quận/Phường
- **Chuyển đổi 2-cấp sang 3-cấp**: Tương thích với API của các hãng vận chuyển (GHN, GHTK)
- **Hỗ trợ đa định dạng**: Nhập địa chỉ qua văn bản thô hoặc file CSV
- **Xử lý hàng loạt**: Có thể xử lý nhiều địa chỉ cùng lúc

### 🚚 So sánh phí vận chuyển (Demo)
- **4 nhà vận chuyển**: GHN, GHTK, VNPost, J&T Express
- **Tính phí demo**: Ước tính phí ship dựa trên thuật toán mock data
- **Thời gian giao hàng**: Hiển thị thời gian ước tính demo
- **So sánh trực quan**: Bảng so sánh chi tiết giúp lựa chọn tối ưu
- **Lưu ý**: Hiện tại sử dụng dữ liệu demo, chưa kết nối API thực

### 📊 Xuất dữ liệu
- **Xuất CSV**: Export kết quả với đầy đủ thông tin phí ship ✅
- **In tem PDF**: UI sẵn sàng, tính năng đang được phát triển 🚧
- **Chọn lọc dữ liệu**: Chỉ xuất những địa chỉ đã chọn ✅

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

### Tích hợp API vận chuyển (Hiện tại: Mock Data)
- **GHN**: Giao Hàng Nhanh - Mock pricing algorithm
- **GHTK**: Giao Hàng Tiết Kiệm - Mock pricing algorithm
- **VNPost**: Vietnam Post - Mock pricing algorithm
- **J&T Express**: J&T Express - Mock pricing algorithm

> **Lưu ý**: Hiện tại ứng dụng sử dụng thuật toán mock để demo tính năng. Việc tích hợp API thực sẽ được thực hiện trong phiên bản tiếp theo.

## 🚧 Kế hoạch phát triển & Tiến độ thực hiện

### ✅ Đã hoàn thành (v1.0.0)
- [x] **Xử lý địa chỉ Việt Nam** (100%) - Chuẩn hóa và tách địa chỉ thành tỉnh/quận/phường
- [x] **Chuyển đổi 2-cấp sang 3-cấp** (100%) - Tương thích với API vận chuyển
- [x] **Giao diện người dùng** (100%) - UI responsive với Tailwind CSS
- [x] **Nhập liệu đa dạng** (100%) - Hỗ trợ văn bản thô và CSV
- [x] **So sánh phí ship Mock** (100%) - Demo với 4 nhà vận chuyển
- [x] **Xuất CSV** (100%) - Export kết quả với đầy đủ thông tin
- [x] **Xử lý hàng loạt** (100%) - Có thể xử lý nhiều địa chỉ cùng lúc

### 🚧 Đang phát triển (v1.1.0)
- [ ] **Tích hợp API thực** (0%) - Kết nối với API chính thức của các hãng vận chuyển
- [ ] **In tem PDF** (30%) - UI đã sẵn sàng, cần implement logic in ấn
- [ ] **Supabase Database** (10%) - Dependencies đã cài, chưa config

### 📋 Kế hoạch tương lai (v2.0.0+)
- [ ] **Authentication** (0%) - Đăng nhập và quản lý tài khoản  
- [ ] **Advanced Analytics** (0%) - Thống kê chi phí vận chuyển
- [ ] **API Endpoints** (0%) - Cung cấp API cho integration
- [ ] **Mobile App** (0%) - Ứng dụng di động

### 📊 Tổng quan tiến độ
- **Core Features**: 100% hoàn thành
- **Advanced Features**: 15% hoàn thành  
- **Overall Progress**: 70% (Phiên bản MVP hoàn chỉnh)

## 📚 Changelog

### v1.0.0 (Current) - MVP Release 🎉
**Ngày phát hành**: Tháng 12, 2024

#### ✅ Hoàn thành
- Khởi tạo dự án Next.js 15.5.3 với TypeScript
- Implement thuật toán chuẩn hóa địa chỉ Việt Nam
- Tạo component AddressProcessor cho nhập liệu
- Tạo component ShippingComparison cho so sánh phí
- Thêm hỗ trợ văn bản thô và CSV input
- Implement chuyển đổi 2-cấp sang 3-cấp
- Tạo mock data cho 4 nhà vận chuyển
- Thêm tính năng export CSV
- Design responsive UI với Tailwind CSS
- Tối ưu hóa performance và build

#### 🐛 Bug fixes
- Sửa lỗi parsing địa chỉ có dấu đặc biệt
- Cải thiện nhận diện tỉnh thành với nhiều alias
- Fix responsive layout trên mobile

### v0.1.0 - Initial Setup
- Project initialization
- Basic folder structure

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