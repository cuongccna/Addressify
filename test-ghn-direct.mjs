// Test GHN calculate fee API directly
import https from 'https';
import fs from 'fs';

// Read .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const envLines = envContent.split('\n');
let GHN_API_TOKEN = '';
let GHN_SHOP_ID = '';

for (const line of envLines) {
  if (line.startsWith('GHN_API_TOKEN=')) {
    GHN_API_TOKEN = line.split('=')[1].trim();
  }
  if (line.startsWith('GHN_SHOP_ID=')) {
    GHN_SHOP_ID = line.split('=')[1].trim();
  }
}

console.log('Testing GHN Calculate Fee API...');
console.log('Token:', GHN_API_TOKEN ? `${GHN_API_TOKEN.substring(0, 10)}...` : 'NOT SET');
console.log('Shop ID:', GHN_SHOP_ID || 'NOT SET');

// Test payload - WITHOUT from_district to use shop's default address
const testPayload = {
  shop_id: Number(GHN_SHOP_ID),
  to_district_id: 1458,
  to_ward_code: "21901",
  service_id: 53320,
  service_type_id: 2,
  weight: 1000
};

console.log('\n=== Request Payload ===');
console.log(JSON.stringify(testPayload, null, 2));

const postData = JSON.stringify(testPayload);

const options = {
  hostname: 'online-gateway.ghn.vn',
  port: 443,
  path: '/shiip/public-api/v2/shipping-order/fee',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Token': GHN_API_TOKEN,
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('\n=== Calling GHN Calculate Fee API ===');
console.log(`URL: https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  console.log(`\n=== Response Status: ${res.statusCode} ===`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== Response Body ===');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.code !== 200) {
        console.log('\n❌ ERROR:', parsed.message);
        console.log('Code:', parsed.code);
      } else {
        console.log('\n✅ SUCCESS');
        console.log('Services available:', parsed.data?.length || 0);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ Request failed:', e.message);
});

req.write(postData);
req.end();
