<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- HEADER -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p class="text-slate-500 mt-1">
              Vue d'ensemble de vos finances
            </p>
          </div>
          
          <div class="flex gap-3">
            <PeriodFilter 
              :period="currentPeriod" 
              :options="periodOptions"
              @update:period="handlePeriodChange"
            />
            <button class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
              📥 Exporter
            </button>
          </div>
        </div>
      </div>

      <!-- STATS CARDS (4 cartes principales) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <!-- Carte Budget total -->
        <StatsCard
          label="Budget total"
          :value="stats.budget_total"
          icon="💰"
          subtitle="Ce mois"
          icon-bg-class="bg-blue-100"
          :trend="{ value: 5, isPositive: true }"
        />
        
        <!-- Carte Dépenses -->
        <StatsCard
          label="Dépenses"
          :value="stats.depenses_total"
          icon="💸"
          subtitle="Ce mois"
          icon-bg-class="bg-red-100"
          :trend="{ value: 8, isPositive: false }"
        />
        
        <!-- Carte Restant -->
        <StatsCard
          label="Restant"
          :value="stats.restant"
          icon="💪"
          subtitle="À dépenser"
          icon-bg-class="bg-emerald-100"
        />
        
        <!-- Carte Taux d'épargne -->
        <StatsCard
          label="Taux d'épargne"
          :value="stats.taux_epargne"
          :is-percentage="true"
          icon="📈"
          subtitle="Du budget"
          icon-bg-class="bg-purple-100"
          :trend="{ value: 3, isPositive: true }"
        />
      </div>

      <!-- GRAPHIQUES (2 colonnes) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        <!-- Graphique: Dépenses par catégorie -->
        <AppCard class="overflow-hidden">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 class="text-lg font-semibold text-slate-700">
                  Dépenses par catégorie
                </h3>
              </div>
              <span class="text-sm text-slate-400">Ce mois</span>
            </div>
          </template>
          
          <div class="space-y-4">
            <div 
              v-for="cat in categories" 
              :key="cat.nom"
              class="space-y-2"
            >
              <div class="flex justify-between text-sm">
                <span class="text-slate-600">{{ cat.nom }}</span>
                <span class="font-medium text-slate-700">
                  {{ cat.montant.toLocaleString() }} F
                </span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-500"
                  :class="cat.color"
                  :style="{ width: cat.pourcentage + '%' }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-slate-400">
                <span>{{ cat.pourcentage }}%</span>
                <span>sur {{ cat.total.toLocaleString() }} F</span>
              </div>
            </div>
          </div>
          
          <template #footer>
            <div class="text-sm text-slate-500 flex justify-between items-center">
              <span>📊 Total: {{ totalDepenses.toLocaleString() }} F</span>
              <button class="text-blue-500 hover:text-blue-600 text-sm">
                Voir détails →
              </button>
            </div>
          </template>
        </AppCard>

        <!-- Graphique: Évolution mensuelle -->
        <AppCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-1 h-6 bg-emerald-500 rounded-full"></div>
                <h3 class="text-lg font-semibold text-slate-700">
                  Évolution des dépenses
                </h3>
              </div>
              <span class="text-sm text-slate-400">{{ currentPeriod === 'year' ? 'Cette année' : 'Ce mois' }}</span>
            </div>
          </template>
          
          <!-- Graphique en barres simplifié -->
          <div class="flex items-end justify-between gap-2 h-48">
            <div 
              v-for="(item, index) in evolutionData" 
              :key="index"
              class="flex-1 flex flex-col items-center gap-2"
            >
              <div 
                class="w-full bg-emerald-500/20 rounded-t-lg hover:bg-emerald-500/30 transition-all cursor-pointer relative group"
                :style="{ height: (item.montant / maxEvolution) * 120 + 'px' }"
              >
                <div 
                  class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap"
                >
                  {{ item.montant.toLocaleString() }} F
                </div>
              </div>
              <span class="text-xs text-slate-500">{{ item.label }}</span>
            </div>
          </div>
          
          <template #footer>
            <div class="text-sm text-slate-500 flex justify-between">
              <span>📈 +12% vs mois dernier</span>
              <span>🎯 Objectif: {{ (stats.budget_total * 0.8).toLocaleString() }} F</span>
            </div>
          </template>
        </AppCard>
      </div>

      <!-- SECTION: Dernières dépenses + Alertes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Dernières transactions -->
        <div class="lg:col-span-2">
          <AppCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-1 h-6 bg-amber-500 rounded-full"></div>
                <h3 class="text-lg font-semibold text-slate-700">
                  Dernières transactions
                </h3>
              </div>
              <button class="text-sm text-blue-500 hover:text-blue-600">
                Voir toutes →
              </button>
            </template>
            
            <div class="space-y-3">
              <div 
                v-for="transaction in recentTransactions" 
                :key="transaction.id"
                class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                    {{ transaction.icon }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-700">{{ transaction.description }}</p>
                    <p class="text-xs text-slate-400">{{ transaction.date }} • {{ transaction.categorie }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-red-600">-{{ transaction.montant.toLocaleString() }} F</p>
                  <p class="text-xs text-slate-400">{{ transaction.status }}</p>
                </div>
              </div>
            </div>
            
            <template #footer>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-500">💰 Total dépenses: {{ totalDepensesRecent.toLocaleString() }} F</span>
                <button class="text-blue-500 text-sm">🔍 Voir historique</button>
              </div>
            </template>
          </AppCard>
        </div>
        
        <!-- Alertes & Conseils -->
        <div>
          <AppCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-1 h-6 bg-red-500 rounded-full"></div>
                <h3 class="text-lg font-semibold text-slate-700">
                  Alertes
                </h3>
              </div>
            </template>
            
            <div class="space-y-4">
              <div 
                v-for="(alerte, index) in alertes" 
                :key="index"
                class="p-3 rounded-xl"
                :class="alerte.bgColor"
              >
                <div class="flex items-start gap-2">
                  <span class="text-xl">{{ alerte.icon }}</span>
                  <div>
                    <p class="font-medium text-slate-700">{{ alerte.title }}</p>
                    <p class="text-sm text-slate-500">{{ alerte.message }}</p>
                    <button 
                      v-if="alerte.action"
                      class="text-sm text-blue-500 mt-1 hover:text-blue-600"
                    >
                      {{ alerte.action }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <template #footer>
              <div class="text-center text-sm text-slate-500">
                <i class="text-amber-500">💡</i> Conseil: Épargnez 20% de vos revenus
              </div>
            </template>
          </AppCard>
        </div>
      </div>

      <!-- BUDGETS RAPIDES -->
      <div>
        <AppCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h3 class="text-lg font-semibold text-slate-700">
                Budgets actifs
              </h3>
            </div>
            <button class="text-sm text-blue-500 hover:text-blue-600">
              + Ajouter un budget
            </button>
          </template>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="budget in budgetsActifs" 
              :key="budget.id"
              class="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-semibold text-slate-700">{{ budget.categorie }}</h4>
                  <p class="text-xs text-slate-400">{{ budget.period }}</p>
                </div>
                <span class="text-sm font-medium" :class="budget.restant > 0 ? 'text-emerald-600' : 'text-red-600'">
                  {{ budget.restant > 0 ? '✅' : '⚠️' }}
                </span>
              </div>
              
              <div class="mb-2">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-500">Dépensé</span>
                  <span>{{ budget.depense.toLocaleString() }} / {{ budget.montant.toLocaleString() }} F</span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all"
                    :class="budget.pourcentage > 80 ? 'bg-red-500' : 'bg-emerald-500'"
                    :style="{ width: budget.pourcentage + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Restant: {{ budget.restant.toLocaleString() }} F</span>
                <span class="text-slate-400">{{ budget.pourcentage }}% utilisé</span>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'
import { useExpenseStore } from '@/stores/useExpenseStore'
import axios from 'axios'

import AppCard from '@/components/common/AppCard.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import PeriodFilter from '@/components/common/PeriodFilter.vue'


// STORES
const budgetStore = useBudgetStore()
const depenseStore = useExpenseStore()

const loadingCategories = ref(false)
const loadingRecent = ref(false)


// STATE
const currentPeriod = ref('month')
const evolutionData = ref([])
const categories = ref([])
const recentTransactions = ref([])



const periodOptions = [
  { value: 'month', label: 'Ce mois', icon: '📊' },
  { value: 'year', label: 'Cette année', icon: '📈' }
]
    watchEffect(() => {
  console.log('=== DEBUG DASHBOARD ===')

  console.log(
    'Budget total:',
    budgetStore.totalAmount,
    typeof budgetStore.totalAmount
  )

  console.log(
    'Dépenses total:',
    depenseStore.summary?.this_month,
    typeof depenseStore.summary?.this_month
  )
})
// COMPUTED - Stats principales
const stats = computed(() => {
  const budget = Number(budgetStore.totalAmount) || 0
  // Utiliser summary.this_month (c'est déjà le total du mois)
  const depenses = Number(depenseStore.summary?.this_month) || 0

  return {
    budget_total: budget,
    depenses_total: depenses,
    restant: budget - depenses,
    taux_epargne: budget > 0 ? Math.round(((budget - depenses) / budget) * 100) : 0
  }
})

// Données catégories (à remplacer par tes vraies données)
const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const token = localStorage.getItem('token')

    const response = await axios.get('/api/dashboard/categories', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    categories.value = response.data.data.map(cat => ({
      nom: cat.nom,
      montant: Number(cat.montant),
      pourcentage: Number(cat.pourcentage),
      total: Number(cat.montant), // ou enlever si inutile
      color: getColor(cat.nom)
    }))

  } catch (error) {
    console.error('Erreur catégories:', error)
  }finally {
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

// Évolution mensuelle (exemple)

const fetchEvolution = async () => {
  try {
    const token = localStorage.getItem('token')

    const response = await axios.get('/api/dashboard/evolution', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    evolutionData.value = response.data.data.map(item => ({
      label: item.label,
      montant: Number(item.montant)
    }))

  } catch (error) {
    console.error('Erreur evolution:', error)
  }
}

const maxEvolution = computed(() => {
  if (!evolutionData.value.length) return 0

  return Math.max(
    ...evolutionData.value.map(d => Number(d.montant))
  )
})

const fetchRecentTransactions = async () => {
  loadingRecent.value = true

  try {
    const token = localStorage.getItem('token')

    const response = await axios.get('/api/dashboard/recent-transactions', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    recentTransactions.value = response.data.data.map(t => ({
      id: t.id,
      description: t.description,
      montant: Number(t.amount),
      date: t.date,
      categorie: t.category,
      icon: getIcon(t.category)
    }))

  } catch (error) {
    console.error('Erreur recent transactions:', error)
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
const alertes = ref([
  { icon: '⚠️', title: 'Budget alimentation dépassé', message: 'Vous avez dépassé de 15 000 F', bgColor: 'bg-red-50', action: 'Voir détails' },
  { icon: '📅', title: 'Fin du mois approche', message: 'Plus que 5 jours, restant 180 000 F', bgColor: 'bg-amber-50', action: null },
  { icon: '💡', title: 'Économies', message: 'Vous avez économisé 25% ce mois-ci', bgColor: 'bg-emerald-50', action: 'Félicitations' }
])

// Budgets actifs
const budgetsActifs = ref([
  { id: 1, categorie: 'Alimentation', period: 'Mai 2024', montant: 200000, depense: 144000, restant: 56000, pourcentage: 72 },
  { id: 2, categorie: 'Loisirs', period: 'Mai 2024', montant: 50000, depense: 48000, restant: 2000, pourcentage: 96 },
  { id: 3, categorie: 'Transport', period: 'Mai 2024', montant: 60000, depense: 38400, restant: 21600, pourcentage: 64 }
])

// METHODS
const handlePeriodChange = (period) => {
  currentPeriod.value = period
  // Recharger les données selon la période
  refreshData()
}

const refreshData = async () => {
  await Promise.all([
    budgetStore.fetchBudgets(currentPeriod.value),
    depenseStore.fetchExpenses(currentPeriod.value),
     depenseStore.fetchSummary()
  ])
}

// LIFECYCLE
onMounted(() => {
  refreshData()
  fetchCategories()
  fetchEvolution()
  fetchRecentTransactions()
})
</script>