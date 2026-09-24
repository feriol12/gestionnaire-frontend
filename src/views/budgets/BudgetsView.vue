<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { Plus, Wallet, History, ChartColumnStacked, CalendarCheck, CalendarDays, Trash2 } from 'lucide-vue-next'
import { useBudgetStore } from '@/stores/useBudgetStore'

import AppButton from '@/components/common/AppButton.vue'
import PeriodFilter from '@/components/common/PeriodFilter.vue'

import BudgetTable from '@/components/budgets/BudgetTable.vue'
import BudgetForm from '@/components/budgets/BudgetForm.vue'
import ExportBudgetButton from '@/components/common/ExportBudgetButton.vue';

const annualTotalAmount = computed(() => budgetStore.annualTotalAmount) // Pour la carte total
// STORE
const budgetStore = useBudgetStore()

// STATE
const openModal = ref(false)
const selectedBudget = ref(null)

const showDeleteModal = ref(false)
const budgetToDelete = ref(null)

const deleting = ref(false)

const currentPeriod = ref('month')

// COMPUTED
const budgets = computed(() => budgetStore.budgets)

const summary = computed(() => budgetStore.summary)

const totalAmount = computed(() => budgetStore.totalAmount)

// Stat captions — presentation only, derived from today's date.
const today = new Date()
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)
const monthName = (date) => date.toLocaleDateString('fr-FR', { month: 'long' })
const monthYear = (date) => capitalize(date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)

const currentMonthName = monthName(today)
const currentMonthLabel = monthYear(today)
const lastMonthShort = capitalize(monthName(lastMonthDate))
const lastMonthLabel = monthYear(lastMonthDate)
const currentYear = today.getFullYear()

// Same display rule as the former StatsCard: null/undefined → "0".
const formatStat = (value) => {
  if (value === undefined || value === null) return '0'
  return new Intl.NumberFormat('fr-FR').format(value)
}

// METHODS

const refreshData = async () => {

  await Promise.all([
    budgetStore.fetchBudgets(currentPeriod.value),
    budgetStore.fetchSummary(),
    budgetStore.fetchAllBudgetsForYear()
  ])
}

const handlePeriodChange = (period) => {

  currentPeriod.value = period

  budgetStore.fetchBudgets(period)
}

const editBudget = (budget) => {

  selectedBudget.value = budget

  openModal.value = true
}

const closeModal = () => {
 console.log('closeModal called')
  openModal.value = false

  selectedBudget.value = null
}

// Focus handling for the inline confirmation (it has none of its own):
// focus starts on "Annuler" and returns to the opener on cancel.
const deleteCancelButton = ref(null)
let deleteReturnFocusEl = null

const confirmDelete = (budget) => {

  deleteReturnFocusEl = document.activeElement

  budgetToDelete.value = budget

  showDeleteModal.value = true

  nextTick(() => deleteCancelButton.value?.$el?.focus())
}

const cancelDelete = () => {

  showDeleteModal.value = false

  if (deleteReturnFocusEl?.isConnected) deleteReturnFocusEl.focus()

  deleteReturnFocusEl = null
}

const deleteBudget = async () => {

  deleting.value = true

  const result =
    await budgetStore.deleteBudget(
      budgetToDelete.value.id
    )

  if (result.success) {

    showDeleteModal.value = false

    budgetToDelete.value = null

    await refreshData()
  }

  deleting.value = false
}
   //adapter le composant PeriodFilter pour les budgets (mois et année uniquement)
const budgetFilterOptions = [
  { value: 'month', label: 'Ce mois', icon: '' },
  { value: 'year', label: 'Cette année', icon: '' }
]

// LIFECYCLE
onMounted(() => {

  refreshData()
})
</script>

