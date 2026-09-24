<!--
  DesktopSidebar — MONEVA V2 desktop navigation shell (Phase 3).
  Structural/presentational only: reuses the existing router state
  (useRoute) for active-item detection and calls the existing
  useAuthStore().logout() exactly as Navbar.vue did — no new auth state,
  no business logic. Covers the desktop breakpoint (≥768px, which per
  MONEVA_V2_DESIGN.md §8 also covers the 768–1023px tablet range — there is
  no separate tablet shell).
-->
<template>
  <aside class="desktop-sidebar">
    <div class="desktop-sidebar-brand">
      <RouterLink to="/dashboard" custom v-slot="{ navigate, href }">
        <a :href="href" class="desktop-sidebar-brand-link" @click="navigate">
          <MonevaMark class="desktop-sidebar-mark" />
          <span class="brand-title text-lg">MONEVA</span>
        </a>
      </RouterLink>
    </div>

    <nav class="desktop-sidebar-nav" aria-label="Navigation principale">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="desktop-sidebar-link"
        :class="{ 'desktop-sidebar-link-active': isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <component :is="item.icon" class="desktop-sidebar-icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="desktop-sidebar-user" v-if="authStore.isAuthenticated">
      <div class="desktop-sidebar-user-info">
        <div class="desktop-sidebar-avatar">{{ userInitial }}</div>
        <div class="desktop-sidebar-user-text">
          <p class="desktop-sidebar-user-name">{{ authStore.userName }}</p>
          <p class="desktop-sidebar-user-email">{{ authStore.user?.email }}</p>
        </div>
      </div>
      <button type="button" class="desktop-sidebar-logout" @click="handleLogout" aria-label="Déconnexion">
        <LogOut class="desktop-sidebar-icon" aria-hidden="true" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { LayoutDashboard, Receipt, Target, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/useAuthStore';
import MonevaMark from '@/components/brand/MonevaMark.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const navItems = [
  { name: 'dashboard', to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { name: 'expenses', to: '/expenses', label: 'Dépenses', icon: Receipt },
  { name: 'budgets', to: '/budgets', label: 'Budgets', icon: Target }
];

const isActive = (to) => route.path === to;

const userInitial = computed(() =>
  authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : '?'
);

// Identical to Navbar.vue's existing handleLogout: call the existing store
// action, then navigate to /login. No reimplementation, no new auth state.
const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.desktop-sidebar {
  display: none;
}

@media (min-width: 768px) {
  .desktop-sidebar {
    display: flex;
    flex-direction: column;
    position: fixed;
    inset-block: 0;
    left: 0;
    width: 256px;
    background-color: var(--color-surface);
    border-right: 1px solid var(--color-border);
    z-index: 40;
  }
}

.desktop-sidebar-brand {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
}

.desktop-sidebar-brand-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.desktop-sidebar-mark {
  width: 32px;
  height: 32px;
}

.desktop-sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-md);
}

.desktop-sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.625rem var(--spacing-md);
  border-radius: var(--radius-moneva);
  color: var(--color-text-muted);
  font-size: var(--text-body-md);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.desktop-sidebar-link:hover {
  background-color: var(--color-border-soft);
  color: var(--color-ink);
}

.desktop-sidebar-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.desktop-sidebar-link-active {
  background-color: var(--color-primary);
  color: white;
}

.desktop-sidebar-link-active:hover {
  background-color: var(--color-primary);
  color: white;
}

.desktop-sidebar-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.desktop-sidebar-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border-soft);
}

.desktop-sidebar-user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.desktop-sidebar-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-body-sm);
}

.desktop-sidebar-user-text {
  min-width: 0;
}

.desktop-sidebar-user-name {
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desktop-sidebar-user-email {
  font-size: var(--text-label-sm);
  color: var(--color-text-muted-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desktop-sidebar-logout {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-muted-light);
  border-radius: var(--radius-moneva-sm);
  cursor: pointer;
}

.desktop-sidebar-logout:hover {
  background-color: var(--color-expense-bg);
  color: var(--color-expense);
}

.desktop-sidebar-logout:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
