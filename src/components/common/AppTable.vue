<!-- src/components/common/AppTable.vue -->
<template>
  <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
    
    <!-- HEADER (optionnel) -->
    <div v-if="$slots.header || title" class="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h3 v-if="title" class="text-lg font-semibold text-slate-800">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-slate-400 mt-0.5">{{ subtitle }}</p>
        <slot name="header-left" />
      </div>
      <div class="flex gap-2">
        <slot name="header-right" />
      </div>
    </div>
    
    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <!-- TABLEAU -->
    <div v-else-if="data.length > 0" class="overflow-x-auto">
      <table class="w-full text-sm">
        <!-- En-tête du tableau -->
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr class="text-left text-slate-500 font-medium">
            <th v-for="column in columns" :key="column.key" :class="column.headerClass || 'px-5 py-3'">
              {{ column.label }}
            </th>
            <th v-if="hasActions" :class="actionsHeaderClass || 'px-5 py-3 text-center'">
              Actions
            </th>
          </tr>
        </thead>
        
        <!-- Corps du tableau -->
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(row, index) in data" :key="index" class="hover:bg-slate-50 transition" :class="rowClass">
            <!-- Cellules dynamiques -->
            <td v-for="column in columns" :key="column.key" :class="column.cellClass || 'px-5 py-3'">
              <!-- Slot personnalisé pour une colonne -->
              <slot :name="`column-${column.key}`" :row="row" :value="row[column.key]">
                <!-- Rendu par défaut -->
                <span :class="column.valueClass ? column.valueClass(row[column.key]) : ''">
                  {{ formatValue(row[column.key], column) }}
                </span>
              </slot>
            </td>
            
            <!-- Cellule Actions -->
            <td v-if="hasActions" :class="actionsCellClass || 'px-5 py-3 text-center whitespace-nowrap'">
              <div class="flex justify-center gap-2">
                <slot name="actions" :row="row" />
              </div>
            </td>
          </tr>
        </tbody>
        
        <!-- Pied de tableau (totaux) -->
        <tfoot v-if="$slots.footer" class="bg-slate-50 border-t border-slate-200">
          <tr>
            <slot name="footer" />
          </tr>
        </tfoot>
       </table>
    </div>
    
    <!-- EMPTY STATE -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
      <div class="text-5xl mb-3">{{ emptyIcon || '📭' }}</div>
      <p class="text-slate-500 mb-2">{{ emptyMessage || 'Aucune donnée disponible' }}</p>
      <slot name="empty-action" />
    </div>
    
  </div>
</template>

<script setup>
import { computed } from 'vue';

// ========== PROPS ==========
const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  columns: {
    type: Array,
    required: true,
    validator: (value) => value.every(col => col.key && col.label)
  },
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  emptyMessage: {
    type: String,
    default: 'Aucune donnée disponible'
  },
  emptyIcon: {
    type: String,
    default: '📭'
  },
  rowClass: {
    type: String,
    default: ''
  },
  hasActions: {
    type: Boolean,
    default: false
  },
  actionsHeaderClass: {
    type: String,
    default: 'px-5 py-3 text-center'
  },
  actionsCellClass: {
    type: String,
    default: 'px-5 py-3 text-center whitespace-nowrap'
  }
});

// ========== EMITS ==========
const emit = defineEmits(['row-click', 'action']);

// ========== MÉTHODES ==========
const formatValue = (value, column) => {
  if (column.format && typeof column.format === 'function') {
    return column.format(value);
  }
  return value;
};

// ========== SLOTS ==========
// Les slots sont gérés par Vue automatiquement
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
.shadow-card {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
}
</style>