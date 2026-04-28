// src/stores/useExpenseStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useExpenseStore = defineStore('expense', () => {
  // ========== STATE ==========
  const expenses = ref([]);
  const summary = ref({
    today: 0,
    this_month: 0,
    last_month: 0,
    this_year: 0,
  });
  const loading = ref(false);
  const error = ref(null);

  // ========== ACTIONS ==========
  
  const fetchExpenses = async (period = 'month') => {
    loading.value = true;
    error.value = null;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/expenses', {
        params: { period },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data && response.data.data) {
        expenses.value = response.data.data;
      } else if (Array.isArray(response.data)) {
        expenses.value = response.data;
      } else {
        expenses.value = [];
      }
      
      return { success: true, data: expenses.value };
    } catch (err) {
      console.error('Erreur récupération dépenses:', err);
      error.value = err.response?.data?.message || 'Erreur lors du chargement des dépenses';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  const fetchSummary = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/expenses/summary', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      summary.value = response.data;
      return { success: true, data: summary.value };
    } catch (err) {
      console.error('Erreur récupération totaux:', err);
      error.value = err.response?.data?.message || 'Erreur lors du chargement des totaux';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  const addExpense = async (expenseData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/expenses', expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data) {
        expenses.value.unshift(response.data);
        await fetchSummary();
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Erreur ajout dépense:', err);
      
      if (err.response?.status === 422) {
        return { 
          success: false, 
          errors: err.response.data.errors,
          message: 'Veuillez corriger les erreurs'
        };
      }
      
      error.value = err.response?.data?.message || 'Erreur lors de l\'ajout';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  const updateExpense = async (id, expenseData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/expenses/${id}`, expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data) {
        const index = expenses.value.findIndex(e => e.id === id);
        if (index !== -1) {
          expenses.value[index] = response.data;
        }
        await fetchSummary();
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Erreur modification dépense:', err);
      
      if (err.response?.status === 422) {
        return { 
          success: false, 
          errors: err.response.data.errors,
          message: 'Veuillez corriger les erreurs'
        };
      }
      
      error.value = err.response?.data?.message || 'Erreur lors de la modification';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  const deleteExpense = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) {
        expenses.value.splice(index, 1);
      }
      await fetchSummary();
      
      return { success: true, message: 'Dépense supprimée avec succès' };
    } catch (err) {
      console.error('Erreur suppression dépense:', err);
      error.value = err.response?.data?.message || 'Erreur lors de la suppression';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };
  
  // ========== GETTERS ==========
  const totalAmount = () => {
    return expenses.value.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
  };
  
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