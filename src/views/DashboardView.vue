<template>
  <div class="dash-page">

    <!-- HEADER -->
    <header class="dash-header">
      <div class="dash-heading">
        <h1 class="dash-title">Tableau de bord</h1>
        <p class="dash-subtitle">Vue d'ensemble de vos finances</p>
      </div>

      <div class="dash-filter">
        <PeriodFilter
          :period="currentPeriod"
          :options="periodOptions"
          @update:period="handlePeriodChange"
        />
      </div>
    </header>

    <!-- STATS (4 cartes principales) -->
    <section class="dash-stats" aria-label="Indicateurs clés">
      <DashboardStatCard
        label="Budget total"
        :value="formatNumber(stats.budget_total)"
        unit="FCFA"
        :caption="currentPeriod === 'year' ? 'Budgets de cette année' : 'Budgets de ce mois'"
        :icon="Wallet"
      />
      <DashboardStatCard
        label="Dépenses"
        :value="formatNumber(stats.depenses_total)"
        unit="FCFA"
        caption="Ce mois"
        :icon="Receipt"
      />
      <DashboardStatCard
        label="Restant"
        :value="formatNumber(stats.restant)"
        unit="FCFA"
        caption="À dépenser"
        :icon="ShieldCheck"
      />
      <DashboardStatCard
        label="Taux d'épargne"
        :value="`${stats.taux_epargne}%`"
        caption="Du budget"
        :icon="Percent"
      />
    </section>

    <!-- VISUALISATIONS (2 colonnes) -->
    <div class="dash-viz">

      <!-- Évolution des dépenses -->
      <section class="dash-card" aria-labelledby="dash-evolution-title">
        <div class="dash-card-head">
          <h2 id="dash-evolution-title" class="dash-card-title">Évolution des dépenses</h2>
          <span class="dash-chip">{{ currentPeriod === 'year' ? 'Cette année' : 'Ce mois' }}</span>
        </div>

        <DashboardEvolutionChart :data="evolutionData" caption="Dépenses par mois" />

        <div class="dash-card-foot">
          <span class="dash-foot-item">
            <TrendingUp class="dash-foot-icon" aria-hidden="true" />
            {{ stats.variation_budget > 0 ? '+' : '' }}{{ stats.variation_budget.toFixed(1) }}% vs mois dernier
          </span>
          <span class="dash-foot-item">
            <Target class="dash-foot-icon" aria-hidden="true" />
            Objectif : {{ formatNumber(stats.budget_total * 0.8) }} FCFA
          </span>
        </div>
      </section>

      <!-- Dépenses par catégorie -->
      <section class="dash-card" aria-labelledby="dash-categories-title">
        <div class="dash-card-head">
          <h2 id="dash-categories-title" class="dash-card-title">Dépenses par catégorie</h2>
          <span class="dash-chip">Ce mois</span>
        </div>

        <DashboardCategoryBreakdown :categories="categories" />

        <div class="dash-card-foot">
          <span>Total : {{ formatNumber(totalDepenses) }} FCFA</span>
          <RouterLink :to="{ name: 'expenses' }" class="dash-link">
            Voir détails
            <ArrowRight class="dash-link-icon" aria-hidden="true" />
          </RouterLink>
        </div>
      </section>
    </div>

    <!-- Dernières transactions + Alertes -->
    <div class="dash-lower">

      <section class="dash-card" aria-labelledby="dash-recent-title">
        <div class="dash-card-head">
          <h2 id="dash-recent-title" class="dash-card-title">Dernières transactions</h2>
          <RouterLink :to="{ name: 'expenses' }" class="dash-link">
            Voir toutes
            <ArrowRight class="dash-link-icon" aria-hidden="true" />
          </RouterLink>
        </div>

        <DashboardRecentList :transactions="recentTransactions" />
      </section>

      <section class="dash-card" aria-labelledby="dash-alerts-title">
        <div class="dash-card-head">
          <h2 id="dash-alerts-title" class="dash-card-title">Alertes</h2>
        </div>

        <DashboardAlerts :alerts="alertes" />
      </section>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'
import { useExpenseStore } from '@/stores/useExpenseStore'
import apiClient from '@/services/apiClient' // ← Import apiClient
import { useAuthStore } from '@/stores/useAuthStore' // ← Pour vérifier l'auth
import { useRouter } from 'vue-router' // ← Pour redirection

