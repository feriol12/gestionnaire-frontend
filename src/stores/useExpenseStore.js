// src/stores/useExpenseStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { expenseApi } from '@/services/apiExpense';
import { useToast } from '@/composables/useToast';
import { currentPrivateGeneration, isStaleGeneration, registerPrivateState } from '@/stores/privateState';

const emptySummary = () => ({ today: 0, this_month: 0, last_month: 0, this_year: 0 });

// AUTH3-06 : résultat d'une requête lancée sous une identité précédente.
const STALE = Object.freeze({ success: false, stale: true });

export const useExpenseStore = defineStore('expense', () => {
  const toast = useToast();

  const expenses = ref([]);
  const summary = ref(emptySummary());
  const loading = ref(false);
  const error = ref(null);

  // AUTH3-06 : données privées du compte, remises à zéro à chaque changement
  // d'identité (voir stores/privateState.js).
  registerPrivateState(() => {
    expenses.value = [];
    summary.value = emptySummary();
    loading.value = false;
    error.value = null;
  });

  // Getter
  // const totalAmount = computed(() => {
  //   return expenses.value.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  // });

  // AUTH3-06 : chaque action capture la génération à son lancement ; après
  // chaque attente, une génération différente signifie que l'identité a changé :
  // aucune écriture (données, erreur, chargement, toast).
  const fetchExpenses = async (period = 'month') => {
    const generation = currentPrivateGeneration();
    loading.value = true;
    error.value = null;

    try {
      const response = await expenseApi.getExpenses(period);
      if (isStaleGeneration(generation)) return STALE;
      expenses.value = response.data?.data || response.data || [];
      return { success: true };
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE;
      error.value = err.response?.data?.message || 'Erreur de chargement';
      toast.error(error.value, { modal: true });
      return { success: false };
    } finally {
      if (!isStaleGeneration(generation)) loading.value = false;
    }
  };

  const fetchSummary = async () => {
    const generation = currentPrivateGeneration();
    loading.value = true;
    try {
      const response = await expenseApi.getSummary();
      if (isStaleGeneration(generation)) return STALE;
      summary.value = response.data;
      return { success: true };
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE;
      toast.error('Erreur chargement totaux', { modal: true });
      return { success: false };
    } finally {
      if (!isStaleGeneration(generation)) loading.value = false;
    }
  };

  const addExpense = async (expenseData) => {
    const generation = currentPrivateGeneration();
    loading.value = true;
    try {
      const response = await expenseApi.addExpense(expenseData);
      if (isStaleGeneration(generation)) return STALE;

      if (response.data) {
        expenses.value.unshift(response.data);
        await fetchSummary();
        if (isStaleGeneration(generation)) return STALE;
        toast.success('Dépense ajoutée avec succès', { modal: true });
      }
      return { success: true, data: response.data };
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE;
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
      if (!isStaleGeneration(generation)) loading.value = false;
    }
  };

  const updateExpense = async (id, expenseData) => {
    const generation = currentPrivateGeneration();
    loading.value = true;
    try {
      const response = await expenseApi.updateExpense(id, expenseData);
      if (isStaleGeneration(generation)) return STALE;

      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) expenses.value[index] = response.data;
      await fetchSummary();
      if (isStaleGeneration(generation)) return STALE;
      toast.success('Dépense modifiée avec succès', { modal: true });

      return { success: true, data: response.data };
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE;
      if (err.response?.status === 422) {
        return { success: false, errors: err.response.data.errors };
      }
      toast.error(err.response?.data?.message || 'Erreur lors de la modification', { modal: true });
      return { success: false };
    } finally {
      if (!isStaleGeneration(generation)) loading.value = false;
    }
  };

  const deleteExpense = async (id) => {
    const generation = currentPrivateGeneration();
    loading.value = true;
    try {
      await expenseApi.deleteExpense(id);
      if (isStaleGeneration(generation)) return STALE;

      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) expenses.value.splice(index, 1);
      await fetchSummary();
      if (isStaleGeneration(generation)) return STALE;
      toast.success('Dépense supprimée avec succès', { modal: true });

      return { success: true };
    } catch (err) {
      if (isStaleGeneration(generation)) return STALE;
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression', { modal: true });
      return { success: false };
    } finally {
      if (!isStaleGeneration(generation)) loading.value = false;
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
