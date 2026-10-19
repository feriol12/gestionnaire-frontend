// router/index.js (modifications minimales)
import { createRouter, createWebHistory } from 'vue-router'
import RegisterVue from '@/views/auth/RegisterVue.vue'
import LoginVue from '@/views/auth/LoginVue.vue'
import { useAuthStore } from '@/stores/useAuthStore';
import MainLayout from '@/components/layout/MainLayout.vue';
import DashboardView from '@/views/DashboardView.vue'
import Test from '@/views/Test.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/register',
      name: 'register',
      component: RegisterVue,
      meta: { guest: true, title: 'Créer un compte' } // accessible seulement si non connecté

    },
    {
      path: '/login',
      name: 'login',
      component: LoginVue,
      meta: { guest: true, title: 'Connexion' } // accessible seulement si non connecté
    },
    // AUTH3-03 : récupération de mot de passe
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordVue.vue'),
      meta: { guest: true, title: 'Mot de passe oublié' }
    },
    {
      // Accessible connecté ou non : le lien reçu par email doit toujours fonctionner.
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordVue.vue'),
      meta: { title: 'Nouveau mot de passe', noindex: true }
    },
    {
      // AUTH3-04 : vérification de l'adresse email. Accessible sans session
      // (inscription, connexion refusée, lien invalide) ou avec une session non
      // vérifiée ; pas « guest » pour ne pas boucler avec cette dernière.
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmailVue.vue'),
      meta: { title: 'Vérification de l’adresse email', noindex: true }
    },
    //  Routes protégées (avec navbar)
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Tableau de bord' },
        },
         {
          path: 'test',
          name: 'test',
          component: Test,
        },
        // La route expenses sera ajoutée quand son composant sera prêt
        {
          path: 'expenses',
          name: 'expenses',
          component: () => import('@/views/expenses/ExpensesView.vue'),
          meta: { title: 'Dépenses' },
        },
         {
          path: 'budgets',
          name: 'budgets',
          component: () => import('@/views/budgets/BudgetsView.vue'),
          meta: { title: 'Budgets' },
        },
        {
          // AUTH3-05 : sécurité du compte (changement de mot de passe)
          path: 'account/security',
          name: 'account-security',
          component: () => import('@/views/account/AccountSecurityView.vue'),
          meta: { title: 'Sécurité du compte' },
        },
      ]
    },
    // {
    //   path: '/expenses',           // ← AJOUT (sans guard, ton ami le fera)
    //   name: 'expenses',
    //   component: ExpensesView,
    // },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { noindex: true },
    },


  ],

})



// // Navigation Guard
router.beforeEach(async (to, from) => {
    const authStore = useAuthStore();

    // AUTH3-01 : l'état vient de la session serveur, vérifiée une seule fois
    // (GET /api/user) avant la première décision de navigation.
    await authStore.initAuth();

    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = authStore.isAuthenticated;

    // Si la route nécessite l'auth
    if (to.meta.requiresAuth && !isAuthenticated) {
        // AUTH3-02 : session invérifiable (serveur indisponible, réseau, 429) :
        // ce n'est pas une déconnexion, on le dit explicitement. La vérification
        // sera retentée à la prochaine navigation.
        if (authStore.authStatus === 'unknown') {
            authStore.notifyAuthUnavailable();
        }
        return('/login');
    }
    // AUTH3-04 : session ouverte mais adresse non vérifiée (session antérieure à
    // la vérification obligatoire) : pas d'accès métier, orientation vers la
    // vérification. Le serveur refuse de toute façon les routes métier (403).
    else if (to.meta.requiresAuth && !authStore.isEmailVerified) {
        return('/verify-email');
    }
    // Si la route est pour invités et que l'utilisateur est connecté
    else if (to.meta.guest && isAuthenticated) {
        return(authStore.isEmailVerified ? '/dashboard' : '/verify-email');
    }

});

// FRONT-RENAME-SEO : titre, indexation et URL canonique de la page affichée.
// Pages privées (requiresAuth, héritée par les routes enfants) et pages à jeton
// ou techniques (meta.noindex) : jamais indexées.
const SITE_NAME = 'FluxMoneva';
const SITE_URL = 'https://fluxmoneva.com';
const DEFAULT_TITLE = 'FluxMoneva — Gestion sereine de vos dépenses personnelles';

function setHeadAttribute(selector, attribute, value) {
    const element = document.head.querySelector(selector);
    if (element) {
        element.setAttribute(attribute, value);
    }
}

router.afterEach((to) => {
    const indexable = !to.meta.requiresAuth && !to.meta.noindex;

    document.title = to.meta.title ? `${to.meta.title} · ${SITE_NAME}` : DEFAULT_TITLE;
    setHeadAttribute('meta[name="robots"]', 'content', indexable ? 'index, follow' : 'noindex, nofollow');
    setHeadAttribute('link[rel="canonical"]', 'href', SITE_URL + to.path);
    setHeadAttribute('meta[property="og:url"]', 'content', SITE_URL + to.path);
});

export default router
