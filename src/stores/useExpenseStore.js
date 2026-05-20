// src/stores/useExpenseStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useToast } from '@/composables/useToast';

export const useExpenseStore = defineStore('expense', () => {
  const toast = useToast();

  const expenses = ref([]);
  const summary = ref({
    today: 0,
    this_month: 0,
    last_month: 0,
    this_year: 0,
  });
  const loading = ref(false);
  const error = ref(null);

  const fetchExpenses = async (period = 'month') => {
    loading.value = true;
    error.value = null;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/expenses', {
        params: { period },
        headers: { Authorization: `Bearer ${token}` }
      });
       console.log('API RESPONSE EXPENSES:', response.data)
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
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/expenses/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/expenses', expenseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        expenses.value.unshift(response.data);
        await fetchSummary();
        toast.success('Dépense ajoutée avec succès', { modal: true });
      }
      return { success: true, data: response.data };
    } catch (err) {
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
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/expenses/${id}`, expenseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      const token = localStorage.getItem('token');
      await axios.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

  // const totalAmount = () => {
  //   return expenses.value.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  // };

  const totalAmount = computed(() => {
  return expenses.value.reduce((sum, e) => {
    return sum + (Number(e.amount) || 0)
  }, 0)
})
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