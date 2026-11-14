<script setup>
// Alerte en ligne (erreur, avertissement, information), éventuellement fermable.
// N'utilise pas role="alert" : l'annonce dynamique est gérée par la vue appelante.
import { useId } from 'vue'
import AdminIcon from './AdminIcon.vue'

defineProps({
  tone: {
    type: String,
    default: 'danger',
    validator: (v) => ['danger', 'warning', 'info'].includes(v),
  },
  title: { type: String, required: true },
  dismissible: { type: Boolean, default: false },
})

const emit = defineEmits(['dismiss'])
const titleId = useId()
const icons = { danger: 'circle-alert', warning: 'warning', info: 'info' }
</script>

<template>
  <div class="inline-alert" :class="`inline-alert--${tone}`" role="group" :aria-labelledby="titleId">
    <AdminIcon :name="icons[tone]" :size="20" class="inline-alert__icon" />
    <div class="inline-alert__body">
      <p :id="titleId" class="inline-alert__title">{{ title }}</p>
      <div class="inline-alert__content"><slot /></div>
      <div v-if="$slots.actions" class="inline-alert__actions"><slot name="actions" /></div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="inline-alert__close"
      aria-label="Fermer l'alerte"
      @click="emit('dismiss')"
    >
      <AdminIcon name="close" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.inline-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--fm-space-sm);
  padding: var(--fm-space-md);
  border: 1px solid;
  border-radius: var(--fm-radius-control);
}

.inline-alert--danger {
  background: var(--fm-danger-button-bg);
  border-color: var(--fm-danger-border);
  color: var(--fm-danger-text);
}

.inline-alert--warning {
  background: var(--fm-warning-soft);
  border-color: var(--fm-warning-border);
  color: var(--fm-warning-text);
}

.inline-alert--info {
  background: var(--fm-primary-soft);
  border-color: var(--fm-primary-soft-border);
  color: var(--fm-primary-text);
}

.inline-alert__icon {
  margin-top: 2px;
}

.inline-alert__body {
  min-width: 0;
  flex: 1;
}

.inline-alert__title {
  font: var(--fm-headline-sm);
  color: inherit;
}

.inline-alert__content {
  margin-top: var(--fm-space-xs);
  color: var(--fm-text);
}

.inline-alert__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fm-space-sm);
  margin-top: var(--fm-space-md);
}

.inline-alert__close {
  display: inline-grid;
  width: 32px;
  height: 32px;
  flex: none;
  place-items: center;
  border: 0;
  border-radius: var(--fm-radius-control);
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.inline-alert__close:hover {
  background: rgba(15, 23, 42, 0.06);
}
</style>
