// src/stores/useExpenseStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { expenseApi } from '@/services/apiExpense';
import { useToast } from '@/composables/useToast';

export const useExpenseStore = defineStore('expense', () => {
  const toast = useToast();
  
  const expenses = ref([]);
  const summary = ref({ today: 0, this_month: 0, last_month: 0, this_year: 0 });
  const loading = ref(false);
  const error = ref(null);

  // Getter
  // const totalAmount = computed(() => {
  //   return expenses.value.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  // });

  const fetchExpenses = async (period = 'month') => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await expenseApi.getExpenses(period);
      expenses.value = response.data?.data || response.data || [];
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de chargement';
      toast.error(error.value, { modal: true });
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  const fetchSummary = async () => {
    loading.value = true;
    try {
      const response = await expenseApi.getSummary();
      summary.value = response.data;
      return { success: true };
    } catch (err) {
      toast.error('Erreur chargement totaux', { modal: true });
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  const addExpense = async (expenseData) => {
    loading.value = true;
    try {
      const response = await expenseApi.addExpense(expenseData);
      
      if (response.data) {
        expenses.value.unshift(response.data);
        await fetchSummary();
        toast.success('Dépense ajoutée avec succès', { modal: true });
      }
      return { success: true, data: response.data };
    } catch (err) {
         // ✅ Gestion spécifique pour les erreurs 500
    if (err.response?.status === 500) {
      toast.error('Le montant est trop élevé. Maximum autorisé : 99 999 999,99 FCFA', { modal: true });
      return { success: false };
    }
      if (err.response?.status === 422) {
        return { success: false, errors: err.response.data.errors };
      }
      toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout', { modal: true });
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  const updateExpense = async (id, expenseData) => {
    loading.value = true;
    try {
      const response = await expenseApi.updateExpense(id, expenseData);
      
      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) expenses.value[index] = response.data;
      await fetchSummary();
      toast.success('Dépense modifiée avec succès', { modal: true });
      
      return { success: true, data: response.data };
    } catch (err) {
      if (err.response?.status === 422) {
        return { success: false, errors: err.response.data.errors };
      }
      toast.error(err.response?.data?.message || 'Erreur lors de la modification', { modal: true });
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  const deleteExpense = async (id) => {
    loading.value = true;
    try {
      await expenseApi.deleteExpense(id);
      
      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) expenses.value.splice(index, 1);
      await fetchSummary();
      toast.success('Dépense supprimée avec succès', { modal: true });
      
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression', { modal: true });
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

    const totalAmount = computed(() => {
  return expenses.value.reduce((sum, e) => {
    return sum + (Number(e.amount) || 0)
  }, 0)
  });

  return {
    expenses,
    summary,
    loading,
    error,
    fetchExpenses,
    fetchSummary,
    addExpense,
    updateExpense,
    deleteExpense,
    totalAmount,
  };
});