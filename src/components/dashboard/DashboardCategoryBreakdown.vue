<!--
  DashboardCategoryBreakdown (MONEVA V2, Phase 7) — presentational view of the
  categories exactly as loaded by the Dashboard ({ nom, montant, pourcentage,
  color }). Rows come only from the payload: nothing is added or filtered.
  The stacked bar is decorative; the list carries names, % and amounts.
-->
<template>
  <div class="cat">
    <template v-if="categories.length">
      <div class="cat-bar" aria-hidden="true">
        <span
          v-for="cat in categories"
          :key="`seg-${cat.nom}`"
          class="cat-seg"
          :class="cat.color"
          :style="{ width: `${cat.pourcentage}%` }"
          :title="cat.nom"
        ></span>
      </div>

      <ul class="cat-list">
        <li v-for="cat in categories" :key="cat.nom" class="cat-item">
          <span class="cat-icon" :class="toneClass(cat.nom)" aria-hidden="true">
            <component :is="getExpenseCategory(cat.nom).icon" class="cat-icon-svg" />
          </span>
          <span class="cat-main">
            <span class="cat-name">
              <span class="cat-dot" :class="cat.color" aria-hidden="true"></span>
              {{ cat.nom }}
            </span>
            <span class="cat-percent">{{ cat.pourcentage }}%</span>
          </span>
          <span class="cat-amount">{{ formatAmount(cat.montant) }} FCFA</span>
        </li>
      </ul>
    </template>

    <EmptyState v-else title="Aucune dépense" message="Aucune dépense par catégorie pour le moment." />
  </div>
</template>

<script setup>
import EmptyState from '@/components/common/EmptyState.vue';
import { getExpenseCategory } from '@/constants/expenseCategories';

defineProps({
  categories: { type: Array, default: () => [] }
});

const TONE_CLASSES = {
  positive: 'bg-positive-bg text-positive',
  primary: 'bg-primary/10 text-primary',
  expense: 'bg-expense-bg text-expense',
  neutral: 'bg-border-soft text-text-muted',
  beauty: 'bg-pink-50 text-pink-600'
};

const toneClass = (name) => TONE_CLASSES[getExpenseCategory(name).tone];

const formatAmount = (value) => new Intl.NumberFormat('fr-FR').format(Number(value) || 0);
</script>

<style scoped>
.cat-bar {
  display: flex;
  gap: 2px;
  height: 12px;
  overflow: hidden;
  background-color: var(--color-border-soft);
  border-radius: 999px;
}

.cat-seg {
  display: block;
  height: 100%;
  min-width: 0;
}

.cat-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0 0;
  padding: 0;
  list-style: none;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-xs) 0;
}

.cat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-moneva-md);
}

.cat-icon-svg {
  width: 18px;
  height: 18px;
}

.cat-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.cat-name {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
  font-weight: var(--text-label-lg--font-weight);
  color: var(--color-ink);
}

.cat-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.cat-percent {
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted-light);
  font-variant-numeric: tabular-nums;
}

.cat-amount {
  flex-shrink: 0;
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
  font-weight: 700;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
