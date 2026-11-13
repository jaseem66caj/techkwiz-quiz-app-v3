import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = process.env.PLAY_EVIDENCE_DIR
const shifts: Record<string, unknown> = {}
const runtimeErrors = new WeakMap<Page, string[]>()

async function capture(page: Page, name: string) {
  if (!evidenceDir) return
  mkdirSync(evidenceDir, { recursive: true })
  await page.screenshot({ path: join(evidenceDir, `${name}.png`), fullPage: true })
}

async function checkPage(page: Page) {
  await expect(page.locator('h1')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect.poll(() => page.locator('button, a').evaluateAll(nodes => nodes.filter(node => {
    const r = node.getBoundingClientRect()
    const style = getComputedStyle(node)
    return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.clipPath === 'none' && (r.width < 43.9 || r.height < 43.9)
  }).map(node => node.textContent?.trim()))).toEqual([])
}

async function recordShifts(page: Page, name: string) {
  const records = await page.evaluate(() => (window as unknown as { shifts: { value: number; startTime: number; recent: boolean }[] }).shifts)
  let max = 0, sum = 0, start = 0, last = 0
  for (const r of records.filter(r => !r.recent)) {
    if (r.startTime - last > 1000 || r.startTime - start > 5000) { sum = 0; start = r.startTime }
    sum += r.value; max = Math.max(max, sum); last = r.startTime
  }
  shifts[name] = { cls: max, totalIncludingInput: records.reduce((n, r) => n + r.value, 0), records }
  if (evidenceDir) writeFileSync(join(evidenceDir, `${name}-metrics.json`), JSON.stringify(shifts[name], null, 2))
  expect(max, `${name} CLS`).toBeLessThanOrEqual(0.1)
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  runtimeErrors.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    const records: { value: number; startTime: number; recent: boolean }[] = []
    ;(window as unknown as { shifts: typeof records }).shifts = records
    new PerformanceObserver(list => {
      for (const item of list.getEntries()) {
        const shift = item as PerformanceEntry & { value: number; hadRecentInput: boolean }
        records.push({ value: shift.value, startTime: shift.startTime, recent: shift.hadRecentInput })
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
})

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page)).toEqual([])
})

for (const category of ['programming', 'ai']) {
  test(`zero-balance guest completes and replays ${category}`, async ({ page }, testInfo) => {
    const name = `${category}-${testInfo.project.name}`
    await page.goto(`/quiz/${category}#play-quiz`)
    const answers = page.getByTestId('answer-option')
    await expect(page.locator('[inert]')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: /Insufficient coins/i })).toHaveCount(0)
    await checkPage(page)
    await capture(page, `${name}-question`)
    for (let i = 0; i < 5; i++) {
      await expect(page.getByRole('heading', { name: `Question ${i + 1} of 5`, exact: true })).toBeVisible()
      await answers.first().click()
      await expect(page.getByTestId('reward-claim-button')).toBeVisible()
      await page.getByTestId('reward-claim-button').click()
    }
    await expect(page.getByRole('heading', { name: 'Quiz Complete!', exact: true })).toBeVisible()
    await checkPage(page)
    await capture(page, `${name}-result`)
    await recordShifts(page, name)
    await page.getByRole('button', { name: 'Play Again', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Question 1 of 5', exact: true })).toBeVisible()
    await expect(page.getByText('+0', { exact: true })).toBeVisible()
    await answers.first().click()
    await expect(page.getByTestId('reward-claim-button')).toBeVisible()
  })
}

test('home finishes with a free continuation and one main heading', async ({ page }, testInfo) => {
  await page.goto('/')
  await checkPage(page)
  await capture(page, `home-${testInfo.project.name}`)
  for (let i = 0; i < 5; i++) {
    await expect(page.getByText(`Question ${i + 1} of 5`, { exact: true })).toBeVisible()
    await page.getByTestId('answer-option').first().click()
  }
  await expect(page.getByRole('heading', { name: 'Quiz Completed!', exact: true })).toBeVisible()
  await checkPage(page)
  await capture(page, `home-${testInfo.project.name}-result`)
  await recordShifts(page, `home-${testInfo.project.name}`)
  await page.getByRole('button', { name: 'Play More Free Quizzes', exact: true }).click()
  await expect(page).toHaveURL(/\/start$/)
  await expect(page.getByTestId('category-card')).toHaveCount(8)
})

test('start has free entry, working thumbnails and 44px controls', async ({ page }, testInfo) => {
  const failedImages: string[] = []
  page.on('response', response => { if (response.url().includes('/_next/image') && !response.ok()) failedImages.push(response.url()) })
  await page.goto('/start')
  await expect(page.getByTestId('category-card')).toHaveCount(8)
  await expect(page.getByTestId('category-card').first()).toContainText('Free')
  await checkPage(page)
  await page.getByRole('heading', { name: 'Latest Tech News', exact: true }).scrollIntoViewIfNeeded()
  const images = page.locator('main img')
  await expect(images.first()).toBeVisible({ timeout: 30_000 })
  await expect.poll(() => images.evaluateAll(nodes => nodes.every(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0))).toBe(true)
  expect(failedImages).toEqual([])
  await capture(page, `start-${testInfo.project.name}`)
  await recordShifts(page, `start-${testInfo.project.name}`)
  await page.getByTestId('category-card').filter({ hasText: 'Programming' }).getByRole('button', { name: 'PLAY', exact: true }).click()
  await expect(page).toHaveURL(/\/quiz\/programming/)
  await expect(page.locator('[inert]')).toHaveCount(0)
})

test('all eight categories allow zero-balance guest entry', async ({ page }) => {
  for (const slug of ['swipe-personality', 'pop-culture-flash', 'micro-trivia', 'social-identity', 'trend-vibes', 'future-you', 'programming', 'ai']) {
    await page.goto('/start')
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await page.goto(`/quiz/${slug}`)
    await expect(page.locator('[inert]')).toHaveCount(0)
    await expect(page.getByTestId('answer-option').first()).toBeEnabled()
    await expect(page.getByRole('heading', { name: /Insufficient coins/i })).toHaveCount(0)
    await expect(page.locator('h1')).toHaveCount(1)
  }
})

test('timeout advances once and resets the next question timer', async ({ page }) => {
  await page.clock.install()
  await page.goto('/quiz/programming#play-quiz')
  await expect(page.locator('[inert]')).toHaveCount(0)
  await page.clock.runFor(30_100)
  await expect(page.getByRole('heading', { name: "Time's Up!", exact: true })).toBeVisible()
  await page.clock.runFor(2100)
  await expect(page.getByRole('heading', { name: 'Question 2 of 5', exact: true })).toBeVisible()
  await expect(page.getByText('0:30', { exact: true })).toBeVisible()
  await expect(page.getByTestId('answer-option').first()).toBeEnabled()
})
