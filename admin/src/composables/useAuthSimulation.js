// FE-02 — Parcours d'authentification simule, exclusivement en memoire.
//
// Aucun appel reseau, aucun stockage durable, aucun secret reel. Le mot de
// passe saisi n'est jamais copie dans l'etat partage : il sert uniquement a
// la comparaison locale avec la fixture fictive, puis il est abandonne.
// L'etat est recreate a chaque chargement de module et efface a la
// deconnexion. Ce composable n'est PAS un controle d'acces : l'autorite
// reste cote serveur (BE-02).

import { computed, getCurrentScope, onScopeDispose, reactive, ref, watch } from 'vue'
import {
  CHALLENGE_TTL_MS,
  DEMO_ADMIN,
  DEMO_TOTP,
  ERROR_CATALOG,
  FRESHNESS_TTL_MS,
  MAX_IDENTITY_ATTEMPTS,
  MAX_IP_ATTEMPTS,
  demoSecretCodes,
} from '@admin/mocks/auth.js'

function blankState() {
  return {
    phase: 'anonymous',
    email: '',
    scenario: 'nominal',
    challengeExpiresAt: null,
    freshUntil: null,
    attempts: 0,
    recoveryCodes: [],
    recoveryConsumed: false,
    totpInvalidated: false,
    codesConfirmed: false,
    reauthOtpUsed: false,
    lastError: null,
    notice: '',
  }
}

const state = reactive(blankState())

// Horloge reactive partagee : Date.now() n'est pas reactif, donc les computed
// de décompte doivent dependre d'un tick. Un seul intervalle pour tous les
// consommateurs, demarre seulement quand une echeance est active.
const clockTick = ref(0)
let clockTimer = null
let clockUsers = 0

function hasCountdown() {
  // R1 : seules les echeances FUTURES justifient un intervalle. Une echeance
  // expiree reste dans l'etat (affichage "0 s", banniere) mais ne fait plus
  // tourner l'horloge. Date.now() brut evite de rendre le watch dependant du tick.
  const current = Date.now()
  return (
    (state.challengeExpiresAt !== null && state.challengeExpiresAt > current) ||
    (state.freshUntil !== null && state.freshUntil > current)
  )
}

function syncCountdownClock() {
  const needed = clockUsers > 0 && hasCountdown()
  if (needed && clockTimer === null) {
    clockTimer = setInterval(() => {
      clockTick.value += 1
      // Arret des que plus aucune echeance future ne subsiste. Les deux
      // echeances sont testees : une expiree n'arrete pas l'horloge si
      // l'autre est encore future (transitions challenge/freshness).
      syncCountdownClock()
    }, 1000)
  } else if (!needed && clockTimer !== null) {
    clearInterval(clockTimer)
    clockTimer = null
  }
}

function startCountdownClock() {
  clockUsers += 1
  syncCountdownClock()
}

function stopCountdownClock() {
  // Compteur de references jamais negatif, meme en cas d'arret redondant.
  clockUsers = Math.max(0, clockUsers - 1)
  syncCountdownClock()
}

// Des qu'une echeance est modifiee, l'horloge s'adapte. On surveille les
// timestamps eux-memes (et non le booleen derive) : apres expiration, le
// booleen reste faux mais un renouvellement doit redemarrer l'horloge.
watch(() => [state.challengeExpiresAt, state.freshUntil], syncCountdownClock, { flush: 'sync' })

function now() {
  // Le tick est une dependance reactive : il force le recalcul des computed
  // qui lisent now(), notamment a l'expiration sans interaction utilisateur.
  void clockTick.value
  return Date.now()
}

function errorMessage(code) {
  return ERROR_CATALOG[code] ?? ERROR_CATALOG[401]
}

function fail(code) {
  state.lastError = { code: String(code), message: errorMessage(code) }
  return { ok: false, code: String(code), message: errorMessage(code) }
}

function failWith(code, message) {
  const result = fail(code)
  state.lastError.message = message
  return { ...result, message }
}

function succeed(notice) {
  state.lastError = null
  state.notice = notice
  return { ok: true }
}

