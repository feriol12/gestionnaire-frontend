// src/services/apiExpense.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const expenseApi = {
  // Récupérer toutes les dépenses (avec filtre période)
  getExpenses(period = 'month') {
    return apiClient.get('/expenses', { params: { period } });
  },
  
  // Récupérer une dépense spécifique
  getExpense(id) {
    return apiClient.get(`/expenses/${id}`);
  },
  
  // Récupérer les totaux (dashboard)
  getSummary() {
    return apiClient.get('/expenses/summary');
  },
  
  // Ajouter une dépense
  addExpense(data) {
    return apiClient.post('/expenses', data);
  },
  
  // Modifier une dépense
  updateExpense(id, data) {
    return apiClient.put(`/expenses/${id}`, data);
  },
  
  // Supprimer une dépense
  deleteExpense(id) {
    return apiClient.delete(`/expenses/${id}`);
  },
};