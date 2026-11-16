<script setup>
// Pastille de statut (pill 24px) : la couleur double toujours un libellé texte.
defineProps({
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['success', 'warning', 'danger', 'info', 'neutral'].includes(v),
  },
  dot: { type: Boolean, default: true },
})
</script>

<template>
  <span class="status-badge" :class="`status-badge--${tone}`">
    <svg v-if="dot" class="status-badge__dot" viewBox="0 0 6 6" aria-hidden="true" focusable="false">
      <circle cx="3" cy="3" r="3" />
    </svg>
    <slot />
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 24px;
  padding: 0.125rem 0.625rem;
  border: 1px solid;
  border-radius: var(--fm-radius-pill);
  font: var(--fm-label-md);
  white-space: nowrap;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  fill: currentColor;
  flex: none;
}

.status-badge--success {
  background: var(--fm-success-soft);
  border-color: var(--fm-success-border);
  color: var(--fm-success-text);
}

.status-badge--warning {
  background: var(--fm-warning-soft);
  border-color: var(--fm-warning-border);
  color: var(--fm-warning-text);
}

.status-badge--danger {
  background: var(--fm-danger-soft);
  border-color: var(--fm-danger-border);
  color: var(--fm-danger-text);
}

.status-badge--info {
  background: var(--fm-primary-soft);
  border-color: var(--fm-primary-soft-border);
  color: var(--fm-primary-text);
}

.status-badge--neutral {
  background: var(--fm-neutral-soft);
  border-color: var(--fm-neutral-border);
  color: var(--fm-neutral-text);
}
</style>
