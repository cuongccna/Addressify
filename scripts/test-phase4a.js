#!/usr/bin/env node

/**
 * Phase 4A Testing Script
 * Tests Quote History Dashboard functionality
 */

const BASE_URL = 'http://localhost:3000'

// Test data
let authToken = ''
let userId = ''
let shopId = ''
let testQuoteIds = []

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  const data = await response.json()
  return { response, data }
}

// Test 1: Setup - Create test user and shop
async function test1_Setup() {
  log('\n📋 Test 1: Setup - Create test user and shop', 'cyan')
  
  try {
    // Sign up
    const email = `test_${Date.now()}@example.com`
    const password = 'Test123456'
    
    log(`Creating user: ${email}`, 'blue')
    const { response: signupRes, data: signupData } = await makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (!signupRes.ok) {
      log(`❌ Signup failed: ${signupData.error}`, 'red')
      return false
    }
    
    userId = signupData.user.id
    log(`✓ User created: ${userId}`, 'green')
    
    // Login
    const { response: loginRes, data: loginData } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (!loginRes.ok) {
      log(`❌ Login failed: ${loginData.error}`, 'red')
      return false
    }
    
    authToken = loginRes.headers.get('set-cookie')
    log(`✓ Logged in successfully`, 'green')
    
    // Create shop
    const { response: shopRes, data: shopData } = await makeRequest('/api/shops', {
      method: 'POST',
      headers: { Cookie: authToken },
      body: JSON.stringify({
        name: 'Test Shop for History',
        senderAddress: '123 Test Street',
        senderDistrict: 'Quận 1',
        senderProvince: 'TP. Hồ Chí Minh',
        ghnProvinceId: '202',
        ghnDistrictId: '1442',
        ghnWardCode: '21211',
      }),
    })
    
    if (!shopRes.ok) {
      log(`❌ Shop creation failed: ${shopData.error}`, 'red')
      return false
    }
    
    shopId = shopData.shop.id
    log(`✓ Shop created: ${shopId}`, 'green')
    
    return true
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red')
    return false
  }
}

