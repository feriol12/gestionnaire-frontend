<!-- src/views/expenses/ExpensesView.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- ========== EN-TÊTE ========== -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent"
            >
              Mes dépenses
            </h1>
            <p class="text-slate-500 mt-1">Suivez et gérez toutes vos dépenses</p>
          </div>

          <AppButton variant="primary" @click="openModal = true">
            <template #default>
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Nouvelle dépense
            </template>
          </AppButton>
        </div>
      </div>

      <!-- Cartes statistiques -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          label="Aujourd'hui"
          :value="summary.today"
          icon="💰"
          subtitle="dépenses du jour"
          icon-bg-class="bg-blue-100"
        />

        <StatsCard
          label="Ce mois"
          :value="summary.this_month"
          icon="📅"
          subtitle="dépenses mensuelles"
          icon-bg-class="bg-emerald-100"
        />

        <StatsCard
          label="Mois dernier"
          :value="summary.last_month"
          icon="📆"
          subtitle="mois précédent"
          icon-bg-class="bg-amber-100"
        />

        <StatsCard
          label="Cette année"
          :value="summary.this_year"
          icon="📊"
          subtitle="total de l'année"
          icon-bg-class="bg-purple-100"
        />
      </div>

      <!-- ========== SECTION FILTRES + TABLEAU ========== -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- Barre d'outils -->
        <div
          class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div class="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 class="text-lg font-semibold text-slate-700">Liste des dépenses</h2>
          </div>

          <div class="flex items-center gap-3">
            <PeriodFilter :period="currentPeriod" @update:period="handlePeriodChange" />
            <ExportButton :period="currentPeriod" />
          
           
          </div>
        </div>

        <!-- Tableau -->
        <ExpenseTable
          id="expenses-table"
          :expenses="expenses"
          :loading="expenseStore.loading"
          :title="'Mes dépenses'"
          :show-add-button="false"
          @edit="editExpense"
          @delete="confirmDelete"
        />
      </div>

      <!-- ========== MODALES ========== -->
      <ExpenseForm
        :open="openModal"
        :expense="selectedExpense"
        @close="closeModal"
        @saved="refreshData"
      />

      <!-- Modale confirmation suppression -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all">
          <div class="text-center">
            <div
              class="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4"
            >
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Confirmer la suppression</h3>
            <p class="text-sm text-slate-500 mb-6">
              Êtes-vous sûr de vouloir supprimer<br />
              "<strong class="text-slate-700">{{ expenseToDelete?.description }}</strong
              >" ?
            </p>
            <div class="flex justify-center gap-3">
              <AppButton variant="secondary" @click="showDeleteModal = false"> Annuler </AppButton>
              <AppButton variant="danger" :loading="deleting" @click="deleteExpense">
                Supprimer
              </AppButton>
            </div>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useExpenseStore } from '@/stores/useExpenseStore'
import AppButton from '@/components/common/AppButton.vue'
import PeriodFilter from '@/components/common/PeriodFilter.vue'
import ExportButton from '@/components/common/ExportButton.vue'
import ExpenseTable from '@/components/expenses/ExpenseTable.vue'
import ExpenseForm from '@/components/expenses/ExpenseForm.vue'
import StatsCard from '@/components/common/StatsCard.vue'

// ========== STORE ==========
const expenseStore = useExpenseStore()

// ========== STATE ==========
const openModal = ref(false)
const selectedExpense = ref(null)
const showDeleteModal = ref(false)
const expenseToDelete = ref(null)
const deleting = ref(false)
const currentPeriod = ref('month')

// ========== COMPUTED ==========
const expenses = computed(() => expenseStore.expenses)
const summary = computed(() => expenseStore.summary)

// ========== MÉTHODES ==========
const refreshData = async () => {
  await Promise.all([expenseStore.fetchExpenses(currentPeriod.value), expenseStore.fetchSummary()])
}

const handlePeriodChange = (period) => {
  currentPeriod.value = period
  expenseStore.fetchExpenses(period)
}

const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0 FCFA'
  const num = parseFloat(amount)
  return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA'
}

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

const confirmDelete = (expense) => {
  expenseToDelete.value = expense
  showDeleteModal.value = true
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
