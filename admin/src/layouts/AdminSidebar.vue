<script setup>
// Sidebar desktop (≥ 1024px), largeur fixe 260px.
import { RouterLink } from 'vue-router'
import BrandMark from '@admin/components/BrandMark.vue'
import { navSections } from '@admin/router/navigation.js'
import NavList from './NavList.vue'
</script>

<template>
  <div class="admin-sidebar">
    <RouterLink :to="{ name: 'dashboard' }" class="admin-sidebar__brand">
      <BrandMark />
    </RouterLink>
    <nav class="admin-sidebar__nav" aria-label="Navigation principale">
      <NavList :sections="navSections" id-prefix="sidebar" />
    </nav>
    <div class="admin-sidebar__footer">
      <p class="admin-sidebar__status">
        <svg viewBox="0 0 8 8" aria-hidden="true" focusable="false"><circle cx="4" cy="4" r="4" /></svg>
        Prototype Admin V1
      </p>
      <p class="admin-sidebar__meta">
        <span>FluxMoneva V1.0</span>
        <span>Console démo</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.admin-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  width: var(--fm-sidebar-width);
  height: 100vh;
  flex: none;
  flex-direction: column;
  border-right: 1px solid var(--fm-border);
  background: var(--fm-surface);
}

.admin-sidebar__brand {
  display: flex;
  min-height: 72px;
  align-items: center;
  padding: var(--fm-space-md) var(--fm-space-lg);
  border-bottom: 1px solid var(--fm-border);
  text-decoration: none;
}

.admin-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--fm-space-lg) var(--fm-space-sm);
}

.admin-sidebar__footer {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-sm);
  padding: var(--fm-space-md);
  border-top: 1px solid var(--fm-border);
}

.admin-sidebar__status {
  display: flex;
  align-items: center;
  gap: var(--fm-space-sm);
  padding: var(--fm-space-sm) var(--fm-space-md);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  color: var(--fm-heading);
  font-weight: 500;
}

.admin-sidebar__status svg {
  width: 8px;
  height: 8px;
  fill: var(--fm-success);
}

.admin-sidebar__meta {
  display: flex;
  justify-content: space-between;
  padding: 0 var(--fm-space-xs);
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

@media (max-width: 1023px) {
  .admin-sidebar {
    display: none;
  }
}
</style>
