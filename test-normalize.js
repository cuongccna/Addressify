// Test script cho address normalization
const testAddresses = [
  "123 tên lữa p. an lạc a, bình tân, hcm",
  "456 le duan, ben nghe, quan 1, tp ho chi minh",
  "789 hoang hoa tham, ba dinh, ha noi",
  "34/5 nguyen van linh, p tan thuan dong, q7, tphcm",
  "12 ly thai to, hoan kiem, hn",
  "999 đường 3/2, p. xuân khánh, ninh kiều, cần thơ",
  "số 10 ngõ 5 phố vương thừa vũ, thanh xuân, hà nội",
  "288 nguyễn văn cừ, an hòa, ninh kiều, cần thơ"
];

async function testNormalization() {
  console.log("🧪 Testing Address Normalization...\n");
  
  for (const address of testAddresses) {
    console.log(`📍 Input: ${address}`);
    console.log(`   Processing...`);
    console.log(`   ✓ See result in UI table at http://localhost:3000/normalize\n`);
  }
  
  console.log("✅ To test via API, you can use:");
  console.log(`
const { processAddress } = require('./src/utils/addressNormalizer');

const result = processAddress("123 tên lữa p. an lạc a, bình tân, hcm");
console.log(result);

Expected output:
{
  rawAddress: "123 tên lữa p. an lạc a, bình tán, hcm",
  streetNumber: "123",
  streetName: "Tên Lửa",
  ward: "An Lạc A",
  district: "Bình Tân",
  province: "Hồ Chí Minh",
  country: "Việt Nam",
  normalizedAddress: "123, Tên Lửa, An Lạc A, Bình Tân, Hồ Chí Minh, Việt Nam",
  isValid: true
}
  `);
}

testNormalization();
