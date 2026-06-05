import apiClient from "@/services/apiClient"



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