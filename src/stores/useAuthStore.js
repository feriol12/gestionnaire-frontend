import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi } from '@/services/apiAuth';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const loading = ref(false);
  
  // Getters
  const isAuthenticated = () => !!token.value && !!user.value;
  
  // Actions
  const register = async (userData) => {
    loading.value = true;
    
    try {
      const response = await authApi.register(userData);
      
      if (response.data.token) {
        token.value = response.data.token;
        user.value = response.data.user;
        localStorage.setItem('token', response.data.token);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur inscription:', error);
      
      if (error.response?.status === 422) {
        // Erreurs de validation
        return { 
          success: false, 
          errors: error.response.data.errors,
          message: 'Veuillez corriger les erreurs'
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de l\'inscription'
      };
    } finally {
      loading.value = false;
    }
  };
  
  const login = async (credentials) => {
    loading.value = true;
    
    try {
      const response = await authApi.login(credentials);
      
      if (response.data.token) {
        token.value = response.data.token;
        user.value = response.data.user;
        localStorage.setItem('token', response.data.token);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion'
      };
    } finally {
      loading.value = false;
    }
  };
  
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
    }
  };
  
  const fetchUser = async () => {
    if (!token.value) return;
    
    try {
      const response = await authApi.getUser();
      user.value = response.data;
    } catch (error) {
      console.error('Erreur récupération user:', error);
      logout();
    }
  };
  
  return {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    fetchUser,
  };
});