import { Wallet, Receipt, ShieldCheck, Percent, TrendingUp, Target, ArrowRight } from 'lucide-vue-next'
import PeriodFilter from '@/components/common/PeriodFilter.vue'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import DashboardEvolutionChart from '@/components/dashboard/DashboardEvolutionChart.vue'
import DashboardCategoryBreakdown from '@/components/dashboard/DashboardCategoryBreakdown.vue'
import DashboardRecentList from '@/components/dashboard/DashboardRecentList.vue'
import DashboardAlerts from '@/components/dashboard/DashboardAlerts.vue'

// Présentation uniquement (même rendu fr-FR que l'ancienne StatsCard).
const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value)

// STORES
const budgetStore = useBudgetStore()
const depenseStore = useExpenseStore()
const authStore = useAuthStore()
const router = useRouter()

// STATE
const currentPeriod = ref('month')
const evolutionData = ref([])
const categories = ref([])
const recentTransactions = ref([])
const loadingCategories = ref(false)
const loadingRecent = ref(false)
const loadingEvolution = ref(false)

const periodOptions = [
  { value: 'month', label: 'Ce mois', icon: '📊' },
  { value: 'year', label: 'Cette année', icon: '📈' }
]

watchEffect(() => {
  console.log('=== DEBUG DASHBOARD ===')
  console.log('Budget total:', budgetStore.totalAmount, typeof budgetStore.totalAmount)
  console.log('Dépenses total:', depenseStore.summary?.this_month, typeof depenseStore.summary?.this_month)
})

// COMPUTED - Stats principales
const stats = computed(() => {
  const budget = Number(budgetStore.totalAmount) || 0
  const depenses = Number(depenseStore.summary?.this_month) || 0
  const lastMonthBudget = Number(budgetStore.summary?.last_month_total) || 0

    let previous = 0

  // 🔥 MOIS
  if (currentPeriod.value === 'month') {
    previous = Number(budgetStore.summary?.last_month_total) || 0
  }

  // 🔥 ANNÉE
  if (currentPeriod.value === 'year') {
    previous = Number(budgetStore.summary?.last_year_total) || 0
  }

  // const variation = lastMonthBudget === 0
  //   ? 0
  //   : ((budget - lastMonthBudget) / lastMonthBudget) * 100

  const variation =
    previous === 0
      ? 0
      : ((budget - previous) / previous) * 100

    console.log('budget:', budget)
    console.log('previous:', previous)


  return {
    budget_total: budget,
    depenses_total: depenses,
    restant: budget - depenses,
    taux_epargne: budget > 0 ? Math.round(((budget - depenses) / budget) * 100) : 0,
    variation_budget: variation

  }
})

// Récupération des catégories (version avec apiClient)
const fetchCategories = async () => {
  // Vérifier si token existe
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  loadingCategories.value = true
  try {
    // Utiliser apiClient au lieu de axios direct
    const response = await apiClient.get('/dashboard/categories')
    
    console.log('Categories API:', response.data)
    
    categories.value = response.data.data.map(cat => ({
      nom: cat.nom,
      montant: Number(cat.montant),
      pourcentage: Number(cat.pourcentage),
      total: Number(cat.montant),
      color: getColor(cat.nom)
    }))
  } catch (error) {
    console.error('Erreur catégories:', error)
    // Si erreur 401, la redirection sera gérée par l'interceptor
  } finally {
    loadingCategories.value = false
  }
}

const getColor = (name) => {
  const colors = {
    'Nourriture': 'bg-blue-500',
    'Factures': 'bg-emerald-500',
    'Transport': 'bg-amber-500',
    'Loisirs': 'bg-purple-500',
    'Imprévu': 'bg-red-500',
  }
  return colors[name] || 'bg-slate-500'
}

const totalDepenses = computed(() => {
  return categories.value.reduce((sum, cat) => sum + cat.montant, 0)
})

// Évolution mensuelle (avec apiClient)
const fetchEvolution = async () => {
  if (!authStore.isAuthenticated) return
  
  loadingEvolution.value = true
  try {
    const response = await apiClient.get('/dashboard/evolution')
    
    evolutionData.value = response.data.data.map(item => ({
      label: item.label,
      montant: Number(item.montant)
    }))
  } catch (error) {
    console.error('Erreur evolution:', error)
  } finally {
    loadingEvolution.value = false
  }
}

const maxEvolution = computed(() => {
  if (!evolutionData.value.length) return 0
  return Math.max(...evolutionData.value.map(d => Number(d.montant)))
})

