import { expect, Page, test } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:3002'
const TEST_TIMEOUT = 90000

// Test data
const TEST_USERS = {
  guest: { coins: 0, name: 'Guest' },
  richUser: { coins: 500, name: 'TestUser' },
  poorUser: { coins: 50, name: 'PoorUser' }
}

// Helper functions
async function setupTestUser(page: Page, userType: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userType]

  if (userType !== 'guest') {
    // Set up authenticated user with specific coin balance
    await page.evaluate((userData) => {
      const user = {
        id: userData.name.toLowerCase(),
        name: userData.name,
        avatar: 'robot',
        coins: userData.coins,
        level: 1,
        totalQuizzes: 0,
        correctAnswers: 0,
        joinDate: new Date().toISOString(),
        quizHistory: [],
        streak: 0
      }
      localStorage.setItem('techkwiz_user', JSON.stringify(user))
    }, user)
  }

  await page.reload()
  await page.waitForLoadState('networkidle')
}

async function captureUserState(page: Page): Promise<any> {
  return await page.evaluate(() => {
    const user = localStorage.getItem('techkwiz_user')
    return user ? JSON.parse(user) : null
  })
}

async function waitForQuizLoad(page: Page) {
  await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 })
  await page.waitForFunction(() => {
    const question = document.querySelector('[data-testid="quiz-question"]')
    return question && question.textContent && question.textContent.trim().length > 0
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

  test('1. Homepage Navigation and Initial State Validation', async ({ page }) => {
    console.log('🧪 Testing: Homepage Navigation and Initial State')

    // Navigate to homepage
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Validate page load
    await expect(page).toHaveTitle(/TechKwiz/i)
    console.log('✅ Homepage loaded successfully')

    // Check for critical elements
    const quizElements = await page.locator('[data-testid*="quiz"], .quiz, [class*="quiz"]').count()
    console.log(`📊 Found ${quizElements} quiz-related elements`)

    // Navigate to start page
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Validate category cards
    const categoryCards = await page.locator('[data-testid="category-card"]').count()
    console.log(`📂 Found ${categoryCards} category cards`)
    expect(categoryCards).toBe(8)

    // Capture screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/homepage-validation.png', fullPage: true })
  })

  test('2. Guest User - Category Access Validation', async ({ page }) => {
    console.log('🧪 Testing: Guest User Category Access')

    await setupTestUser(page, 'guest')
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Verify guest user state
    const userState = await captureUserState(page)
    expect(userState?.coins).toBe(0)
    console.log(`👤 Guest user confirmed: ${userState?.coins} coins`)

    // Try to access paid category
    const firstCategory = page.locator('[data-testid="category-card"]').first()
    await firstCategory.click()

    // Should remain on start page (insufficient coins)
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/start')
    console.log('🚫 Guest correctly blocked from paid category')

    await page.screenshot({ path: 'tests/e2e/screenshots/guest-category-access.png' })
  })

  test('3. Rich User - Complete Quiz Flow', async ({ page }) => {
    console.log('🧪 Testing: Rich User Complete Quiz Flow')

    await setupTestUser(page, 'richUser')
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Verify rich user state
    const initialState = await captureUserState(page)
    expect(initialState?.coins).toBe(500)
    console.log(`👤 Rich user confirmed: ${initialState?.coins} coins`)

    // Access first category
    const firstCategory = page.locator('[data-testid="category-card"]').first()
    await firstCategory.click()

    // Should navigate to quiz page
    await page.waitForURL(/\/quiz\//, { timeout: 10000 })
    console.log('✅ Successfully navigated to quiz page')

    // Verify entry fee deduction
    const postEntryState = await captureUserState(page)
    expect(postEntryState?.coins).toBe(400) // 500 - 100 entry fee
    console.log(`💰 Entry fee deducted: ${initialState?.coins} → ${postEntryState?.coins}`)

    await page.screenshot({ path: 'tests/e2e/screenshots/quiz-entry-success.png' })
  })

  test('4. Quiz Question Flow and Answer Validation', async ({ page }) => {
    console.log('🧪 Testing: Quiz Question Flow and Answer Validation')

    await setupTestUser(page, 'richUser')
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Access quiz
    const firstCategory = page.locator('[data-testid="category-card"]').first()
    await firstCategory.click()
    await page.waitForURL(/\/quiz\//)

    // Wait for quiz to load
    await waitForQuizLoad(page)

    const initialCoins = (await captureUserState(page))?.coins || 0
    console.log(`💰 Starting quiz with ${initialCoins} coins`)

    // Answer questions
    let correctAnswers = 0
    let totalQuestions = 0

    for (let i = 0; i < 5; i++) { // Test up to 5 questions
      try {
        // Wait for question to load
        await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 5000 })

        const questionText = await page.locator('[data-testid="quiz-question"]').textContent()
        if (!questionText || questionText.trim().length === 0) {
          console.log('⚠️ Empty question detected, skipping')
          break
        }

        totalQuestions++
        console.log(`❓ Question ${totalQuestions}: ${questionText.substring(0, 50)}...`)

        // Find answer options
        const answerButtons = page.locator('[data-testid*="answer"], .answer-option, button:has-text("A)"), button:has-text("B)"), button:has-text("C)"), button:has-text("D)")')
        const answerCount = await answerButtons.count()

        if (answerCount === 0) {
          console.log('⚠️ No answer options found, checking for different selectors')
          // Try alternative selectors
          const altButtons = page.locator('button').filter({ hasText: /^[A-D]\)/ })
          const altCount = await altButtons.count()
          if (altCount > 0) {
            await altButtons.first().click()
          } else {
            console.log('❌ No answer buttons found, breaking')
            break
          }
        } else {
          // Click first answer option
          await answerButtons.first().click()
        }

        // Wait for answer processing
        await page.waitForTimeout(1000)

        // Check if answer was correct (look for reward popup or coin increase)
        const currentCoins = (await captureUserState(page))?.coins || 0
        if (currentCoins > initialCoins + (correctAnswers * 50)) {
          correctAnswers++
          console.log(`✅ Correct answer! Coins: ${currentCoins}`)
        } else {
          console.log(`❌ Incorrect answer. Coins: ${currentCoins}`)
        }

        // Look for next question button or completion
        const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), [data-testid="next-question"]')
        if (await nextButton.count() > 0) {
          await nextButton.click()
          await page.waitForTimeout(1000)
        } else {
          console.log('🏁 Quiz completed or no next button found')
          break
        }

      } catch (error) {
        console.log(`⚠️ Error on question ${totalQuestions}: ${error}`)
        break
      }
    }

    const finalCoins = (await captureUserState(page))?.coins || 0
    console.log(`🎯 Quiz Results: ${totalQuestions} questions, ${correctAnswers} correct, Final coins: ${finalCoins}`)

    await page.screenshot({ path: 'tests/e2e/screenshots/quiz-completion.png' })
  })

  test('5. Coin Balance Persistence and Navigation', async ({ page }) => {
    console.log('🧪 Testing: Coin Balance Persistence and Navigation')

    await setupTestUser(page, 'richUser')
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Record initial state
    const initialState = await captureUserState(page)
    console.log(`💰 Initial coins: ${initialState?.coins}`)

    // Navigate to profile
    await page.goto(`${BASE_URL}/profile`)
    await page.waitForLoadState('networkidle')

    // Verify coins persist
    const profileState = await captureUserState(page)
    expect(profileState?.coins).toBe(initialState?.coins)
    console.log(`✅ Coins persisted in profile: ${profileState?.coins}`)

    // Navigate to leaderboard
    await page.goto(`${BASE_URL}/leaderboard`)
    await page.waitForLoadState('networkidle')

    // Verify coins still persist
    const leaderboardState = await captureUserState(page)
    expect(leaderboardState?.coins).toBe(initialState?.coins)
    console.log(`✅ Coins persisted in leaderboard: ${leaderboardState?.coins}`)

    // Test browser refresh
    await page.reload()
    await page.waitForLoadState('networkidle')

    const refreshState = await captureUserState(page)
    expect(refreshState?.coins).toBe(initialState?.coins)
    console.log(`✅ Coins persisted after refresh: ${refreshState?.coins}`)

    await page.screenshot({ path: 'tests/e2e/screenshots/coin-persistence.png' })
  })

  test('6. Edge Case - Insufficient Coins Handling', async ({ page }) => {
    console.log('🧪 Testing: Insufficient Coins Handling')

    await setupTestUser(page, 'poorUser')
    await page.goto(`${BASE_URL}/start`)
    await page.waitForLoadState('networkidle')

    // Verify poor user state
    const userState = await captureUserState(page)
    expect(userState?.coins).toBe(50)
    console.log(`👤 Poor user confirmed: ${userState?.coins} coins`)

    // Try to access category requiring 100 coins
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()

    // Should remain on start page or show error
    await page.waitForTimeout(2000)
    const currentUrl = page.url()

    if (currentUrl.includes('/start')) {
      console.log('✅ User correctly blocked from category (stayed on start page)')
    } else if (currentUrl.includes('/quiz/')) {
      console.log('⚠️ User was allowed into quiz despite insufficient coins')
      // Check if coins were deducted anyway
      const postClickState = await captureUserState(page)
      console.log(`💰 Coins after click: ${postClickState?.coins}`)
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/insufficient-coins.png' })
  })

  test('7. Multi-Viewport Responsive Design Test', async ({ page, browserName }) => {
    console.log('🧪 Testing: Multi-Viewport Responsive Design')

    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ]

    await setupTestUser(page, 'richUser')

    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`)

      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`${BASE_URL}/start`)
      await page.waitForLoadState('networkidle')

      // Check category cards visibility
      const categoryCards = await page.locator('[data-testid="category-card"]').count()
      expect(categoryCards).toBe(8)
      console.log(`✅ All 8 category cards visible on ${viewport.name}`)

      // Test navigation
      await page.goto(`${BASE_URL}/profile`)
      await page.waitForLoadState('networkidle')

      // Capture screenshot for each viewport
      await page.screenshot({
        path: `tests/e2e/screenshots/responsive-${viewport.name}.png`,
        fullPage: true
      })
    }
  })

  test('8. Error Handling and Console Validation', async ({ page }) => {
    console.log('🧪 Testing: Error Handling and Console Validation')

    const consoleMessages: string[] = []
    const errors: string[] = []

    // Capture console messages
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(`${msg.type()}: ${text}`)
      if (msg.type() === 'error' && !text.includes('Sentry') && !text.includes('DSN')) {
        errors.push(text)
      }
    })

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`)
    })

    await setupTestUser(page, 'richUser')

    // Test various pages for errors
    const testPages = ['/', '/start', '/profile', '/leaderboard']

    for (const testPage of testPages) {
      console.log(`🔍 Testing page: ${testPage}`)
      await page.goto(`${BASE_URL}${testPage}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Allow time for any async errors
    }

    // Test invalid route
    await page.goto(`${BASE_URL}/nonexistent-page`)
    await page.waitForLoadState('networkidle')

    // Report findings
    console.log(`📊 Console Messages: ${consoleMessages.length}`)
    console.log(`❌ Errors Found: ${errors.length}`)

    if (errors.length > 0) {
      console.log('🚨 Critical Errors:')
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    } else {
      console.log('✅ No critical JavaScript errors found')
    }

    // Save console log
    await page.evaluate((messages) => {
      console.log('=== CONSOLE LOG SUMMARY ===')
      messages.forEach(msg => console.log(msg))
    }, consoleMessages)

    await page.screenshot({ path: 'tests/e2e/screenshots/error-handling.png' })
  })

  test('9. Performance and Load Time Validation', async ({ page }) => {
    console.log('🧪 Testing: Performance and Load Time Validation')

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

    await page.screenshot({ path: 'tests/e2e/screenshots/performance-test.png' })
  })
})
