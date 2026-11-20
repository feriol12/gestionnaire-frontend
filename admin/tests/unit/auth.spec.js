// FE-02 — Tests unitaires des parcours d'authentification simules.
// Toutes les assertions sont locales : aucun appel réel, aucun stockage.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountAt } from './helpers.js'
import { useAuthSimulation, resetAuthSimulation } from '@admin/composables/useAuthSimulation.js'
import { DEMO_ADMIN, DEMO_RECOVERY_CODES, DEMO_TOTP } from '@admin/mocks/auth.js'

const auth = useAuthSimulation()

async function settle(ms = 600) {
  await new Promise((resolve) => setTimeout(resolve, ms))
  await flushPromises()
}

// Sous faux timers, settle() attendrait un vrai setTimeout et bloquerait :
// cette variante avance le temps simule de la latence des submit() FE-02.
async function advanceSubmit(ms = 120) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}

const FIXED_TIME = new Date('2026-11-20T12:00:00Z')

// jsdom cree ses propres intervalles de rendu : on identifie uniquement
// ceux du composable FE-02 pour prouver le partage et le nettoyage.
function trackClockIntervals() {
  const realSetInterval = globalThis.setInterval
  const realClearInterval = globalThis.clearInterval
  const created = []
  const cleared = []
  vi.spyOn(globalThis, 'setInterval').mockImplementation((...args) => {
    const id = realSetInterval(...args)
    if (new Error().stack?.includes('useAuthSimulation.js')) created.push(id)
    return id
  })
  vi.spyOn(globalThis, 'clearInterval').mockImplementation((id) => {
    cleared.push(id)
    return realClearInterval(id)
  })
  return {
    active: () => created.filter((id) => !cleared.includes(id)).length,
    createdCount: () => created.length,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

async function loginWith(wrapper, email = DEMO_ADMIN.email, password = 'fictional-demo-password') {
  await wrapper.find('input[type="email"]').setValue(email)
  await wrapper.find('input[type="password"]').setValue(password)
  await wrapper.find('form').trigger('submit')
  await settle()
}

async function completeEnrollment() {
  resetAuthSimulation()
  auth.state.scenario = 'enrollment'
  expect(auth.login(DEMO_ADMIN.email, 'fictional-demo-password').ok).toBe(true)
  expect(auth.submitTotp(DEMO_TOTP.code, { enrollment: true }).ok).toBe(true)
  auth.state.scenario = 'nominal'
}

beforeEach(() => {
  resetAuthSimulation()
})

describe('FE-02 — Connexion Super Admin', () => {
  it('affiche un h1 accessible, les champs et le selecteur de scenario', async () => {
    const { wrapper } = await mountAt('/connexion')
    const title = wrapper.find('#admin-page-title')
    expect(title.exists()).toBe(true)
    expect(title.attributes('tabindex')).toBe('-1')
    expect(wrapper.text()).toContain('Connexion Super Admin')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.findAll('option').length).toBeGreaterThan(5)
    wrapper.unmount()
  })

  it('masque et affiche le mot de passe en conservant le focus', async () => {
    const { wrapper } = await mountAt('/connexion')
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    const toggle = wrapper.get('button[aria-label="Afficher le mot de passe"]')
    await toggle.trigger('click')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-pressed="true"]').exists()).toBe(true)
    await wrapper.get('button[aria-label="Masquer le mot de passe"]').trigger('click')
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('refuse des champs vides avec un 422', async () => {
    const { wrapper } = await mountAt('/connexion')
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(auth.state.lastError?.code).toBe('422')
    expect(wrapper.text()).toContain('Donnees invalides')
    wrapper.unmount()
  })

  it.each([
    ['wrong-password', '401'],
    ['forbidden', '403'],
    ['csrf', '419'],
    ['throttled', '429'],
  ])('affiche le code %s sous la forme %s', async (scenario, code) => {
    auth.state.scenario = scenario
    const { wrapper } = await mountAt('/connexion')
    await loginWith(wrapper)
    expect(auth.state.lastError?.code).toBe(code)
    expect(wrapper.text()).toContain(`Erreur ${code}`)
    expect(wrapper.vm.$route.name).toBe('auth-login')
    wrapper.unmount()
  })

  // FE02-1 — comparaison explicite des identifiants aux fixtures.
  it('refuse un mot de passe errone sans scénario forcé', async () => {
    const result = auth.login(DEMO_ADMIN.email, 'not-the-demo-password')
    expect(result.ok).toBe(false)
    expect(result.code).toBe('401')
    expect(auth.state.phase).toBe('anonymous')
    expect(auth.state.attempts).toBe(1)
    expect(result.message).not.toContain('not-the-demo-password')
  })

  it('refuse une adresse inconnue', async () => {
    const result = auth.login('someone@example.test', DEMO_ADMIN.password)
    expect(result.ok).toBe(false)
    expect(result.code).toBe('401')
    expect(auth.state.phase).toBe('anonymous')
  })

  it('accepte exactement l’adresse et le mot de passe des fixtures', async () => {
    const result = auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    expect(result.ok).toBe(true)
    expect(auth.state.phase).toBe('mfa_required')
    // Le mot de passe n'est recopie ni dans l'etat, ni dans le message.
    expect(JSON.stringify(auth.state)).not.toContain(DEMO_ADMIN.password)
    expect(auth.state.notice).not.toContain(DEMO_ADMIN.password)
  })

  it('affiche une 401 et reste sur la connexion avec un mauvais mot de passe', async () => {
    const { wrapper, router } = await mountAt('/connexion')
    await loginWith(wrapper, DEMO_ADMIN.email, 'not-the-demo-password')
    expect(auth.state.lastError?.code).toBe('401')
    expect(wrapper.text()).toContain('Erreur 401')
    expect(router.currentRoute.value.name).toBe('auth-login')
    expect(wrapper.html()).not.toContain('not-the-demo-password')
    wrapper.unmount()
  })

  it('envoie vers le challenge MFA apres un mot de passe accepte', async () => {
    const { wrapper, router } = await mountAt('/connexion')
    await loginWith(wrapper)
    expect(auth.state.phase).toBe('mfa_required')
    expect(router.currentRoute.value.name).toBe('auth-mfa-verify')
    wrapper.unmount()
  })

  it('envoie vers l’enrolement pour un premier accès', async () => {
    auth.state.scenario = 'enrollment'
    const { wrapper, router } = await mountAt('/connexion')
    await loginWith(wrapper)
    expect(router.currentRoute.value.name).toBe('auth-mfa-enrollment')
    wrapper.unmount()
  })
})

describe('FE-02 — Enrolement TOTP et codes', () => {
  it('affiche une illustration non scannable et une cle fictive', async () => {
    const { wrapper } = await mountAt('/mfa/enrolement')
    expect(wrapper.text()).toContain('non scannable')
    expect(wrapper.text()).toContain('DEMO4FAKE4KEY4NOT4REAL')
    expect(wrapper.find('svg[role="img"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('refuse un TOTP invalide (401) puis accepte le code fictif', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, 'fictional-demo-password')
    const { wrapper } = await mountAt('/mfa/enrolement')
    await wrapper.find('input[inputmode="numeric"]').setValue('000000')
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(auth.state.lastError?.code).toBe('401')
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(auth.state.phase).toBe('authenticated')
    expect(wrapper.findAll('.fe02-enroll__codes li').length).toBe(10)
    wrapper.unmount()
  })

  // FE02-3 — les codes ne réapparaissent pas après confirmation.
  it('supprime les codes après confirmation et interdit un second affichage', async () => {
    await completeEnrollment()
    const first = await mountAt('/mfa/enrolement')
    expect(first.wrapper.findAll('.fe02-enroll__codes li').length).toBe(10)
    const confirm = first.wrapper.findAll('button').find((button) => button.text().includes('Je confirme'))
    await confirm.trigger('click')
    await flushPromises()
    expect(auth.state.codesConfirmed).toBe(true)
    expect(auth.state.recoveryCodes).toEqual([])

    // Retour explicite sur l'écran : ni codes, ni formulaire d'enrôlement.
    const second = await mountAt('/mfa/enrolement')
    expect(second.wrapper.findAll('.fe02-enroll__codes li').length).toBe(0)
    expect(second.wrapper.find('input[inputmode="numeric"]').exists()).toBe(false)
    expect(second.wrapper.text()).toContain('Codes deja confirmes')
    first.wrapper.unmount()
    second.wrapper.unmount()
  })

  it('exige la confirmation de conservation avant de quitter', async () => {
    await completeEnrollment()
    const { wrapper, router } = await mountAt('/mfa/enrolement')
    const confirm = wrapper.findAll('button').find((button) => button.text().includes('Je confirme'))
    expect(auth.state.codesConfirmed).toBe(false)
    await confirm.trigger('click')
    await flushPromises()
    expect(auth.state.codesConfirmed).toBe(true)
    expect(router.currentRoute.value.name).toBe('dashboard')
    wrapper.unmount()
  })
})

describe('FE-02 — Challenge MFA', () => {
  it('refuse un code invalide et affiche le compteur de tentatives', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, 'fictional-demo-password')
    const { wrapper } = await mountAt('/mfa/verification')
    await wrapper.find('input[inputmode="numeric"]').setValue('999999')
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(auth.state.lastError?.code).toBe('401')
    expect(wrapper.text()).toContain('tentatives')
    wrapper.unmount()
  })

  // FE02-2 — comptabilité des tentatives et blocage simulé cohérent.
  it('compte chaque échec TOTP et bloque à la limite annoncée', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    for (let expected = 1; expected <= 5; expected += 1) {
      const attempt = auth.submitTotp('000000')
      expect(attempt.ok).toBe(false)
      expect(attempt.code).toBe('401')
      expect(auth.state.attempts).toBe(expected)
    }
    const blocked = auth.submitTotp(DEMO_TOTP.code)
    expect(blocked.ok).toBe(false)
    expect(blocked.code).toBe('429')
    expect(blocked.message).toContain('Limite de 5 tentatives atteinte')
    expect(auth.state.phase).toBe('mfa_required')
  })

  it('réinitialise le compteur après un code valide avant la limite', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    expect(auth.submitTotp('111111').ok).toBe(false)
    expect(auth.submitTotp('222222').ok).toBe(false)
    expect(auth.state.attempts).toBe(2)
    expect(auth.submitTotp(DEMO_TOTP.code).ok).toBe(true)
    expect(auth.state.attempts).toBe(0)
    expect(auth.state.phase).toBe('authenticated')
  })

  it('affiche le compteur et le message de limite dans l’écran de challenge', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    const { wrapper } = await mountAt('/mfa/verification')
    for (let i = 0; i < 5; i += 1) {
      await wrapper.find('input[inputmode="numeric"]').setValue('000000')
      await wrapper.find('form').trigger('submit')
      await settle()
    }
    expect(wrapper.text()).toContain('5 / 5')
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(wrapper.text()).toContain('Limite de 5 tentatives atteinte')
    wrapper.unmount()
  })

  it('detecte un challenge expire (300 s)', async () => {
    resetAuthSimulation()
    auth.state.scenario = 'expired'
    auth.login(DEMO_ADMIN.email, 'fictional-demo-password')
    const { wrapper } = await mountAt('/mfa/verification')
    expect(wrapper.text()).toContain('Challenge expire')
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(auth.state.lastError?.code).toBe('expired')
    wrapper.unmount()
  })

  it('accepte un TOTP valide et ouvre la reauthentification', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, 'fictional-demo-password')
    const { wrapper, router } = await mountAt('/mfa/verification')
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(auth.state.phase).toBe('authenticated')
    expect(router.currentRoute.value.name).toBe('auth-reauth')
    wrapper.unmount()
  })
})

