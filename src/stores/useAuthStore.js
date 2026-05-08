import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/apiAuth';

export const useAuthStore = defineStore('auth', () => {
  // State
  // const user = ref(null);
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));  // ✅ Restaure le user
  const token = ref(localStorage.getItem('token') || null);
  const loading = ref(false);
  
  // // Getters
  // const isAuthenticated = () => !!token.value && !!user.value;
  
   // Getters - utilise computed au lieu d'une fonction
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
        localStorage.setItem('user', JSON.stringify(response.data.user)); // ← Ajoute aussi le user
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
         localStorage.setItem('user', JSON.stringify(response.data.user)); // ← Ajoute aussi le user
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
      localStorage.removeItem('user'); // ← Ajoute aussi le user
    }
  };
  
  const fetchUser = async () => {
    if (!token.value) return;
        loading.value = true; // ✅ AJOUT: Indicateur de chargement
    try {
      const response = await authApi.getUser();
      user.value = response.data;
       localStorage.setItem('user', JSON.stringify(response.data)); // ✅ Synchronise localStorage
    } catch (error) {
      console.error('Erreur récupération user:', error);
      logout();
    }finally {
      loading.value = false; // ✅ AJOUT: Fin du chargement
    }
  };

  // ============================================
// INITIALISATION AUTOMATIQUE (OPTIMISÉE)
// ============================================

const initAuth = async () => {
  // Vérifie si un token existe
  if (token.value) {
    // Si user n'est pas encore chargé ou si vous voulez des données fraîches
    if (!user.value) {
      await fetchUser(); // Attend que fetchUser finisse
    }
  }
};

// Exécution automatique silencieuse (ne bloque pas l'UI)
initAuth();
  
  return {
    user,
    token,
    loading,
    isAuthenticated,
    userName,         // Ajoute ce getter
    register,
    login,
    logout,
    fetchUser,
  };
});