#!/usr/bin/env node

/**
 * Automated API Testing Script for Phase 2
 * Run: node scripts/test-phase2.js
 */

const BASE_URL = 'http://localhost:3000'
let authCookie = ''
let userId = ''
let shopId = ''

// Test utilities
const log = {
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.log('❌', msg),
  info: (msg) => console.log('ℹ️ ', msg),
  section: (msg) => console.log('\n' + '='.repeat(60) + '\n' + msg + '\n' + '='.repeat(60))
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (authCookie) {
    headers['Cookie'] = authCookie
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json()

    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers
    }
  } catch (error) {
    return {
      ok: false,
      error: error.message
    }
  }
}

// Test Cases
async function testSignup() {
  log.section('TEST 1: User Signup')
  
  const email = `test-${Date.now()}@addressify.vn`
  const password = 'Test123456!'
  const name = 'Test User'

  log.info(`Creating user: ${email}`)

  const result = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  })

  if (result.ok && result.data.user) {
    userId = result.data.user.id
    log.success(`User created: ${result.data.user.email}`)
    log.info(`User ID: ${userId}`)
    return { email, password }
  } else {
    log.error(`Signup failed: ${result.data.error || result.error}`)
    return null
  }
}

async function testLogin(credentials) {
  log.section('TEST 2: User Login')

  if (!credentials) {
    log.error('No credentials provided')
    return false
  }

  log.info(`Logging in: ${credentials.email}`)

  const result = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })

  if (result.ok && result.data.user) {
    // Extract auth cookie from Set-Cookie header
    const setCookie = result.headers.get('set-cookie')
    if (setCookie) {
      authCookie = setCookie.split(';')[0]
      log.success(`Login successful: ${result.data.user.email}`)
      log.info(`Auth cookie set`)
      return true
    }
  }

  log.error(`Login failed: ${result.data.error || result.error}`)
  return false
}

async function testGetUser() {
  log.section('TEST 3: Get Current User')

  const result = await request('/api/auth/user')

  if (result.ok && result.data.user) {
    log.success(`User fetched: ${result.data.user.email}`)
    return true
  } else {
    log.error(`Get user failed: ${result.data.error || result.error}`)
    return false
  }
}

async function testCreateShop() {
  log.section('TEST 4: Create Shop')

  const shopData = {
    name: `Test Shop ${Date.now()}`,
    senderAddress: '123 Nguyễn Huệ',
    senderDistrict: 'Quận 1',
    senderProvince: 'Hồ Chí Minh',
    ghnProvinceId: '202',
    ghnDistrictId: '1451',
    ghnWardCode: '20101',
    ghnShopId: '6034259'
  }

  log.info(`Creating shop: ${shopData.name}`)

  const result = await request('/api/shops', {
    method: 'POST',
    body: JSON.stringify(shopData)
  })

  if (result.ok && result.data.shop) {
    shopId = result.data.shop.id
    log.success(`Shop created: ${result.data.shop.name}`)
    log.info(`Shop ID: ${shopId}`)
    return true
  } else {
    log.error(`Create shop failed: ${result.data.error || result.error}`)
    return false
  }
}

async function testGetShops() {
  log.section('TEST 5: Get Shops')

  const result = await request('/api/shops')

  if (result.ok && result.data.shops) {
    log.success(`Fetched ${result.data.shops.length} shop(s)`)
    result.data.shops.forEach((shop, i) => {
      log.info(`  ${i + 1}. ${shop.name} (${shop.id})`)
    })
    return true
  } else {
    log.error(`Get shops failed: ${result.data.error || result.error}`)
    return false
  }
}

async function testUpdateShop() {
  log.section('TEST 6: Update Shop')

  if (!shopId) {
    log.error('No shop ID available')
    return false
  }

  const updateData = {
    name: `Updated Shop ${Date.now()}`,
    senderAddress: '456 Lê Lợi'
  }

  log.info(`Updating shop: ${shopId}`)

  const result = await request(`/api/shops/${shopId}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  })

  if (result.ok && result.data.shop) {
    log.success(`Shop updated: ${result.data.shop.name}`)
    return true
  } else {
    log.error(`Update shop failed: ${result.data.error || result.error}`)
    return false
  }
}

async function testDeleteShop() {
  log.section('TEST 7: Delete Shop')

  if (!shopId) {
    log.error('No shop ID available')
    return false
  }

  log.info(`Deleting shop: ${shopId}`)

  const result = await request(`/api/shops/${shopId}`, {
    method: 'DELETE'
  })

  if (result.ok) {
    log.success(`Shop deleted successfully`)
    return true
  } else {
    log.error(`Delete shop failed: ${result.data.error || result.error}`)
    return false
  }
}

async function testUnauthorizedAccess() {
  log.section('TEST 8: Unauthorized Access')

  // Save current auth cookie
  const savedCookie = authCookie
  authCookie = ''

  log.info('Testing API without auth cookie...')

  const result = await request('/api/shops')

  // Restore auth cookie
  authCookie = savedCookie

  if (!result.ok && result.status === 401) {
    log.success('Unauthorized access blocked correctly')
    return true
  } else {
    log.error('Unauthorized access was NOT blocked!')
    return false
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 STARTING PHASE 2 API TESTS\n')

  const results = []

  try {
    // Test 1: Signup
    const credentials = await testSignup()
    results.push({ name: 'Signup', passed: credentials !== null })

    if (!credentials) {
      log.error('Cannot continue without credentials')
      return
    }

    // Test 2: Login
    const loginPassed = await testLogin(credentials)
    results.push({ name: 'Login', passed: loginPassed })

    if (!loginPassed) {
      log.error('Cannot continue without authentication')
      return
    }

    // Test 3: Get User
    const getUserPassed = await testGetUser()
    results.push({ name: 'Get User', passed: getUserPassed })

    // Test 4: Create Shop
    const createShopPassed = await testCreateShop()
    results.push({ name: 'Create Shop', passed: createShopPassed })

    // Test 5: Get Shops
    const getShopsPassed = await testGetShops()
    results.push({ name: 'Get Shops', passed: getShopsPassed })

    // Test 6: Update Shop
    const updateShopPassed = await testUpdateShop()
    results.push({ name: 'Update Shop', passed: updateShopPassed })

    // Test 7: Delete Shop
    const deleteShopPassed = await testDeleteShop()
    results.push({ name: 'Delete Shop', passed: deleteShopPassed })

    // Test 8: Unauthorized Access
    const unauthorizedPassed = await testUnauthorizedAccess()
    results.push({ name: 'Unauthorized Access', passed: unauthorizedPassed })

  } catch (error) {
    log.error(`Test runner error: ${error.message}`)
  }

  // Summary
  log.section('TEST SUMMARY')
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
  })

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed (${results.length} total)`)

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 2 is ready.\n')
    process.exit(0)
  } else {
    console.log('\n❌ SOME TESTS FAILED. Please review and fix.\n')
    process.exit(1)
  }
}

// Run tests
runAllTests().catch(error => {
  log.error(`Fatal error: ${error.message}`)
  process.exit(1)
})
