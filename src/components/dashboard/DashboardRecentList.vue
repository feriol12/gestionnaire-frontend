<!--
  DashboardRecentList (MONEVA V2, Phase 7) — renders every transaction it is
  given, in the order received (the endpoint already limits and orders them).
  Presentation only: dates are formatted from their "Y-m-d" parts, so no
  timezone shift; no status, time or total is shown.
-->
<template>
  <ul v-if="transactions.length" class="recent">
    <li v-for="transaction in transactions" :key="transaction.id" class="recent-item">
      <AppListRow
        :label="transaction.description"
        :sublabel="`${transaction.categorie} • ${formatDate(transaction.date)}`"
        :amount="`−${formatAmount(transaction.montant)} FCFA`"
        :icon-bg-class="toneClass(transaction.categorie)"
      >
        <template #icon>
          <component :is="getExpenseCategory(transaction.categorie).icon" class="recent-icon" />
        </template>
      </AppListRow>
    </li>
  </ul>

  <EmptyState v-else title="Aucune dépense récente" message="Vos dernières dépenses apparaîtront ici." />
</template>

<script setup>
import AppListRow from '@/components/common/AppListRow.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { getExpenseCategory } from '@/constants/expenseCategories';

defineProps({
  // [{ id, description, montant, date, categorie }] as loaded by the Dashboard.
  transactions: { type: Array, default: () => [] }
});

const TONE_CLASSES = {
  positive: 'bg-positive-bg text-positive',
  primary: 'bg-primary/10 text-primary',
  expense: 'bg-expense-bg text-expense',
  neutral: 'bg-border-soft text-text-muted',
  beauty: 'bg-pink-50 text-pink-600'
};

const toneClass = (category) => TONE_CLASSES[getExpenseCategory(category).tone];

const formatAmount = (value) => new Intl.NumberFormat('fr-FR').format(Number(value) || 0);

const formatDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(typeof value === 'string' ? value : '');
  if (!match) return value ?? '';
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
</script>

<style scoped>
.recent {
  margin: 0;
  padding: 0;
  list-style: none;
}

.recent-item + .recent-item {
  border-top: 1px solid var(--color-border-soft);
}

.recent-icon {
  width: 20px;
  height: 20px;
}
</style>