// Test 2: Create sample quote histories
async function test2_CreateSampleQuotes() {
  log('\n📋 Test 2: Create sample quote histories', 'cyan')
  
  try {
    const quotes = [
      {
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0901234567',
        recipientAddress: '456 Lê Lợi, Quận 1, TP.HCM',
        normalizedAddress: '456 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        wardCode: '21211',
        confidence: 95,
        quotes: [
          { provider: 'GHN', service: 'Express', amount: 25000, deliveryTime: '1-2 ngày' },
          { provider: 'GHTK', service: 'Standard', amount: 30000, deliveryTime: '2-3 ngày' },
          { provider: 'VTP', service: 'Express', amount: 28000, deliveryTime: '1-2 ngày' }
        ],
        weight: 1000,
        value: 500000,
        note: 'Test quote 1'
      },
      {
        recipientName: 'Trần Thị B',
        recipientPhone: '0912345678',
        recipientAddress: '789 Nguyễn Huệ, Quận 1, TP.HCM',
        normalizedAddress: '789 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        wardCode: '21211',
        confidence: 85,
        quotes: [
          { provider: 'GHN', service: 'Express', amount: 22000, deliveryTime: '1-2 ngày' },
          { provider: 'GHTK', service: 'Standard', amount: 27000, deliveryTime: '2-3 ngày' }
        ],
        weight: 800,
        value: 300000,
        note: 'Test quote 2'
      },
      {
        recipientName: 'Lê Văn C',
        recipientPhone: '0923456789',
        recipientAddress: '321 Đồng Khởi, Quận 1, TP.HCM',
        normalizedAddress: '321 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        wardCode: '21211',
        confidence: 90,
        quotes: [
          { provider: 'GHN', service: 'Express', amount: 24000, deliveryTime: '1-2 ngày' },
          { provider: 'VTP', service: 'Express', amount: 26000, deliveryTime: '1-2 ngày' }
        ],
        weight: 1200,
        value: 600000,
        note: 'Test quote 3'
      }
    ]
    
    for (const quote of quotes) {
      const { response, data } = await makeRequest('/api/quote-history', {
        method: 'POST',
        headers: { Cookie: authToken },
        body: JSON.stringify({
          shopId,
          ...quote
        }),
      })
      
      if (!response.ok) {
        log(`❌ Failed to create quote: ${data.error}`, 'red')
        return false
      }
      
      testQuoteIds.push(data.quoteHistory.id)
      log(`✓ Created quote for ${quote.recipientName}`, 'green')
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    log(`✓ Created ${quotes.length} sample quotes`, 'green')
    return true
  } catch (error) {
    log(`❌ Failed to create sample quotes: ${error.message}`, 'red')
    return false
  }
}

// Test 3: Fetch all quotes
async function test3_FetchAllQuotes() {
  log('\n📋 Test 3: Fetch all quotes', 'cyan')
  
  try {
    const { response, data } = await makeRequest(`/api/quote-history?shopId=${shopId}`, {
      headers: { Cookie: authToken },
    })
    
    if (!response.ok) {
      log(`❌ Failed to fetch quotes: ${data.error}`, 'red')
      return false
    }
    
    log(`✓ Fetched ${data.quoteHistories.length} quotes`, 'green')
    
    // Verify all test quotes are present
    if (data.quoteHistories.length !== testQuoteIds.length) {
      log(`❌ Expected ${testQuoteIds.length} quotes, got ${data.quoteHistories.length}`, 'red')
      return false
    }
    
    log(`✓ All quotes retrieved successfully`, 'green')
    return true
  } catch (error) {
    log(`❌ Failed to fetch quotes: ${error.message}`, 'red')
    return false
  }
}

// Test 4: Test date range filtering
async function test4_DateRangeFilter() {
  log('\n📋 Test 4: Test date range filtering', 'cyan')
  
  try {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    
    // Today's quotes
    const { response: todayRes, data: todayData } = await makeRequest(
      `/api/quote-history?shopId=${shopId}&dateFrom=${today}&dateTo=${today}`,
      { headers: { Cookie: authToken } }
    )
    
    if (!todayRes.ok) {
      log(`❌ Date filter failed: ${todayData.error}`, 'red')
      return false
    }
    
    log(`✓ Date range filter works: ${todayData.quoteHistories.length} quotes today`, 'green')
    
    // Future dates (should be empty)
    const { response: futureRes, data: futureData } = await makeRequest(
      `/api/quote-history?shopId=${shopId}&dateFrom=${tomorrow}`,
      { headers: { Cookie: authToken } }
    )
    
    if (!futureRes.ok) {
      log(`❌ Future date filter failed: ${futureData.error}`, 'red')
      return false
    }
    
    if (futureData.quoteHistories.length !== 0) {
      log(`❌ Future date filter returned ${futureData.quoteHistories.length} quotes (expected 0)`, 'red')
      return false
    }
    
    log(`✓ Future date filter works correctly (0 quotes)`, 'green')
    return true
  } catch (error) {
    log(`❌ Date range filter test failed: ${error.message}`, 'red')
    return false
  }
}

// Test 5: Test limit parameter
async function test5_LimitParameter() {
  log('\n📋 Test 5: Test limit parameter', 'cyan')
  
  try {
    const { response, data } = await makeRequest(
      `/api/quote-history?shopId=${shopId}&limit=2`,
      { headers: { Cookie: authToken } }
    )
    
    if (!response.ok) {
      log(`❌ Limit parameter failed: ${data.error}`, 'red')
      return false
    }
    
    if (data.quoteHistories.length !== 2) {
      log(`❌ Expected 2 quotes with limit=2, got ${data.quoteHistories.length}`, 'red')
      return false
    }
    
    log(`✓ Limit parameter works: returned ${data.quoteHistories.length} quotes`, 'green')
    return true
  } catch (error) {
    log(`❌ Limit parameter test failed: ${error.message}`, 'red')
    return false
  }
}

// Test 6: Test authorization (wrong shop)
async function test6_Authorization() {
  log('\n📋 Test 6: Test authorization', 'cyan')
  
  try {
    const fakeShopId = '00000000-0000-0000-0000-000000000000'
    
    const { response, data } = await makeRequest(
      `/api/quote-history?shopId=${fakeShopId}`,
      { headers: { Cookie: authToken } }
    )
    
    if (response.ok) {
      log(`❌ Authorization check failed: should reject invalid shop`, 'red')
      return false
    }
    
    if (response.status !== 404 && response.status !== 403) {
      log(`❌ Expected 403 or 404, got ${response.status}`, 'red')
      return false
    }
    
    log(`✓ Authorization check works: rejected invalid shop (${response.status})`, 'green')
    return true
  } catch (error) {
    log(`❌ Authorization test failed: ${error.message}`, 'red')
    return false
  }
}

// Test 7: Test statistics calculation
async function test7_Statistics() {
  log('\n📋 Test 7: Test statistics calculation', 'cyan')
  
  try {
    const { response, data } = await makeRequest(`/api/quote-history?shopId=${shopId}`, {
      headers: { Cookie: authToken },
    })
    
    if (!response.ok) {
      log(`❌ Failed to fetch quotes: ${data.error}`, 'red')
      return false
    }
    
    const histories = data.quoteHistories
    
    // Calculate total quotes
    const totalQuotes = histories.length
    log(`→ Total quotes: ${totalQuotes}`, 'blue')
    
    // Calculate average amount
    const allQuotes = histories.flatMap(h => h.quotes)
    const amounts = allQuotes.map(q => q.amount)
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    log(`→ Average amount: ${Math.round(avgAmount).toLocaleString('vi-VN')}₫`, 'blue')
    
    // Calculate min/max
    const minAmount = Math.min(...amounts)
    const maxAmount = Math.max(...amounts)
    log(`→ Min amount: ${minAmount.toLocaleString('vi-VN')}₫`, 'blue')
    log(`→ Max amount: ${maxAmount.toLocaleString('vi-VN')}₫`, 'blue')
    
    // Calculate potential savings
    const totalSavings = histories.reduce((sum, h) => {
      if (h.quotes.length < 2) return sum
      const amounts = h.quotes.map(q => q.amount)
      const max = Math.max(...amounts)
      const min = Math.min(...amounts)
      return sum + (max - min)
    }, 0)
    log(`→ Potential savings: ${totalSavings.toLocaleString('vi-VN')}₫`, 'blue')
    
    // Provider counts
    const providerCounts = {}
    allQuotes.forEach(q => {
      providerCounts[q.provider] = (providerCounts[q.provider] || 0) + 1
    })
    log(`→ Provider distribution:`, 'blue')
    Object.entries(providerCounts).forEach(([provider, count]) => {
      log(`  - ${provider}: ${count} quotes`, 'blue')
    })
    
    log(`✓ Statistics calculated successfully`, 'green')
    return true
  } catch (error) {
    log(`❌ Statistics test failed: ${error.message}`, 'red')
    return false
  }
}

// Run all tests
async function runTests() {
  log('=' .repeat(60), 'cyan')
  log('🧪 PHASE 4A TESTING SCRIPT - Quote History Dashboard', 'cyan')
  log('=' .repeat(60), 'cyan')
  
  const tests = [
    test1_Setup,
    test2_CreateSampleQuotes,
    test3_FetchAllQuotes,
    test4_DateRangeFilter,
    test5_LimitParameter,
    test6_Authorization,
    test7_Statistics,
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    const result = await test()
    if (result) {
      passed++
    } else {
      failed++
    }
  }
  
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 TEST RESULTS', 'cyan')
  log('='.repeat(60), 'cyan')
  log(`✓ Passed: ${passed}`, 'green')
  log(`✗ Failed: ${failed}`, 'red')
  log(`Total: ${tests.length}`, 'blue')
  
  if (failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Phase 4A is working correctly!', 'green')
  } else {
    log('\n⚠️  SOME TESTS FAILED. Please review the errors above.', 'yellow')
  }
  
  log('\n📝 Test Data:', 'cyan')
  log(`User ID: ${userId}`, 'blue')
  log(`Shop ID: ${shopId}`, 'blue')
  log(`Created ${testQuoteIds.length} test quotes`, 'blue')
  log('\n💡 You can now test the dashboard at:', 'cyan')
  log(`${BASE_URL}/history`, 'green')
  log('\n')
}

// Run tests
runTests().catch(console.error)