function isExpired() {
  // >= pour que l'etat "expire" coincide avec l'affichage "0 s".
  return state.challengeExpiresAt !== null && now() >= state.challengeExpiresAt
}

function scenarioFailure() {
  switch (state.scenario) {
    case 'wrong-password':
      return 401
    case 'forbidden':
      return 403
    case 'csrf':
      return 419
    case 'invalid':
      return 422
    case 'throttled':
      return 429
    case 'offline':
      return 'offline'
    default:
      return null
  }
}

function login(email, password) {
  const normalized = String(email ?? '').trim().toLowerCase()
  state.email = normalized

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || !String(password ?? '')) {
    return fail(422)
  }
  if (state.attempts >= MAX_IDENTITY_ATTEMPTS || state.attempts >= MAX_IP_ATTEMPTS) {
    return fail(429)
  }

  const forced = scenarioFailure()
  if (forced) {
    if (forced === 401 || forced === 429) state.attempts += 1
    return fail(forced)
  }
  if (normalized !== DEMO_ADMIN.email) {
    state.attempts += 1
    return fail(401)
  }
  // FE02-1 : le mot de passe saisi doit correspondre a la fixture fictive.
  // La comparaison est locale, sans journalisation ni copie dans l'etat.
  if (password !== DEMO_ADMIN.password) {
    state.attempts += 1
    return fail(401)
  }

  state.attempts = 0
  state.phase = state.scenario === 'enrollment' ? 'pending_enrollment' : 'mfa_required'
  // Un compte deja enrole possede des codes (fictifs) cote serveur dans BE-02 :
  // on les represente en memoire pour rendre le parcours de recuperation
  // demonstrable, sans jamais les ecrire dans un stockage durable.
  if (state.phase === 'mfa_required') state.recoveryCodes = demoSecretCodes()
  state.challengeExpiresAt = now() + CHALLENGE_TTL_MS
  if (state.scenario === 'expired') state.challengeExpiresAt = now() - 1
  return succeed('Mot de passe accepte (simulation). Aucune valeur conservee.')
}

function submitTotp(code, options = {}) {
  const enrollment = options.enrollment === true
  if (!['pending_enrollment', 'mfa_required', 'recovery_required'].includes(state.phase)) {
    return fail(403)
  }

  const digits = String(code ?? '').trim()
  if (!/^\d{6}$/.test(digits)) return fail(422)
  if (isExpired()) return fail('expired')

  const forced = scenarioFailure()
  if (forced) {
    // Seuls les refus d'authentification consomment une tentative.
    if (forced === 401 || forced === 429) state.attempts += 1
    return fail(forced)
  }
  if (state.attempts >= MAX_IDENTITY_ATTEMPTS) {
    return failWith(
      429,
      `Limite de ${MAX_IDENTITY_ATTEMPTS} tentatives atteinte : recommencez la connexion (simulation).`,
    )
  }
  // Apres recuperation, le nouveau secret doit pouvoir etre enrole :
  // l'ancien facteur reste invalide, mais le challenge d'enrolement est neuf.
  const reenrollment = enrollment || state.phase === 'recovery_required'
  if (digits !== DEMO_TOTP.code || (state.totpInvalidated && !reenrollment)) {
    // FE02-2 : chaque refus de code, y compris hors scenario force, est compte.
    state.attempts += 1
    const remaining = MAX_IDENTITY_ATTEMPTS - state.attempts
    return failWith(
      401,
      remaining > 0
        ? `Code TOTP invalide : ${remaining} tentative(s) restante(s) (simulation).`
        : `Limite de ${MAX_IDENTITY_ATTEMPTS} tentatives atteinte : recommencez la connexion (simulation).`,
    )
  }

  state.attempts = 0
  // Ordonnance pour eviter une extinction puis un redemarrage transitoire
  // de l'horloge partagee (hasCountdown ne doit jamais passer par false).
  state.freshUntil = now() + FRESHNESS_TTL_MS
  state.challengeExpiresAt = null
  state.phase = 'authenticated'
  state.totpInvalidated = false
  state.codesConfirmed = false
  state.reauthOtpUsed = false
  if (enrollment || state.recoveryConsumed) state.recoveryCodes = demoSecretCodes()
  const notice = state.recoveryConsumed
    ? 'Nouvel enrolement termine : anciens codes et ancien facteur invalides (simulation).'
    : 'Facteur TOTP confirme (simulation).'
  state.recoveryConsumed = false
  return succeed(notice)
}

