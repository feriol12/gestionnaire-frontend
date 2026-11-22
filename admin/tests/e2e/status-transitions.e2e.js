import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const journals = new WeakMap()
test.beforeEach(async ({ page, context }) => {
  const journal = { forbidden: [], errors: [] }
  journals.set(page, journal)
  await context.route('**/*', (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (
      url.origin !== 'http://localhost:4174' ||
      /^\/api(?:\/|$)/.test(url.pathname) ||
      ['fetch', 'xhr', 'websocket', 'eventsource'].includes(request.resourceType()) ||
      request.method() !== 'GET'
    ) {
      journal.forbidden.push(request.method() + ' ' + url.origin + url.pathname)
      return route.abort()
    }
    return route.continue()
  })
  page.on('pageerror', (e) => journal.errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') journal.errors.push(m.text())
  })
})
test.afterEach(async ({ page, context }) => {
  expect(journals.get(page)).toEqual({ forbidden: [], errors: [] })
  expect(await context.cookies()).toEqual([])
  expect(
    await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      databases: (await indexedDB.databases()).length,
      caches: (await caches.keys()).length,
    })),
  ).toEqual({ local: 0, session: 0, databases: 0, caches: 0 })
  expect(await page.locator('.fe-status-page').textContent()).not.toMatch(
    /FCFA|XOF|€|montant|solde|budget|dépense|amount|balance|iban/i,
  )
})
const path = (id = 1001, action = 'suspension') => `/utilisateurs/${id}/${action}-simulee`
const state = (page) => page.locator('[data-transition-state]')
async function ready(page) {
  await expect(state(page)).toHaveAttribute('data-transition-state', 'form')
}
async function fill(page, emailId = '1') {
  await page.getByLabel('Motif (obligatoire)', { exact: true }).fill('Motif fictif de test')
  await page
    .getByLabel('Confirmer l’adresse email exacte (obligatoire)', { exact: true })
    .fill(`compte.demo.${emailId}@example.test`)
  await page.getByRole('button', { name: 'Vérifier la simulation', exact: true }).click()
}
async function axe(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  await test.info().attach('axe-fe05', {
    body: JSON.stringify({
      url: page.url(),
      viewport: page.viewportSize(),
      violations: results.violations,
      passes: results.passes.length,
    }),
    contentType: 'application/json',
  })
  expect(results.violations).toEqual([])
}
async function capture(page, name) {
  await page.screenshot({ path: test.info().outputPath(name + '.png'), fullPage: true })
}
for (const width of [390, 768, 1440]) {
  test.describe('FE-05 ' + width + 'px', () => {
    test.use({ viewport: { width, height: 900 } })
    for (const [id, action, emailId, expected] of [
      [1001, 'suspension', '1', 'suspended'],
      [1002, 'reactivation', '2', 'active'],
    ]) {
      test(action + ' : formulaire, confirmation, succès et axe', async ({ page }) => {
        await page.goto(path(id, action))
        await ready(page)
        await axe(page)
        await capture(page, action + '-form')
        await fill(page, emailId)
        await expect(page.locator('#fe-status-confirm')).toBeFocused()
        await axe(page)
        await capture(page, action + '-confirm')
        await page.getByRole('button', { name: 'Confirmer la simulation', exact: true }).dblclick()
        await expect(state(page)).toHaveAttribute('data-transition-state', 'success')
        await expect(page.locator('#fe-status-outcome')).toBeFocused()
        await expect(page.locator('.fe-status-result')).toContainText(
          'Statut résultant simulé : ' + expected,
        )
        await axe(page)
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(0)
        await capture(page, action + '-success')
        await page.reload()
        await ready(page)
        await expect(page.getByLabel('Motif (obligatoire)', { exact: true })).toHaveValue('')
      })
    }
  })
}
for (const action of ['suspension', 'reactivation']) {
  for (const scenario of ['401', '403', '404', '409', '419', '422', '429', '500', '503', 'mfa']) {
    test('FE-05 ' + action + ' erreur ' + scenario + ' et reprise', async ({ page }) => {
      const id = action === 'suspension' ? 1001 : 1002
      await page.goto(path(id, action))
      await ready(page)
      await page.getByLabel('Scénario FE-05', { exact: true }).selectOption(scenario)
      await ready(page)
      await fill(page, id === 1001 ? '1' : '2')
      await page.getByRole('button', { name: 'Confirmer la simulation', exact: true }).click()
      await expect(state(page)).toHaveAttribute('data-transition-state', 'error')
      await expect(page.locator('#fe-status-outcome')).toBeFocused()
      await expect(page.getByRole('alert')).toBeVisible()
      await axe(page)
      if (scenario === 'mfa') {
        await expect(page.getByRole('alert')).toContainText('aucune protection réelle')
        await capture(page, 'mfa-requise')
      }
      await page.getByRole('button', { name: 'Reprendre le formulaire fictif' }).click()
      await expect(page.getByLabel('Motif (obligatoire)', { exact: true })).toBeFocused()
      await expect(page.getByLabel('Motif (obligatoire)', { exact: true })).toHaveValue('')
    })
  }
}
test('FE-05 clavier, erreurs locales, focus visible et annulation', async ({ page }) => {
  await page.goto(path())
  await ready(page)
  const reason = page.getByLabel('Motif (obligatoire)', { exact: true })
  const email = page.getByLabel('Confirmer l’adresse email exacte (obligatoire)', { exact: true })
  await reason.focus()
  await page.keyboard.press('Tab')
  await expect(email).toBeFocused()
  await page.keyboard.press('Tab')
  const submit = page.getByRole('button', { name: 'Vérifier la simulation', exact: true })
  await expect(submit).toBeFocused()
  expect(await submit.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(reason).toBeFocused()
  await expect(reason).toHaveAttribute('aria-invalid', 'true')
  await axe(page)
  await reason.fill('Motif fictif')
  for (const incorrect of ['COMPTE.demo.1@example.test', 'compte.demo.1@example.test ']) {
    await email.fill(incorrect)
    await email.press('Enter')
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toBeFocused()
  }
  await email.fill('compte.demo.1@example.test')
  await email.press('Enter')
  await expect(page.locator('#fe-status-confirm')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Confirmer la simulation', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Annuler la simulation', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(reason).toBeFocused()
  await expect(reason).toHaveValue('')
})
test('FE-05 attente, annulation, navigation arrière et aucune reprise tardive', async ({
  page,
}) => {
  await page.goto(path() + '?q=compte&page=2&per_page=5')
  await ready(page)
  await page.getByLabel('Scénario FE-05', { exact: true }).selectOption('loading')
  await ready(page)
  await fill(page)
  await page.getByRole('button', { name: 'Confirmer la simulation', exact: true }).click()
  await expect(state(page)).toHaveAttribute('data-transition-state', 'pending')
  await expect(
    page.getByRole('button', { name: 'Confirmer la simulation', exact: true }),
  ).toHaveAttribute('aria-disabled', 'true')
  await axe(page)
  await capture(page, 'attente')
  await page.getByRole('button', { name: 'Annuler la simulation', exact: true }).click()
  await ready(page)
  await fill(page)
  await page.getByRole('button', { name: 'Confirmer la simulation', exact: true }).click()
  await page.getByRole('link', { name: 'Retour aux utilisateurs', exact: true }).click()
  await expect(page).toHaveURL(/q=compte&page=2&per_page=5/)
  await page.goBack()
  await ready(page)
  await expect(page.getByLabel('Motif (obligatoire)', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Scénario FE-05', { exact: true })).toHaveValue('success')
})
test('FE-05 cibles absentes, parcours redondants, hub, responsive 320px et 200%', async ({
  page,
}) => {
  for (const url of ['/simulations/statuts', path(1031), path(1032), path(9999)]) {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto(url)
    if (!url.startsWith('/simulations'))
      await expect(state(page)).not.toHaveAttribute('data-transition-state', 'loading')
    await axe(page)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(0)
    await capture(page, 'cible-' + url.split('/')[2])
  }
  for (const [id, action, emailId] of [
    [1001, 'reactivation', '1'],
    [1002, 'suspension', '2'],
  ]) {
    await page.goto(path(id, action))
    await ready(page)
    await fill(page, emailId)
    await page.getByRole('button', { name: 'Confirmer la simulation', exact: true }).click()
    await expect(page.locator('#fe-status-outcome')).toHaveText('Erreur 409 simulée')
  }
  await page.goto(path())
  await ready(page)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(0)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  await fill(page)
  await axe(page)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(0)
})