describe('FE-02 — Recuperation et regles GOV-06', () => {
  async function mountRecovery() {
    return mountAt('/mfa/recuperation')
  }

  it('consomme un code une seule fois et force le reenrolement', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, 'fictional-demo-password')
    expect(auth.state.recoveryCodes.length).toBe(10)
    const { wrapper, router } = await mountRecovery()
    await wrapper.find('input').setValue(DEMO_RECOVERY_CODES[0])
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(router.currentRoute.value.name).toBe('auth-mfa-enrollment')
    expect(auth.state.phase).toBe('recovery_required')
    expect(auth.state.recoveryCodes).toEqual([])
    expect(auth.state.totpInvalidated).toBe(true)
    expect(auth.consumeRecoveryCode(DEMO_RECOVERY_CODES[0]).ok).toBe(false)
    wrapper.unmount()
  })

  it('invalide tous les anciens codes apres recuperation', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, 'fictional-demo-password')
    expect(auth.consumeRecoveryCode(DEMO_RECOVERY_CODES[3]).ok).toBe(true)
    expect(auth.consumeRecoveryCode(DEMO_RECOVERY_CODES[4]).ok).toBe(false)
    expect(auth.submitTotp(DEMO_TOTP.code, { enrollment: true }).ok).toBe(true)
    expect(auth.state.recoveryCodes.length).toBe(10)
    expect(auth.state.totpInvalidated).toBe(false)
  })

  it('interdit toute recuperation web apres perte simultanee TOTP et codes', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, 'fictional-demo-password')
    auth.state.recoveryCodes = []
    const { wrapper } = await mountRecovery()
    expect(wrapper.text()).toContain('Aucune recuperation web possible')
    expect(wrapper.text()).toContain('GOV-06')
    expect(wrapper.html()).not.toMatch(/mailto:/i)
    expect(auth.consumeRecoveryCode(DEMO_RECOVERY_CODES[0]).ok).toBe(false)
    wrapper.unmount()
  })

  it('n’ouvre jamais de session complete avant reenrolement', async () => {
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, 'fictional-demo-password')
    expect(auth.consumeRecoveryCode(DEMO_RECOVERY_CODES[0]).ok).toBe(true)
    expect(auth.state.phase).toBe('recovery_required')
    expect(auth.state.freshUntil).toBeNull()
    expect(auth.reauthenticate('fictional-demo-password', DEMO_TOTP.code).ok).toBe(false)
  })
})

