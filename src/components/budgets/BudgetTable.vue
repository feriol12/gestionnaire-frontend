<!-- src/components/budgets/BudgetTable.vue -->
<!--
  MONEVA V2 (Phase 6): a single AppTable instance serves both breakpoints,
  keyed by budget id (two budgets for the same month are distinct rows).
  >=768px it is the Stitch desktop table; <768px the same rows (the same
  AppTable page slice, page size 4) are restyled into cards via CSS only —
  no second list, no independent slicing or pagination.
-->
<template>
  <AppTable
    class="budget-table"
    :data="safeBudgets"
    :columns="columns"
    :loading="loading"
    :title="title"
    :subtitle="subtitle"
    :empty-message="emptyMessage"
    empty-icon="💰"
    :has-actions="showActions"
    actions-header-class="budget-th budget-th-actions"
    actions-cell-class="budget-cell budget-cell-actions"
    :show-pagination="true"
    row-key="id"
  >

    <!-- COLONNE MOIS (+ carte mobile) -->
    <template #column-month="{ row }">
      <div class="budget-month" :data-budget-id="row.id">
        <span
          class="budget-month-icon"
          :class="{ 'is-current': isCurrentMonth(row?.month) }"
          aria-hidden="true"
        >
          <CalendarDays class="budget-icon-18" />
        </span>
        <div class="budget-month-text">
          <div class="budget-month-title">
            <span class="budget-month-label">{{ formatMonth(row?.month) }}</span>
            <span v-if="isCurrentMonth(row?.month)" class="budget-pill">Ce mois</span>
          </div>
          <span v-if="formatMonthRange(row?.month)" class="budget-desktop-only budget-month-range">
            {{ formatMonthRange(row?.month) }}
          </span>
          <span
            class="budget-mobile-only budget-month-amount"
            :class="{ 'is-current': isCurrentMonth(row?.month) }"
          >
            {{ formatAmount(row?.amount) }}
          </span>
        </div>
      </div>
    </template>

    <!-- COLONNE MONTANT -->
    <template #column-amount="{ row }">
      <span class="budget-amount">
        {{ formatAmountValue(row?.amount) }}
        <span class="budget-currency">FCFA</span>
      </span>
    </template>

    <!-- ACTIONS -->
    <template #actions="{ row }">
      <div class="budget-desktop-only budget-actions">
        <button
          type="button"
          @click="$emit('edit', row)"
          class="budget-icon-btn"
          title="Modifier le budget"
          :aria-label="`Modifier le budget ${rowName(row)}`"
        >
          <Pencil class="budget-icon-18" aria-hidden="true" />
        </button>
        <button
          type="button"
          @click="$emit('delete', row)"
          class="budget-icon-btn budget-icon-btn-danger"
          title="Supprimer le budget"
          :aria-label="`Supprimer le budget ${rowName(row)}`"
        >
          <Trash2 class="budget-icon-18" aria-hidden="true" />
        </button>
      </div>

      <div
        class="budget-mobile-only budget-menu-root"
        :data-budget-menu="row.id"
        @keydown="onMenuKeydown"
        @focusout="onMenuFocusOut"
      >
        <button
          type="button"
          class="budget-icon-btn"
          aria-haspopup="menu"
          :aria-expanded="openMenuId === row.id ? 'true' : 'false'"
          :aria-controls="openMenuId === row.id ? menuDomId(row.id) : undefined"
          :aria-label="`Actions pour le budget ${rowName(row)}`"
          @click="toggleMenu(row.id)"
        >
          <EllipsisVertical class="budget-icon-20" aria-hidden="true" />
        </button>
        <div
          v-if="openMenuId === row.id"
          :id="menuDomId(row.id)"
          class="budget-menu"
          role="menu"
          :aria-label="`Actions pour le budget ${rowName(row)}`"
        >
          <button type="button" role="menuitem" class="budget-menu-item" @click="selectMenuAction('edit', row)">
            <Pencil class="budget-icon-16" aria-hidden="true" />
            Modifier
          </button>
          <button
            type="button"
            role="menuitem"
            class="budget-menu-item budget-menu-item-danger"
            @click="selectMenuAction('delete', row)"
          >
            <Trash2 class="budget-icon-16" aria-hidden="true" />
            Supprimer
          </button>
        </div>
      </div>
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
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { CalendarDays, Pencil, Trash2, EllipsisVertical } from 'lucide-vue-next'
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

