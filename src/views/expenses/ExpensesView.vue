<!-- src/views/expenses/ExpensesView.vue -->
<template>
  <div class="expenses-page">
    <!-- ========== EN-TÊTE ========== -->
    <header class="expenses-header">
      <div class="expenses-heading">
        <h1 class="expenses-title">Mes dépenses</h1>
        <p class="expenses-subtitle">Suivez et gérez toutes vos dépenses</p>
      </div>

      <div class="expenses-header-actions">
        <ExportButton :period="currentPeriod" />

        <AppButton variant="primary" @click="openModal = true">
          <template #default>
            <Plus class="expenses-btn-icon" aria-hidden="true" />
            <span class="expenses-label-full">Nouvelle dépense</span>
            <span class="expenses-label-short">Nouvelle</span>
          </template>
        </AppButton>
      </div>
    </header>

    <!-- ========== FILTRE + TOTAL ========== -->
    <div class="expenses-overview">
      <div class="expenses-card expenses-filter-card">
        <PeriodFilter
          :period="currentPeriod"
          :options="periodOptions"
          @update:period="handlePeriodChange"
        />
      </div>

      <div class="expenses-card expenses-total-card">
        <div class="expenses-total-main">
          <p class="expenses-total-label">
            Total dépensé
            <span class="expenses-total-badge">{{ periodLabel }}</span>
          </p>
          <p class="expenses-total-value">
            {{ formatAmountValue(totalAmount) }}
            <span class="expenses-total-currency">FCFA</span>
          </p>
        </div>
        <span class="expenses-total-icon" aria-hidden="true">
          <TrendingDown class="expenses-total-icon-svg" />
        </span>
      </div>
    </div>

    <!-- ========== LISTE ========== -->
    <section class="expenses-list" aria-labelledby="expenses-list-heading">
      <h2 id="expenses-list-heading" class="expenses-list-heading">Liste des dépenses</h2>

      <ExpenseTable
        id="expenses-table"
        :expenses="expenses"
        :loading="expenseStore.loading"
        title=""
        :show-add-button="false"
        :show-footer="false"
        @edit="editExpense"
        @delete="confirmDelete"
      />
    </section>

    <!-- ========== MODALES ========== -->
    <ExpenseForm
      :open="openModal"
      :expense="selectedExpense"
      @close="closeModal"
      @saved="refreshData"
    />

    <!-- Modale confirmation suppression -->
    <div v-if="showDeleteModal" class="expenses-confirm-backdrop">
      <div
        class="expenses-confirm-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="expenses-confirm-title"
        aria-describedby="expenses-confirm-message"
      >
        <div class="expenses-confirm-icon" aria-hidden="true">
          <Trash2 class="expenses-confirm-icon-svg" />
        </div>
        <h3 id="expenses-confirm-title" class="expenses-confirm-title">Confirmer la suppression</h3>
        <p id="expenses-confirm-message" class="expenses-confirm-message">
          Êtes-vous sûr de vouloir supprimer<br />
          "<strong class="expenses-confirm-name">{{ expenseToDelete?.description }}</strong
          >" ?
        </p>
        <div class="expenses-confirm-actions">
          <AppButton ref="deleteCancelButton" variant="secondary" @click="cancelDelete"> Annuler </AppButton>
          <AppButton variant="danger" :loading="deleting" @click="deleteExpense">
            Supprimer
          </AppButton>
        </div>
      </div>
    </div>
  </div>

  <!-- <AppNotificationModal
    :visible="expenseStore.notification.visible"
    :type="expenseStore.notification.type"
    :title="expenseStore.notification.title"
    :message="expenseStore.notification.message"
    @close="expenseStore.hideNotification"
  /> -->
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { Plus, TrendingDown, Trash2 } from 'lucide-vue-next'
import { useExpenseStore } from '@/stores/useExpenseStore'
import AppButton from '@/components/common/AppButton.vue'
import PeriodFilter from '@/components/common/PeriodFilter.vue'
import ExportButton from '@/components/common/ExportButton.vue'
import ExpenseTable from '@/components/expenses/ExpenseTable.vue'
import ExpenseForm from '@/components/expenses/ExpenseForm.vue'

// ========== STORE ==========
const expenseStore = useExpenseStore()

// ========== STATE ==========
const openModal = ref(false)
const selectedExpense = ref(null)
const showDeleteModal = ref(false)
const expenseToDelete = ref(null)
const deleting = ref(false)
const currentPeriod = ref('month')

// Same 4 periods as PeriodFilter's defaults, without the emoji icons (Stitch).
const periodOptions = [
  { value: 'today', label: "Aujourd'hui", icon: '' },
  { value: 'week', label: 'Cette semaine', icon: '' },
  { value: 'month', label: 'Ce mois', icon: '' },
  { value: 'year', label: 'Cette année', icon: '' },
]

// ========== COMPUTED ==========
const expenses = computed(() => expenseStore.expenses)

