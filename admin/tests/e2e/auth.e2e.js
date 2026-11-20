// FE-02 — Parcours navigateur des ecrans d'authentification simules.
// Hors CI, comme la suite FE-01. Lancer avec : npm run test:admin:e2e
// (le build Admin est produit par le script ; Chromium doit etre installe).
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const allowedOrigins = new Set(['http://localhost:4174'])
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const screens = [
  { path: '/connexion', name: 'connexion' },
  { path: '/mfa/enrolement', name: 'enrolement' },
  { path: '/mfa/verification', name: 'challenge' },
  { path: '/mfa/recuperation', name: 'recuperation' },
  { path: '/reauthentification', name: 'reauthentification' },
]

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
  expect(offOrigin, 'requetes hors origine').toEqual([])
  expect(apiCalls, 'appels /api reels').toEqual([])
  expect(errors, 'erreurs navigateur').toEqual([])
  const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))
  expect(storage).toEqual({ local: 0, session: 0 })
  expect(await context.cookies()).toEqual([])
})

for (const width of [390, 1440]) {
  test.describe(`${width}px — ecrans FE-02`, () => {
    test.use({ viewport: { width, height: 900 } })

    for (const screen of screens) {
      test(`${screen.name} : rendu, axe, aucun debordement`, async ({ page }) => {
        await page.goto(screen.path)
        await page.waitForLoadState('networkidle')
        await expect(page.locator('h1#admin-page-title')).toHaveCount(1)
        await expect(page.getByText(/Parcours FE-02 fictif/)).toBeVisible()
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        expect(overflow).toBeLessThanOrEqual(0)
        const results = await new AxeBuilder({ page }).withTags(axeTags).analyze()
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([])
      })
    }
  })
}

test.describe('Parcours FE-02', () => {
  test('connexion puis challenge MFA sans reseau reel', async ({ page }) => {
    await page.goto('/connexion')
    await page.getByLabel('Adresse e-mail administrative').fill('admin@example.test')
    await page.locator('input[type="password"]').fill('fictional-demo-password')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(page).toHaveURL(/\/mfa\/verification$/)
    await page.locator('input[inputmode="numeric"]').fill('123456')
    await page.getByRole('button', { name: 'Valider le code TOTP' }).click()
    await expect(page).toHaveURL(/\/reauthentification$/)
    await expect(page.getByText(/Fenetre de fraicheur/)).toBeVisible()
  })

  test('affichage et masquage du mot de passe au clavier', async ({ page }) => {
    await page.goto('/connexion')
    const toggle = page.getByRole('button', { name: 'Afficher le mot de passe' })
    await toggle.focus()
    await toggle.press('Enter')
    await expect(page.locator('input[type="text"][autocomplete="current-password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Masquer le mot de passe' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('scenario 401 : erreur generique et aucun stockage', async ({ page }) => {
    await page.goto('/connexion')
    await page.getByLabel('Scenario simule').selectOption('wrong-password')
    await page.getByLabel('Adresse e-mail administrative').fill('admin@example.test')
    await page.locator('input[type="password"]').fill('fictional-demo-password')
    await page.getByRole('button', { name: 'Continuer' }).click()
    await expect(page.getByText(/Erreur 401/)).toBeVisible()
    await expect(page).toHaveURL(/\/connexion$/)
  })

  test('perte totale : aucun contournement web', async ({ page }) => {
    await page.goto('/mfa/recuperation')
    await expect(page.getByText(/Aucune recuperation web possible/)).toBeVisible()
    await expect(page.getByText(/GOV-06/)).toBeVisible()
  })
})
