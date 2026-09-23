<template>
  <button
    :type="type"
    :class="['btn', `btn-${variant}`, { 'btn-loading': loading, 'btn-full': fullWidth }]"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    @click="$emit('click')"
  >
    <template v-if="loading">
      <span class="btn-spinner" aria-hidden="true"></span>
      <span class="sr-only">Chargement…</span>
    </template>
    <slot v-else>{{ text }}</slot>
  </button>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: 'Button'
  },
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success', 'outline'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);
</script>

<style scoped>
/*
 * MONEVA V2 restyle — same 5 variants, props, emits, and DOM structure as
 * before; only the visual treatment moves to Phase 1 tokens. Colors below
 * intentionally reuse MONEVA_V2_DESIGN.md §7 tokens where a variant maps
 * cleanly onto one (primary/danger->expense/success->positive); `secondary`
 * has no dedicated design-doc token, so it keeps its original neutral
 * slate hue, now sourced from the existing color-text-muted(-light)
 * tokens rather than a hardcoded hex (their values already matched).
 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px; /* Même hauteur que les inputs */
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-moneva);
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  cursor: pointer;
  border: none;
  gap: 0.5rem;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-full {
  width: 100%;
}

/* Primary variant */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

/* Secondary variant */
.btn-secondary {
  background-color: var(--color-text-muted-light);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-text-muted);
}

/* Danger variant */
.btn-danger {
  background-color: var(--color-expense);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #e11d48;
}

/* Success variant */
.btn-success {
  background-color: var(--color-positive);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #059669;
}

/* Outline variant */
.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}

/* Keyboard-focus ring only (mouse/touch focus stays quiet) */
.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Loading spinner — paused (not spun) under prefers-reduced-motion via the
 * global rule in main.css; aria-busy + the sr-only label below keep the
 * busy state understandable to assistive tech and reduced-motion users
 * even when the ring itself isn't rotating. */
.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>