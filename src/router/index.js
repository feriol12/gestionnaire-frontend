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
      meta: { guest: true } // accessible seulement si non connecté

    },
    {
      path: '/login',
      name: 'login',
      component: LoginVue,
      meta: { guest: true } // accessible seulement si non connecté
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
        },
         {
          path: 'budgets',
          name: 'budgets',
          component: () => import('@/views/budgets/BudgetsView.vue'),
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
    },


  ],

})



// // Navigation Guard
router.beforeEach(async (to, from) => {
    const authStore = useAuthStore();
    
    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = authStore.isAuthenticated;
    
    // Si la route nécessite l'auth
    if (to.meta.requiresAuth && !isAuthenticated) {
        return('/login');
    }
    // Si la route est pour invités et que l'utilisateur est connecté
    else if (to.meta.guest && isAuthenticated) {
        return('/dashboard');
    }
   
});

export default router
