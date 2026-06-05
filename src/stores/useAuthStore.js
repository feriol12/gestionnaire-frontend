import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/apiAuth';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const token = ref(localStorage.getItem('token') || null);
  const loading = ref(false);
  const isLoggingOut = ref(false); // Flag pour éviter les appels multiples
  
  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userName = computed(() => user.value?.name || '');
  
  // Actions
  const register = async (userData) => {
    loading.value = true;
    
    try {
      const response = await authApi.register(userData);
      
      if (response.data.token) {
        token.value = response.data.token;
        user.value = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur inscription:', error);
      
      if (error.response?.status === 422) {
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
        localStorage.setItem('user', JSON.stringify(response.data.user));
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
  
  const logout = async (options = { skipApiCall: false }) => {
    // Éviter les appels multiples
    if (isLoggingOut.value) return;
    isLoggingOut.value = true;
    
    try {
      if (!options.skipApiCall && token.value) {
        try {
          await authApi.logout();
        } catch (error) {
          // Ignorer les erreurs de logout (déjà déconnecté)
          console.log('Logout API error ignored:', error.message);
        }
      }
    } finally {
      // Nettoyer toujours le localStorage et le state
      token.value = null;
      user.value = null;
      loading.value = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      isLoggingOut.value = false;
      
      // Rediriger seulement si pas déjà sur login
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
  };
  
  const fetchUser = async () => {
    if (!token.value) return;
    loading.value = true;
    
    try {
      const response = await authApi.getUser();
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Erreur récupération user:', error);
      // Ne pas appeler logout ici pour éviter la boucle
      // Juste nettoyer localement
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      loading.value = false;
    }
  };
  
  // Méthode pour vérifier si le token est valide
  const checkSession = () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken && token.value) {
      // Token manquant, nettoyer le store sans appel API
      logout({ skipApiCall: true });
    }
  };
  
  // INITIALISATION AUTOMATIQUE
  const initAuth = async () => {
    if (token.value) {
      if (!user.value) {
        await fetchUser();
      }
    }
  };
  
  // Exécution automatique silencieuse
  initAuth();
  
  return {
    user,
    token,
    loading,
    isAuthenticated,
    userName,
    register,
    login,
    logout,
    fetchUser,
    checkSession,
  };
});