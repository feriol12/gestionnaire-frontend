<!--
  AppProgressBar — generic progress indicator (MONEVA V2, Phase 2).
  Presentation-only: `value`/`max` come from the caller's own already-computed
  business number, and `variant` (which color to render) is likewise decided
  entirely by the caller. This component does not decide budget-threshold
  semantics of any kind — see MONEVA_V2_DESIGN.md §7/§11.
-->
<template>
  <div class="app-progress">
    <div v-if="label" class="app-progress-label">{{ label }}</div>
    <div
      class="app-progress-track"
      role="progressbar"
      :aria-valuenow="normalizedValue"
      :aria-valuemin="0"
      :aria-valuemax="normalizedMax"
      :aria-label="label || ariaLabel || undefined"
    >
      <div
        class="app-progress-fill"
        :class="`app-progress-fill-${variant}`"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, default: 100 },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'positive', 'warning', 'expense'].includes(value)
  },
  label: { type: String, default: '' },
  /** Accessible name to use when no visible `label` is provided. */
  ariaLabel: { type: String, default: '' }
});

// Single normalization feeding BOTH the visual fill and the ARIA attributes,
// so they can never disagree (e.g. value=150/max=100 shows and announces
// 100%, never a >100% fill with a clamped announcement or vice versa).
// This never mutates the caller's own props — it only derives presentation
// values from them.
const normalizedMax = computed(() => (Number.isFinite(props.max) && props.max > 0 ? props.max : 100));

const normalizedValue = computed(() => {
  const raw = props.value;
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(raw, normalizedMax.value);
});

const percentage = computed(() => (normalizedValue.value / normalizedMax.value) * 100);
</script>

<style scoped>
.app-progress-label {
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-xs);
}

.app-progress-track {
  height: 8px;
  width: 100%;
  border-radius: 9999px;
  background-color: var(--color-border-soft);
  overflow: hidden;
}

.app-progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.app-progress-fill-primary {
  background-color: var(--color-primary);
}

.app-progress-fill-positive {
  background-color: var(--color-positive);
}

.app-progress-fill-warning {
  background-color: var(--color-warning);
}

.app-progress-fill-expense {
  background-color: var(--color-expense);
}
</style>
