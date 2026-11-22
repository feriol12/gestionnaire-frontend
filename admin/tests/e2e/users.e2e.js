import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { fileURLToPath } from 'node:url'

const captures = fileURLToPath(new URL('./__screenshots__/captures/', import.meta.url))
const journals = new WeakMap()
test.beforeEach(async ({ page, context }) => {
  const journal = { forbidden: [], errors: [] }
  journals.set(page, journal)
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== 'http://localhost:4174' || /^\/api(?:\/|$)/.test(url.pathname)) {
      journal.forbidden.push(url.origin + url.pathname)
      return route.abort()
    }
    return route.continue()
  })
  page.on('pageerror', (error) => journal.errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') journal.errors.push(message.text())
  })
})
test.afterEach(async ({ page, context }) => {
  expect(journals.get(page)).toEqual({ forbidden: [], errors: [] })
  expect(await context.cookies()).toEqual([])
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
})

async function ready(page) {
  await expect(page.locator('.fe-users-page [aria-busy="true"]')).toHaveCount(0)
}
async function axe(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  await test.info().attach('axe-fe04', {
    body: JSON.stringify({
      url: page.url(),
      viewport: page.viewportSize(),
      engine: results.testEngine,
      passes: results.passes.length,
      violations: results.violations,
    }),
    contentType: 'application/json',
  })
  expect(results.violations).toEqual([])
}
const screens = [
  ['liste', '/utilisateurs'],
  ['fiche', '/utilisateurs/1001'],
  ['champs-absents', '/utilisateurs/1032'],
  ['introuvable', '/utilisateurs/9999'],
  ['vide', '/utilisateurs?q=aucun-resultat'],
  ['chargement', '/utilisateurs?demo=loading'],
  ['erreur', '/utilisateurs?demo=error'],
  ['refus', '/utilisateurs?demo=forbidden'],
  ['fiche-erreur', '/utilisateurs/1001?demo=error'],
  ['fiche-refus', '/utilisateurs/1001?demo=forbidden'],
]
for (const width of [390, 768, 1440]) {
  test.describe(`FE-04 ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } })
    for (const [name, path] of screens) {
      test(`${name} : responsive, axe et capture`, async ({ page }) => {
        await page.goto(path)
        if (name !== 'chargement') await ready(page)
        else await expect(page.locator('[data-users-state="loading"]')).toBeVisible()
        await expect(page.locator('h1')).toHaveCount(1)
        await expect(
          page
            .getByRole('complementary', { name: 'Démonstration du répertoire' })
            .getByText('Répertoire fictif · Lecture seule'),
        ).toBeVisible()
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(0)
        if (name === 'liste') {
          await expect(page.getByRole('table')).toBeVisible({ visible: width >= 768 })
          await expect(
            page.getByRole('list', { name: 'Utilisateurs fictifs', exact: true }),
          ).toBeVisible({ visible: width < 768 })
        }
        await axe(page)
        await page.screenshot({ path: `${captures}fe04-${width}-${name}.png`, fullPage: true })
      })
    }
  })
}

test.describe('FE-04 : parcours utilisateurs', () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  test('recherche nom/email au clavier, validation et réinitialisation', async ({ page }) => {
    await page.goto('/utilisateurs')
    await ready(page)
    const search = page.getByRole('searchbox', { name: 'Nom ou email', exact: true })
    await search.fill('emile')
    await search.press('Enter')
    await expect(page.getByRole('rowheader', { name: 'Émile Laurent', exact: true })).toBeVisible()
    await expect(page.locator('.fe-users-table tbody tr')).toHaveCount(1)
    await expect(page.locator('#admin-page-title')).toBeFocused()
    await search.fill('compte.demo.17@example.test')
    await page.getByRole('button', { name: 'Rechercher', exact: true }).click()
    await expect(page.getByRole('rowheader', { name: 'Mariam Fall', exact: true })).toBeVisible()
    await search.fill('x'.repeat(101))
    await search.press('Enter')
    await expect(search).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('.fe-users-announcement')).toHaveText(
      'La recherche est limitée à 100 caractères.',
    )
    await page.getByRole('link', { name: 'Réinitialiser', exact: true }).click()
    await expect(page.locator('.fe-users-table tbody tr')).toHaveCount(15)
  })
  test('pagination, fiche et retour : contexte conservé, focus après navigation', async ({
    page,
  }) => {
    await page.goto('/utilisateurs')
    await ready(page)
    const previous = page.getByRole('link', { name: 'Précédente', exact: true })
    await expect(previous).toHaveAttribute('aria-disabled', 'true')
    await page.getByLabel('Utilisateurs par page', { exact: true }).selectOption('5')
    await expect(page.locator('.fe-users-table tbody tr')).toHaveCount(5)
    const next = page.getByRole('link', { name: 'Suivante', exact: true })
    await next.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.fe-users-table tbody tr').first()).toContainText('#1006')
    await expect(page.locator('#admin-page-title')).toBeFocused()
    const detail = page.getByRole('link', { name: 'Consulter la fiche de Hugo Petit', exact: true })
    await detail.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/utilisateurs\/1006\?/)
    await expect(page.locator('.fe-users-details')).toContainText('Hugo Petit')
    await expect(page.locator('#admin-page-title')).toBeFocused()
    await page.getByRole('link', { name: 'Retour aux utilisateurs', exact: true }).click()
    await expect(page.locator('.fe-users-table tbody tr').first()).toContainText('#1006')
    await expect(page).toHaveURL(/page=2/)
    await expect(page).toHaveURL(/per_page=5/)
    await page.reload()
    await expect(page.locator('.fe-users-table tbody tr').first()).toContainText('#1006')
    await page.goBack()
    await expect(page.locator('.fe-users-details')).toContainText('Hugo Petit')
  })
  test('dernière page et page au-delà des résultats', async ({ page }) => {
    await page.goto('/utilisateurs?page=3')
    await ready(page)
    await expect(page.locator('.fe-users-table tbody tr')).toHaveCount(2)
    await expect(page.getByRole('link', { name: 'Suivante', exact: true })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await page.goto('/utilisateurs?page=999')
    await expect(page.getByRole('heading', { name: 'Aucun utilisateur à afficher' })).toBeVisible()
    await page.getByRole('link', { name: 'Revenir à la première page' }).click()
    await expect(page.locator('.fe-users-table tbody tr')).toHaveCount(15)
  })
  test('scénarios modifiables au clavier et réessai sans données résiduelles', async ({ page }) => {
    await page.goto('/utilisateurs')
    await ready(page)
    const scenario = page.getByLabel('Scénario de démonstration', { exact: true })
    await scenario.focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('[data-users-state="loading"]')).toBeVisible()
    await scenario.selectOption('error')
    await expect(page.locator('[data-users-state="error"]')).toBeVisible()
    await page.getByRole('button', { name: 'Réessayer la simulation' }).click()
    await expect(page.locator('[data-users-state="loading"]')).toBeVisible()
    await expect(page.locator('[data-users-state="error"]')).toBeVisible()
    await scenario.selectOption('forbidden')
    await expect(page.locator('[data-users-state="forbidden"]')).toBeVisible()
    await expect(page.locator('.fe-users-table')).toHaveCount(0)
    await scenario.selectOption('normal')
    await expect(page.locator('.fe-users-table tbody tr')).toHaveCount(15)
  })
  test('fiche : pas de statut supposé, aucune action de mutation', async ({ page }) => {
    await page.goto('/utilisateurs/1032')
    await ready(page)
    await expect(page.locator('.fe-users-details')).toContainText('Non renseigné')
    await expect(page.locator('.fe-users-details')).not.toContainText('Statut administratif')
    await expect(
      page.getByRole('button', { name: /Suspendre|Supprimer|Réactiver|Modifier|Exporter/ }),
    ).toHaveCount(0)
    await page.goto('/utilisateurs/1001?demo=loading')
    await expect(page.locator('[data-users-state="loading"]')).toBeVisible()
    await axe(page)
  })
  test('paramètres et identifiants invalides', async ({ page }) => {
    await page.goto('/utilisateurs?per_page=7')
    await expect(page.locator('.fe-users-table tbody tr')).toHaveCount(7)
    await expect(page.getByLabel('Utilisateurs par page', { exact: true })).toHaveValue('7')
    await page.goto('/utilisateurs?per_page=51')
    await expect(
      page.getByRole('heading', { name: 'Paramètres de consultation invalides' }),
    ).toBeVisible()
    await page.getByRole('link', { name: 'Revenir à la première page' }).click()
    await expect(page.locator('.fe-users-table tbody tr')).toHaveCount(15)
    await page.goto('/utilisateurs/abc')
    await expect(page.getByText("Cette page n'existe pas dans le prototype")).toBeVisible()
  })
  test('ordre de tabulation et focus visible dans la recherche', async ({ page }) => {
    await page.goto('/utilisateurs')
    await ready(page)
    const input = page.getByRole('searchbox', { name: 'Nom ou email', exact: true })
    await input.focus()
    await page.keyboard.press('Tab')
    const submit = page.getByRole('button', { name: 'Rechercher', exact: true })
    await expect(submit).toBeFocused()
    expect(await submit.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Réinitialiser', exact: true })).toBeFocused()
  })
})

test('FE-04 : reflow 320px et texte agrandi à 200 %', async ({ page }) => {
  for (const path of ['/utilisateurs', '/utilisateurs/1001']) {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto(path)
    await ready(page)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(0)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(0)
  }
})
