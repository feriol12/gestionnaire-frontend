// FE-03 — Vérifications navigateur du tableau de bord non financier.
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const allowedOrigins = new Set(['http://localhost:4174'])
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const journals = new WeakMap()

test.beforeEach(async ({ page }) => {
  const journal = { requests: [], errors: [] }
  journals.set(page, journal)
  page.on('request', (request) => journal.requests.push(request.url()))
  page.on('pageerror', (error) => journal.errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') journal.errors.push(`console: ${message.text()}`)
  })
})

test.afterEach(async ({ page, context }) => {
  const { requests, errors } = journals.get(page)
  const offOrigin = requests.filter((url) => !allowedOrigins.has(new URL(url).origin))
  const apiCalls = requests.filter((url) => /\/api(\/|$)/.test(new URL(url).pathname))
  expect(offOrigin, 'requêtes hors origine').toEqual([])
  expect(apiCalls, 'appels /api réels').toEqual([])
  expect(errors, 'erreurs navigateur').toEqual([])
  const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))
  expect(storage).toEqual({ local: 0, session: 0 })
  expect(await context.cookies()).toEqual([])
})

async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

test('dashboard FE-03 : rendu fictif, absence de données financières et axe', async ({ page }) => {
  await page.goto('/')
  await settle(page)
  await expect(page.locator('#fe03-title')).toBeVisible()
  await expect(page.locator('.fe03-metrics__item')).toHaveCount(3)
  await expect(page.locator('.fe03-trend tbody tr')).toHaveCount(7)
  await expect(page.locator('.fe03-feed__item')).toHaveCount(3)
  const text = await page.locator('body').innerText()
  expect(text).not.toMatch(/(?:dépenses|revenus|budgets|soldes|transactions|montant|solde|€|FCFA|XOF)/i)
  const results = await new AxeBuilder({ page }).withTags(axeTags).analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([])
})

test('scénarios FE-03 : vide, erreur et reprise sans requête', async ({ page }) => {
  await page.goto('/')
  await settle(page)
  await page.getByRole('button', { name: /Vide/ }).click()
  await expect(page.getByText('Aucun événement')).toBeVisible()
  await page.getByRole('button', { name: /Erreur simulée/ }).click()
  await expect(page.getByRole('button', { name: /Réessayer/ })).toBeVisible()
  await page.getByRole('button', { name: /Réessayer/ }).click()
  await expect(page.locator('.fe03-feed__item')).toHaveCount(3)
})

test('clavier et focus visible sur les contrôles FE-03', async ({ page }) => {
  await page.goto('/')
  await settle(page)
  const first = page.locator('.fe03__scenario').first()
  await first.focus()
  await expect(first).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(first).toHaveAttribute('aria-pressed', 'true')
})

for (const width of [320, 390, 768, 1440]) {
  test(`responsive ${width}px : aucun défilement horizontal`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await settle(page)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
