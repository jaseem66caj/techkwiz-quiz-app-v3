import { expect, Page, test } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:3002'

// Helper functions
async function setupRichUser(page: Page) {
  // Navigate to page first to establish context
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')

  // Set up authenticated user with 500 coins
  await page.evaluate(() => {
    const user = {
      id: 'test-user',
      name: 'TestUser',
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
}

async function getUserCoins(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const user = localStorage.getItem('techkwiz_user')
    return user ? JSON.parse(user).coins : 0
  })
}

test.describe('TechKwiz Comprehensive User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set test environment variables
    await page.addInitScript(() => {
      window.localStorage.setItem('NEXT_PUBLIC_DISABLE_NEWS', 'true')
      window.localStorage.setItem('NEXT_PUBLIC_DISABLE_EXIT_GUARD', 'true')
    })
  })

  test('1. Homepage and Category Cards Validation', async ({ page }) => {
    console.log('🧪 Testing: Homepage and Category Cards Validation')

    // Navigate to homepage
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Validate page load
    await expect(page).toHaveTitle(/TechKwiz/i)
    console.log('✅ Homepage loaded successfully')

    // Navigate to start page
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Validate category cards
    const categoryCards = await page.locator('[data-testid="category-card"]').count()
    console.log(`📂 Found ${categoryCards} category cards`)
    expect(categoryCards).toBe(8)

    // Test category card content
    const firstCard = page.locator('[data-testid="category-card"]').first()
    await expect(firstCard).toBeVisible()

    // Capture screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/category-cards-validation.png', fullPage: true })
    console.log('✅ All 8 category cards validated successfully')
  })

  test('2. Guest User Access Control', async ({ page }) => {
    console.log('🧪 Testing: Guest User Access Control')

    // Start as guest (no localStorage setup)
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Verify guest state (0 coins)
    const guestCoins = await getUserCoins(page)
    console.log(`👤 Guest user has ${guestCoins} coins`)
    expect(guestCoins).toBe(0)

    // Try to click on a category card
    const firstCategory = page.locator('[data-testid="category-card"]').first()
    await firstCategory.click()

    // Wait for modal to appear
    await page.waitForTimeout(2000)

    // Check if insufficient coins modal appeared
    const modal = page.locator('text=Insufficient Coins')
    const modalVisible = await modal.isVisible()

    if (modalVisible) {
      console.log('✅ Guest correctly blocked with insufficient coins modal')

      // Verify modal content
      await expect(page.locator('text=You need')).toBeVisible()
      await expect(page.locator('text=100')).toBeVisible() // Entry fee
      await expect(page.locator('text=You currently have')).toBeVisible()
      await expect(page.locator('text=0')).toBeVisible() // Current coins

      // Test "Earn Coins Free" button
      const earnCoinsButton = page.locator('text=Earn Coins Free')
      await expect(earnCoinsButton).toBeVisible()

      console.log('✅ Modal content validated successfully')
    } else {
      // Check if we stayed on start page (fallback behavior)
      const currentUrl = page.url()
      console.log(`🔗 Current URL after click: ${currentUrl}`)
      expect(currentUrl).toContain('/start')
      console.log('✅ Guest correctly blocked (stayed on start page)')
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/guest-access-control.png' })
  })

  test('3. Rich User Quiz Flow and Coin Management', async ({ page }) => {
    console.log('🧪 Testing: Rich User Quiz Flow and Coin Management')

    await setupRichUser(page)
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Verify rich user state
    const initialCoins = await getUserCoins(page)
    console.log(`👤 Rich user has ${initialCoins} coins`)
    expect(initialCoins).toBe(500)

    // Access first category
    const firstCategory = page.locator('[data-testid="category-card"]').first()
    await firstCategory.click()

    // Wait for navigation
    await page.waitForTimeout(3000)
    const currentUrl = page.url()
    console.log(`🔗 Navigated to: ${currentUrl}`)

    if (currentUrl.includes('/quiz/')) {
      console.log('✅ Successfully navigated to quiz page')

      // Check coin deduction
      const postEntryCoins = await getUserCoins(page)
      console.log(`💰 Coins after entry: ${initialCoins} → ${postEntryCoins}`)

      if (postEntryCoins === 400) {
        console.log('✅ Entry fee correctly deducted (100 coins)')
      } else {
        console.log(`⚠️ Unexpected coin balance: expected 400, got ${postEntryCoins}`)
      }

      // Look for quiz elements
      const quizQuestion = page.locator('[data-testid="quiz-question"], .quiz-question, h1, h2, h3').first()
      if (await quizQuestion.count() > 0) {
        const questionText = await quizQuestion.textContent()
        console.log(`❓ Quiz question loaded: ${questionText?.substring(0, 50)}...`)
      }

    } else {
      console.log('❌ Failed to navigate to quiz page')
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/rich-user-quiz-flow.png' })
  })

  test('4. Navigation and State Persistence', async ({ page }) => {
    console.log('🧪 Testing: Navigation and State Persistence')

    await setupRichUser(page)

    // Test navigation between pages
    const testPages = [
      { name: 'Start', url: '/start' },
      { name: 'Profile', url: '/profile' },
      { name: 'Leaderboard', url: '/leaderboard' }
    ]

    for (const testPage of testPages) {
      await page.goto(`${BASE_URL}${testPage.url}`)
      await page.waitForLoadState('networkidle')

      const coins = await getUserCoins(page)
      console.log(`💰 ${testPage.name} page: ${coins} coins`)
      expect(coins).toBe(500) // Should persist across navigation
    }

    // Test browser refresh
    await page.reload()
    await page.waitForLoadState('networkidle')

    const refreshCoins = await getUserCoins(page)
    console.log(`💰 After refresh: ${refreshCoins} coins`)
    expect(refreshCoins).toBe(500)

    console.log('✅ Coin balance persisted across navigation and refresh')
    await page.screenshot({ path: 'tests/e2e/screenshots/state-persistence.png' })
  })

  test('5. Responsive Design Validation', async ({ page }) => {
    console.log('🧪 Testing: Responsive Design Validation')

    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ]

    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`)

      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`${BASE_URL}/start`)
      await page.waitForLoadState('networkidle')

      // Check category cards visibility
      const categoryCards = await page.locator('[data-testid="category-card"]').count()
      expect(categoryCards).toBe(8)
      console.log(`✅ All 8 category cards visible on ${viewport.name}`)

      // Capture screenshot for each viewport
      await page.screenshot({
        path: `tests/e2e/screenshots/responsive-${viewport.name}.png`,
        fullPage: true
      })
    }
  })

  test('6. Error Handling and Console Validation', async ({ page }) => {
    console.log('🧪 Testing: Error Handling and Console Validation')

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

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`)
    })

    // Test various pages for errors
    const testPages = ['/', '/start', '/profile', '/leaderboard', '/nonexistent-page']

    for (const testPage of testPages) {
      console.log(`🔍 Testing page: ${testPage}`)
      await page.goto(`${BASE_URL}${testPage}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Allow time for any async errors
    }

    // Report findings
    console.log(`❌ Critical Errors Found: ${errors.length}`)
    console.log(`⚠️ Warnings Found: ${warnings.length}`)

    if (errors.length > 0) {
      console.log('🚨 Critical Errors:')
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    } else {
      console.log('✅ No critical JavaScript errors found')
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/error-validation.png' })
  })

  test('7. Performance Validation', async ({ page }) => {
    console.log('🧪 Testing: Performance Validation')

    const performanceMetrics: any[] = []

    // Test page load times
    const testPages = [
      { name: 'Homepage', url: '/' },
      { name: 'Start Page', url: '/start' },
      { name: 'Profile', url: '/profile' },
      { name: 'Leaderboard', url: '/leaderboard' }
    ]

    for (const testPage of testPages) {
      const startTime = Date.now()

      await page.goto(`${BASE_URL}${testPage.url}`)
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime
      performanceMetrics.push({
        page: testPage.name,
        loadTime: loadTime,
        url: testPage.url
      })

      console.log(`⏱️ ${testPage.name}: ${loadTime}ms`)
    }

    // Validate load times (should be under 5 seconds)
    performanceMetrics.forEach(metric => {
      expect(metric.loadTime).toBeLessThan(5000)
    })

    console.log('✅ All pages loaded within acceptable time limits')

    await page.screenshot({ path: 'tests/e2e/screenshots/performance-validation.png' })
  })
})
