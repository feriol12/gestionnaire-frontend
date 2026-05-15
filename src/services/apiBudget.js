import axios from "axios";

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

export const budgetApi ={
    // Récupérer le budget actuel (avec filtre période)
    getBudgets(period = 'month') {
        return apiClient.get('/budgets', { params: { period } });
    },

    //Récupérer un budget spécifique
    getBudget(id) {
        return apiClient.get(`/budgets/${id}`);
    },

    //Récupérer les totaux (dashboard)
    getSummary() {
        return apiClient.get('/budgets/summary');
    },
    
    //Ajouter un budget
    addBudget(data){
      return apiClient.post('/budgets', data);

    },
      
    // Modifier un budget
    updateBudget(id, data) {
        return apiClient.put(`/budgets/${id}`, data);
    },

    // Supprimer un budget
    deleteBudget(id) {
        return apiClient.delete(`/budgets/${id}`);
    },



}