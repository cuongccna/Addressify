# Hướng Dẫn Chuẩn Hóa Địa Chỉ với GHN Master Data

## 🎯 Tổng Quan

Hệ thống chuẩn hóa địa chỉ của Addressify sử dụng **GHN Master Data** để:
- ✅ Nhận diện chính xác Tỉnh/Quận/Phường từ địa chỉ thô
- ✅ Fuzzy matching với 11,979 wards từ GHN
- ✅ Trả về GHN IDs để gọi API shipping
- ✅ Hiển thị độ tin cậy (confidence score) của từng match

---

## 🚀 Quick Start

### **Bước 1: Sync Master Data (Chỉ cần 1 lần)**

Truy cập: http://localhost:3000/master-data

Click nút **"Sync Master Data từ GHN"**

Đợi ~1-2 phút để tải về:
- 63 provinces
- 723 districts  
- 11,979 wards

Data sẽ được cache tại `src/data/master-data/`

---

### **Bước 2: Test Chuẩn Hóa Địa Chỉ**

Truy cập: http://localhost:3000/normalize

Paste danh sách địa chỉ thô (mỗi địa chỉ 1 dòng):

```
123 tên lữa p. an lạc a, bình tân, hcm
456 le duan, ben nghe, quan 1, tp ho chi minh
789 hoang hoa tham, ba dinh, ha noi
34/5 nguyen van linh, p tan thuan dong, q7, tphcm
12 ly thai to, hoan kiem, hn
999 đường 3/2, p. xuân khánh, ninh kiều, cần thơ
```

Click **"Xử lý địa chỉ"**

---

## 📊 Hiểu Kết Quả

### **Bảng Kết Quả Chuẩn Hóa**

| Cột | Mô tả | Ví dụ |
|-----|-------|-------|
| **Địa chỉ gốc** | Input của bạn | `123 tên lữa p. an lạc a, bình tân, hcm` |
| **Chuẩn hóa** | Địa chỉ đã format chuẩn | `123, Tên Lửa, Phường An Lạc A, Quận Bình Tân, Hồ Chí Minh, Việt Nam` |
| **Số nhà** | House number | `123` |
| **Tên đường** | Street name | `Tên Lửa` |
| **Tỉnh/TP** | Province + GHN ID | `Hồ Chí Minh (202)` |
| **Quận/Huyện** | District + GHN ID | `Quận Bình Tân (1458)` |
| **Phường/Xã** | Ward + GHN Code | `Phường An Lạc A (21902)` |
| **GHN IDs** | Compact IDs | `P: 202`<br/>`D: 1458`<br/>`W: 21902` |
| **Độ chính xác** | Confidence scores | `P: 100%` ✅<br/>`D: 100%` ✅<br/>`W: 100%` ✅ |

---

### **Confidence Score Colors**

| Score | Color | Ý nghĩa |
|-------|-------|---------|
| 100% | 🟢 Green | Exact match - Tin cậy hoàn toàn |
| 80-99% | 🟡 Yellow | Fuzzy match - Cần kiểm tra |
| < 80% | 🔴 Red | Low confidence - Nên sửa thủ công |

---

## 🔧 Cách Hoạt Động

### **1. Regex-Based Extraction (Fallback)**

Nếu master data chưa sync, hệ thống dùng regex:

```typescript
// Extract province
const province = extractProvince(address)  // "Hồ Chí Minh"

// Extract district (với HCMC curated list)
const district = extractDistrict(address)  // "Bình Tân"

// Extract ward
const ward = extractWard(address)          // "An Lạc A"

// Extract street
const { streetNumber, streetName } = extractStreet(address)
// streetNumber: "123"
// streetName: "Tên Lửa"
```

---

### **2. GHN Master Data Matching (Preferred)**

Nếu master data đã sync, sử dụng fuzzy matching:

```typescript
const matcher = new AddressMatcher()
await matcher.loadCache()

const resolved = await matcher.resolveAddress(
  "Hồ Chí Minh",    // province query
  "Bình Tân",       // district query
  "An Lạc A"        // ward query (optional)
)

// Result:
{
  province: { id: 202, name: "Hồ Chí Minh", confidence: 1.0 },
  district: { id: 1458, name: "Quận Bình Tân", confidence: 1.0 },
  ward: { code: "21902", name: "Phường An Lạc A", confidence: 1.0 }
}
```

---

### **3. Fuzzy Matching Algorithm**

