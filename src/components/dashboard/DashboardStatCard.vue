<!--
  DashboardStatCard (MONEVA V2, Phase 7) — purely presentational: the caller
  passes an already-formatted value. No business math, trend or progress.
-->
<template>
  <div class="dash-stat">
    <div class="dash-stat-top">
      <p class="dash-stat-label">{{ label }}</p>
      <span v-if="icon" class="dash-stat-icon" aria-hidden="true">
        <component :is="icon" class="dash-stat-icon-svg" />
      </span>
    </div>
    <p class="dash-stat-value">
      {{ value }}
      <span v-if="unit" class="dash-stat-unit">{{ unit }}</span>
    </p>
    <p v-if="caption" class="dash-stat-caption">{{ caption }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String, default: '' },
  caption: { type: String, default: '' },
  icon: { type: [Object, Function], default: null }
});
</script>

<style scoped>
.dash-stat {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-moneva-lg);
  box-shadow: var(--shadow-low);
}

.dash-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.dash-stat-label {
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.dash-stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
  border-radius: var(--radius-moneva-md);
}

.dash-stat-icon-svg {
  width: 18px;
  height: 18px;
}

.dash-stat-value {
  margin-top: var(--spacing-md);
  font-size: var(--text-currency);
  line-height: var(--text-currency--line-height);
  font-weight: var(--text-currency--font-weight);
  letter-spacing: -0.02em;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.dash-stat-unit {
  font-size: var(--text-label-md);
  font-weight: 600;
  letter-spacing: 0;
  color: var(--color-text-muted);
}

.dash-stat-caption {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted-light);
}
</style>
