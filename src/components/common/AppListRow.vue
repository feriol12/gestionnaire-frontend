<!--
  AppListRow — generic icon + label/date + trailing amount row
  (MONEVA V2, Phase 2), shared later by the Dashboard "recent" list and the
  Expenses mobile card list. Purely presentational, no store/API access.

  Note for consumers: when rendering a list of these with v-for, key each
  instance by the underlying resource's own `id` (not the array index) —
  AppTable's existing rows still use an index key for their own reasons,
  but any *new* list built on this component should not repeat that.
-->
<template>
  <div class="app-list-row">
    <div
      v-if="icon || $slots.icon"
      class="app-list-row-icon"
      :class="iconBgClass"
      :style="iconStyle"
      aria-hidden="true"
    >
      <slot name="icon">{{ icon }}</slot>
    </div>
    <div class="app-list-row-main">
      <p class="app-list-row-label">{{ label }}</p>
      <p v-if="sublabel" class="app-list-row-sublabel">{{ sublabel }}</p>
    </div>
    <div class="app-list-row-trailing">
      <slot name="trailing">
        <span class="app-list-row-amount" :class="`app-list-row-amount-${amountVariant}`">
          {{ amount }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: { type: String, default: '' },
  iconBgClass: { type: String, default: '' },
  label: { type: String, required: true },
  sublabel: { type: String, default: '' },
  amount: { type: String, default: '' },
  amountVariant: {
    type: String,
    default: 'neutral',
    validator: (value) => ['positive', 'expense', 'neutral'].includes(value)
  }
});

const iconStyle = computed(() =>
  props.iconBgClass ? {} : { backgroundColor: 'var(--color-border-soft)' }
);
</script>

<style scoped>
.app-list-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
}

.app-list-row-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-moneva-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.app-list-row-main {
  flex: 1;
  min-width: 0;
}

.app-list-row-label {
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  font-weight: var(--text-body-md--font-weight);
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-list-row-sublabel {
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted-light);
}

.app-list-row-trailing {
  flex-shrink: 0;
}

.app-list-row-amount {
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.app-list-row-amount-positive {
  color: var(--color-positive);
}

.app-list-row-amount-expense {
  color: var(--color-expense);
}

.app-list-row-amount-neutral {
  color: var(--color-ink);
}
</style>
