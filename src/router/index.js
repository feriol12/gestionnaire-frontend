// router/index.js (modifications minimales)
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterVue from '@/views/auth/RegisterVue.vue'
import LoginVue from '@/views/auth/LoginVue.vue'
import ExpensesView from '@/views/expenses/ExpensesView.vue'  // ← AJOUT

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
    },
    {
      path: '/login',
      name: 'login',
      component: LoginVue,
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

export default router