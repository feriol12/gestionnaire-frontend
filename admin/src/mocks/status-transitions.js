// FE-05 : états explicitement fictifs, indépendants du répertoire FE-04.
import { readUser } from './users.js'

export const statusTargets = Object.freeze([
  Object.freeze({ ...readUser(1001).data, administrative_status: 'active' }),
  Object.freeze({ ...readUser(1002).data, administrative_status: 'suspended' }),
  Object.freeze({ ...readUser(1031).data }),
  Object.freeze({ ...readUser(1032).data }),
])
export const transitionScenarios = Object.freeze([
  { value: 'success', label: 'Succès simulé' },
  { value: 'loading', label: 'Chargement prolongé' },
  ...['401', '403', '404', '409', '419', '422', '429', '500', '503'].map((value) => ({
    value,
    label: `Erreur ${value} simulée`,
  })),
  { value: 'mfa', label: 'MFA récente requise' },
])
export const transitionErrors = Object.freeze({
  401: 'Session administrative expirée. Recommencez le parcours de démonstration.',
  403: 'Action refusée. Aucune autorisation réelle n’est évaluée.',
  404: 'Cible introuvable dans cette simulation.',
  409: 'Conflit de statut : transition redondante ou concurrente. Aucune transition simulée.',
  419: 'Session de formulaire expirée. Reprenez la saisie et confirmez à nouveau.',
  422: 'Motif ou confirmation rejeté dans ce scénario. Reprenez la saisie.',
  429: 'Trop de tentatives simulées. Aucun nouvel essai automatique.',
  500: 'Erreur serveur simulée. Aucun succès partiel annoncé.',
  503: 'Service indisponible simulé. Aucun nouvel essai automatique.',
  mfa: 'Une réauthentification MFA datant d’au plus 5 minutes serait requise côté serveur pour les deux opérations. Cet écran ne vérifie aucun facteur et ne fournit aucune protection réelle.',
})
export function readStatusTarget(id) {
  return statusTargets.find((user) => String(user.id) === String(id)) ?? null
}
export function validateTransition(user, reason, email) {
  return {
    reason: reason.trim() ? '' : 'Saisissez un motif non vide.',
    email:
      user?.email && email === user.email
        ? ''
        : 'Saisissez l’adresse email exacte de la cible, sans changer la casse ni ajouter d’espace.',
  }
}
export function simulateTransition(user, action, scenario) {
  if (!user) return { error: '404' }
  if (!['active', 'suspended'].includes(user.administrative_status) || !user.email)
    return { error: '422' }
  if (!['suspend', 'reactivate'].includes(action)) return { error: '422' }
  if (scenario !== 'success')
    return { error: Object.hasOwn(transitionErrors, scenario) ? scenario : '500' }
  const status = action === 'suspend' ? 'suspended' : 'active'
  if (user.administrative_status === status) return { error: '409' }
  // Résultat neuf, jamais écrit dans la fixture ni dans un état partagé.
  return { administrative_status: status }
}
