<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'

import AppButton from '@/components/common/AppButton.vue'
import PeriodFilter from '@/components/common/PeriodFilter.vue'
import StatsCard from '@/components/common/StatsCard.vue'

import BudgetTable from '@/components/budgets/BudgetTable.vue'
import BudgetForm from '@/components/budgets/BudgetForm.vue'
// import ExportButton from '@/components/common/ExportButton.vue';

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

const confirmDelete = (budget) => {

  budgetToDelete.value = budget

  showDeleteModal.value = true
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
  { value: 'month', label: 'Ce mois', icon: '📊' },
  { value: 'year', label: 'Cette année', icon: '📈' }
]

// LIFECYCLE
onMounted(() => {

  refreshData()
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
  >
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >

      <!-- HEADER -->
      <div class="mb-8">

        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >

          <div>

            <h1
              class="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent"
            >
              Mes budgets
            </h1>

            <p class="text-slate-500 mt-1">
              Gérez vos budgets et objectifs financiers
            </p>

          </div>

          <AppButton
            variant="primary"
            @click="openModal = true"
          >

            <template #default>

              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />

              </svg>

              Nouveau budget

            </template>

          </AppButton>

        </div>

      </div>

      <!-- STATS -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      >

        <StatsCard
          label="Ce mois"
          :value="summary.current_month_total"
          icon="💰"
          subtitle="budget mensuel"
          icon-bg-class="bg-blue-100"
        />

        <StatsCard
          label="Mois dernier"
          :value="summary.last_month_total"
          icon="📅"
          subtitle="budget précédent"
          icon-bg-class="bg-emerald-100"
        />

        <!-- <StatsCard
          label="Cette année"
          :value="summary.this_year"
          icon="📊"
          subtitle="budget annuel"
          icon-bg-class="bg-purple-100"
        /> -->

        <StatsCard
          label="Total"
          :value="annualTotalAmount"
          icon="🏦"
          subtitle="budgets annuels"
          icon-bg-class="bg-amber-100"
        />

      </div>

      <!-- TABLE SECTION -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >

        <!-- TOOLBAR -->
        <div
          class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >

          <div class="flex items-center gap-3">

            <div
              class="w-1 h-6 bg-blue-500 rounded-full"
            />

            <h2
              class="text-lg font-semibold text-slate-700"
            >
              Liste des budgets
            </h2>

          </div>

          <div class="flex items-center gap-3">

            <PeriodFilter
              :period="currentPeriod"
              :options="budgetFilterOptions"
       @update:period="handlePeriodChange"
            />

          </div>

        </div>

        <!-- TABLE -->
        <BudgetTable
          :budgets="budgets"
          :loading="budgetStore.loading"
          @edit="editBudget"
          @delete="confirmDelete"
        />

      </div>

      <!-- FORM MODAL -->
      <BudgetForm
        :open="openModal"
        :budget="selectedBudget"
        @close="closeModal"
        @saved="refreshData"
      />

      <!-- DELETE MODAL -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >

        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        >

          <div class="text-center">

            <div
              class="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4"
            >

              🗑️

            </div>

            <h3
              class="text-lg font-semibold text-slate-900 mb-2"
            >
              Confirmer la suppression
            </h3>

            <p
              class="text-sm text-slate-500 mb-6"
            >
              Voulez-vous vraiment supprimer ce budget ?
            </p>

            <div
              class="flex justify-center gap-3"
            >

              <AppButton
                variant="secondary"
                @click="showDeleteModal = false"
              >
                Annuler
              </AppButton>

              <AppButton
                variant="danger"
                :loading="deleting"
                @click="deleteBudget"
              >
                Supprimer
              </AppButton>

            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>