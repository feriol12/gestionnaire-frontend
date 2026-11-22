import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { mountAt } from './helpers.js'
import * as transitions from '@admin/mocks/status-transitions.js'
import { demoUsers } from '@admin/mocks/users.js'

enableAutoUnmount(afterEach)
beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  expect(localStorage.length).toBe(0)
  expect(sessionStorage.length).toBe(0)
  expect(document.cookie).toBe('')
  vi.useRealTimers()
})
const path = (id = 1001, action = 'suspension') => `/utilisateurs/${id}/${action}-simulee`
async function advance(ms = 200) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}
async function ready(url = path()) {
  const app = await mountAt(url)
  await advance()
  return app
}
async function fill(wrapper, email = 'compte.demo.1@example.test', reason = 'Motif fictif') {
  const inputs = wrapper.findAll('.fe-status-form input')
  await inputs[0].setValue(reason)
  await inputs[1].setValue(email)
}
async function review(wrapper, email) {
  await fill(wrapper, email)
  await wrapper.get('.fe-status-form').trigger('submit')
}
const phase = (wrapper) =>
  wrapper.get('[data-transition-state]').attributes('data-transition-state')
const click = (wrapper, label) =>
  wrapper
    .findAll('button')
    .find((b) => b.text() === label)
    .trigger('click')

describe('FE-05 contrat fictif', () => {
  it('allowlist administrative, fixtures figées et indépendantes de FE-04', () => {
    expect(Object.isFrozen(transitions.statusTargets)).toBe(true)
    for (const user of transitions.statusTargets) {
      expect(Object.isFrozen(user)).toBe(true)
      expect(
        Object.keys(user).every((k) =>
          ['id', 'nom', 'email', 'created_at', 'administrative_status'].includes(k),
        ),
      ).toBe(true)
      if (user.email) expect(user.email).toMatch(/@example\.test$/)
    }
    expect(JSON.stringify(transitions.statusTargets)).not.toMatch(
      /FCFA|XOF|€|montant|solde|budget|dépense|amount|balance|iban/i,
    )
    expect(demoUsers.every((u) => !Object.hasOwn(u, 'administrative_status'))).toBe(true)
  })
  it.each([
    '',
    ' ',
    'COMPTE.demo.1@example.test',
    'compte.demo.1@example.test ',
    'autre@example.test',
  ])('email exact rejeté : %j', (email) => {
    expect(
      transitions.validateTransition(transitions.statusTargets[0], 'motif', email).email,
    ).not.toBe('')
  })
  it.each(['', ' ', '\n\t'])('motif blanc rejeté : %j', (reason) => {
    expect(
      transitions.validateTransition(
        transitions.statusTargets[0],
        reason,
        'compte.demo.1@example.test',
      ).reason,
    ).not.toBe('')
  })
  it('transitions redondantes, inconnues ou incomplètes sans effet', () => {
    const [active, suspended, missing] = transitions.statusTargets
    expect(transitions.simulateTransition(active, 'reactivate', 'success')).toEqual({
      error: '409',
    })
    expect(transitions.simulateTransition(suspended, 'suspend', 'success')).toEqual({
      error: '409',
    })
    expect(transitions.simulateTransition(null, 'suspend', 'success')).toEqual({ error: '404' })
    expect(transitions.simulateTransition(missing, 'suspend', 'success')).toEqual({ error: '422' })
    expect(transitions.simulateTransition(active, 'unknown', 'success')).toEqual({ error: '422' })
  })
})

