<script setup>
// Shell Admin : bandeau démo, sidebar desktop, en-tête, contenu, pied de page,
// navigation basse et tiroir de navigation mobile (<dialog> modal natif).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AdminIcon from '@admin/components/AdminIcon.vue'
import BrandMark from '@admin/components/BrandMark.vue'
import DemoBanner from '@admin/components/DemoBanner.vue'
import { navSections } from '@admin/router/navigation.js'
import AdminHeader from './AdminHeader.vue'
import AdminSidebar from './AdminSidebar.vue'
import MobileNav from './MobileNav.vue'
import NavList from './NavList.vue'

const route = useRoute()
const title = computed(() => route.meta.title ?? 'Administration')
const subtitle = computed(() => route.meta.subtitle ?? '')

const drawer = ref(null)
const drawerOpen = ref(false)
// Destination du focus à la fermeture du tiroir :
// 'menu' (bouton d'ouverture), 'title' (h1 de la page) ou 'none' (la navigation s'en charge).
let focusAfterClose = 'menu'

function openDrawer() {
  drawer.value?.showModal?.()
  drawerOpen.value = true
}

function closeDrawer(focusTarget = 'menu') {
  focusAfterClose = focusTarget
  drawer.value?.close?.()
}

function onDrawerClose() {
  drawerOpen.value = false
  if (focusAfterClose === 'menu') document.getElementById('admin-menu-button')?.focus()
  if (focusAfterClose === 'title') document.getElementById('admin-page-title')?.focus()
  focusAfterClose = 'menu'
}

function onDrawerClick(event) {
  // Clic sur le fond (le <dialog> lui-même, hors panneau) : fermeture.
  if (event.target === drawer.value) closeDrawer()
}

function skipToContent() {
  document.getElementById('admin-main')?.focus()
}

// Passage en largeur desktop (≥ 1024px, ex. rotation d'une tablette) : le
// tiroir modal n'a plus lieu d'être et son bouton d'ouverture est masqué.
// On le ferme et le focus va au titre de la page.
// Le focus après navigation est géré par le router (afterEach).
const desktopQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1024px)') : null

function onDesktopChange(event) {
  if (event.matches && drawer.value?.open) closeDrawer('title')
}

onMounted(() => desktopQuery?.addEventListener('change', onDesktopChange))
onBeforeUnmount(() => desktopQuery?.removeEventListener('change', onDesktopChange))
</script>

<template>
  <a class="skip-link" href="#admin-main" @click.prevent="skipToContent">Aller au contenu principal</a>
  <DemoBanner />
  <div class="admin-shell">
    <AdminSidebar />
    <div class="admin-shell__stage">
      <AdminHeader :title="title" :subtitle="subtitle" :menu-open="drawerOpen" @open-menu="openDrawer" />
      <main id="admin-main" class="admin-shell__main" tabindex="-1">
        <RouterView />
      </main>
      <footer class="admin-shell__footer">
        <p>FluxMoneva Admin — Prototype V1</p>
        <p>Données fictives · aucune connexion au service · aucune donnée financière</p>
      </footer>
    </div>
  </div>
  <MobileNav />

  <dialog
    id="admin-drawer"
    ref="drawer"
    class="admin-drawer"
    aria-labelledby="admin-drawer-title"
    @close="onDrawerClose"
    @click="onDrawerClick"
  >
    <div class="admin-drawer__panel">
      <div class="admin-drawer__head">
        <BrandMark compact />
        <h2 id="admin-drawer-title" class="fm-visually-hidden">Menu de navigation</h2>
        <button type="button" class="admin-drawer__close" aria-label="Fermer le menu" @click="closeDrawer()">
          <AdminIcon name="close" :size="22" />
        </button>
      </div>
      <nav aria-label="Navigation principale (menu)">
        <NavList :sections="navSections" id-prefix="drawer" @navigate="closeDrawer('none')" />
      </nav>
    </div>
  </dialog>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: var(--fm-space-sm);
  left: var(--fm-space-sm);
  z-index: 50;
  padding: var(--fm-space-sm) var(--fm-space-md);
  border-radius: var(--fm-radius-control);
  background: var(--fm-surface);
  color: var(--fm-primary-text);
  font-weight: 600;
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: none;
}

.admin-shell {
  display: flex;
  min-height: 100vh;
}

.admin-shell__stage {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.admin-shell__main {
  flex: 1;
  padding: var(--fm-space-lg) var(--fm-margin) var(--fm-space-xl);
}

.admin-shell__main:focus {
  outline: none;
}

.admin-shell__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--fm-space-xs) var(--fm-space-md);
  padding: var(--fm-space-md) var(--fm-margin);
  border-top: 1px solid var(--fm-border);
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.admin-drawer {
  width: min(85vw, 320px);
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--fm-surface);
  box-shadow: var(--fm-shadow-3);
}

.admin-drawer::backdrop {
  background: rgba(15, 23, 42, 0.45);
}

.admin-drawer__panel {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: var(--fm-space-lg);
  padding: var(--fm-space-md) var(--fm-space-sm);
}

.admin-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fm-space-sm);
  padding: 0 var(--fm-space-sm);
}

.admin-drawer__close {
  display: inline-grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 0;
  border-radius: var(--fm-radius-control);
  background: transparent;
  color: var(--fm-text);
  cursor: pointer;
}

.admin-drawer__close:hover {
  background: var(--fm-surface-hover);
}

@media (max-width: 1023px) {
  .admin-shell__main {
    padding: var(--fm-space-md) var(--fm-margin-mobile) var(--fm-space-xl);
  }

  .admin-shell__footer {
    /* Réserve la hauteur de la barre de navigation basse fixe. */
    padding: var(--fm-space-md) var(--fm-margin-mobile) calc(88px + env(safe-area-inset-bottom));
  }
}
</style>
