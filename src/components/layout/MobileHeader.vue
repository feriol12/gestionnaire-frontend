<!--
  MobileHeader — MONEVA V2 mobile top bar (Phase 3, <768px only).
  Brand + logout action. Primary navigation lives in MobileBottomNav.vue;
  this header does not duplicate route links.

  Mobile logout placement: PROPOSED, not yet signed off. Placed here as a
  single icon button (top-right) rather than inside a menu, since there are
  only 3 destinations and no other header actions today. Flagged explicitly
  in the Phase 3 report for Human Owner approval before being treated as
  final.
-->
<template>
  <header class="mobile-header">
    <RouterLink to="/dashboard" custom v-slot="{ navigate, href }">
      <a :href="href" class="mobile-header-brand" @click="navigate">
        <MonevaMark class="mobile-header-mark" />
        <span class="brand-title text-base">MONEVA</span>
      </a>
    </RouterLink>

    <div v-if="authStore.isAuthenticated" class="mobile-header-actions">
      <!-- AUTH3-05 : sécurité du compte (changement de mot de passe) -->
      <RouterLink
        to="/account/security"
        class="mobile-header-security"
        aria-label="Sécurité du compte"
      >
        <KeyRound class="mobile-header-icon" aria-hidden="true" />
      </RouterLink>
      <button
        type="button"
        class="mobile-header-logout"
        @click="handleLogout"
        aria-label="Déconnexion"
      >
        <LogOut class="mobile-header-icon" aria-hidden="true" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { LogOut, KeyRound } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/useAuthStore';
import MonevaMark from '@/components/brand/MonevaMark.vue';

const router = useRouter();
const authStore = useAuthStore();

// Identical to Navbar.vue's existing handleLogoutMobile call pattern.
const handleLogout = async () => {
  // A3-F1 : ne quitter l'espace connecté que si la session serveur est fermée.
  if (await authStore.logout()) router.push('/login');
};
</script>

<style scoped>
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) var(--spacing-md) 0;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 40;
}

@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }
}

.mobile-header-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 44px;
  min-height: 44px;
  padding: 0 4px;
  margin-left: -4px;
}

.mobile-header-mark {
  width: 28px;
  height: 28px;
}

.mobile-header-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: var(--radius-moneva-sm);
  cursor: pointer;
}

.mobile-header-logout:hover {
  background-color: var(--color-expense-bg);
  color: var(--color-expense);
}

.mobile-header-logout:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
}

.mobile-header-security {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--color-text-muted);
  border-radius: var(--radius-moneva-sm);
}

.mobile-header-security:hover {
  background-color: var(--color-border-soft);
  color: var(--color-primary);
}

.mobile-header-security:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.mobile-header-icon {
  width: 22px;
  height: 22px;
}
</style>
