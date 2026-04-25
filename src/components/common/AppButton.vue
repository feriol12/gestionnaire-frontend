<template>
  <button
    :type="type"
    :class="['btn', `btn-${variant}`, { 'btn-loading': loading, 'btn-full': fullWidth }]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="btn-spinner"></span>
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
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px; /* Même hauteur que les inputs */
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
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

/* Primary variant - Blue */
.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px #93c5fd;
}

/* Secondary variant */
.btn-secondary {
  background-color: #64748b;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #475569;
}

/* Danger variant */
.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

/* Success variant */
.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #059669;
}

/* Outline variant */
.btn-outline {
  background-color: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline:hover:not(:disabled) {
  background-color: #3b82f6;
  color: white;
}

/* Loading spinner */
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