describe('FE-02 — Reauthentification et deconnexion', () => {
  it('represente la fenetre de fraicheur de 300 secondes', async () => {
    await completeEnrollment()
    const { wrapper } = await mountAt('/reauthentification')
    expect(wrapper.text()).toContain('300 secondes')
    wrapper.unmount()
  })

  it('reussit avec mot de passe et TOTP fictifs', async () => {
    await completeEnrollment()
    const { wrapper } = await mountAt('/reauthentification')
    await wrapper.find('input[type="password"]').setValue('fictional-demo-password')
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(wrapper.text()).toContain('Reauthentification reussie')
    expect(auth.state.freshUntil).not.toBeNull()
    wrapper.unmount()
  })

  // FE02-4 — non-rejeu du code fixe de démonstration.
  it('accepte un premier usage puis refuse le rejeu du même code', async () => {
    await completeEnrollment()
    const first = auth.reauthenticate(DEMO_ADMIN.password, DEMO_TOTP.code)
    expect(first.ok).toBe(true)
    const freshUntil = auth.state.freshUntil
    const replay = auth.reauthenticate(DEMO_ADMIN.password, DEMO_TOTP.code)
    expect(replay.ok).toBe(false)
    expect(replay.code).toBe('401')
    expect(replay.message).toContain('deja ete utilise')
    expect(auth.state.freshUntil).toBe(freshUntil)
  })

  it('autorise à nouveau la réauthentification après un nouvel enrôlement', async () => {
    await completeEnrollment()
    expect(auth.reauthenticate(DEMO_ADMIN.password, DEMO_TOTP.code).ok).toBe(true)
    expect(auth.state.reauthOtpUsed).toBe(true)
    await completeEnrollment()
    expect(auth.state.reauthOtpUsed).toBe(false)
    expect(auth.reauthenticate(DEMO_ADMIN.password, DEMO_TOTP.code).ok).toBe(true)
  })

  it('signale le rejeu dans l’écran après remontage', async () => {
    await completeEnrollment()
    const first = await mountAt('/reauthentification')
    await first.wrapper.find('input[type="password"]').setValue(DEMO_ADMIN.password)
    await first.wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await first.wrapper.find('form').trigger('submit')
    await settle()
    expect(first.wrapper.text()).toContain('Reauthentification reussie')

    const second = await mountAt('/reauthentification')
    await second.wrapper.find('input[type="password"]').setValue(DEMO_ADMIN.password)
    await second.wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await second.wrapper.find('form').trigger('submit')
    await settle()
    expect(second.wrapper.text()).toContain('deja ete utilise')
    first.wrapper.unmount()
    second.wrapper.unmount()
  })

  it.each([
    ['wrong-password', '401'],
    ['csrf', '419'],
    ['expired', 'expired'],
  ])('signale %s (%s) lors de la reauthentification', async (scenario, code) => {
    await completeEnrollment()
    auth.state.scenario = scenario
    const { wrapper } = await mountAt('/reauthentification')
    await wrapper.find('input[type="password"]').setValue('fictional-demo-password')
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(wrapper.text()).toContain(code === 'expired' ? 'expire' : `Erreur ${code}`)
    wrapper.unmount()
  })

  it('efface l’etat temporaire a la deconnexion et revient a la connexion', async () => {
    await completeEnrollment()
    const { wrapper, router } = await mountAt('/reauthentification')
    const logout = wrapper.findAll('button').find((button) => button.text().includes('Deconnexion'))
    expect(logout).toBeDefined()
    await logout.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('auth-login')
    expect(auth.state.phase).toBe('logged_out')
    expect(auth.state.email).toBe('')
    expect(auth.state.recoveryCodes).toEqual([])
    expect(auth.state.freshUntil).toBeNull()
    wrapper.unmount()
  })
})

