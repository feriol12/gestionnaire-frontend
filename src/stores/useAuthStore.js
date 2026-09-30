import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/apiAuth';
import { useToast } from '@/composables/useToast';
import router from '@/router';

const { error: showError } = useToast();

// AUTH3-01 : la session serveur (cookie HttpOnly) est la seule source de vérité.
// Aucune donnée d'authentification n'est conservée dans le navigateur ; les
// clés de l'ancien modèle à jeton (PAT) sont supprimées, sans jamais être relues.
const LEGACY_AUTH_KEYS = ['token', 'user'];

const purgeLegacyAuthStorage = () => {
  try {
    LEGACY_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // stockage indisponible (navigation privée stricte) : rien à nettoyer
  }
};

export const useAuthStore = defineStore('auth', () => {
  purgeLegacyAuthStorage();

  // State
  const user = ref(null);
  const initialized = ref(false); // session vérifiée au moins une fois auprès du serveur
  const loading = ref(false);
  const isLoggingOut = ref(false); // Flag pour éviter les appels multiples
  let initPromise = null;

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userName = computed(() => user.value?.name || '');

  // Oublie l'identité locale (session expirée, déconnexion...).
  const clearSession = () => {
    user.value = null;
    purgeLegacyAuthStorage();
  };

  // Actions
  const register = async (userData) => {
    loading.value = true;

    try {
      await authApi.csrfCookie();
      const response = await authApi.register(userData);

      // Contrat actuel : l'inscription ne connecte pas l'utilisateur.
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
      await authApi.csrfCookie();
      const response = await authApi.login(credentials);

      // La session est ouverte côté serveur ; seule l'identité est gardée en mémoire.
      user.value = response.data.user;
      initialized.value = true;

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

  // Ferme la session côté serveur. true = plus aucune session authentifiée
  // (fermée, ou déjà inexistante : 401) ; false = état serveur inconnu.
  const closeServerSession = async () => {
    try {
      await authApi.logout();
      return true;
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) return true;

      // 419 : jeton CSRF périmé. Un seul nouvel essai avec un jeton frais.
      if (status === 419) {
        try {
          await authApi.csrfCookie();
          await authApi.logout();
          return true;
        } catch (retryError) {
          return retryError?.response?.status === 401;
        }
      }

      // 429, 5xx, réseau : la session serveur peut encore être active.
      return false;
    }
  };

  // Retourne true si l'utilisateur est réellement déconnecté.
  const logout = async (options = { skipApiCall: false }) => {
    // Éviter les appels multiples
    if (isLoggingOut.value) return false;
    isLoggingOut.value = true;

    try {
      if (!options.skipApiCall && user.value && !(await closeServerSession())) {
        // A3-F1 : ne jamais présenter une déconnexion non confirmée comme réussie.
        showError('La déconnexion a échoué. Veuillez réessayer.');
        return false;
      }

      clearSession();

      // Rediriger seulement si pas déjà sur login
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }

      return true;
    } finally {
      loading.value = false;
      isLoggingOut.value = false;
    }
  };

  // Demande au serveur qui est connecté (cookie de session).
  const fetchUser = async () => {
    loading.value = true;

    try {
      const response = await authApi.getUser();
      user.value = response.data;
    } catch {
      // 401 : pas de session valide
      clearSession();
    } finally {
      loading.value = false;
    }
  };

  // Vérification unique de la session au démarrage (partagée par les gardes du routeur).
  const initAuth = () => {
    if (!initPromise) {
      initPromise = fetchUser().finally(() => {
        initialized.value = true;
      });
    }

    return initPromise;
  };

  return {
    user,
    initialized,
    loading,
    isAuthenticated,
    userName,
    register,
    login,
    logout,
    fetchUser,
    initAuth,
    clearSession,
  };
});