```typescript
function calculateSimilarity(a: string, b: string): number {
  const normA = normalizeText(a)  // lowercase, remove diacritics
  const normB = normalizeText(b)
  
  // 1. Exact match
  if (normA === normB) return 1.0
  
  // 2. Substring match
  if (normA.includes(normB) || normB.includes(normA)) return 0.8
  
  // 3. Word overlap (Jaccard similarity)
  const wordsA = new Set(normA.split(/\s+/))
  const wordsB = new Set(normB.split(/\s+/))
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length
  const union = new Set([...wordsA, ...wordsB]).size
  
  return intersection / union
}
```

**Example:**
- `"Hồ Chí Minh"` vs `"Hồ Chí Minh"` → 1.0 (exact)
- `"Bình Tân"` vs `"Quận Bình Tân"` → 0.8 (substring)
- `"An Lạc A"` vs `"Phường An Lạc A"` → 0.8 (substring)
- `"Q1"` vs `"Quận 1"` → 0.75 (via NameExtension)

---

## 🧪 Test Cases

### **Test 1: Standard HCMC Address**

**Input:**
```
123 Nguyễn Văn Linh, P. Tân Thuận Đông, Q7, TPHCM
```

**Expected Output:**
```
Số nhà: 123
Tên đường: Nguyễn Văn Linh
Phường/Xã: Phường Tân Thuận Đông
Quận/Huyện: Quận 7
Tỉnh/TP: Hồ Chí Minh
GHN Province ID: 202
GHN District ID: 1456 (example)
GHN Ward Code: 21xxx (example)
Confidence: P: 100%, D: 100%, W: 100%
```

---

### **Test 2: Abbreviated Format**

**Input:**
```
456 le duan, ben nghe, q1, hcm
```

**Expected Output:**
```
Số nhà: 456
Tên đường: Le Duan (→ Lê Duẩn after title case)
Phường/Xã: Phường Bến Nghé
Quận/Huyện: Quận 1
Tỉnh/TP: Hồ Chí Minh
GHN Province ID: 202
Confidence: P: 100%, D: 100%, W: 80-100%
```

---

### **Test 3: Hanoi Address**

**Input:**
```
789 hoang hoa tham, ba dinh, ha noi
```

**Expected Output:**
```
Số nhà: 789
Tên đường: Hoang Hoa Tham (→ Hoàng Hoa Thám)
Phường/Xã: (detected from context)
Quận/Huyện: Ba Đình
Tỉnh/TP: Hà Nội
GHN Province ID: 201
Confidence: P: 100%, D: 100%
```

---

### **Test 4: Complex House Number**

**Input:**
```
34/5 nguyen van linh, p tan thuan dong, q7, tphcm
```

**Expected Output:**
```
Số nhà: 34/5
Tên đường: Nguyen Van Linh (→ Nguyễn Văn Linh)
Phường/Xã: Phường Tân Thuận Đông
Quận/Huyện: Quận 7
Tỉnh/TP: Hồ Chí Minh
```

---

## 🎛️ Advanced Usage

### **API Endpoint: Resolve Address**

**Request:**
```bash
curl -X POST http://localhost:3000/api/master-data/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "province": "Hồ Chí Minh",
    "district": "Bình Tân",
    "ward": "An Lạc A"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "province": {
      "id": 202,
      "name": "Hồ Chí Minh",
      "confidence": 1
    },
    "district": {
      "id": 1458,
      "name": "Quận Bình Tân",
      "confidence": 1
    },
    "ward": {
      "code": "21902",
      "name": "Phường An Lạc A",
      "confidence": 1
    }
  }
}
```

---

### **Programmatic Usage**

```typescript
import { processAddressWithMasterData } from '@/utils/addressNormalizer'

// With master data (async)
const result = await processAddressWithMasterData(
  "123 tên lữa p. an lạc a, bình tân, hcm"
)

console.log(result)
/*
{
  original: "123 tên lữa p. an lạc a, bình tân, hcm",
  province: "Hồ Chí Minh",
  district: "Quận Bình Tân",
  ward: "Phường An Lạc A",
  streetNumber: "123",
  streetName: "Tên Lửa",
  ghnProvinceId: 202,
  ghnDistrictId: 1458,
  ghnWardCode: "21902",
  matchConfidence: {
    province: 1.0,
    district: 1.0,
    ward: 1.0
  },
  isValid: true,
  normalizedAddress: "123, Tên Lửa, Phường An Lạc A, Quận Bình Tân, Hồ Chí Minh, Việt Nam"
}
*/
```

---

## 🔄 Sync Strategy

### **Khi Nào Cần Re-Sync?**

- ✅ **Lần đầu tiên** cài đặt
- ✅ **Hàng tháng** để cập nhật thay đổi
- ✅ **Khi GHN thông báo** thay đổi địa giới hành chính
- ❌ **KHÔNG CẦN** sync mỗi request (data ổn định)

### **Sync Lại Master Data**