// Dernières transactions (avec apiClient)
const fetchRecentTransactions = async () => {
  if (!authStore.isAuthenticated) return
  
  loadingRecent.value = true
  try {
    const response = await apiClient.get('/dashboard/recent-transactions')
    
    recentTransactions.value = response.data.data.map(t => ({
      id: t.id,
      description: t.description,
      montant: Number(t.amount),
      date: t.date,
      categorie: t.category,
      icon: getIcon(t.category)
    }))
  } catch (error) {
     if (!error?.silent) {
    console.error('Erreur recent transactions:', error)
  }
  } finally {
    loadingRecent.value = false
  }
}

const getIcon = (category) => {
  const icons = {
    Nourriture: '🍕',
    Transport: '🚗',
    Loisirs: '🎬',
    Factures: '💡',
    Imprévu: '🏠',
  }
  return icons[category] || '💰'
}

const totalDepensesRecent = computed(() => {
  return recentTransactions.value.reduce((sum, t) => sum + (t.montant || 0), 0)
})

// Alertes
const alertes = computed(() => {
  const list = []
  const budget = stats.value.budget_total
  const depenses = stats.value.depenses_total
  const restant = stats.value.restant
  const taux = stats.value.taux_epargne

  if (depenses > budget && budget > 0) {
    list.push({
      icon: '🚨',
      title: 'Budget dépassé',
      message: `Vous avez dépassé votre budget de ${(depenses - budget).toLocaleString('fr-FR')} FCFA`,
      bgColor: 'bg-red-50',
      action: 'Voir détails'
    })
  }

  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const daysLeft = Math.ceil((lastDay - today) / (1000 * 60 * 60 * 24))

  if (daysLeft <= 5 && daysLeft > 0) {
    list.push({
      icon: '📅',
      title: 'Fin du mois approche',
      message: `Plus que ${daysLeft} jour(s) avant la fin du mois`,
      bgColor: 'bg-amber-50',
      action: null
    })
  }

  if (daysLeft === 0 || daysLeft === 1) {
    if (taux >= 20) {
      list.push({
        icon: '🎉',
        title: 'Excellente gestion',
        message: `Vous avez économisé ${taux}% ce mois-ci`,
        bgColor: 'bg-emerald-50',
        action: 'Félicitations'
      })
    }
  }

  return list
})


// METHODS
const handlePeriodChange = (period) => {
  currentPeriod.value = period
  refreshData()
}

const refreshData = async () => {
  if (!authStore.isAuthenticated) return
  
  await Promise.allSettled([
    budgetStore.fetchBudgets(currentPeriod.value),
    depenseStore.fetchExpenses(currentPeriod.value),
    depenseStore.fetchSummary()
  ])
}

// LIFECYCLE
onMounted(() => {
  // Vérifier l'authentification au montage
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
   budgetStore.fetchSummary()
  refreshData()
  fetchCategories()
  fetchEvolution()
  fetchRecentTransactions()
})
</script>

<style scoped>
.dash-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ---------- Header ---------- */
.dash-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.dash-heading {
  min-width: 0;
}

.dash-title {
  font-size: var(--text-display-hero-mobile);
  line-height: var(--text-display-hero-mobile--line-height);
  font-weight: var(--text-display-hero-mobile--font-weight);
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.dash-subtitle {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
}

.dash-filter {
  min-width: 0;
  max-width: 100%;
}

/* ---------- Grids ---------- */
.dash-stats,
.dash-viz,
.dash-lower {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-md);
}

/* ---------- Cards ---------- */
.dash-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 0;
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-moneva-lg);
  box-shadow: var(--shadow-low);
}

.dash-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.dash-card-title {
  font-size: var(--text-headline-md);
  line-height: var(--text-headline-md--line-height);
  font-weight: var(--text-headline-md--font-weight);
  color: var(--color-ink);
}

.dash-chip {
  padding: 2px 10px;
  font-size: var(--text-label-sm);
  line-height: var(--text-label-sm--line-height);
  font-weight: var(--text-label-sm--font-weight);
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  border-radius: 999px;
}

.dash-card-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm) var(--spacing-md);
  margin-top: auto;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-soft);
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted);
}

.dash-foot-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dash-foot-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
}

.dash-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
  font-weight: var(--text-label-lg--font-weight);
  color: var(--color-primary);
  border-radius: var(--radius-moneva-sm);
}

.dash-link:hover {
  color: var(--color-primary-hover);
}

.dash-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.dash-link-icon {
  width: 16px;
  height: 16px;
}

@media (min-width: 640px) {
  .dash-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .dash-title {
    font-size: var(--text-display-hero);
    line-height: var(--text-display-hero--line-height);
    font-weight: var(--text-display-hero--font-weight);
  }
}

@media (min-width: 1024px) {
  .dash-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .dash-viz {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dash-lower {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  }
}
</style>
