// FE-01 — Responsive, accessibilité (axe), clavier, focus, réseau et stockage.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const capturesDir = fileURLToPath(new URL('./__screenshots__/captures/', import.meta.url))
const distDir = fileURLToPath(new URL('../../dist/', import.meta.url))
// Seule origine autorisée : le serveur de prévisualisation local (aucune police
// ni ressource tierce depuis la suppression de Google Fonts).
const allowedOrigins = new Set(['http://localhost:4174'])
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Mobiles, tablette portrait (768), seuil desktop (1024), seuil large (1280), desktop.
const widths = [360, 390, 430, 768, 1024, 1280, 1440]
const screens = [
  { path: '/', name: 'tableau-de-bord' },
  { path: '/etats', name: 'etats-simules' },
  { path: '/composants', name: 'composants' },
  { path: '/utilisateurs', name: 'module-reserve' },
  { path: '/connexion', name: 'reserve-fe02' },
]

// Chaque test : journal des requêtes, erreurs JS et console.
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
  expect(offOrigin, 'requêtes vers une origine non autorisée').toEqual([])
  expect(apiCalls, 'appels /api').toEqual([])
  expect(errors, 'erreurs navigateur').toEqual([])
  if (page.url().startsWith('http')) {
    const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))
    expect(storage).toEqual({ local: 0, session: 0 })
  }
  expect(await context.cookies()).toEqual([])
})

async function attachAxeEvidence(page, results) {
  await test.info().attach('axe-results', {
    body: JSON.stringify({
      url: page.url(), viewport: page.viewportSize(), engine: results.testEngine,
      tags: axeTags, passes: results.passes.length, violations: results.violations,
    }, null, 2),
    contentType: 'application/json',
  })
}

async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

async function horizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
}

for (const width of widths) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: width >= 1024 ? 900 : 800 } })

    for (const screen of screens) {
      test(`${screen.name} : rendu, débordement, axe, capture`, async ({ page }) => {
        await page.goto(screen.path)
        await settle(page)
        await expect(page.locator('h1')).toHaveCount(1)
        await expect(page.getByText('Données fictives — Démonstration').first()).toBeVisible()
        expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
        if (screen.path !== '/connexion') {
          // Desktop : sidebar sans menu hamburger ; mobile : menu + barre basse.
          const desktop = width >= 1024
          await expect(page.locator('#admin-menu-button')).toBeVisible({ visible: !desktop })
          await expect(page.getByRole('navigation', { name: 'Navigation principale', exact: true })).toBeVisible({
            visible: desktop,
          })
          await expect(page.getByRole('navigation', { name: 'Navigation rapide' })).toBeVisible({ visible: !desktop })
        }

        const results = await new AxeBuilder({ page }).withTags(axeTags).analyze()
        await attachAxeEvidence(page, results)
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([])

        await page.screenshot({ path: `${capturesDir}${width}-${screen.name}.png`, fullPage: true })
      })
    }
  })
}

test.describe('Reflow et zoom', () => {
  // 320px = reflow WCAG 1.4.10 ; 720px = 1440px affiché à 200 %.
  for (const width of [320, 720]) {
    test(`${width}px : aucun défilement horizontal`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      for (const screen of screens) {
        await page.goto(screen.path)
        await settle(page)
        expect(await horizontalOverflow(page), screen.path).toBeLessThanOrEqual(0)
      }
    })
  }

  test('texte agrandi à 200 % (1440px) : pas de débordement', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await settle(page)
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
  })
})

