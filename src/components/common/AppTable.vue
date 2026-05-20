<template>
  <div :id="id" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
    
    <!-- HEADER -->
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
    <div v-else-if="paginatedData.length > 0" class="overflow-x-auto">
      <table class="w-full text-sm">
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
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(row, index) in paginatedData" :key="index" class="hover:bg-slate-50 transition" :class="rowClass">
            <td v-for="column in columns" :key="column.key" :class="column.cellClass || 'px-5 py-3'">
              <slot :name="`column-${column.key}`" :row="row" :value="row[column.key]">
                <span :class="column.valueClass ? column.valueClass(row[column.key]) : ''">
                  {{ formatValue(row[column.key], column) }}
                </span>
              </slot>
            </td>
            <td v-if="hasActions" :class="actionsCellClass || 'px-5 py-3 text-center whitespace-nowrap'">
              <div class="flex justify-center gap-2">
                <slot name="actions" :row="row" />
              </div>
            </td>
          </tr>
        </tbody>
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
    
    <!-- PAGINATION RESPONSIVE -->
    <div v-if="showPagination && totalPages > 1" class="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      
      <div class="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
        Affichage de <span class="font-medium">{{ startIndex + 1 }}</span> à
        <span class="font-medium">{{ endIndex }}</span> sur
        <span class="font-medium">{{ filteredData.length }}</span>
      </div>
      
      <div class="flex gap-2 justify-center">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="currentPage === 1 ? 'bg-slate-100 text-slate-400' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
        >
          ←
        </button>
        
        <!-- Numéros de pages (DESKTOP) -->
        <div class="hidden sm:flex gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="w-9 h-9 rounded-lg text-sm font-medium transition"
            :class="page === currentPage ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            {{ page }}
          </button>
        </div>
        
        <!-- Indicateur (MOBILE) -->
        <div class="sm:hidden text-sm text-slate-600 px-2">
          {{ currentPage }} / {{ totalPages }}
        </div>
        
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="currentPage === totalPages ? 'bg-slate-100 text-slate-400' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
        >
          →
        </button>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// ========== PROPS ==========
const props = defineProps({
   id: { type: String, default: '' }, 
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
  loading: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  emptyMessage: { type: String, default: 'Aucune donnée disponible' },
  emptyIcon: { type: String, default: '📭' },
  rowClass: { type: String, default: '' },
  hasActions: { type: Boolean, default: false },
  actionsHeaderClass: { type: String, default: 'px-5 py-3 text-center' },
  actionsCellClass: { type: String, default: 'px-5 py-3 text-center whitespace-nowrap' },
  showPagination: { type: Boolean, default: true }
  // Plus de defaultItemsPerPage en prop
});

// ========== STATE ==========
const currentPage = ref(1);
// Valeur par défaut : 8, sera changée par updateItemsPerPage
const itemsPerPage = ref(8);

// ========== COMPUTED ==========
const filteredData = computed(() => props.data);

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage.value);
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value;
});

const endIndex = computed(() => {
  const end = startIndex.value + itemsPerPage.value;
  return end > filteredData.value.length ? filteredData.value.length : end;
});

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value);
});

const visiblePages = computed(() => {
  const maxVisible = 5;
  const pages = [];
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// ========== MÉTHODES ==========
const formatValue = (value, column) => {
  if (column.format && typeof column.format === 'function') {
    return column.format(value);
  }
  return value;
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// ========== PAGINATION RESPONSIVE ==========
const updateItemsPerPage = () => {
  // Détection de la largeur de l'écran
  const width = window.innerWidth;
  console.log('Largeur écran:', width);
  
  if (width < 768) {
    itemsPerPage.value = 4;
    console.log('→ Mode mobile : 4 éléments par page');
  } else {
    itemsPerPage.value = 8;
    console.log('→ Mode desktop : 8 éléments par page');
  }
  
  // Reset à la page 1
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }
};

// ========== LIFECYCLE ==========
onMounted(() => {
  updateItemsPerPage();
  window.addEventListener('resize', updateItemsPerPage);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateItemsPerPage);
});
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