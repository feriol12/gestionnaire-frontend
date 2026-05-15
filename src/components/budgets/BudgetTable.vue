<!-- src/components/budgets/BudgetTable.vue -->

<template>
  <AppTable
    :data="budgets"
    :columns="columns"
    :loading="loading"
    :title="title"
    :subtitle="subtitle"
    :empty-message="emptyMessage"
    empty-icon="💰"
    :has-actions="showActions"
    :show-pagination="true"
  >

    <!-- COLONNE MOIS -->
    <template #column-month="{ row }">

      <span class="text-slate-700 font-medium">
        {{ formatMonth(row.month) }}
      </span>

    </template>

    <!-- COLONNE MONTANT -->
    <template #column-amount="{ row }">

      <span
        class="font-semibold text-emerald-600"
      >
        {{ formatAmount(row.amount) }}
      </span>

    </template>

    <!-- ACTIONS -->
    <template #actions="{ row }">

      <button
        @click="$emit('edit', row)"
        class="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-lg"
        title="Modifier"
      >
        ✏️
      </button>

      <button
        @click="$emit('delete', row)"
        class="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg"
        title="Supprimer"
      >
        🗑️
      </button>

    </template>

    <!-- FOOTER -->
    <template #footer v-if="showFooter">

      <td
        colspan="1"
        class="px-5 py-3 text-right font-medium text-slate-700"
      >
        Total des budgets :
      </td>

      <td
        class="px-5 py-3 text-right font-bold text-slate-900"
      >
        {{ formatAmount(totalAmount) }}
      </td>

      <td
        v-if="showActions"
        class="px-5 py-3"
      />

    </template>

  </AppTable>
</template>

<script setup>
import { computed } from 'vue'

import AppTable from '@/components/common/AppTable.vue'

// PROPS
const props = defineProps({

  budgets: {
    type: Array,
    required: true,
    default: () => []
  },

  loading: {
    type: Boolean,
    default: false
  },

  title: {
    type: String,
    default: 'Mes budgets'
  },

  subtitle: {
    type: String,
    default: ''
  },

  emptyMessage: {
    type: String,
    default: 'Aucun budget pour le moment'
  },

  showActions: {
    type: Boolean,
    default: true
  },

  showFooter: {
    type: Boolean,
    default: true
  }
})

// EMITS
defineEmits([
  'edit',
  'delete'
])

// COLUMNS
const columns = [

  {
    key: 'month',
    label: 'Mois',
    headerClass: 'px-5 py-3',
    cellClass: 'px-5 py-3'
  },

  {
    key: 'amount',
    label: 'Montant',
    headerClass: 'px-5 py-3 text-right',
    cellClass: 'px-5 py-3 text-right'
  }
]

// COMPUTED
const totalAmount = computed(() => {

  return props.budgets.reduce((total, budget) => {

    return total + (Number(budget.amount) || 0)

  }, 0)
})

// METHODS

const formatAmount = (amount) => {

  if (amount === undefined || amount === null) {
    return '0 FCFA'
  }

  return new Intl.NumberFormat(
    'fr-FR'
  ).format(Number(amount)) + ' FCFA'
}

const formatMonth = (month) => {

  if (!month) return ''

  const date = new Date(month)

  return date.toLocaleDateString(
    'fr-FR',
    {
      month: 'long',
      year: 'numeric'
    }
  )
}
</script>