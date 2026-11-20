import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountAt } from './helpers.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('Shell Admin', () => {
  it('affiche le bandeau démo, le lien d’évitement, les navigations et un h1 unique', async () => {
    const { wrapper } = await mountAt('/')
    expect(wrapper.text()).toContain('Données fictives — Démonstration')
    expect(wrapper.get('.skip-link').attributes('href')).toBe('#admin-main')
    expect(wrapper.find('main#admin-main').exists()).toBe(true)
    expect(wrapper.findAll('nav').length).toBeGreaterThanOrEqual(2)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toBe('Tableau de bord')
  })

  it('marque le lien actif avec aria-current="page"', async () => {
    const { wrapper } = await mountAt('/etats')
    const current = wrapper.findAll('[aria-current="page"]').map((el) => el.text())
    expect(current).toContain('États simulés')
  })

  it('la recherche reste simulée et l’annonce', async () => {
    const { wrapper } = await mountAt('/')
    await wrapper.get('#admin-search').setValue('uid-demo')
    await wrapper.get('form[role="search"]').trigger('submit')
    expect(wrapper.get('#admin-search-status').text()).toContain('aucune requête envoyée')
  })

  it('le message de recherche simulée est effacé au changement de page', async () => {
    const { wrapper, router } = await mountAt('/')
    await wrapper.get('form[role="search"]').trigger('submit')
    expect(wrapper.get('#admin-search-status').text()).not.toBe('')
    await router.push('/etats')
    await flushPromises()
    expect(wrapper.get('#admin-search-status').text()).toBe('')
  })
})

describe('Focus après navigation', () => {
  const focusedId = () => document.activeElement?.id

  it('premier chargement : le focus reste au début du document', async () => {
    await mountAt('/')
    expect(document.activeElement).toBe(document.body)
  })

  it('navigation dans le shell : focus sur le titre de page', async () => {
    const { router } = await mountAt('/')
    await router.push('/utilisateurs')
    await flushPromises()
    expect(focusedId()).toBe('admin-page-title')
    expect(document.activeElement.textContent).toBe('Utilisateurs')
  })

  it('retour d’un emplacement FE-02 (hors shell) vers le shell : focus sur le titre', async () => {
    const { router } = await mountAt('/connexion')
    await router.push('/')
    await flushPromises()
    expect(focusedId()).toBe('admin-page-title')
    expect(document.activeElement.textContent).toBe('Tableau de bord')
  })

  it('du shell vers un emplacement FE-02 : focus sur son titre', async () => {
    const { router } = await mountAt('/')
    await router.push('/mfa/verification')
    await flushPromises()
    expect(focusedId()).toBe('admin-page-title')
    expect(document.activeElement.textContent).toBe('Vérification TOTP')
  })
})

describe('Rendu sans avertissement', () => {
  it('aucun avertissement Vue (icône inconnue, prop invalide…) sur tous les écrans', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const paths = ['/', '/utilisateurs', '/audit', '/notifications', '/securite', '/etats', '/composants']
    for (const path of [...paths, '/connexion', '/mfa/enrolement', '/inconnue']) {
      const { wrapper } = await mountAt(path)
      wrapper.unmount()
    }
    expect(warn.mock.calls).toEqual([])
  })
})

describe('Tableau de bord', () => {
  it('rend 4 indicateurs, 4 événements simulés et le graphique accessible', async () => {
    const { wrapper } = await mountAt('/')
    expect(wrapper.findAll('.kpi-card')).toHaveLength(4)
    expect(wrapper.findAll('.audit-activity__table tbody tr')).toHaveLength(4)
    expect(wrapper.findAll('.audit-activity__card')).toHaveLength(4)
    // Graphique : SVG décoratif, information portée par la légende et le tableau.
    expect(wrapper.get('.activity-chart__svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.activity-chart svg[role="img"]').exists()).toBe(false)
    expect(wrapper.get('.activity-chart figcaption').text()).toContain('valeurs fictives')
    expect(wrapper.findAll('.activity-chart__table tbody tr')).toHaveLength(12)
    expect(wrapper.text()).toContain('Affichage de 4 événements simulés')
  })

  it('rejoue un chargement simulé (squelettes, aria-busy) sans requête', async () => {
    vi.useFakeTimers()
    const { wrapper } = await mountAt('/')
    const button = wrapper.get('button[aria-label="Rejouer le chargement simulé"]')
    await button.trigger('click')
    expect(wrapper.find('[data-state="loading"]').exists()).toBe(true)
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
    expect(button.attributes('aria-disabled')).toBe('true')
    vi.advanceTimersByTime(1000)
    await flushPromises()
    expect(wrapper.find('[data-state="loading"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Activité simulée rechargée')
  })
})

describe('États simulés', () => {
  it('rend les 6 états, chacun étiqueté « Simulation »', async () => {
    const { wrapper } = await mountAt('/etats')
    const states = wrapper.findAll('[data-state]').map((el) => el.attributes('data-state'))
    expect(states).toEqual(['normal', 'loading', 'empty', 'error', 'forbidden', 'expired'])
    wrapper.findAll('[data-state]').forEach((panel) => expect(panel.text()).toContain('Simulation'))
  })

  it('les états accès refusé et session expirée se déclarent illustratifs', async () => {
    const { wrapper } = await mountAt('/etats')
    expect(wrapper.get('[data-state="forbidden"]').text()).toContain("n'applique aucun contrôle d'accès")
    expect(wrapper.get('[data-state="expired"]').text()).toContain('Aucune session réelle')
  })

  it("l'alerte d'erreur se ferme puis se réaffiche, avec annonce", async () => {
    const { wrapper } = await mountAt('/etats')
    await wrapper.get('button[aria-label="Fermer l\'alerte"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('.inline-alert').exists()).toBe(false)
    expect(document.activeElement?.textContent).toContain("Réafficher l'alerte simulée")
    await wrapper.get('[data-state="error"] button').trigger('click')
    expect(wrapper.find('.inline-alert').exists()).toBe(true)
  })
})

describe('Emplacements réservés', () => {
  it.each(['/utilisateurs', '/audit', '/notifications', '/securite'])('%s : placeholder sans formulaire', async (path) => {
    const { wrapper } = await mountAt(path)
    const main = wrapper.get('main')
    expect(main.find('[data-placeholder="true"]').exists()).toBe(true)
    expect(main.text()).toContain('Emplacement réservé')
    expect(main.findAll('form, input, select, textarea')).toHaveLength(0)
  })

  it.each(['/connexion', '/mfa/enrolement', '/mfa/verification', '/mfa/recuperation', '/reauthentification'])(
    '%s : écran FE-02 hors shell, sans donnée financière',
    async (path) => {
      const { wrapper } = await mountAt(path)
      const main = wrapper.get('main')
      expect(main.find('h1#admin-page-title').exists()).toBe(true)
      expect(wrapper.find('.admin-shell').exists()).toBe(false)
      expect(wrapper.text()).not.toMatch(/FCFA|XOF|€|\$|solde|iban/i)
      // Aucun secret reel ne peut etre pret-rempli dans un champ.
      expect(wrapper.html()).not.toMatch(/type=["']password["'][^>]*value=["'][^"']+["']/)
    },
  )
})
