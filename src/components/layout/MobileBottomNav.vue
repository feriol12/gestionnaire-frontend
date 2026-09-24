<!--
  MobileBottomNav — MONEVA V2 mobile primary navigation (Phase 3, <768px only).
  Same 3 destinations as DesktopSidebar, safe-area-aware for devices with a
  home indicator. Active-state derives from useRoute(), no duplicated
  routing state.
-->
<template>
  <nav class="mobile-bottom-nav" aria-label="Navigation principale">
    <RouterLink
      v-for="item in navItems"
      :key="item.name"
      :to="item.to"
      class="mobile-bottom-nav-link"
      :class="{ 'mobile-bottom-nav-link-active': isActive(item.to) }"
      :aria-current="isActive(item.to) ? 'page' : undefined"
    >
      <component :is="item.icon" class="mobile-bottom-nav-icon" aria-hidden="true" />
      <span class="mobile-bottom-nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { LayoutDashboard, Receipt, Target } from 'lucide-vue-next';

const route = useRoute();

const navItems = [
  { name: 'dashboard', to: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
  { name: 'expenses', to: '/expenses', label: 'Dépenses', icon: Receipt },
  { name: 'budgets', to: '/budgets', label: 'Budgets', icon: Target }
];

const isActive = (to) => route.path === to;
</script>

<style scoped>
.mobile-bottom-nav {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(60px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  z-index: 40;
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}

.mobile-bottom-nav-link {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin: 6px 4px;
  min-width: 44px;
  min-height: 44px;
  border-radius: var(--radius-moneva);
  color: var(--color-text-muted-light);
  text-decoration: none;
}

.mobile-bottom-nav-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.mobile-bottom-nav-link-active {
  background-color: var(--color-primary);
  color: white;
}

.mobile-bottom-nav-icon {
  width: 22px;
  height: 22px;
}

.mobile-bottom-nav-label {
  font-size: var(--text-label-sm);
  font-weight: var(--text-label-sm--font-weight);
}
</style>
