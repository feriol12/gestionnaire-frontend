<script setup>
// Bouton Admin : variantes primary / secondary / danger / ghost.
// Avec « to », rend un RouterLink stylé en bouton (navigation interne uniquement).
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AdminIcon from './AdminIcon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v),
  },
  type: { type: String, default: 'button' },
  to: { type: [String, Object], default: null },
  icon: { type: String, default: null },
  iconRight: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

// En chargement, le bouton reste focalisable (aria-disabled) pour ne pas perdre
// le focus clavier ; les clics sont ignorés jusqu'à la fin du chargement.
function onClick(event) {
  if (props.loading) return
  emit('click', event)
}

const classes = computed(() => [
  'admin-button',
  `admin-button--${props.variant}`,
  { 'admin-button--block': props.block, 'is-loading': props.loading },
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes" @click="emit('click', $event)">
    <AdminIcon v-if="icon" :name="icon" :size="16" />
    <span><slot /></span>
    <AdminIcon v-if="iconRight" :name="iconRight" :size="16" />
  </RouterLink>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="disabled"
    :aria-disabled="loading ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click="onClick"
  >
    <AdminIcon v-if="loading" name="loader" :size="16" class="admin-button__spinner" />
    <AdminIcon v-else-if="icon" :name="icon" :size="16" />
    <span><slot /></span>
    <AdminIcon v-if="iconRight && !loading" :name="iconRight" :size="16" />
  </button>
</template>

<style scoped>
.admin-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--fm-space-sm);
  min-height: var(--fm-control-height);
  padding: 0 var(--fm-space-md);
  border: 1px solid transparent;
  border-radius: var(--fm-radius-control);
  font: var(--fm-label-md);
  font-size: 0.875rem;
  letter-spacing: 0;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
}

.admin-button--block {
  display: flex;
  width: 100%;
}

.admin-button--primary {
  background: var(--fm-primary);
  color: var(--fm-on-primary);
}

.admin-button--primary:hover:not(:disabled) {
  background: var(--fm-primary-hover);
}

.admin-button--secondary {
  background: var(--fm-surface);
  border-color: var(--fm-border);
  color: var(--fm-heading);
}

.admin-button--secondary:hover:not(:disabled) {
  background: var(--fm-surface-hover);
}

.admin-button--danger {
  background: var(--fm-danger-button-bg);
  border-color: var(--fm-danger-button-border);
  color: var(--fm-danger-text);
}

.admin-button--danger:hover:not(:disabled) {
  background: var(--fm-danger-button-hover);
}

.admin-button--ghost {
  background: var(--fm-primary-soft);
  color: var(--fm-primary-text);
}

.admin-button--ghost:hover:not(:disabled) {
  background: var(--fm-primary-soft-border);
}

.admin-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.admin-button.is-loading {
  cursor: progress;
}

.admin-button__spinner {
  animation: admin-spin 900ms linear infinite;
}

@keyframes admin-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
