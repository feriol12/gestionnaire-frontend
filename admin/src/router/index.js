// FE-01 — Router de l'Admin de démonstration.
//
// Aucun garde de navigation (ni global, ni par route) : l'accès n'est PAS
// contrôlé côté navigateur et ne doit jamais l'être pour de faux. Les états
// « accès refusé » et « session expirée » sont des rendus simulés (/etats).
// Les routes d'authentification sont des emplacements réservés à FE-02.
import { nextTick } from 'vue'
import { createRouter, createWebHistory, START_LOCATION } from 'vue-router'
import AdminShell from '@admin/layouts/AdminShell.vue'
import DashboardView from '@admin/views/DashboardView.vue'

const PlaceholderView = () => import('@admin/views/PlaceholderView.vue')
// FE-02 — les emplacements reserves pointent desormais vers de vrais ecrans
// de simulation. Les chemins, noms et metadonnees FE-01 sont inchanges.
const LoginView = () => import('@admin/views/auth/LoginView.vue')
const EnrollmentView = () => import('@admin/views/auth/EnrollmentView.vue')
const MfaChallengeView = () => import('@admin/views/auth/MfaChallengeView.vue')
const RecoveryView = () => import('@admin/views/auth/RecoveryView.vue')
const ReauthView = () => import('@admin/views/auth/ReauthView.vue')

export const routes = [
  {
    path: '/',
    component: AdminShell,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Tableau de bord', subtitle: "Vue d'ensemble de l'administration" },
      },
      {
        path: 'utilisateurs',
        name: 'users',
        component: PlaceholderView,
        meta: {
          title: 'Utilisateurs',
          subtitle: 'Module réservé',
          placeholder: { icon: 'users', module: 'Gestion des comptes utilisateurs' },
        },
      },
      {
        path: 'audit',
        name: 'audit',
        component: PlaceholderView,
        meta: {
          title: "Journal d'audit",
          subtitle: 'Module réservé',
          placeholder: { icon: 'audit', module: "Consultation du journal d'audit" },
        },
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: PlaceholderView,
        meta: {
          title: 'Notifications',
          subtitle: 'Module réservé',
          placeholder: { icon: 'notifications', module: 'Centre de notifications' },
        },
      },
      {
        path: 'securite',
        name: 'security',
        component: PlaceholderView,
        meta: {
          title: 'Paramètres et sécurité',
          subtitle: 'Module réservé',
          placeholder: { icon: 'security', module: 'Paramètres de sécurité du compte administrateur' },
        },
      },
      {
        path: 'etats',
        name: 'states',
        component: () => import('@admin/views/StatesView.vue'),
        meta: { title: 'États simulés', subtitle: 'Les 6 états UI de référence FE-01' },
      },
      {
        path: 'composants',
        name: 'components',
        component: () => import('@admin/views/ComponentsView.vue'),
        meta: { title: 'Composants', subtitle: 'Catalogue des composants Admin' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@admin/views/NotFoundView.vue'),
        meta: { title: 'Page introuvable', subtitle: 'Prototype Admin V1' },
      },
    ],
  },
  // Ecrans FE-02 : simulation locale, sans garde de route ni appel reseau.
  {
    path: '/connexion',
    name: 'auth-login',
    component: LoginView,
    meta: { title: 'Connexion', reservedFor: 'FE-02' },
  },
  {
    path: '/mfa/enrolement',
    name: 'auth-mfa-enrollment',
    component: EnrollmentView,
    meta: { title: 'Enrôlement MFA', reservedFor: 'FE-02' },
  },
  {
    path: '/mfa/verification',
    name: 'auth-mfa-verify',
    component: MfaChallengeView,
    meta: { title: 'Vérification TOTP', reservedFor: 'FE-02' },
  },
  {
    path: '/mfa/recuperation',
    name: 'auth-mfa-recovery',
    component: RecoveryView,
    meta: { title: 'Récupération MFA', reservedFor: 'FE-02' },
  },
  {
    path: '/reauthentification',
    name: 'auth-reauth',
    component: ReauthView,
    meta: { title: 'Réauthentification', reservedFor: 'FE-02' },
  },
]

export function createAdminRouter(history = createWebHistory('/')) {
  const router = createRouter({
    history,
    routes,
    scrollBehavior: () => ({ top: 0 }),
  })
  // Après navigation (ne bloque ni ne redirige rien) : titre du document, puis
  // focus sur le titre de page (h1 #admin-page-title), y compris lors d'un
  // passage entre le shell et un écran hors shell (emplacements FE-02).
  // Pas au premier chargement : le focus reste au début du document.
  router.afterEach((to, from, failure) => {
    if (failure) return
    document.title = `${to.meta.title ?? 'Admin'} — FluxMoneva Admin (prototype)`
    if (from === START_LOCATION) return
    nextTick(() => document.getElementById('admin-page-title')?.focus())
  })
  return router
}
