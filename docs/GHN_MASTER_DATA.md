# GHN Master Data Integration

## Tổng quan

Hệ thống tích hợp với GHN Master Data API để:
- Lấy danh sách tỉnh/thành phố, quận/huyện, phường/xã chính thức từ GHN
- Cache dữ liệu local để giảm API calls
- Matching thông minh địa chỉ người dùng với master data
- Resolve district/ward IDs cho GHN shipping API

## Cấu trúc

```
src/
├── lib/master-data/
│   ├── ghn-master-data.ts      # Service gọi GHN API
│   └── address-matcher.ts       # Fuzzy matching địa chỉ
├── app/api/master-data/
│   ├── sync/route.ts            # POST endpoint để sync toàn bộ
│   ├── provinces/route.ts       # GET danh sách tỉnh
│   ├── districts/route.ts       # GET danh sách quận (filter by province)
│   ├── wards/route.ts           # GET danh sách phường (require district_id)
│   └── resolve/route.ts         # POST matching địa chỉ
├── app/master-data/page.tsx     # UI quản lý master data
└── data/master-data/            # Cache directory
    ├── ghn-provinces.json
    ├── ghn-districts.json
    ├── ghn-wards-{districtId}.json
    └── ghn-all-wards.json
```

## APIs

### 1. Sync Master Data
```bash
POST /api/master-data/sync
```
**Response:**
```json
{
  "success": true,
  "message": "Master data synced successfully",
  "data": {
    "provinces": 63,
    "districts": 705,
    "wards": 10599
  }
}
```

### 2. Get Provinces
```bash
GET /api/master-data/provinces
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ProvinceID": 202,
      "ProvinceName": "Thành phố Hồ Chí Minh",
      "Code": "79",
      "NameExtension": ["TP.HCM", "Sài Gòn", "HCM"]
    }
  ]
}
```

### 3. Get Districts
```bash
GET /api/master-data/districts?province_id=202
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "DistrictID": 1442,
      "ProvinceID": 202,
      "DistrictName": "Quận Bình Tân",
      "Code": "784",
      "Type": 1,
      "NameExtension": ["Bình Tân"]
    }
  ]
}
```

### 4. Get Wards
```bash
GET /api/master-data/wards?district_id=1442
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "WardCode": "20612",
      "DistrictID": 1442,
      "WardName": "Phường An Lạc A",
      "NameExtension": ["An Lạc A"]
    }
  ]
}
```

### 5. Resolve Address
```bash
POST /api/master-data/resolve
Content-Type: application/json

{
  "province": "Hồ Chí Minh",
  "district": "Bình Tân",
  "ward": "An Lạc A"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "province": {
      "id": 202,
      "name": "Thành phố Hồ Chí Minh",
      "confidence": 1.0
    },
    "district": {
      "id": 1442,
      "name": "Quận Bình Tân",
      "provinceId": 202,
      "confidence": 0.95
    },
    "ward": {
      "code": "20612",
      "name": "Phường An Lạc A",
      "districtId": 1442,
      "confidence": 1.0
    }
  }
}
```

## Sử dụng

### 1. Lần đầu setup - Sync master data
Truy cập: http://localhost:3000/master-data
1. Nhấn "Sync Master Data từ GHN"
2. Đợi ~1-2 phút để tải toàn bộ dữ liệu
3. Kiểm tra kết quả sync

Hoặc dùng API:
```bash
curl -X POST http://localhost:3000/api/master-data/sync
```

### 2. Matching địa chỉ trong code

```typescript
import { AddressMatcher } from '@/lib/master-data/address-matcher'

const matcher = new AddressMatcher()
await matcher.loadCache()

const result = await matcher.resolveAddress(
  'Hồ Chí Minh',
  'Bình Tân', 
  'An Lạc A'
)

// Use result.district.id and result.ward.code for GHN API
```

### 3. Test matching trên UI
Truy cập: http://localhost:3000/master-data
1. Nhập tỉnh/quận/phường vào form bên phải
2. Nhấn "Test Matching"
3. Xem kết quả với confidence score

## Thuật toán Matching

### Normalization
```typescript
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
```

### Similarity Scoring
- **Exact match** → confidence = 1.0
- **Substring match** → confidence = 0.8
- **Word overlap** → confidence = intersectionCount / unionCount
- **Threshold** → confidence >= 0.6 mới accept

### NameExtension
GHN cung cấp các alias/tên gọi khác cho mỗi địa danh:
```json
{
  "DistrictName": "Quận Bình Tân",
  "NameExtension": ["Bình Tân", "binh tan", "Q. Bình Tân"]
}
```
Matcher kiểm tra cả name chính và tất cả extensions.

## Cấu hình

### Environment Variables
```bash
# Required
GHN_API_TOKEN=your_ghn_token_here

# Optional (có default)
GHN_API_BASE_URL=https://online-gateway.ghn.vn/shiip/public-api
```

### Cache Location
Cache được lưu tại: `src/data/master-data/`

Để xóa cache và sync lại:
```bash
# Windows
Remove-Item -Recurse src\data\master-data\*.json

# Linux/Mac
rm -rf src/data/master-data/*.json
```

## Tích hợp với Address Normalizer

File `src/utils/addressNormalizer.ts` hiện sử dụng:
- Danh sách tỉnh hard-code (~20 tỉnh phổ biến)
- Danh sách quận TPHCM hard-code (~22 quận)
- Pattern matching bằng regex

**Roadmap để nâng cấp:**
1. Thay thế danh sách hard-code bằng GHN master data
2. Sử dụng AddressMatcher để resolve IDs
3. Trả về cả canonical name và GHN IDs trong AddressData
4. Enable GHN quotes trực tiếp từ /normalize page

## Performance

- **Initial sync**: ~1-2 phút (one-time)
- **Subsequent loads**: < 100ms (đọc từ cache)
- **Matching**: < 50ms per address
- **Cache size**: ~15-20 MB

## Troubleshooting

### "Master data not available"
→ Chạy sync trước: `POST /api/master-data/sync`

### "GHN API error: Token invalid"
→ Kiểm tra `GHN_API_TOKEN` trong `.env`

### Matching confidence thấp
→ Kiểm tra NameExtension, có thể cần thêm alias vào master data

### Cache không update
→ Xóa file cache và sync lại

## Next Steps

1. ✅ Tích hợp GHN Master Data API
2. ✅ Implement fuzzy matching
3. ✅ UI quản lý và test
4. ⏳ Integrate vào addressNormalizer
5. ⏳ Thêm GHTK/VTP master data (nếu có API)
6. ⏳ Auto-sync hàng tuần
7. ⏳ Redis cache cho production