// Total of the loaded (period-filtered) list — same computation as the
// former ExpenseTable footer.
const totalAmount = computed(() =>
  expenses.value.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0),
)

// ========== MÉTHODES ==========
const refreshData = async () => {
  await Promise.all([expenseStore.fetchExpenses(currentPeriod.value), expenseStore.fetchSummary()])
}

const handlePeriodChange = (period) => {
  currentPeriod.value = period
  expenseStore.fetchExpenses(period)
}

const formatAmountValue = (amount) => new Intl.NumberFormat('fr-FR').format(amount)

const periodLabel = computed(() => {
  const labels = {
    today: "Aujourd'hui",
    week: 'Cette semaine',
    month: 'Ce mois',
    year: 'Cette année',
  }
  return labels[currentPeriod.value] || 'Ce mois'
})

const editExpense = (expense) => {
  selectedExpense.value = expense
  openModal.value = true
}

const closeModal = () => {
  openModal.value = false
  selectedExpense.value = null
}

// Focus handling for the inline confirmation (it has none of its own):
// focus starts on "Annuler" and returns to the opener on cancel.
const deleteCancelButton = ref(null)
let deleteReturnFocusEl = null

const confirmDelete = (expense) => {
  deleteReturnFocusEl = document.activeElement
  expenseToDelete.value = expense
  showDeleteModal.value = true
  nextTick(() => deleteCancelButton.value?.$el?.focus())
}

const cancelDelete = () => {
  showDeleteModal.value = false
  if (deleteReturnFocusEl?.isConnected) deleteReturnFocusEl.focus()
  deleteReturnFocusEl = null
}

const deleteExpense = async () => {
  deleting.value = true
  const result = await expenseStore.deleteExpense(expenseToDelete.value.id)

  if (result.success) {
    showDeleteModal.value = false
    expenseToDelete.value = null
    await refreshData()
  }

  deleting.value = false
}

// ========== LIFECYCLE ==========
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.expenses-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ---------- Header ---------- */
.expenses-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.expenses-heading {
  min-width: 0;
}

.expenses-title {
  font-size: var(--text-display-hero-mobile);
  line-height: var(--text-display-hero-mobile--line-height);
  font-weight: var(--text-display-hero-mobile--font-weight);
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.expenses-subtitle {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
}

.expenses-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.expenses-btn-icon {
  width: 18px;
  height: 18px;
}

.expenses-label-full {
  display: none;
}

/* ---------- Filter + total ---------- */
.expenses-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-md);
}

.expenses-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-moneva-lg);
  box-shadow: var(--shadow-low);
}

.expenses-filter-card {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: var(--spacing-sm);
}

.expenses-filter-card > * {
  max-width: 100%;
}

.expenses-total-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
}

.expenses-total-main {
  min-width: 0;
}

.expenses-total-label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.expenses-total-badge {
  padding: 2px var(--spacing-sm);
  font-size: var(--text-label-sm);
  line-height: var(--text-label-sm--line-height);
  letter-spacing: 0;
  text-transform: none;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  border-radius: 999px;
}

.expenses-total-value {
  margin-top: var(--spacing-xs);
  font-size: var(--text-currency);
  line-height: var(--text-currency--line-height);
  font-weight: var(--text-currency--font-weight);
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.expenses-total-currency {
  font-size: var(--text-body-md);
  font-weight: 600;
  color: var(--color-text-muted);
}

.expenses-total-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
  border-radius: var(--radius-moneva-md);
}

.expenses-total-icon-svg {
  width: 22px;
  height: 22px;
}

/* ---------- List ---------- */
.expenses-list-heading {
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ---------- Delete confirmation (same semantics as before, restyled) ---------- */
.expenses-confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: rgb(15 23 42 / 0.3);
  backdrop-filter: blur(4px);
}

.expenses-confirm-panel {
  width: 100%;
  max-width: 24rem;
  padding: var(--spacing-lg);
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  border-radius: var(--radius-moneva-lg);
  box-shadow: var(--shadow-high);
}

.expenses-confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-md);
  color: var(--color-expense);
  background-color: var(--color-expense-bg);
  border-radius: 999px;
}

.expenses-confirm-icon-svg {
  width: 22px;
  height: 22px;
}

.expenses-confirm-title {
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-headline-sm);
  line-height: var(--text-headline-sm--line-height);
  font-weight: var(--text-headline-sm--font-weight);
  color: var(--color-ink);
}

.expenses-confirm-message {
  margin-bottom: var(--spacing-lg);
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
}

.expenses-confirm-name {
  color: var(--color-ink);
}

.expenses-confirm-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

@media (min-width: 640px) {
  .expenses-label-full {
    display: inline;
  }

  .expenses-label-short {
    display: none;
  }
}

@media (min-width: 768px) {
  .expenses-title {
    font-size: var(--text-display-hero);
    line-height: var(--text-display-hero--line-height);
    font-weight: var(--text-display-hero--font-weight);
  }

  .expenses-list-heading {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

@media (min-width: 1024px) {
  .expenses-overview {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  }
}
</style>