test.describe('Build Admin (admin/dist)', () => {
  // URI présentes dans le code de Vue/Lucide sans jamais être chargées :
  // espaces de noms XML et lien de documentation des messages d'erreur Vue.
  const inertUrls = [/^http:\/\/www\.w3\.org\//, /^https:\/\/vuejs\.org\/error-reference\//]

  test('aucune ressource externe référencée', () => {
    const files = readdirSync(distDir, { recursive: true }).filter((file) => /\.(html|css|js)$/.test(file))
    expect(files.length).toBeGreaterThan(3)
    const external = files.flatMap((file) =>
      (readFileSync(`${distDir}${file}`, 'utf8').match(/https?:\/\/[^"'`\s)]+/g) ?? [])
        .filter((url) => !inertUrls.some((pattern) => pattern.test(url)))
        .map((url) => `${file}: ${url}`),
    )
    expect(external).toEqual([])
    const html = readFileSync(`${distDir}index.html`, 'utf8')
    expect(html).not.toMatch(/<(script|style)>/)
    expect(html).not.toMatch(/preconnect|fonts\.g/)
  })
})

test.describe('Clavier et focus (1440px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test("lien d'évitement puis contenu principal", async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Aller au contenu principal' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(page.locator('#admin-main')).toBeFocused()
  })

  test('navigation clavier dans la sidebar et focus sur le titre de page', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    const link = page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Utilisateurs' })
    await link.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/utilisateurs$/)
    await expect(page.locator('#admin-page-title')).toBeFocused()
    await expect(page.locator('#admin-page-title')).toHaveText('Utilisateurs')
    await expect(link).toHaveAttribute('aria-current', 'page')
  })

  test('focus visible sur les éléments interactifs', async ({ page }) => {
    await page.goto('/composants')
    await settle(page)
    const button = page.getByRole('button', { name: 'Valider' })
    await button.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    const outline = await button.evaluate((el) => getComputedStyle(el).outlineStyle)
    expect(outline).not.toBe('none')
  })

  test("retour d'un emplacement FE-02 vers le shell : focus sur le titre", async ({ page }) => {
    await page.goto('/connexion')
    await settle(page)
    await page.getByRole('link', { name: 'Retour au tableau de bord (démonstration)' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('#admin-page-title')).toBeFocused()
    await expect(page.locator('#admin-page-title')).toHaveText('Tableau de bord')
  })

  test('du shell vers un emplacement FE-02 : focus sur son titre', async ({ page }) => {
    await page.goto('/etats')
    await settle(page)
    const relogin = page.getByRole('link', { name: 'Se reconnecter' })
    await relogin.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/connexion$/)
    await expect(page.locator('#admin-page-title')).toBeFocused()
  })

  test("tableau d'audit : tabulable seulement s'il défile", async ({ page }) => {
    await page.goto('/')
    await settle(page)
    const region = page.locator('.audit-activity__table-wrap')
    await expect(region).toHaveAttribute('data-scrollable', 'false')
    await expect(region).not.toHaveAttribute('tabindex')
    // Texte agrandi à 200 % : le tableau dépasse, la zone redevient focalisable.
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    await expect(region).toHaveAttribute('tabindex', '0')
    await region.focus()
    await expect(region).toBeFocused()
  })

  test('chargement simulé : bouton focalisé, squelettes puis contenu', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    const replay = page.getByRole('button', { name: 'Rejouer le chargement simulé' })
    await replay.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-state="loading"]')).toBeVisible()
    await expect(replay).toBeFocused()
    await expect(page.locator('[data-state="loading"]')).toHaveCount(0)
    await expect(page.getByRole('status').filter({ hasText: 'Activité simulée rechargée' })).toHaveCount(1)
  })
})

test.describe('Navigation mobile (390px)', () => {
  test.use({ viewport: { width: 390, height: 800 } })

  test('tiroir : ouverture, axe, Échap et retour du focus', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    const menuButton = page.locator('#admin-menu-button')
    await menuButton.click()
    const drawer = page.locator('#admin-drawer')
    await expect(drawer).toBeVisible()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    const focusInside = await drawer.evaluate((el) => el.contains(document.activeElement))
    expect(focusInside).toBe(true)

    const results = await new AxeBuilder({ page }).withTags(axeTags).analyze()
    await attachAxeEvidence(page, results)
    expect(results.violations.map((v) => v.id)).toEqual([])
    await page.screenshot({ path: `${capturesDir}390-tiroir-navigation.png` })

    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(menuButton).toBeFocused()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('tiroir : un lien navigue, ferme le menu et focalise le titre', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await page.locator('#admin-menu-button').click()
    await page.locator('#admin-drawer').getByRole('link', { name: "Journal d'audit" }).click()
    await expect(page).toHaveURL(/\/audit$/)
    await expect(page.locator('#admin-drawer')).toBeHidden()
    await expect(page.locator('#admin-page-title')).toBeFocused()
  })

  test('tiroir ouvert puis passage à 1024px : fermé, page active, focus sur le titre', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await page.locator('#admin-menu-button').click()
    const drawer = page.locator('#admin-drawer')
    await expect(drawer).toBeVisible()
    // Rotation d'une tablette ou agrandissement de la fenêtre.
    await page.setViewportSize({ width: 1024, height: 800 })
    await expect(drawer).toBeHidden()
    await expect(page.locator('#admin-page-title')).toBeFocused()
    const modalOpen = await page.evaluate(() => Boolean(document.querySelector('dialog[open]')))
    expect(modalOpen).toBe(false)
    // La page n'est plus inerte : la sidebar est utilisable.
    await page.getByRole('navigation', { name: 'Navigation principale', exact: true }).getByRole('link', { name: 'Utilisateurs' }).click()
    await expect(page).toHaveURL(/\/utilisateurs$/)
    await expect(page.locator('#admin-page-title')).toBeFocused()
  })

  test('tiroir : sous 1024px, un redimensionnement ne le ferme pas', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await page.locator('#admin-menu-button').click()
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('#admin-drawer')).toBeVisible()
  })

  test('barre basse : cibles ≥ 44px et lien actif', async ({ page }) => {
    await page.goto('/securite')
    await settle(page)
    const nav = page.getByRole('navigation', { name: 'Navigation rapide' })
    await expect(nav).toBeVisible()
    for (const link of await nav.getByRole('link').all()) {
      const box = await link.boundingBox()
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
    }
    await expect(nav.getByRole('link', { name: 'Sécurité' })).toHaveAttribute('aria-current', 'page')
  })

  test('activité en cartes (pas de tableau) sur mobile', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await expect(page.locator('.audit-activity__cards')).toBeVisible()
    await expect(page.locator('.audit-activity__table-wrap')).toBeHidden()
  })
})

