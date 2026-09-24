<!-- src/components/expenses/ExpenseTable.vue -->
<!--
  MONEVA V2 (Phase 5): a single AppTable instance serves both breakpoints.
  >=768px it is the Stitch desktop table; <768px the same rows (the same
  AppTable page slice, page size 4) are restyled into AppListRow cards via
  CSS only — no second list, no independent slicing or pagination.
-->
<template>
  <AppTable
    :id="id"
    class="expense-table"
    :data="expenses"
    :columns="columns"
    :loading="loading"
    :title="title"
    :subtitle="subtitle"
    :empty-message="emptyMessage"
    empty-icon="💰"
    :has-actions="showActions"
    actions-header-class="expense-th expense-th-actions"
    actions-cell-class="expense-cell expense-cell-actions"
    :show-pagination="true"

  >
    <!-- Colonne Catégorie -->
    <template #column-category="{ row }">
      <span class="expense-category">
        <span class="expense-category-icon" :class="toneClass(row.category)" aria-hidden="true">
          <component :is="getExpenseCategory(row.category).icon" class="expense-icon-20" />
        </span>
        <span class="expense-category-label">{{ row.category }}</span>
      </span>
    </template>

    <!-- Colonne Description (+ carte mobile) -->
    <template #column-description="{ row }">
      <span class="expense-desktop-only expense-description">{{ row.description }}</span>
      <div class="expense-mobile-only">
        <AppListRow
          :label="row.description"
          :sublabel="`${row.category} • ${formatDate(row.date)}`"
          :amount="formatExpenseAmount(row.amount)"
          :icon-bg-class="toneClass(row.category)"
        >
          <template #icon>
            <component :is="getExpenseCategory(row.category).icon" class="expense-icon-20" />
          </template>
        </AppListRow>
      </div>
    </template>

    <!-- Colonne Date personnalisée -->
    <template #column-date="{ row }">
      <span class="expense-date">{{ formatDate(row.date) }}</span>
    </template>

    <!-- Colonne Montant -->
    <template #column-amount="{ row }">
      <span class="expense-amount">{{ formatExpenseAmount(row.amount) }}</span>
    </template>

    <!-- Actions -->
    <template #actions="{ row }">
      <div class="expense-desktop-only expense-actions">
        <button
          type="button"
          @click="$emit('edit', row)"
          class="expense-icon-btn"
          title="Modifier"
          :aria-label="`Modifier ${row.description}`"
        >
          <Pencil class="expense-icon-18" aria-hidden="true" />
        </button>
        <button
          type="button"
          @click="$emit('delete', row)"
          class="expense-icon-btn expense-icon-btn-danger"
          title="Supprimer"
          :aria-label="`Supprimer ${row.description}`"
        >
          <Trash2 class="expense-icon-18" aria-hidden="true" />
        </button>
      </div>

      <div class="expense-mobile-only expense-menu-root" :data-expense-menu="row.id">
        <button
          type="button"
          class="expense-icon-btn"
          aria-haspopup="menu"
          :aria-expanded="openMenuId === row.id ? 'true' : 'false'"
          :aria-label="`Actions pour ${row.description}`"
          @click="toggleMenu(row.id)"
        >
          <EllipsisVertical class="expense-icon-20" aria-hidden="true" />
        </button>
        <div
          v-if="openMenuId === row.id"
          class="expense-menu"
          role="menu"
          :aria-label="`Actions pour ${row.description}`"
        >
          <button type="button" role="menuitem" class="expense-menu-item" @click="selectMenuAction('edit', row)">
            <Pencil class="expense-icon-16" aria-hidden="true" />
            Modifier
          </button>
          <button
            type="button"
            role="menuitem"
            class="expense-menu-item expense-menu-item-danger"
            @click="selectMenuAction('delete', row)"
          >
            <Trash2 class="expense-icon-16" aria-hidden="true" />
            Supprimer
          </button>
        </div>
      </div>
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
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { Pencil, Trash2, EllipsisVertical } from 'lucide-vue-next';
import AppTable from '@/components/common/AppTable.vue';
import AppListRow from '@/components/common/AppListRow.vue';
import { getExpenseCategory } from '@/constants/expenseCategories';

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

// ========== COLONNES (ordre Stitch desktop) ==========
const columns = [
  { key: 'category', label: 'Catégorie', headerClass: 'expense-th', cellClass: 'expense-cell expense-cell-category' },
  { key: 'description', label: 'Description', headerClass: 'expense-th', cellClass: 'expense-cell expense-cell-description' },
  { key: 'date', label: 'Date', headerClass: 'expense-th', cellClass: 'expense-cell expense-cell-date' },
  { key: 'amount', label: 'Montant', headerClass: 'expense-th expense-th-amount', cellClass: 'expense-cell expense-cell-amount' }
];

// ========== COMPUTED ==========
const totalAmount = computed(() => {
  return props.expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
});

// ========== MÉTHODES ==========
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0 FCFA';
  const num = parseFloat(amount);
  return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
};

const formatExpenseAmount = (amount) => `−${formatAmount(amount)}`;

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR');
};