// COLUMNS (ordre Stitch desktop)
const columns = [
  {
    key: 'month',
    label: 'Mois',
    headerClass: 'budget-th',
    cellClass: 'budget-cell budget-cell-month'
  },
  {
    key: 'amount',
    label: 'Montant',
    headerClass: 'budget-th',
    cellClass: 'budget-cell budget-cell-amount'
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
const formatAmountValue = (amount) => {
  if (amount === undefined || amount === null) {
    return '0'
  }
  const numAmount = Number(amount)
  if (isNaN(numAmount)) {
    return '0'
  }
  return new Intl.NumberFormat('fr-FR').format(numAmount)
}

const formatAmount = (amount) => `${formatAmountValue(amount)} FCFA`

// Presentation only: reads the "YYYY-MM" prefix the form also edits
// (BudgetForm uses month.slice(0, 7)), so the label never shifts with the
// browser's timezone. Anything else keeps the previous Date-based display.
const parseMonth = (month) => {
  const match = /^(\d{4})-(\d{2})/.exec(typeof month === 'string' ? month : '')
  if (!match) return null
  return { year: Number(match[1]), monthIndex: Number(match[2]) - 1 }
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

const formatMonth = (month) => {
  if (!month) return 'Date inconnue'
  const parsed = parseMonth(month)
  if (parsed) {
    return capitalize(
      new Date(parsed.year, parsed.monthIndex, 1).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
      })
    )
  }
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

const formatMonthRange = (month) => {
  const parsed = parseMonth(month)
  if (!parsed) return ''
  const options = { day: 'numeric', month: 'short' }
  const first = new Date(parsed.year, parsed.monthIndex, 1).toLocaleDateString('fr-FR', options)
  const last = new Date(parsed.year, parsed.monthIndex + 1, 0).toLocaleDateString('fr-FR', options)
  return `${first} – ${last}`
}

const isCurrentMonth = (month) => {
  const parsed = parseMonth(month)
  if (!parsed) return false
  const now = new Date()
  return parsed.year === now.getFullYear() && parsed.monthIndex === now.getMonth()
}

// Month + amount: distinguishes two budgets of the same month for screen readers.
const rowName = (row) => `${formatMonth(row?.month)} (${formatAmount(row?.amount)})`

// ========== MENU ACTIONS MOBILE ==========
const openMenuId = ref(null)

const menuDomId = (id) => `budget-menu-${id}`

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const menuRoot = (id) => document.querySelector(`[data-budget-menu="${id}"]`)

const closeMenu = ({ restoreFocus = false } = {}) => {
  const id = openMenuId.value
  openMenuId.value = null
  if (restoreFocus && id !== null) menuRoot(id)?.querySelector('[aria-haspopup="menu"]')?.focus()
}

// Focus the row's ⋮ trigger before emitting, so the edit/delete layer that
// opens next records a stable return-focus origin (not the removed menu item).
const selectMenuAction = (action, row) => {
  closeMenu({ restoreFocus: true })
  emit(action, row)
}

const onMenuKeydown = (event) => {
  if (openMenuId.value === null) return
  const items = [...(menuRoot(openMenuId.value)?.querySelectorAll('[role="menuitem"]') || [])]
  const index = items.indexOf(document.activeElement)
  if (index === -1) return
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
  if (step) {
    event.preventDefault()
    items[(index + step + items.length) % items.length].focus()
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    items[event.key === 'Home' ? 0 : items.length - 1].focus()
  }
}

// Tabbing out of the open menu closes it without stealing focus back.
const onMenuFocusOut = (event) => {
  if (openMenuId.value === null) return
  const root = menuRoot(openMenuId.value)
  if (root && event.relatedTarget && !root.contains(event.relatedTarget)) closeMenu()
}

const onDocumentPointerDown = (event) => {
  const root = event.target.closest?.('[data-budget-menu]')
  if (!root || root.dataset.budgetMenu !== String(openMenuId.value)) closeMenu()
}

const onDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeMenu({ restoreFocus: true })
}

const removeMenuListeners = () => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeydown)
}

watch(openMenuId, async (id) => {
  removeMenuListeners()
  if (id === null) return
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeydown)
  await nextTick()
  menuRoot(id)?.querySelector('[role="menuitem"]')?.focus()
})