function consumeRecoveryCode(code) {
  const value = String(code ?? '').trim()
  if (!value) return fail(422)
  if (!['mfa_required', 'pending_enrollment', 'recovery_required'].includes(state.phase)) {
    return fail(403)
  }

  const forced = scenarioFailure()
  if (forced) return fail(forced)

  if (!state.recoveryCodes.length) {
    const result = fail(401)
    state.lastError.message =
      'Aucun code de recuperation disponible : aucune recuperation web n’est possible (simulation).'
    return { ...result, exhausted: true }
  }
  if (!demoSecretCodes().includes(value) || !state.recoveryCodes.includes(value)) return fail(401)

  state.recoveryCodes = []
  state.totpInvalidated = true
  state.recoveryConsumed = true
  state.phase = 'recovery_required'
  state.challengeExpiresAt = now() + CHALLENGE_TTL_MS
  state.freshUntil = null
  return succeed('Code utilise une seule fois. Un nouvel enrolement MFA est obligatoire.')
}

function reauthenticate(password, code) {
  if (state.phase !== 'authenticated') return fail(403)
  const digits = String(code ?? '').trim()
  if (!String(password ?? '') || !/^\d{6}$/.test(digits)) return fail(422)

  const forced = scenarioFailure()
  if (forced) return fail(forced)
  if (state.scenario === 'expired') return fail('expired')
  if (state.totpInvalidated || digits !== DEMO_TOTP.code || password !== DEMO_ADMIN.password) {
    return fail(401)
  }
  // FE02-4 : simulation de non-rejeu du code fixe de demonstration.
  // Ce n'est PAS une protection TOTP serveur : l'etat est local et en memoire.
  if (state.reauthOtpUsed) {
    return failWith(401, 'Ce code TOTP de demonstration a deja ete utilise (rejeu refuse, simulation).')
  }

  state.reauthOtpUsed = true
  state.freshUntil = now() + FRESHNESS_TTL_MS
  return succeed('Reauthentification reussie : fenetre de fraicheur renouvelee (300 s simulees).')
}

function confirmCodes() {
  state.codesConfirmed = true
  // FE02-3 : apres confirmation, les codes ne sont plus detenus par la
  // simulation : un retour sur l'ecran ne peut pas les reafficher.
  state.recoveryCodes = []
  return succeed('Conservation des codes confirmee (simulation).')
}

function logout() {
  Object.assign(state, blankState())
  state.phase = 'logged_out'
  state.notice = 'Session simulee terminee : etat temporaire efface.'
  return succeed(state.notice)
}

export function resetAuthSimulation() {
  Object.assign(state, blankState())
}

const challengeSeconds = computed(() =>
  state.challengeExpiresAt === null ? 0 : Math.max(0, Math.ceil((state.challengeExpiresAt - now()) / 1000)),
)

const freshnessSeconds = computed(() =>
  state.freshUntil === null ? 0 : Math.max(0, Math.ceil((state.freshUntil - now()) / 1000)),
)

const canRecoverWeb = computed(() => state.recoveryCodes.length > 0)

export function useAuthSimulation() {
  // Un consommateur = un composant monte. Hors composant (tests directs du
  // composable), getCurrentScope() est null : aucun timer n'est cree.
  if (getCurrentScope()) {
    startCountdownClock()
    onScopeDispose(() => stopCountdownClock())
  }
  return {
    state,
    challengeSeconds,
    freshnessSeconds,
    canRecoverWeb,
    errorMessage,
    isExpired,
    login,
    submitTotp,
    consumeRecoveryCode,
    reauthenticate,
    confirmCodes,
    logout,
    resetAuthSimulation,
  }
}
