<script setup>
// Rendu générique d'un état (vide, accès refusé, session expirée, introuvable…).
// Purement visuel : n'applique aucun contrôle d'accès ni aucune action réelle.
import AdminIcon from './AdminIcon.vue'

defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'info', 'warning', 'danger'].includes(v),
  },
  headingLevel: { type: Number, default: 3 },
})
</script>

<template>
  <div class="state-panel">
    <span class="state-panel__icon" :class="`state-panel__icon--${tone}`">
      <AdminIcon :name="icon" :size="24" />
    </span>
    <component :is="`h${headingLevel}`" class="state-panel__title">{{ title }}</component>
    <p v-if="description" class="state-panel__description">{{ description }}</p>
    <div v-if="$slots.default" class="state-panel__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fm-space-sm);
  padding: var(--fm-space-xl) var(--fm-space-md);
  border-radius: var(--fm-radius-card);
  background: var(--fm-canvas);
  text-align: center;
}

.state-panel__icon {
  display: inline-grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: var(--fm-radius-pill);
  background: var(--fm-surface);
  box-shadow: var(--fm-shadow-1);
}

.state-panel__icon--neutral {
  color: var(--fm-neutral-text);
}

.state-panel__icon--info {
  color: var(--fm-primary-text);
}

.state-panel__icon--warning {
  color: var(--fm-warning-text);
}

.state-panel__icon--danger {
  color: var(--fm-danger-text);
}

.state-panel__title {
  font: var(--fm-headline-sm);
}

.state-panel__description {
  max-width: 34rem;
  color: var(--fm-text-muted);
}

.state-panel__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--fm-space-sm);
  margin-top: var(--fm-space-sm);
}
</style>
