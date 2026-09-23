<!--
  AppShell — MONEVA V2 application shell (Phase 3).
  Composes DesktopSidebar / MobileHeader / MobileBottomNav. All three are
  always mounted; visibility switches purely via CSS media queries inside
  each component (min-width: 768px), never via a JS resize listener, so the
  breakpoint transition never mounts/unmounts the content slot and never
  duplicates the page underneath it. The default slot (used by MainLayout
  for its single <router-view>) is rendered exactly once regardless of
  breakpoint.
-->
<template>
  <div class="app-shell">
    <DesktopSidebar />
    <MobileHeader />

    <main class="app-shell-content">
      <div class="app-shell-content-inner">
        <slot />
      </div>
    </main>

    <MobileBottomNav />
  </div>
</template>

<script setup>
import DesktopSidebar from './DesktopSidebar.vue';
import MobileHeader from './MobileHeader.vue';
import MobileBottomNav from './MobileBottomNav.vue';
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background-color: var(--color-canvas);
}

.app-shell-content {
  padding-top: calc(56px + env(safe-area-inset-top));
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

@media (min-width: 768px) {
  .app-shell-content {
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 256px;
  }
}

.app-shell-content-inner {
  /* Mobile gutter: 16px, per MONEVA_V2_DESIGN.md §7 page-gutter scale. */
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-xl);
}

@media (min-width: 768px) {
  .app-shell-content-inner {
    /* Tablet gutter (768-1023px): 24px. */
    padding: var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .app-shell-content-inner {
    /* Desktop gutter (>=1024px): 32px. */
    padding: var(--spacing-xl);
  }
}
</style>
