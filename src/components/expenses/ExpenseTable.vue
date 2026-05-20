<!-- src/components/expenses/ExpenseTable.vue -->
<template>
  <AppTable
    :id="id"
    :data="expenses"
    :columns="columns"
    :loading="loading"
    :title="title"
    :subtitle="subtitle"
    :empty-message="emptyMessage"
    empty-icon="💰"
    :has-actions="showActions"
    :show-pagination="true"
    
  >
    <!-- Colonne Date personnalisée -->
    <template #column-date="{ row }">
      <span class="text-slate-600 whitespace-nowrap">{{ formatDate(row.date) }}</span>
    </template>
    
    <!-- Colonne Description -->
    <template #column-description="{ row }">
      <span class="font-medium text-slate-800">{{ row.description }}</span>
    </template>
    
    <!-- Colonne Catégorie -->
    <template #column-category="{ row }">
      <span class="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
        <span>{{ getCategoryIcon(row.category) }}</span>
        {{ row.category }}
      </span>
    </template>
    
    <!-- Colonne Montant -->
    <template #column-amount="{ row }">
      <span :class="getAmountColor(row.amount)" class="font-semibold">
        {{ formatAmount(row.amount) }}
      </span>
    </template>
    
    <!-- Actions -->
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
    
    <!-- Header droite (bouton ajouter) -->
    <template #header-right v-if="showAddButton">
      <button 
        @click="$emit('add')"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition bg-blue-600 hover:bg-blue-700 text-white"
      >
        <span class="text-base">+</span>
        Ajouter
      </button>
    </template>
    
    <!-- Footer (totaux) -->
    <template #footer v-if="showFooter">
      <td colspan="3" class="px-5 py-3 text-right font-medium text-slate-700">
        Total des dépenses :
      </td>
      <td class="px-5 py-3 text-right font-bold text-slate-900">
        {{ formatAmount(totalAmount) }}
      </td>
      <td v-if="showActions" class="px-5 py-3"></td>
    </template>
    
  </AppTable>
</template>

<script setup>
import { computed } from 'vue';
import AppTable from '@/components/common/AppTable.vue';

// ========== PROPS ==========
const props = defineProps({
  expenses: {
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
    default: 'Mes dépenses'
  },
  subtitle: {
    type: String,
    default: ''
  },
  emptyMessage: {
    type: String,
    default: 'Aucune dépense pour le moment'
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showAddButton: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },

    id: { type: String, default: 'expenses-table' },
  title: { type: String, default: 'Mes dépenses' }

});

// ========== EMITS ==========
const emit = defineEmits(['add', 'edit', 'delete']);

// ========== COLONNES ==========
const columns = [
  { key: 'date', label: 'Date', headerClass: 'px-5 py-3', cellClass: 'px-5 py-3' },
  { key: 'description', label: 'Description', headerClass: 'px-5 py-3', cellClass: 'px-5 py-3' },
  { key: 'category', label: 'Catégorie', headerClass: 'px-5 py-3', cellClass: 'px-5 py-3' },
  { key: 'amount', label: 'Montant', headerClass: 'px-5 py-3 text-right', cellClass: 'px-5 py-3 text-right' }
];

// ========== COMPUTED ==========
const totalAmount = computed(() => {
  return props.expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
});

// ========== MÉTHODES ==========
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0,00 €';
  const num = parseFloat(amount);
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' €';
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR');
};

const getCategoryIcon = (category) => {
  const icons = {
    'Nourriture': '🍔',
    'Transport': '🚕',
    'Factures': '💡',
    'Loisirs': '🎮',
    'Imprévu': '⚠️'
  };
  return icons[category] || '📌';
};

const getAmountColor = (amount) => {
  const num = parseFloat(amount);
  if (num > 100) return 'text-red-600';
  if (num > 50) return 'text-amber-600';
  return 'text-emerald-600';
};
</script>