<template>
  <div class="budgets-page">

    <!-- HEADER -->
    <header class="budgets-header">
      <div class="budgets-heading">
        <h1 class="budgets-title">Mes budgets</h1>
        <p class="budgets-subtitle">Planifiez et gérez vos budgets mensuels.</p>
      </div>

      <div class="budgets-header-actions">
        <ExportBudgetButton
          class="budgets-export-desktop"
          :period="currentPeriod"
          variant="ghost"
          label="Exporter en PDF"
          icon
        />
        <ExportBudgetButton
          class="budgets-export-mobile"
          :period="currentPeriod"
          variant="ghost"
          label="Exporter en PDF"
          icon-only
        />

        <AppButton
          variant="primary"
          @click="openModal = true"
        >
          <template #default>
            <Plus class="budgets-btn-icon" aria-hidden="true" />
            Nouveau budget
          </template>
        </AppButton>
      </div>
    </header>

    <!-- STATS -->
    <div class="budgets-stats">

      <section class="budgets-card budgets-stat budgets-stat-hero" aria-labelledby="budgets-stat-current">
        <div class="budgets-stat-top">
          <h2 id="budgets-stat-current" class="budgets-stat-label">
            <span class="budgets-desktop-only">Budget du mois</span>
            <span class="budgets-mobile-only">Budget de {{ currentMonthName }}</span>
          </h2>
          <span class="budgets-pill">Ce mois</span>
        </div>
        <div class="budgets-stat-main">
          <p class="budgets-stat-value">
            {{ formatStat(summary.current_month_total) }}
            <span class="budgets-stat-currency">FCFA</span>
          </p>
          <span class="budgets-stat-icon budgets-desktop-only" aria-hidden="true">
            <Wallet class="budgets-stat-icon-svg" />
          </span>
        </div>
        <p class="budgets-stat-caption budgets-desktop-only">
          <CalendarCheck class="budgets-caption-icon" aria-hidden="true" />
          Période active : {{ currentMonthLabel }}
        </p>
      </section>

      <section class="budgets-card budgets-stat" aria-labelledby="budgets-stat-last">
        <div class="budgets-stat-top">
          <h2 id="budgets-stat-last" class="budgets-stat-label">
            <span class="budgets-desktop-only">Budget du mois dernier</span>
            <span class="budgets-mobile-only">Mois dernier</span>
          </h2>
          <span class="budgets-chip">
            <span class="budgets-desktop-only">{{ lastMonthLabel }}</span>
            <span class="budgets-mobile-only">{{ lastMonthShort }}</span>
          </span>
        </div>
        <div class="budgets-stat-main">
          <p class="budgets-stat-value">
            {{ formatStat(summary.last_month_total) }}
            <span class="budgets-stat-currency">FCFA</span>
          </p>
          <span class="budgets-stat-icon budgets-desktop-only" aria-hidden="true">
            <History class="budgets-stat-icon-svg" />
          </span>
        </div>
        <p class="budgets-stat-caption budgets-desktop-only">Précédemment alloué</p>
      </section>

      <section class="budgets-card budgets-stat" aria-labelledby="budgets-stat-year">
        <div class="budgets-stat-top">
          <h2 id="budgets-stat-year" class="budgets-stat-label">
            <span class="budgets-desktop-only">Total de l'année</span>
            <span class="budgets-mobile-only">Total annuel</span>
          </h2>
          <span class="budgets-chip">
            <span class="budgets-desktop-only">Cumul {{ currentYear }}</span>
            <span class="budgets-mobile-only">{{ currentYear }}</span>
          </span>
        </div>
        <div class="budgets-stat-main">
          <p class="budgets-stat-value">
            {{ formatStat(annualTotalAmount) }}
            <span class="budgets-stat-currency">FCFA</span>
          </p>
          <span class="budgets-stat-icon budgets-desktop-only" aria-hidden="true">
            <ChartColumnStacked class="budgets-stat-icon-svg" />
          </span>
        </div>
      </section>

    </div>

    <!-- HISTORIQUE -->
    <section class="budgets-history" aria-labelledby="budgets-history-heading">

      <div class="budgets-card budgets-filter-bar">
        <CalendarDays class="budgets-filter-icon" aria-hidden="true" />
        <PeriodFilter
          :period="currentPeriod"
          :options="budgetFilterOptions"
          @update:period="handlePeriodChange"
        />
      </div>

      <h2 id="budgets-history-heading" class="budgets-history-heading">Historique des budgets</h2>

      <BudgetTable
        :budgets="budgets"
        :loading="budgetStore.loading"
        title=""
        :show-footer="false"
        @edit="editBudget"
        @delete="confirmDelete"
      />
    </section>

    <!-- FORM MODAL -->
    <BudgetForm
      :open="openModal"
      :budget="selectedBudget"
      @close="closeModal"
      @saved="refreshData"
    />

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="budgets-confirm-backdrop">
      <div
        class="budgets-confirm-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="budgets-confirm-title"
        aria-describedby="budgets-confirm-message"
      >
        <div class="budgets-confirm-icon" aria-hidden="true">
          <Trash2 class="budgets-confirm-icon-svg" />
        </div>
        <h3 id="budgets-confirm-title" class="budgets-confirm-title">
          Confirmer la suppression
        </h3>
        <p id="budgets-confirm-message" class="budgets-confirm-message">
          Voulez-vous vraiment supprimer ce budget ?
        </p>
        <div class="budgets-confirm-actions">
          <AppButton ref="deleteCancelButton" variant="secondary" @click="cancelDelete">
            Annuler
          </AppButton>
          <AppButton variant="danger" :loading="deleting" @click="deleteBudget">
            Supprimer
          </AppButton>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.budgets-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.budgets-mobile-only {
  display: none;
}

/* ---------- Header ---------- */
.budgets-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.budgets-heading {
  min-width: 0;
}

