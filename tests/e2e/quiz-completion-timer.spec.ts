import { test, expect } from '@playwright/test'

// Helper to seed user in localStorage before any scripts run
const seedUser = (page: any, coins: number) => page.addInitScript((coins: number) => {
  const user = {
    id: 'guest',
    name: 'Guest',
    avatar: '\u{1F916}',
    coins,
    level: 1,
    totalQuizzes: 0,
    correctAnswers: 0,
    joinDate: new Date().toISOString(),
    quizHistory: [],
    streak: 0,
  };
  window.localStorage.setItem('techkwiz_user', JSON.stringify(user));
}, coins)

// Attempt to click a visible button by text, if present
async function clickIfVisible(page: any, text: string) {
  const locator = page.getByRole('button', { name: text })
  if (await locator.isVisible({ timeout: 500 })) {
    await locator.click()
    return true
  }
  return false
}

// Click any of the common RewardPopup actions if present
async function closeRewardPopupIfOpen(page: any) {
  const options = ['Claim', 'Continue', 'Next', 'OK', 'Close', 'Skip', 'Got it']
  for (const text of options) {
    if (await clickIfVisible(page, text)) return true
  }
  return false
}

// Answer a question by clicking the first option-like button
async function answerFirstOption(page: any) {
  // Try role button first
  const btn = page.getByRole('button').first()
  if (await btn.isVisible({ timeout: 1000 })) {
    await btn.click()
    return
  }
  // Fallback: any clickable div with class quiz-option
  const opt = page.locator('.quiz-option').first()
  if (await opt.isVisible({ timeout: 1000 })) {
    await opt.click()
  }
}

// ------------------------------
// Homepage quiz completion timer
// ------------------------------

test('Homepage Results: shows 90-second countdown and Create Profile Now button', async ({ page }) => {
  await seedUser(page, 200)
  await page.goto('/')

  // Answer 5 questions quickly; homepage auto-progresses
  for (let i = 0; i < 5; i++) {
    await answerFirstOption(page)
    // small delay to allow 650ms progression
    await page.waitForTimeout(800)
  }

  // Expect timer text and progress bar
  await expect(page.getByText(/Redirecting to categories in \d+ seconds/i)).toBeVisible()
  await expect(page.locator('div').filter({ hasText: /Redirecting to categories/ })).toBeVisible()

  // Create Profile Now button should be visible and navigate to /start
  await expect(page.getByRole('button', { name: 'Create Profile Now' })).toBeVisible()
  await page.getByRole('button', { name: 'Create Profile Now' }).click()
  // Note: This button shows profile creation modal, but auto-redirect still goes to /start
})

// --------------------------------
// Category quiz completion timer
// --------------------------------

test('Category Results: shows 90-second countdown and Next Quiz button', async ({ page }) => {
  await seedUser(page, 500)
  await page.goto('/quiz/programming')

  // Iterate through a few questions; handle RewardPopup manually
  for (let i = 0; i < 6; i++) {
    await answerFirstOption(page)
    // Allow 400ms feedback; popup then appears for manual progression
    await page.waitForTimeout(500)
    await closeRewardPopupIfOpen(page)
    // small wait for next question render
    await page.waitForTimeout(300)
    // Break if results visible
    const resultVisible = await page.getByText(/Redirecting to categories in \d+ seconds/i).isVisible({ timeout: 300 }).catch(() => false)
    if (resultVisible) break
  }

  await expect(page.getByText(/Redirecting to categories in \d+ seconds/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next Quiz' })).toBeVisible()

  // Next Quiz button should navigate to /start immediately
  await page.getByRole('button', { name: 'Next Quiz' }).click()
  await page.waitForURL('**/start')
})

