<!--
  AuthShell — MONEVA V2 auth-page shell (Phase 4).
  Desktop (>=768px): split panel — decorative marketing pane (left) + form
  pane (right), per MONEVA_V2_DESIGN.md §10 ("Desktop: split panel (dark
  marketing pane left, form pane right)").
  Mobile (<768px): single centered card — the marketing pane collapses away
  entirely via CSS media query (no JS breakpoint listener), matching the
  approved Login/Register Mobile composition (§5/§10), which was already a
  single-card layout before this restyle.

  The marketing pane is decorative only: the exact canonical MONEVA symbol
  (MonevaMark, P3-04) + brand wordmark + a short static tagline, no data, no
  illustration graphic. The background remains a CSS-only gradient.
-->
<template>
  <div class="auth-shell">
    <aside class="auth-shell-marketing" aria-hidden="true">
      <div class="auth-shell-marketing-inner">
        <div class="auth-shell-brand-row">
          <MonevaMark class="auth-shell-mark" />
          <span class="brand-title auth-shell-brand">MONEVA</span>
        </div>
        <p class="auth-shell-tagline">{{ tagline }}</p>
      </div>
    </aside>

    <div class="auth-shell-form-pane">
      <div class="auth-shell-form-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import MonevaMark from '@/components/brand/MonevaMark.vue';

defineProps({
  tagline: {
    type: String,
    default: 'Gérez vos finances simplement'
  }
});
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  background-color: var(--color-canvas);
  display: flex;
  flex-direction: column;
}

.auth-shell-marketing {
  display: none;
}

@media (min-width: 768px) {
  .auth-shell {
    flex-direction: row;
  }

  .auth-shell-marketing {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    /* Decorative gradient built from existing tokens; no illustration asset available. */
    background: linear-gradient(135deg, var(--color-ink) 0%, #1e3a5f 100%);
  }
}

.auth-shell-marketing-inner {
  max-width: 360px;
  padding: var(--spacing-xl);
}

.auth-shell-brand-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.auth-shell-mark {
  width: 56px;
  height: 56px;
}

.auth-shell-brand {
  display: block;
  color: white;
  font-size: var(--text-display-hero);
  line-height: var(--text-display-hero--line-height);
}

.auth-shell-tagline {
  margin-top: var(--spacing-md);
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--text-body-lg);
  line-height: var(--text-body-lg--line-height);
}

.auth-shell-form-pane {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

@media (min-width: 768px) {
  .auth-shell-form-pane {
    padding: var(--spacing-xl);
  }
}

.auth-shell-form-inner {
  width: 100%;
  max-width: 400px;
}
</style>
