// FE-03 — Tableau de bord administratif non financier : données fictives,
// états simulés et confinement (aucun appel réel, aucun stockage).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountAt } from './helpers.js'
import * as dashboardMocks from '@admin/mocks/dashboard.js'
import {
  administrativeBreakdown,
  dashboardScenarios,
  registrationSeries,
  supervisionEvents,
} from '@admin/mocks/dashboard.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('FE-03 — données fictives', () => {
  it('restent figées et cohérentes avec le parc fictif', () => {
    expect(Object.isFrozen(administrativeBreakdown)).toBe(true)
    expect(Object.isFrozen(registrationSeries)).toBe(true)
    expect(Object.isFrozen(supervisionEvents)).toBe(true)
    expect(Object.isFrozen(dashboardScenarios)).toBe(true)
    const total = administrativeBreakdown.reduce((sum, item) => sum + item.value, 0)
    expect(total).toBe(dashboardMocks.kpis.find((kpi) => kpi.id === 'total').value)
  })

  it('ne contiennent ni donnée financière ni valeur réelle', () => {
    const serialized = JSON.stringify({
      administrativeBreakdown,
      registrationSeries,
      supervisionEvents,
      dashboardScenarios,
    })
    expect(serialized).not.toMatch(/FCFA|XOF|€|\$|montant|solde|budget|dépense|amount|balance|iban|transaction/i)
    expect(serialized).toContain('fictif')
    const emails = serialized.match(/[\w.+-]+@[\w.-]+/g) ?? []
    emails.forEach((email) => expect(email).toMatch(/@example\.test$/))
    administrativeBreakdown.forEach((item) => expect(item.definition.length).toBeGreaterThan(20))
  })
})

describe('FE-03 — tableau de bord', () => {
  it('affiche les indicateurs, la série et les événements fictifs', async () => {
    const { wrapper } = await mountAt('/')
    expect(wrapper.find('#fe03-title').exists()).toBe(true)
    expect(wrapper.findAll('.fe03-metrics__item')).toHaveLength(3)
    expect(wrapper.findAll('.fe03-trend tbody tr')).toHaveLength(7)
    expect(wrapper.findAll('.fe03-feed__item')).toHaveLength(3)
    expect(wrapper.text()).toContain('Inscriptions fictives sur sept jours')
    expect(wrapper.text()).toContain('Données fictives')
    wrapper.unmount()
  })

  it('expose quatre scénarios avec aria-pressed et gère l’état vide', async () => {
    const { wrapper } = await mountAt('/')
    const buttons = wrapper.findAll('.fe03__scenario')
    expect(buttons).toHaveLength(4)
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    await buttons[2].trigger('click')
    expect(buttons[2].attributes('aria-pressed')).toBe('true')
    expect(wrapper.text()).toContain('Aucun événement')
    expect(wrapper.findAll('.fe03-feed__item')).toHaveLength(0)
    wrapper.unmount()
  })

  it('affiche un chargement simulé avec aria-busy', async () => {
    const { wrapper } = await mountAt('/')
    const buttons = wrapper.findAll('.fe03__scenario')
    await buttons[1].trigger('click')
    expect(wrapper.find('[data-fe03-state="loading"]').exists()).toBe(true)
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Chargement simule')
    wrapper.unmount()
  })

  it('permet la reprise après une erreur simulée', async () => {
    vi.useFakeTimers()
    const { wrapper } = await mountAt('/')
    const buttons = wrapper.findAll('.fe03__scenario')
    await buttons[3].trigger('click')
    expect(wrapper.text()).toContain('Erreur simulee')
    await wrapper.get('.fe03-feed__retry').trigger('click')
    expect(wrapper.find('[data-fe03-state="loading"]').exists()).toBe(true)
    await vi.advanceTimersByTimeAsync(600)
    await flushPromises()
    expect(wrapper.findAll('.fe03-feed__item')).toHaveLength(3)
    expect(wrapper.text()).toContain('Reprise simulee')
    wrapper.unmount()
  })

  it('ne stocke ni ne journalise la démonstration', async () => {
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    const logs = vi.spyOn(console, 'log')
    const { wrapper } = await mountAt('/')
    for (const button of wrapper.findAll('.fe03__scenario')) await button.trigger('click')
    expect(writes).not.toHaveBeenCalled()
    expect(logs).not.toHaveBeenCalled()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    expect(document.cookie).toBe('')
    wrapper.unmount()
  })
})