const TONE_CLASSES = {
  positive: 'bg-positive-bg text-positive',
  primary: 'bg-primary/10 text-primary',
  expense: 'bg-expense-bg text-expense',
  neutral: 'bg-border-soft text-text-muted'
};

const toneClass = (category) => TONE_CLASSES[getExpenseCategory(category).tone];

// ========== MENU ACTIONS MOBILE ==========
const openMenuId = ref(null);

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const menuTrigger = (id) =>
  document.querySelector(`[data-expense-menu="${id}"] [aria-haspopup="menu"]`);

const closeMenu = ({ restoreFocus = false } = {}) => {
  const id = openMenuId.value;
  openMenuId.value = null;
  if (restoreFocus && id !== null) menuTrigger(id)?.focus();
};

// Focus the row's ⋮ trigger before emitting, so the edit/delete layer that
// opens next records a stable return-focus origin (not the removed menu item).
const selectMenuAction = (action, row) => {
  closeMenu({ restoreFocus: true });
  emit(action, row);
};

const onDocumentPointerDown = (event) => {
  const root = event.target.closest?.('[data-expense-menu]');
  if (!root || root.dataset.expenseMenu !== String(openMenuId.value)) closeMenu();
};

const onDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeMenu({ restoreFocus: true });
};

const removeMenuListeners = () => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
  document.removeEventListener('keydown', onDocumentKeydown);
};

watch(openMenuId, async (id) => {
  removeMenuListeners();
  if (id === null) return;
  document.addEventListener('pointerdown', onDocumentPointerDown);
  document.addEventListener('keydown', onDocumentKeydown);
  await nextTick();
  document.querySelector(`[data-expense-menu="${id}"] [role="menuitem"]`)?.focus();
});

// A page/period change can remove the row whose menu is open.
watch(() => props.expenses, () => closeMenu());

onBeforeUnmount(removeMenuListeners);
</script>

<style scoped>
.expense-icon-16 {
  width: 16px;
  height: 16px;
}

.expense-icon-18 {
  width: 18px;
  height: 18px;
}

.expense-icon-20 {
  width: 20px;
  height: 20px;
}

/* ---------- Desktop table (>=768px) ---------- */
.expense-table :deep(.expense-th) {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.expense-table :deep(.expense-th-amount) {
  text-align: right;
}

.expense-table :deep(.expense-cell) {
  padding: var(--spacing-md) var(--spacing-lg);
  vertical-align: middle;
}

.expense-table :deep(.expense-cell-amount) {
  text-align: right;
}

.expense-category {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.expense-category-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-moneva-lg);
}

.expense-category-label {
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  font-weight: 600;
  color: var(--color-ink);
}

.expense-description {
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  font-weight: 500;
  color: var(--color-ink);
}

.expense-date {
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.expense-amount {
  font-size: var(--text-body-lg);
  line-height: var(--text-body-lg--line-height);
  font-weight: 700;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.expense-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.expense-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-moneva);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.expense-icon-btn:hover {
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.expense-icon-btn-danger:hover {
  color: var(--color-expense);
  background-color: var(--color-expense-bg);
}

.expense-mobile-only {
  display: none;
}

/* ---------- Mobile cards (<768px): same AppTable rows, restyled ---------- */
@media (max-width: 767px) {
  .expense-desktop-only {
    display: none;
  }

  .expense-mobile-only {
    display: block;
  }

  .expense-table {
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    overflow: visible;
  }

  .expense-table :deep(thead) {
    display: none;
  }

  .expense-table :deep(div:has(> table)) {
    overflow: visible;
  }

  .expense-table :deep(table),
  .expense-table :deep(tbody) {
    display: block;
  }

  .expense-table :deep(tbody) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .expense-table :deep(tbody > tr) {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-xs) var(--spacing-sm) var(--spacing-md);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-moneva-lg);
    box-shadow: var(--shadow-low);
  }

  .expense-table :deep(.expense-cell-category),
  .expense-table :deep(.expense-cell-date),
  .expense-table :deep(.expense-cell-amount) {
    display: none;
  }

  .expense-table :deep(.expense-cell-description) {
    flex: 1;
    min-width: 0;
    padding: 0;
  }

  .expense-table :deep(.expense-cell-actions) {
    padding: 0;
  }

  .expense-menu-root {
    position: relative;
  }

  .expense-menu {
    position: absolute;
    top: 50%;
    right: calc(100% + var(--spacing-xs));
    z-index: 1;
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-moneva-md);
    box-shadow: var(--shadow-medium);
    transform: translateY(-50%);
  }

  .expense-menu-item {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    height: 44px;
    padding: 0 var(--spacing-md);
    font-size: var(--text-label-lg);
    line-height: var(--text-label-lg--line-height);
    font-weight: var(--text-label-lg--font-weight);
    color: var(--color-ink);
    white-space: nowrap;
    background: transparent;
    border: none;
    border-radius: var(--radius-moneva);
    cursor: pointer;
  }

  .expense-menu-item:hover {
    background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }

  .expense-menu-item-danger {
    color: var(--color-expense);
  }

  .expense-menu-item-danger:hover {
    background-color: var(--color-expense-bg);
  }
}
</style>