// A page/period change can remove the row whose menu is open.
watch(() => props.budgets, () => closeMenu())

onBeforeUnmount(removeMenuListeners)
</script>

<style scoped>
.budget-icon-16 {
  width: 16px;
  height: 16px;
}

.budget-icon-18 {
  width: 18px;
  height: 18px;
}

.budget-icon-20 {
  width: 20px;
  height: 20px;
}

/* ---------- Desktop table (>=768px) ---------- */
.budget-table :deep(.budget-th) {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.budget-table :deep(.budget-th-actions) {
  text-align: right;
}

.budget-table :deep(.budget-cell) {
  padding: var(--spacing-md) var(--spacing-lg);
  vertical-align: middle;
}

.budget-table :deep(.budget-cell-actions) {
  white-space: nowrap;
}

.budget-table :deep(.budget-cell-actions > div) {
  justify-content: flex-end;
}

.budget-month {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.budget-month-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  color: var(--color-text-muted);
  background-color: var(--color-border-soft);
  border-radius: var(--radius-moneva-md);
}

.budget-month-icon.is-current {
  color: #ffffff;
  background-color: var(--color-primary);
}

.budget-month-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.budget-month-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.budget-month-label {
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
  font-weight: var(--text-label-lg--font-weight);
  color: var(--color-ink);
  white-space: nowrap;
}

.budget-pill {
  padding: 2px 10px;
  font-size: var(--text-label-sm);
  line-height: var(--text-label-sm--line-height);
  font-weight: var(--text-label-sm--font-weight);
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  border-radius: 999px;
  white-space: nowrap;
}

.budget-month-range {
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted-light);
}

.budget-amount {
  font-size: var(--text-headline-sm);
  line-height: var(--text-headline-sm--line-height);
  font-weight: 600;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.budget-currency {
  margin-left: 2px;
  font-size: var(--text-label-sm);
  line-height: var(--text-label-sm--line-height);
  font-weight: var(--text-label-sm--font-weight);
  color: var(--color-text-muted-light);
}

.budget-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-xs);
}

.budget-icon-btn {
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

.budget-icon-btn:hover {
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.budget-icon-btn-danger:hover {
  color: var(--color-expense);
  background-color: var(--color-expense-bg);
}

.budget-icon-btn:focus-visible,
.budget-menu-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.budget-mobile-only {
  display: none;
}

/* ---------- Mobile cards (<768px): same AppTable rows, restyled ---------- */
@media (max-width: 767px) {
  .budget-desktop-only {
    display: none;
  }

  .budget-mobile-only {
    display: block;
  }

  .budget-table {
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    overflow: visible;
  }

  .budget-table :deep(thead) {
    display: none;
  }

  .budget-table :deep(div:has(> table)) {
    overflow: visible;
  }

  .budget-table :deep(table),
  .budget-table :deep(tbody) {
    display: block;
  }

  .budget-table :deep(tbody) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .budget-table :deep(tbody > tr) {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-md) var(--spacing-xs) var(--spacing-md) var(--spacing-md);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border-soft);
    border-radius: var(--radius-moneva-lg);
    box-shadow: var(--shadow-low);
  }

  .budget-table :deep(.budget-cell-amount) {
    display: none;
  }

  .budget-table :deep(.budget-cell-month) {
    flex: 1;
    min-width: 0;
    padding: 0;
  }

  .budget-table :deep(.budget-cell-actions) {
    padding: 0;
  }

  .budget-month-icon {
    width: 48px;
    height: 48px;
    color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  }

  .budget-month-icon.is-current {
    color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  }

  .budget-month-label {
    font-size: var(--text-body-lg);
    line-height: var(--text-body-lg--line-height);
    font-weight: 500;
  }

  .budget-month-amount {
    font-size: var(--text-headline-md);
    line-height: var(--text-headline-md--line-height);
    font-weight: 700;
    color: var(--color-ink);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .budget-month-amount.is-current {
    color: var(--color-primary);
  }

  .budget-menu-root {
    position: relative;
  }

  .budget-menu {
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

  .budget-menu-item {
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

  .budget-menu-item:hover {
    background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }

  .budget-menu-item-danger {
    color: var(--color-expense);
  }

  .budget-menu-item-danger:hover {
    background-color: var(--color-expense-bg);
  }
}
</style>
