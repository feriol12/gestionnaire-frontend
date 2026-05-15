import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { budgetApi } from '@/services/apiBudget'

export const useBudgetStore = defineStore('budget', () => {
  const toast = useToast()
  const budgets = ref([])
  const summary = ref({
    this_month: 0,
    last_month: 0,
    this_year: 0,
  })
  const loading = ref(false)
  const error = ref(null)

  const fetchBudgets = async (period = 'month') => {
    loading.value = true
    error.value = null
    try {  
     
        const response = await budgetApi.getBudgets(period)
      budgets.value = response.data?.data || response.data || []
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de chargement'
      toast.error(error.value, { modal: true })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // Récupérer les totaux (dashboard)
  const fetchSummary = async () => {
    loading.value = true
    try {
       const response = await budgetApi.getSummary()

      summary.value = response.data
      return { success: true }
    } catch (err) {
      toast.error('Erreur chargement totaux', { modal: true })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // Ajouter un budget
  const addBudget = async (budgetData) => {
    loading.value = true
    try {
        const response = await budgetApi.addBudget(budgetData)
        budgets.value.push(response.data.data)
         await fetchSummary()
      toast.success('Budget ajouté avec succès', { modal: true })
      return { success: true }
    } catch (err) {
      toast.error('Erreur ajout budget', { modal: true })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // Modifier un budget
  const updateBudget = async (id, budgetData) => {
    loading.value = true
    try {
      const response = await budgetApi.updateBudget(id, budgetData)
        
      const index = budgets.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        budgets.value[index] = response.data.data
        await fetchSummary()
        toast.success('Budget modifié avec succès', { modal: true })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: "Budget introuvable" }
    } catch (err) {
      if (err.response?.status === 422) {
        return { success: false, errors: err.response.data.errors }
      }
      toast.error('Erreur modification budget', { modal: true })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // Supprimer un budget
  const deleteBudget = async (id) => {
    loading.value = true
    try {
        await budgetApi.deleteBudget(id)
      const index = budgets.value.findIndex((b) => b.id === id)
      if (index !== -1) budgets.value.splice(index, 1)
      await fetchSummary()
      toast.success('Budget supprimé avec succès', { modal: true })
      return { success: true }
    } catch (err) {
      toast.error('Erreur suppression budget', { modal: true })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

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
  }
})
