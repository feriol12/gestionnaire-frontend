import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { budgetApi } from '@/services/apiBudget'
import { currentPrivateGeneration, isStaleGeneration, registerPrivateState } from '@/stores/privateState'

const emptySummary = () => ({
  this_month: 0,
  last_month: 0,
  this_year: 0,
})

// AUTH3-06 : résultat d'une requête lancée sous une identité précédente.
const STALE = Object.freeze({ success: false, stale: true })

export const useBudgetStore = defineStore('budget', () => {
  const toast = useToast()
  const budgets = ref([])
  const allBudgets = ref([])
  const summary = ref(emptySummary())
  const loading = ref(false)
  const error = ref(null)

  // AUTH3-06 : données privées du compte, remises à zéro à chaque changement
  // d'identité (voir stores/privateState.js).
  registerPrivateState(() => {
    budgets.value = []
    allBudgets.value = []
    summary.value = emptySummary()
    loading.value = false
    error.value = null
  })

  // AUTH3-06 : chaque action capture la génération à son lancement ; après
  // chaque attente, une génération différente signifie que l'identité a changé :
  // aucune écriture (données, erreur, chargement, toast).

  // 👈 Nouvelle méthode pour récupérer TOUS les budgets de l'année
  const fetchAllBudgetsForYear = async () => {
    const generation = currentPrivateGeneration()
    try {
      const response = await budgetApi.getBudgets('year') // Récupère tous les budgets de l'année
      if (isStaleGeneration(generation)) return STALE
      allBudgets.value = response.data?.data || response.data || []
      if (!Array.isArray(allBudgets.value)) {
        allBudgets.value = []
      }
      return { success: true }
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE
      console.error('Erreur chargement budgets annuels:', err)
      allBudgets.value = []
      return { success: false }
    }
  }

  const fetchBudgets = async (period = 'month') => {
    const generation = currentPrivateGeneration()
    loading.value = true
    error.value = null
    try {

        const response = await budgetApi.getBudgets(period)
      if (isStaleGeneration(generation)) return STALE
      budgets.value = response.data?.data || response.data || []
      return { success: true }
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE
      error.value = err.response?.data?.message || 'Erreur de chargement'
      toast.error(error.value, { modal: true })
      return { success: false }
    } finally {
      if (!isStaleGeneration(generation)) loading.value = false
    }
  }

  // Récupérer les totaux (dashboard)
  const fetchSummary = async () => {
    const generation = currentPrivateGeneration()
    loading.value = true
    try {
       const response = await budgetApi.getSummary()
      if (isStaleGeneration(generation)) return STALE

      summary.value = response.data
      console.log('SUMMARY API:', response.data)
      return { success: true }
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE
      toast.error('Erreur chargement totaux', { modal: true })
      return { success: false }
    } finally {
      if (!isStaleGeneration(generation)) loading.value = false
    }
  }

 // Ajouter un budget
const addBudget = async (budgetData) => {
  const generation = currentPrivateGeneration()
  loading.value = true
  try {
    const response = await budgetApi.addBudget(budgetData)
    if (isStaleGeneration(generation)) return STALE
    budgets.value.push(response.data.data)
    await fetchSummary()
    if (isStaleGeneration(generation)) return STALE
    toast.success('Budget ajouté avec succès', { modal: true })
    return { success: true }
  } catch (err) {
    if (isStaleGeneration(generation)) return STALE
    // ✅ Important : retourner les erreurs de validation
    if (err.response?.status === 422) {
      return { success: false, errors: err.response.data.errors }
    }
    toast.error('Erreur ajout budget - Le montant autorisé est de 8 chiffres', { modal: true })
    return { success: false, errors: null }
  } finally {
    if (!isStaleGeneration(generation)) loading.value = false
  }
}


 // Modifier un budget
const updateBudget = async (id, budgetData) => {
  const generation = currentPrivateGeneration()
  loading.value = true
  try {
    const response = await budgetApi.updateBudget(id, budgetData)
    if (isStaleGeneration(generation)) return STALE
    const index = budgets.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      budgets.value[index] = response.data.data
      await fetchSummary()
      if (isStaleGeneration(generation)) return STALE
      toast.success('Budget modifié avec succès', { modal: true })
      return { success: true, data: response.data.data }
    }
    return { success: false, message: "Budget introuvable" }
  } catch (err) {
    if (isStaleGeneration(generation)) return STALE
    // ✅ Important : retourner les erreurs de validation
    if (err.response?.status === 422) {
      return { success: false, errors: err.response.data.errors }
    }
    toast.error('Erreur modification budget', { modal: true })
    return { success: false, errors: null }
  } finally {
    if (!isStaleGeneration(generation)) loading.value = false
  }
}

  // Supprimer un budget
  const deleteBudget = async (id) => {
    const generation = currentPrivateGeneration()
    loading.value = true
    try {
        await budgetApi.deleteBudget(id)
      if (isStaleGeneration(generation)) return STALE
      const index = budgets.value.findIndex((b) => b.id === id)
      if (index !== -1) budgets.value.splice(index, 1)
      await fetchSummary()
      if (isStaleGeneration(generation)) return STALE
      toast.success('Budget supprimé avec succès', { modal: true })
      return { success: true }
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE
      toast.error('Erreur suppression budget', { modal: true })
      return { success: false }
    } finally {
      if (!isStaleGeneration(generation)) loading.value = false
    }
  }


   // 👈 Nouveau computed pour le total annuel basé sur allBudgets
  const annualTotalAmount = computed(() => {
    if (!Array.isArray(allBudgets.value)) return 0

    // Obtenir l'année courante
    const currentYear = new Date().getFullYear()

    // Filtrer les budgets de l'année courante
    const currentYearBudgets = allBudgets.value.filter(budget => {
      if (!budget?.month) return false
      const budgetYear = new Date(budget.month).getFullYear()
      return budgetYear === currentYear
    })

    // Calculer le total
    return currentYearBudgets.reduce((total, budget) => {
      return total + (Number(budget.amount) || 0)
    }, 0)
  })
 const totalAmount = computed(() => {
  return budgets.value.reduce((total, b) => {
    return total + (Number(b.amount) || 0)
  }, 0)
})
  return {
    budgets,
    summary,
    loading,
    error,
    fetchBudgets,
    fetchSummary,
    addBudget,
    updateBudget,
    deleteBudget,
    totalAmount,
    annualTotalAmount,
    fetchAllBudgetsForYear
  }
})
