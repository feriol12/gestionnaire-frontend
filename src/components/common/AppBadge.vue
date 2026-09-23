<!--
  AppBadge — generic status chip/badge (MONEVA V2, Phase 2).
  Purely presentational: the caller decides which `variant` applies and
  when (e.g. based on whatever business rule it already has). This
  component does not encode any financial threshold or business rule of
  its own — see MONEVA_V2_DESIGN.md §7's note on color-warning.
-->
<template>
  <span class="app-badge" :class="`app-badge-${variant}`">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  variant: {
    type: String,
    default: 'neutral',
    validator: (value) => ['positive', 'expense', 'warning', 'neutral'].includes(value)
  }
});
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  white-space: nowrap;
}

/*
 * P2-08: the semantic *foreground* color itself (color-positive/expense/
 * warning) is not AA-compliant at 12px on its own tinted background — the
 * background tint alone already carries the semantic distinction between
 * variants, so every variant uses the same canonical dark text token
 * (color-ink) for the label, rather than inventing a second, darker
 * semantic palette.
 */
.app-badge-positive {
  background-color: var(--color-positive-bg);
  color: var(--color-ink);
}

.app-badge-expense {
  background-color: var(--color-expense-bg);
  color: var(--color-ink);
}

.app-badge-warning {
  /* No canonical warning-bg token exists yet (design doc §7) — derived
     from color-warning itself rather than introducing a new hardcoded hue. */
  background-color: color-mix(in srgb, var(--color-warning) 18%, white);
  color: var(--color-ink);
}

.app-badge-neutral {
  background-color: var(--color-border-soft);
  color: var(--color-ink);
}
</style>
