<script setup>
// Barre de navigation basse (< 1024px), cibles tactiles ≥ 48px.
import { RouterLink } from 'vue-router'
import AdminIcon from '@admin/components/AdminIcon.vue'
import { mobileNavItems } from '@admin/router/navigation.js'
</script>

<template>
  <nav class="mobile-nav" aria-label="Navigation rapide">
    <ul class="mobile-nav__items">
      <li v-for="item in mobileNavItems" :key="item.label">
        <RouterLink :to="item.to" class="mobile-nav__link">
          <AdminIcon :name="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  border-top: 1px solid var(--fm-border);
  background: var(--fm-surface);
  box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.06);
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-nav__items {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--fm-space-xs);
  margin: 0;
  padding: var(--fm-space-xs) var(--fm-space-sm);
  list-style: none;
}

.mobile-nav__link {
  display: flex;
  min-height: 56px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: var(--fm-radius-control);
  color: var(--fm-text);
  font: var(--fm-label-md);
  text-decoration: none;
}

.mobile-nav__link span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-nav__link[aria-current='page'] {
  background: var(--fm-primary-soft);
  color: var(--fm-primary-text);
}

@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}
</style>
