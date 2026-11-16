<script setup>
// Liste de navigation partagée par la sidebar desktop et le tiroir mobile.
import { RouterLink } from 'vue-router'
import AdminIcon from '@admin/components/AdminIcon.vue'

defineProps({
  sections: { type: Array, required: true },
  idPrefix: { type: String, required: true },
})

const emit = defineEmits(['navigate'])
</script>

<template>
  <div class="nav-list">
    <div v-for="section in sections" :key="section.id" class="nav-list__section">
      <p :id="`${idPrefix}-${section.id}`" class="nav-list__title">{{ section.title }}</p>
      <ul class="nav-list__items" :aria-labelledby="`${idPrefix}-${section.id}`">
        <li v-for="item in section.items" :key="item.label">
          <RouterLink :to="item.to" class="nav-list__link" @click="emit('navigate')">
            <AdminIcon :name="item.icon" :size="20" />
            <span class="nav-list__label">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-list__badge">
              <span aria-hidden="true">{{ item.badge }}</span>
              <span class="fm-visually-hidden">({{ item.badgeLabel }})</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-lg);
}

.nav-list__title {
  margin: 0 0 var(--fm-space-sm);
  padding: 0 var(--fm-space-md);
  color: var(--fm-text-muted);
  font: var(--fm-label-md);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.nav-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-list__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  padding: 0.5rem var(--fm-space-md);
  border-radius: var(--fm-radius-control);
  color: var(--fm-text);
  font: var(--fm-body-lg);
  font-weight: 500;
  text-decoration: none;
}

.nav-list__link:hover {
  background: var(--fm-surface-hover);
  color: var(--fm-heading);
}

.nav-list__link[aria-current='page'] {
  background: var(--fm-primary);
  color: var(--fm-on-primary);
}

.nav-list__label {
  min-width: 0;
  flex: 1;
}

.nav-list__badge {
  display: inline-grid;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  place-items: center;
  border-radius: var(--fm-radius-pill);
  background: var(--fm-danger-soft);
  color: var(--fm-danger-text);
  font: var(--fm-label-md);
}

.nav-list__link[aria-current='page'] .nav-list__badge {
  background: var(--fm-surface);
}
</style>
