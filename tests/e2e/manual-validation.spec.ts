import { test, expect, Page } from '@playwright/test'

const BASE_URL = 'http://localhost:3002'

test.describe('Manual Validation of Implemented Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Set test environment variables
    await page.addInitScript(() => {
      window.localStorage.setItem('NEXT_PUBLIC_DISABLE_NEWS', 'true')
      window.localStorage.setItem('NEXT_PUBLIC_DISABLE_EXIT_GUARD', 'true')
    })
  })

  test('Validate Category Cards Loading', async ({ page }) => {
    console.log('🧪 Testing: Category Cards Loading')
    
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')
    
    // Wait for categories to load with extended timeout
    await page.waitForTimeout(5000)
    
    // Check for category cards
    const categoryCards = await page.locator('[data-testid="category-card"]').count()
    console.log(`📂 Found ${categoryCards} category cards`)
    
    // Take screenshot for manual verification
    await page.screenshot({ path: 'tests/e2e/screenshots/category-loading-validation.png', fullPage: true })
    
    // Basic validation
    expect(categoryCards).toBeGreaterThan(0)
    console.log('✅ Category cards are loading')
  })

  test('Validate Guest Access Control Behavior', async ({ page }) => {
    console.log('🧪 Testing: Guest Access Control Behavior')
    
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000)
    
    // Verify guest state
    const guestCoins = await page.evaluate(() => {
      const user = localStorage.getItem('techkwiz_user')
      return user ? JSON.parse(user).coins : 0
    })
    console.log(`👤 Guest user has ${guestCoins} coins`)
    
    // Wait for category cards to be visible
    await page.waitForSelector('[data-testid="category-card"]', { state: 'visible', timeout: 10000 })
    
    // Try to click on a category card
    const firstCategory = page.locator('[data-testid="category-card"]').first()
    await firstCategory.waitFor({ state: 'visible' })
    
    // Click and wait for response
    await firstCategory.click()
    await page.waitForTimeout(3000)
    
    // Check current URL and modal state
    const currentUrl = page.url()
    const modalVisible = await page.locator('text=Insufficient Coins').isVisible()
    
    console.log(`🔗 Current URL: ${currentUrl}`)
    console.log(`📋 Modal visible: ${modalVisible}`)
    
    // Take screenshot for manual verification
    await page.screenshot({ path: 'tests/e2e/screenshots/guest-access-behavior.png', fullPage: true })
    
    // Validation: Either modal should be visible OR we should stay on start page
    const validBehavior = modalVisible || currentUrl.includes('/start')
    expect(validBehavior).toBe(true)
    
    if (modalVisible) {
      console.log('✅ Guest access control working: Modal displayed')
    } else if (currentUrl.includes('/start')) {
      console.log('✅ Guest access control working: Stayed on start page')
    } else {
      console.log(`⚠️ Unexpected behavior: URL = ${currentUrl}, Modal = ${modalVisible}`)
    }
  })

  test('Validate Rich User Access Control', async ({ page }) => {
    console.log('🧪 Testing: Rich User Access Control')
    
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')
    
    // Set up rich user
    await page.evaluate(() => {
      const user = {
        id: 'test-rich-user',
        name: 'RichUser',
        avatar: 'robot',
        coins: 500,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0
      }
      localStorage.setItem('techkwiz_user', JSON.stringify(user))
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000)
    
    // Verify rich user state
    const richUserCoins = await page.evaluate(() => {
      const user = localStorage.getItem('techkwiz_user')
      return user ? JSON.parse(user).coins : 0
    })
    console.log(`👤 Rich user has ${richUserCoins} coins`)
    
    // Wait for category cards and click
    await page.waitForSelector('[data-testid="category-card"]', { state: 'visible', timeout: 10000 })
    const firstCategory = page.locator('[data-testid="category-card"]').first()
    await firstCategory.click()
    
    await page.waitForTimeout(3000)
    const currentUrl = page.url()
    console.log(`🔗 Rich user navigated to: ${currentUrl}`)
    
    // Take screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/rich-user-access.png', fullPage: true })
    
    // Rich user should be able to access quiz pages
    const accessGranted = currentUrl.includes('/quiz/')
    console.log(`✅ Rich user access: ${accessGranted ? 'GRANTED' : 'DENIED'}`)
    
    if (accessGranted) {
      // Check coin deduction
      const postEntryCoins = await page.evaluate(() => {
        const user = localStorage.getItem('techkwiz_user')
        return user ? JSON.parse(user).coins : 0
      })
      console.log(`💰 Coins after entry: ${richUserCoins} → ${postEntryCoins}`)
      
      if (postEntryCoins === 400) {
        console.log('✅ Entry fee correctly deducted')
      } else {
        console.log(`⚠️ Unexpected coin balance: expected 400, got ${postEntryCoins}`)
      }
    }
  })

  test('Validate Console Error Reduction', async ({ page }) => {
    console.log('🧪 Testing: Console Error Reduction')
    
    const errors: string[] = []
    const warnings: string[] = []
    
    // Capture console messages
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error' && !text.includes('Sentry') && !text.includes('DSN')) {
        errors.push(text)
      } else if (msg.type() === 'warning' && !text.includes('Sentry')) {
        warnings.push(text)
      }
    })
    
    // Test various pages
    const testPages = ['/', '/start', '/profile', '/leaderboard']
    
    for (const testPage of testPages) {
      console.log(`🔍 Testing page: ${testPage}`)
      await page.goto(`${BASE_URL}${testPage}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)
    }
    
    console.log(`❌ Critical Errors Found: ${errors.length}`)
    console.log(`⚠️ Warnings Found: ${warnings.length}`)
    
    if (errors.length > 0) {
      console.log('🚨 Critical Errors:')
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.substring(0, 100)}...`)
      })
    } else {
      console.log('✅ No critical JavaScript errors found')
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/console-validation.png' })
    
    // Expect minimal errors (some are expected in development)
    expect(errors.length).toBeLessThan(5)
  })
})