.budgets-title {
  font-size: var(--text-display-hero-mobile);
  line-height: var(--text-display-hero-mobile--line-height);
  font-weight: var(--text-display-hero-mobile--font-weight);
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.budgets-subtitle {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
}

.budgets-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.budgets-btn-icon {
  width: 18px;
  height: 18px;
}

/* Two presentations of the same export, one per breakpoint. Dedicated
   classes (not *-only, which would force display:inline on the button);
   two classes outrank AppButton's own .btn display rule. */
.budgets-header-actions .budgets-export-mobile {
  display: none;
}

/* ---------- Cards ---------- */
.budgets-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-moneva-lg);
  box-shadow: var(--shadow-low);
}

.budgets-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-md);
}

.budgets-stat {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--spacing-lg);
}

.budgets-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.budgets-stat-label {
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  color: var(--color-text-muted);
}

.budgets-pill {
  flex-shrink: 0;
  padding: 2px 10px;
  font-size: var(--text-label-sm);
  line-height: var(--text-label-sm--line-height);
  font-weight: var(--text-label-sm--font-weight);
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  border-radius: 999px;
}

.budgets-chip {
  flex-shrink: 0;
  padding: 2px var(--spacing-sm);
  font-size: var(--text-label-sm);
  line-height: var(--text-label-sm--line-height);
  font-weight: var(--text-label-sm--font-weight);
  color: var(--color-text-muted);
  background-color: var(--color-border-soft);
  border-radius: var(--radius-moneva);
}

.budgets-stat-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.budgets-stat-value {
  min-width: 0;
  font-size: var(--text-currency);
  line-height: var(--text-currency--line-height);
  font-weight: var(--text-currency--font-weight);
  letter-spacing: -0.02em;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.budgets-stat-currency {
  font-size: var(--text-label-md);
  font-weight: 600;
  letter-spacing: 0;
  color: var(--color-text-muted);
}

.budgets-stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
  border-radius: var(--radius-moneva-md);
}

.budgets-stat-icon-svg {
  width: 22px;
  height: 22px;
}

.budgets-stat-caption {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--spacing-sm);
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted);
}

.budgets-caption-icon {
  width: 15px;
  height: 15px;
  color: var(--color-primary);
}

/* ---------- History ---------- */
.budgets-history {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.budgets-filter-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  padding: var(--spacing-sm) var(--spacing-md);
}

.budgets-filter-bar > :last-child {
  min-width: 0;
  max-width: 100%;
}

.budgets-filter-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
}

/* Stitch desktop shows no visible heading above the table. */
.budgets-history-heading {
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

/* ---------- Delete confirmation (same semantics as before, restyled) ---------- */
.budgets-confirm-backdrop {
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

.budgets-confirm-panel {
  width: 100%;
  max-width: 24rem;
  padding: var(--spacing-lg);
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  border-radius: var(--radius-moneva-lg);
  box-shadow: var(--shadow-high);
}

.budgets-confirm-icon {
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

.budgets-confirm-icon-svg {
  width: 22px;
  height: 22px;
}

.budgets-confirm-title {
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-headline-sm);
  line-height: var(--text-headline-sm--line-height);
  font-weight: var(--text-headline-sm--font-weight);
  color: var(--color-ink);
}

.budgets-confirm-message {
  margin-bottom: var(--spacing-lg);
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
}

.budgets-confirm-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

@media (min-width: 768px) {
  .budgets-title {
    font-size: var(--text-display-hero);
    line-height: var(--text-display-hero--line-height);
    font-weight: var(--text-display-hero--font-weight);
  }
}

/* ---------- Mobile (<768px) ---------- */
@media (max-width: 767px) {
  .budgets-desktop-only {
    display: none;
  }

  .budgets-mobile-only {
    display: inline;
  }

  .budgets-header-actions .budgets-export-desktop {
    display: none;
  }

  .budgets-header-actions .budgets-export-mobile {
    display: inline-flex;
  }

  .budgets-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .budgets-stat {
    padding: var(--spacing-md);
  }

  .budgets-stat-hero {
    grid-column: 1 / -1;
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .budgets-stat:not(.budgets-stat-hero) .budgets-stat-top {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .budgets-stat:not(.budgets-stat-hero) .budgets-stat-label {
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .budgets-stat:not(.budgets-stat-hero) .budgets-chip {
    padding: 0;
    font-size: var(--text-body-md);
    font-weight: 400;
    background: transparent;
  }

  .budgets-stat:not(.budgets-stat-hero) .budgets-stat-value {
    font-size: var(--text-headline-md);
    line-height: var(--text-headline-md--line-height);
  }

  .budgets-stat:not(.budgets-stat-hero) .budgets-stat-currency {
    display: block;
  }

  .budgets-stat-hero .budgets-stat-value {
    font-size: var(--text-display-hero-mobile);
    line-height: var(--text-display-hero-mobile--line-height);
    color: var(--color-primary);
  }

  .budgets-history-heading {
    position: static;
    width: auto;
    height: auto;
    margin: var(--spacing-sm) 0 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
    font-size: var(--text-headline-md);
    line-height: var(--text-headline-md--line-height);
    font-weight: var(--text-headline-md--font-weight);
    color: var(--color-ink);
  }
}
</style>