describe('FE-02 — Confinement des secrets', () => {
  it('ne journalise ni ne stocke durablement le mot de passe saisi', async () => {
    const password = 'fictional-demo-password'
    const logs = [vi.spyOn(console, 'log'), vi.spyOn(console, 'info'), vi.spyOn(console, 'error')]
    const writes = vi.spyOn(Storage.prototype, 'setItem')

    const { wrapper, router } = await mountAt('/connexion')
    await loginWith(wrapper)
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await settle()
    await router.push({ name: 'auth-login' })
    await flushPromises()

    expect(writes).not.toHaveBeenCalled()
    for (const spy of logs) expect(spy).not.toHaveBeenCalled()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    expect(document.cookie).toBe('')
    expect(wrapper.html()).not.toContain(password)
    wrapper.unmount()
  })
})

describe('FE-02 — Décompte automatique (T1-T7)', () => {
  it('T1 : le challenge décroît chaque seconde sans interaction', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    await flushPromises()
    const { wrapper } = await mountAt('/mfa/verification')
    await flushPromises()
    expect(wrapper.text()).toContain('Challenge valable 300 s')
    for (let i = 0; i < 5; i += 1) {
      await vi.advanceTimersByTimeAsync(1000)
      await flushPromises()
    }
    expect(wrapper.text()).toContain('Challenge valable 295 s')
    wrapper.unmount()
  })

  it('T2 : zéro et bannière d’expiration apparaissent sans clic', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    await flushPromises()
    const { wrapper } = await mountAt('/mfa/verification')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(300_000)
    await flushPromises()
    expect(wrapper.text()).toContain('Challenge valable 0 s')
    expect(wrapper.text()).toContain('Challenge expire')
    wrapper.unmount()
  })

  it('T3 : la soumission après expiration est refusée sans consommer de tentative', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    await flushPromises()
    const { wrapper } = await mountAt('/mfa/verification')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(300_000)
    await flushPromises()
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await advanceSubmit()
    expect(auth.state.lastError?.code).toBe('expired')
    expect(auth.state.attempts).toBe(0)
    expect(wrapper.vm.$route.name).toBe('auth-mfa-verify')
    wrapper.unmount()
  })

  it('T4 : un seul intervalle pour plusieurs consommateurs, arrêté au démontage et au logout', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    const clock = trackClockIntervals()
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    await flushPromises()
    const first = await mountAt('/mfa/verification')
    const second = await mountAt('/mfa/verification')
    await flushPromises()
    // Deux composants (vue + layout) ne partagent qu'un seul intervalle.
    expect(clock.createdCount()).toBe(1)
    expect(clock.active()).toBe(1)
    first.wrapper.unmount()
    await flushPromises()
    expect(clock.active()).toBe(1)
    auth.logout()
    await flushPromises()
    expect(clock.active()).toBe(0)
    second.wrapper.unmount()
    await flushPromises()
    expect(clock.active()).toBe(0)
    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()
    expect(clock.active()).toBe(0)
  })

  it('T5 : fraîcheur décroissante, zéro affiché puis renouvellement', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    await completeEnrollment()
    const { wrapper } = await mountAt('/reauthentification')
    await flushPromises()
    expect(wrapper.text()).toContain('300 s')
    await vi.advanceTimersByTimeAsync(120_000)
    await flushPromises()
    expect(wrapper.text()).toContain('180 s')
    await vi.advanceTimersByTimeAsync(180_000)
    await flushPromises()
    expect(wrapper.text()).toMatch(/\b0 s\b/)
    await wrapper.find('input[type="password"]').setValue(DEMO_ADMIN.password)
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await advanceSubmit()
    expect(wrapper.text()).toContain('Reauthentification reussie')
    expect(wrapper.text()).toContain('300 s')
    wrapper.unmount()
  })

  it('T6 : enrôlement décompté puis arrêt de l’horloge après confirmation', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    const clock = trackClockIntervals()
    resetAuthSimulation()
    auth.state.scenario = 'enrollment'
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    await flushPromises()
    const { wrapper, router } = await mountAt('/mfa/enrolement')
    await flushPromises()
    expect(clock.active()).toBe(1)
    expect(wrapper.text()).toContain('Challenge valable 300 s')
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()
    expect(wrapper.text()).toContain('Challenge valable 299 s')
    await wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await wrapper.find('form').trigger('submit')
    await advanceSubmit()
    expect(clock.active()).toBe(1)
    expect(wrapper.findAll('.fe02-enroll__codes li').length).toBe(10)
    const confirm = wrapper.findAll('button').find((button) => button.text().includes('Je confirme'))
    await confirm.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(clock.active()).toBe(0)
    wrapper.unmount()
  })

  it('T7 : l’API publique de useAuthSimulation est préservée', () => {
    expect(Object.keys(auth).sort()).toEqual(
      [
        'state',
        'challengeSeconds',
        'freshnessSeconds',
        'canRecoverWeb',
        'errorMessage',
        'isExpired',
        'login',
        'submitTotp',
        'consumeRecoveryCode',
        'reauthenticate',
        'confirmCodes',
        'logout',
        'resetAuthSimulation',
      ].sort(),
    )
  })

  // R2 — le dernier démontage doit arrêter l'horloge sans effacer d'échéance.
  it('T4b : démontage du dernier consommateur avec échéance encore active', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    const clock = trackClockIntervals()
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    await flushPromises()
    const deadline = auth.state.challengeExpiresAt
    expect(deadline).toBeGreaterThan(Date.now())
    const { wrapper } = await mountAt('/mfa/verification')
    await flushPromises()
    expect(clock.active()).toBe(1)

    // Aucun logout, aucun reset : seul le composant disparaît.
    wrapper.unmount()
    await flushPromises()
    expect(auth.state.challengeExpiresAt).toBe(deadline)
    expect(auth.state.challengeExpiresAt).toBeGreaterThan(Date.now())
    expect(clock.active()).toBe(0)
    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()
    expect(clock.active()).toBe(0)
  })

  it('T4b-variante : deux consommateurs partagés puis démontés un par un', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    const clock = trackClockIntervals()
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    await flushPromises()
    const deadline = auth.state.challengeExpiresAt
    const first = await mountAt('/mfa/verification')
    const second = await mountAt('/mfa/verification')
    await flushPromises()
    expect(clock.createdCount()).toBe(1)
    expect(clock.active()).toBe(1)
    first.wrapper.unmount()
    await flushPromises()
    expect(auth.state.challengeExpiresAt).toBe(deadline)
    expect(clock.active()).toBe(1)
    second.wrapper.unmount()
    await flushPromises()
    expect(auth.state.challengeExpiresAt).toBe(deadline)
    expect(clock.active()).toBe(0)
  })

  // R1 — arrêt automatique à l'expiration, sans quitter l'écran.
  it('T8 : l’horloge s’arrête à l’expiration du challenge', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    const clock = trackClockIntervals()
    resetAuthSimulation()
    auth.login(DEMO_ADMIN.email, DEMO_ADMIN.password)
    await flushPromises()
    const { wrapper } = await mountAt('/mfa/verification')
    await flushPromises()
    expect(clock.active()).toBe(1)
    await vi.advanceTimersByTimeAsync(300_000)
    await flushPromises()
    expect(wrapper.text()).toContain('Challenge valable 0 s')
    expect(wrapper.text()).toContain('Challenge expire')
    // Écran toujours monté, échéance toujours dans l'état : seul le timer s'arrête.
    expect(auth.state.challengeExpiresAt).not.toBeNull()
    expect(auth.isExpired()).toBe(true)
    expect(clock.active()).toBe(0)
    await vi.advanceTimersByTimeAsync(5000)
    await flushPromises()
    expect(clock.active()).toBe(0)
    wrapper.unmount()
  })

  it('T9 : transitions challenge/freshness sans double intervalle', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_TIME)
    const clock = trackClockIntervals()

    // a) expiration de la fraîcheur puis réauthentification réussie.
    await completeEnrollment()
    const fresh = await mountAt('/reauthentification')
    await flushPromises()
    expect(clock.active()).toBe(1)
    await vi.advanceTimersByTimeAsync(300_000)
    await flushPromises()
    expect(fresh.wrapper.text()).toMatch(/\b0 s\b/)
    expect(clock.active()).toBe(0)
    expect(auth.state.freshUntil).not.toBeNull()

    await fresh.wrapper.find('input[type="password"]').setValue(DEMO_ADMIN.password)
    await fresh.wrapper.find('input[inputmode="numeric"]').setValue(DEMO_TOTP.code)
    await fresh.wrapper.find('form').trigger('submit')
    await advanceSubmit()
    expect(fresh.wrapper.text()).toContain('Reauthentification reussie')
    // Un seul intervalle actif, même après redémarrage suite au renouvellement.
    expect(clock.active()).toBe(1)
    expect(fresh.wrapper.text()).toContain('300 s')
    fresh.wrapper.unmount()
    await flushPromises()
    expect(clock.active()).toBe(0)

    // b) challenge expiré + fraîcheur future : l'horloge doit rester active.
    resetAuthSimulation()
    const current = Date.now()
    auth.state.phase = 'authenticated'
    auth.state.challengeExpiresAt = current - 1000
    auth.state.freshUntil = current + 300_000
    await flushPromises()
    const mixed = await mountAt('/reauthentification')
    await flushPromises()
    expect(clock.active()).toBe(1)
    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()
    expect(auth.isExpired()).toBe(true)
    expect(clock.active()).toBe(1) // jamais deux intervalles simultanés
    mixed.wrapper.unmount()
    await flushPromises()
    expect(clock.active()).toBe(0)
  })
})