**Option 1: UI**
```
http://localhost:3000/master-data
→ Click "Sync Master Data từ GHN"
```

**Option 2: API**
```bash
curl -X POST http://localhost:3000/api/master-data/sync
```

**Option 3: Script (Future)**
```bash
npm run sync:master-data
```

---

## 📁 Cache Structure

```
src/data/master-data/
├── ghn-provinces.json          # 63 provinces
├── ghn-districts.json          # 723 districts (all)
├── ghn-wards-1454.json         # Wards for District 1454
├── ghn-wards-1455.json         # Wards for District 1455
├── ...                         # 723 ward files
└── ghn-all-wards.json          # All 11,979 wards (large file)
```

**Git Strategy:**
- ✅ Commit `ghn-provinces.json` và `ghn-districts.json` (small)
- ❌ Gitignore `ghn-wards-*.json` và `ghn-all-wards.json` (large)
- 📝 Document sync step trong README

---

## 🚨 Troubleshooting

### **Vấn đề 1: Confidence Score Thấp**

**Triệu chứng:**
```
District: "oang hoa tham" (sai)
Confidence: 45%
```

**Nguyên nhân:**
- Địa chỉ thiếu context (không có tỉnh/quận rõ ràng)
- Typo hoặc viết tắt không chuẩn

**Giải pháp:**
1. Thêm context: `"789 hoang hoa tham, ba dinh, ha noi"`
2. Sửa typo: `"oang"` → `"hoang"`
3. Dùng full name: `"Q1"` → `"Quận 1"`

---

### **Vấn đề 2: Không Có GHN IDs**

**Triệu chứng:**
```
GHN IDs: —
Độ chính xác: N/A
```

**Nguyên nhân:**
- Master data chưa sync
- API error khi load cache

**Giải pháp:**
1. Sync master data tại `/master-data`
2. Check console logs cho errors
3. Verify files tồn tại trong `src/data/master-data/`

---

### **Vấn đề 3: District/Ward Sai**

**Triệu chứng:**
```
Input: "bình tân"
Output: District = "tân" (thiếu chữ)
```

**Nguyên nhân:**
- Fallback regex không match đúng pattern

**Giải pháp:**
- ✅ Sync master data để dùng fuzzy matching
- ✅ Fuzzy matching sẽ fix: `"tân"` → `"Quận Bình Tân"` (confidence ~0.8)

---

## 🎯 Best Practices

### **1. Luôn Sync Master Data Trước**
```
Lần đầu deploy → Sync ngay
Sau đó → Sync 1 lần/tháng
```

### **2. Check Confidence Scores**
```
100%: Tin cậy hoàn toàn
80-99%: Review thủ công nếu quan trọng
< 80%: Bắt buộc review
```

### **3. Sử dụng GHN IDs Cho API Calls**
```typescript
// ✅ ĐÚNG: Dùng GHN IDs từ master data
const payload = {
  to_province_id: result.ghnProvinceId,
  to_district_id: result.ghnDistrictId,
  to_ward_code: result.ghnWardCode
}

// ❌ SAI: Dùng text string (không reliable)
const payload = {
  to_province: result.province,
  to_district: result.district
}
```

### **4. Fallback Strategy**
```typescript
// Luôn có fallback nếu master data fail
const result = await processAddressWithMasterData(address)
  .catch(() => processAddress(address))  // Fallback to regex
```

---

## 📈 Performance

| Operation | Time | Notes |
|-----------|------|-------|
| **Sync all master data** | ~1-2 min | One-time per month |
| **Load cache (first time)** | ~500ms | Load 11,979 wards |
| **Process 1 address** | ~10-50ms | With fuzzy matching |
| **Process 100 addresses** | ~1-2s | Parallel processing |

**Optimization Tips:**
- Cache loaded data in memory
- Process addresses in batches
- Use Web Workers for large datasets

---

## 🔮 Future Enhancements

- [ ] **Auto-sync scheduler** (cron job weekly)
- [ ] **GHTK/VTP master data** integration
- [ ] **Geocoding** (lat/lng coordinates)
- [ ] **Address autocomplete** (suggest as you type)
- [ ] **Bulk export** (CSV with GHN IDs)
- [ ] **Analytics dashboard** (confidence distribution)
- [ ] **Redis cache** (for production scale)

---

## 📞 Support

- **Issues:** Check master data sync status tại `/master-data`
- **API Docs:** `/api/master-data/*` endpoints
- **Master Data Guide:** `docs/GHN_MASTER_DATA.md`
- **Implementation Summary:** `docs/IMPLEMENTATION_SUMMARY.md`

---

**Last Updated:** Oct 1, 2025  
**Version:** 2.0 (with GHN Master Data Integration)
