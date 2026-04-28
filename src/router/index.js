// router/index.js (modifications minimales)
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterVue from '@/views/auth/RegisterVue.vue'
import LoginVue from '@/views/auth/LoginVue.vue'
import ExpensesView from '@/views/expenses/ExpensesView.vue'  // ← AJOUT
import { useAuthStore } from '@/stores/useAuthStore'; 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
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
    {
      path: '/expenses',           // ← AJOUT (sans guard, ton ami le fera)
      name: 'expenses',
      component: ExpensesView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],

})



// // Navigation Guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    
    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = authStore.isAuthenticated;
    
    // Si la route nécessite l'auth
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    }
    // Si la route est pour invités et que l'utilisateur est connecté
    else if (to.meta.guest && isAuthenticated) {
        next('/dashboard');
    }
    else {
        next();
    }
});

export default router
