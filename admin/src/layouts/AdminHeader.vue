<script setup>
// En-tête : titre de page (h1, cible du focus après navigation), recherche
// simulée, notifications fictives et opérateur de démonstration.
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AdminAvatar from '@admin/components/AdminAvatar.vue'
import AdminIcon from '@admin/components/AdminIcon.vue'
import BrandMark from '@admin/components/BrandMark.vue'
import { demoNotificationsCount, demoOperator } from '@admin/mocks/dashboard.js'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  menuOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['open-menu'])

const route = useRoute()
const query = ref('')
const searchStatus = ref('')

// Le message de recherche simulée concerne la page courante : effacé à chaque navigation.
watch(
  () => route.fullPath,
  () => {
    searchStatus.value = ''
  },
)

function simulateSearch() {
  // Aucune requête : le prototype annonce seulement que la recherche est fictive.
  searchStatus.value = query.value.trim()
    ? `Recherche simulée pour « ${query.value.trim()} » : aucune requête envoyée (prototype).`
    : 'Saisissez un terme : la recherche reste simulée dans ce prototype.'
}
</script>

<template>
  <header class="admin-header">
    <div class="admin-header__bar">
      <button
        id="admin-menu-button"
        type="button"
        class="admin-header__icon-button admin-header__menu"
        aria-label="Ouvrir le menu de navigation"
        aria-controls="admin-drawer"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        @click="emit('open-menu')"
      >
        <AdminIcon name="menu" :size="22" />
      </button>

      <RouterLink :to="{ name: 'dashboard' }" class="admin-header__brand">
        <BrandMark compact />
      </RouterLink>

      <div class="admin-header__titles">
        <h1 id="admin-page-title" class="admin-header__title" tabindex="-1">{{ title }}</h1>
        <p v-if="subtitle" class="admin-header__subtitle">{{ subtitle }}</p>
      </div>

      <form class="admin-header__search" role="search" @submit.prevent="simulateSearch">
        <label for="admin-search" class="fm-visually-hidden">Rechercher un compte (simulation)</label>
        <AdminIcon name="search" :size="16" class="admin-header__search-icon" />
        <input
          id="admin-search"
          v-model="query"
          type="search"
          class="admin-header__search-input"
          placeholder="Rechercher un compte, UID…"
          autocomplete="off"
          aria-describedby="admin-search-status"
        />
      </form>

      <div class="admin-header__tools">
        <RouterLink :to="{ name: 'notifications' }" class="admin-header__icon-button admin-header__bell">
          <AdminIcon name="bell" :size="20" />
          <span class="fm-visually-hidden">Notifications ({{ demoNotificationsCount }} fictives)</span>
          <span class="admin-header__bell-count" aria-hidden="true">{{ demoNotificationsCount }}</span>
        </RouterLink>
        <span class="admin-header__divider" aria-hidden="true" />
        <div class="admin-header__operator">
          <AdminAvatar :initials="demoOperator.initials" />
          <p class="admin-header__operator-text">
            <span class="admin-header__operator-name">{{ demoOperator.name }}</span>
            <span class="admin-header__operator-role">{{ demoOperator.role }}</span>
            <span class="fm-visually-hidden">(opérateur fictif)</span>
          </p>
        </div>
      </div>
    </div>
    <p id="admin-search-status" class="admin-header__search-status" role="status">{{ searchStatus }}</p>
  </header>
</template>

<style scoped>
.admin-header {
  border-bottom: 1px solid var(--fm-border);
  background: var(--fm-surface);
}

.admin-header__bar {
  display: flex;
  min-height: 72px;
  align-items: center;
  gap: var(--fm-space-md);
  padding: var(--fm-space-sm) var(--fm-margin);
}

.admin-header__titles {
  min-width: 0;
  flex: 1;
}

.admin-header__title {
  font: var(--fm-headline-lg);
  letter-spacing: -0.015em;
}

.admin-header__subtitle {
  color: var(--fm-text-muted);
}

.admin-header__search {
  position: relative;
  width: min(100%, 22rem);
}

.admin-header__search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  color: var(--fm-text-muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.admin-header__search-input {
  width: 100%;
  height: var(--fm-control-height);
  padding: 0 0.75rem 0 2.25rem;
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  background: var(--fm-canvas);
  color: var(--fm-heading);
}

.admin-header__search-input::placeholder {
  color: var(--fm-text-muted);
}

.admin-header__search-input:focus-visible {
  border-color: var(--fm-primary);
  outline-offset: 0;
}

.admin-header__tools {
  display: flex;
  align-items: center;
  gap: var(--fm-space-md);
}

.admin-header__icon-button {
  position: relative;
  display: inline-grid;
  width: 44px;
  height: 44px;
  flex: none;
  place-items: center;
  border: 0;
  border-radius: var(--fm-radius-control);
  background: transparent;
  color: var(--fm-text);
  cursor: pointer;
}

.admin-header__icon-button:hover {
  background: var(--fm-surface-hover);
}

/* Desktop : menu et marque compacte masqués (la sidebar les remplace).
   Déclaré après .admin-header__icon-button pour l'emporter. */
.admin-header__menu,
.admin-header__brand {
  display: none;
}

.admin-header__bell-count {
  position: absolute;
  top: 4px;
  right: 4px;
  display: inline-grid;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  place-items: center;
  border: 2px solid var(--fm-surface);
  border-radius: var(--fm-radius-pill);
  background: var(--fm-danger-text);
  color: var(--fm-on-primary);
  font: var(--fm-label-sm);
}

.admin-header__divider {
  width: 1px;
  height: 32px;
  background: var(--fm-border);
}

.admin-header__operator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-header__operator-text {
  display: flex;
  flex-direction: column;
}

.admin-header__operator-name {
  color: var(--fm-heading);
  font: var(--fm-headline-sm);
}

.admin-header__operator-role {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.admin-header__search-status:empty {
  display: none;
}

.admin-header__search-status {
  padding: var(--fm-space-sm) var(--fm-margin);
  border-top: 1px solid var(--fm-border-subtle);
  background: var(--fm-primary-soft);
  color: var(--fm-primary-text);
  font: var(--fm-body-sm);
  font-weight: 600;
}

@media (max-width: 1279px) {
  .admin-header__operator-text,
  .admin-header__divider {
    display: none;
  }
}

@media (max-width: 1023px) {
  .admin-header__bar {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'menu brand tools'
      'titles titles titles'
      'search search search';
    gap: var(--fm-space-sm) var(--fm-space-sm);
    padding: var(--fm-space-sm) var(--fm-margin-mobile) var(--fm-space-md);
  }

  .admin-header__menu {
    display: inline-grid;
    grid-area: menu;
  }

  .admin-header__brand {
    display: flex;
    min-width: 0;
    grid-area: brand;
    text-decoration: none;
  }

  .admin-header__tools {
    grid-area: tools;
    gap: var(--fm-space-xs);
  }

  .admin-header__titles {
    grid-area: titles;
    padding-top: var(--fm-space-sm);
  }

  .admin-header__title {
    font: var(--fm-headline-md);
  }

  .admin-header__search {
    width: 100%;
    grid-area: search;
  }

  .admin-header__search-status {
    padding-inline: var(--fm-margin-mobile);
  }
}

@media (max-width: 359px) {
  .admin-header__brand :deep(.brand-mark__product) {
    display: none;
  }
}
</style>
