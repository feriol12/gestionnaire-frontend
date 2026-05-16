<!-- src/components/budgets/BudgetTable.vue -->

<template>
  <AppTable
    :data="safeBudgets"
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
        {{ formatMonth(row?.month) }}
      </span>
    </template>

    <!-- COLONNE MONTANT -->
    <template #column-amount="{ row }">
      <span class="font-semibold text-emerald-600">
        {{ formatAmount(row?.amount) }}
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
    <template #footer v-if="showFooter && safeBudgets.length > 0">
      <td
        colspan="1"
        class="px-5 py-3 text-right font-medium text-slate-700"
      >
        Total des budgets :
      </td>
      <td class="px-5 py-3 text-right font-bold text-slate-900">
        {{ formatAmount(totalAmount) }}
      </td>
      <td v-if="showActions" class="px-5 py-3" />
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
const emit = defineEmits(['edit', 'delete'])

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

// COMPUTED - Filtrer les budgets invalides
const safeBudgets = computed(() => {
  if (!Array.isArray(props.budgets)) {
    return []
  }
  // Filtrer les entrées invalides
  return props.budgets.filter(budget => budget && typeof budget === 'object')
})

const totalAmount = computed(() => {
  if (!Array.isArray(safeBudgets.value)) return 0
  
  return safeBudgets.value.reduce((total, budget) => {
    const amount = budget?.amount
    return total + (Number(amount) || 0)
  }, 0)
})

// METHODS
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) {
    return '0 FCFA'
  }
  const numAmount = Number(amount)
  if (isNaN(numAmount)) {
    return '0 FCFA'
  }
  return new Intl.NumberFormat('fr-FR').format(numAmount) + ' FCFA'
}

const formatMonth = (month) => {
  if (!month) return 'Date inconnue'
  try {
    const date = new Date(month)
    if (isNaN(date.getTime())) {
      return month
    }
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    })
  } catch (error) {
    return month
  }
}
</script>