test.describe('AdminButton : régression disabled/loading', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const name of ['Lien désactivé', 'Lien en chargement']) {
    test(`${name} : souris, clavier et clic modifié sans navigation`, async ({ page, context }) => {
      await page.goto('/composants')
      const link = page.getByRole('link', { name, exact: true })
      await expect(link).toHaveAttribute('aria-disabled', 'true')
      await expect(link).not.toHaveAttribute('href')
      await link.scrollIntoViewIfNeeded()
      let box = await link.boundingBox()
      // Vraie souris : Playwright locator.click refuserait un aria-disabled.
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await link.focus()
      await page.keyboard.press('Enter')
      await page.keyboard.press('Space')
      await expect(link).toBeFocused()
      // Espace peut faire défiler la page, comme pour tout lien natif.
      // Recalculer la position avant les clics suivants.
      await link.scrollIntoViewIfNeeded()
      box = await link.boundingBox()
      await page.keyboard.down('Control')
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await page.keyboard.up('Control')
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'middle' })
      await expect(page).toHaveURL(/\/composants$/)
      expect(context.pages()).toHaveLength(1)
    })
  }

  test('tabulation : lien désactivé ignoré, chargement focalisable', async ({ page }) => {
    await page.goto('/composants')
    await page.getByRole('link', { name: 'Voir les états', exact: true }).focus()
    await page.keyboard.press('Tab')
    const loading = page.getByRole('link', { name: 'Lien en chargement', exact: true })
    await expect(loading).toBeFocused()
    await expect(loading).toHaveAttribute('aria-busy', 'true')
    await expect(page.getByRole('link', { name: 'Lien désactivé', exact: true })).toHaveAttribute('tabindex', '-1')
  })

  for (const activation of ['souris', 'clavier']) {
    test(`lien actif : navigation réelle (${activation})`, async ({ page }) => {
      await page.goto('/composants')
      const link = page.getByRole('link', { name: 'Voir les états', exact: true })
      await expect(link).toHaveAttribute('href', '/etats')
      if (activation === 'souris') await link.click()
      else {
        await link.focus()
        await page.keyboard.press('Enter')
      }
      await expect(page).toHaveURL(/\/etats$/)
      await expect(page.locator('#admin-page-title')).toBeFocused()
    })
  }

  test('button : disabled natif et loading gardent leur comportement clavier', async ({ page }) => {
    await page.clock.install()
    await page.goto('/composants')
    const disabled = page.getByRole('button', { name: 'Désactivé', exact: true })
    await expect(disabled).toBeDisabled()
    await page.getByRole('button', { name: 'Paramètres', exact: true }).focus()
    await page.keyboard.press('Tab')
    const button = page.getByRole('button', { name: 'Tester le chargement', exact: true })
    await expect(button).toBeFocused()
    await page.keyboard.press('Space')
    const loading = page.getByRole('button', { name: 'Chargement simulé…', exact: true })
    await expect(loading).toBeFocused()
    await expect(loading).toHaveAttribute('aria-busy', 'true')
    await expect(loading).not.toHaveAttribute('disabled')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
    await page.clock.fastForward(1200)
    await expect(button).toBeFocused()
    await expect(button).not.toHaveAttribute('aria-disabled')
    await page.keyboard.press('Enter')
    await expect(loading).toHaveAttribute('aria-busy', 'true')
  })
})