describe('FE-05 parcours de simulation', () => {
  it('chargement puis validation liée aux champs, focus sur la première erreur', async () => {
    const { wrapper } = await mountAt(path())
    expect(phase(wrapper)).toBe('loading')
    await advance()
    await wrapper.get('.fe-status-form').trigger('submit')
    expect(phase(wrapper)).toBe('form')
    expect(wrapper.findAll('[aria-invalid="true"]')).toHaveLength(2)
    expect(document.activeElement).toBe(wrapper.get('.fe-status-form input').element)
  })
  it.each([
    [1001, 'suspension', 'suspended', '1'],
    [1002, 'reactivation', 'active', '2'],
  ])('confirmation et succès %s %s sans mutation', async (id, action, status, emailId) => {
    const simulate = vi.spyOn(transitions, 'simulateTransition')
    const before = JSON.stringify(transitions.statusTargets)
    const { wrapper } = await ready(path(id, action))
    await review(wrapper, `compte.demo.${emailId}@example.test`)
    expect(phase(wrapper)).toBe('confirm')
    expect(document.activeElement.id).toBe('fe-status-confirm')
    expect(simulate).not.toHaveBeenCalled()
    await click(wrapper, 'Confirmer la simulation')
    await click(wrapper, 'Confirmer la simulation')
    expect(phase(wrapper)).toBe('pending')
    await advance(650)
    expect(simulate).toHaveBeenCalledTimes(1)
    expect(phase(wrapper)).toBe('success')
    expect(wrapper.get('.fe-status-result').text()).toContain(status)
    expect(document.activeElement.id).toBe('fe-status-outcome')
    expect(JSON.stringify(transitions.statusTargets)).toBe(before)
    expect(wrapper.html()).not.toContain('Motif fictif')
    await click(wrapper, 'Reprendre le formulaire fictif')
    expect(wrapper.get('.fe-status-form input').element.value).toBe('')
  })
  it.each(['401', '403', '404', '409', '419', '422', '429', '500', '503', 'mfa'])(
    'erreur %s et reprise explicite',
    async (scenario) => {
      const { wrapper } = await ready()
      await wrapper.get('.fe-status-page select').setValue(scenario)
      await advance()
      await review(wrapper)
      await click(wrapper, 'Confirmer la simulation')
      await advance(650)
      expect(phase(wrapper)).toBe('error')
      expect(wrapper.get('[role="alert"]').text()).toBe(transitions.transitionErrors[scenario])
      if (scenario === 'mfa') expect(wrapper.text()).toContain('aucune protection réelle')
      await click(wrapper, 'Reprendre le formulaire fictif')
      expect(phase(wrapper)).toBe('form')
      expect(wrapper.findAll('.fe-status-form input').every((i) => i.element.value === '')).toBe(
        true,
      )
    },
  )
  it.each(['confirm', 'pending'])(
    'annulation depuis %s, effacement et aucun résultat tardif',
    async (stage) => {
      const simulate = vi.spyOn(transitions, 'simulateTransition')
      const { wrapper } = await ready()
      await review(wrapper)
      if (stage === 'pending') await click(wrapper, 'Confirmer la simulation')
      await click(wrapper, 'Annuler la simulation')
      await advance(1000)
      expect(phase(wrapper)).toBe('form')
      expect(simulate).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('Simulation annulée')
      expect(wrapper.get('.fe-status-form input').element.value).toBe('')
    },
  )
  it('chargement prolongé reste annulable', async () => {
    const { wrapper } = await ready()
    await wrapper.get('.fe-status-page select').setValue('loading')
    await advance()
    await review(wrapper)
    await click(wrapper, 'Confirmer la simulation')
    await advance(10000)
    expect(phase(wrapper)).toBe('pending')
    await click(wrapper, 'Annuler la simulation')
    expect(phase(wrapper)).toBe('form')
  })
  it.each([1031, 1032, 9999])('champs absents / cible inexistante : %s', async (id) => {
    const { wrapper } = await ready(path(id))
    expect(wrapper.find('.fe-status-form').exists()).toBe(false)
    expect(wrapper.text()).toContain(
      id === 9999 ? 'Utilisateur introuvable' : 'Confirmation indisponible',
    )
  })
  it('changement de cible et navigation interrompent la simulation et effacent le motif', async () => {
    const simulate = vi.spyOn(transitions, 'simulateTransition')
    const { wrapper, router } = await ready()
    await review(wrapper)
    await click(wrapper, 'Confirmer la simulation')
    await router.push(path(1002, 'reactivation'))
    await advance(1000)
    expect(simulate).not.toHaveBeenCalled()
    expect(phase(wrapper)).toBe('form')
    expect(wrapper.get('.fe-status-form input').element.value).toBe('')
    await review(wrapper, 'compte.demo.2@example.test')
    await click(wrapper, 'Confirmer la simulation')
    await router.push('/simulations/statuts')
    await advance(1000)
    expect(simulate).not.toHaveBeenCalled()
    await router.push(path())
    await advance()
    expect(wrapper.get('.fe-status-form input').element.value).toBe('')
  })
  it('la liste reprend seulement ses paramètres de consultation', async () => {
    const { wrapper, router } = await ready(path() + '?q=compte&page=2&per_page=5')
    await wrapper
      .findAll('a')
      .find((a) => a.text() === 'Retour aux utilisateurs')
      .trigger('click')
    await flushPromises()
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('users'))
    expect(router.currentRoute.value.query).toEqual({ q: 'compte', page: '2', per_page: '5' })
  })
})
