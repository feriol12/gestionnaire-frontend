import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/apiAuth';
import { useToast } from '@/composables/useToast';
import router from '@/router';

const { error: showError, warning: showWarning } = useToast();

// AUTH3-02 : message utilisateur selon la réponse réelle du serveur. Seuls les
// messages de validation (422) du serveur sont repris ; jamais de message brut
// d'erreur serveur (exception, trace, chemin interne).
export const describeAuthError = (error, flow) => {
  const status = error?.response?.status;

  if (!error?.response) {
    return { kind: 'network', message: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.' };
  }
  if (status === 422) {
    return { kind: 'validation', message: 'Veuillez corriger les erreurs du formulaire.', errors: error.response.data?.errors ?? {} };
  }
  if (status === 401 && flow === 'login') {
    return { kind: 'credentials', message: 'Email ou mot de passe incorrect.' };
  }
  // AUTH3-04 : identifiants corrects mais adresse email non vérifiée.
  if (status === 403 && error.response.data?.code === 'EMAIL_UNVERIFIED') {
    return { kind: 'email_unverified', message: 'Votre adresse email doit être vérifiée avant de continuer.' };
  }
  if (status === 419) {
    return { kind: 'csrf', message: 'La session de sécurité a expiré. Veuillez réessayer.' };
  }
  if (status === 429) {
    return { kind: 'rate_limited', message: 'Trop de tentatives. Veuillez patienter une minute avant de réessayer.' };
  }
  if (status >= 500) {
    return { kind: 'server', message: 'Le serveur rencontre un problème temporaire. Veuillez réessayer dans un instant.' };
  }
  const fallback = {
    login: 'Connexion impossible pour le moment.',
    register: 'Inscription impossible pour le moment.',
  };
  return {
    kind: 'unexpected',
    message: fallback[flow] ?? 'Opération impossible pour le moment. Veuillez réessayer plus tard.',
  };
};

// Délai minimal avant de retenter la vérification de session après un échec
// temporaire (serveur indisponible, réseau, 429...).
const INIT_RETRY_COOLDOWN_MS = 3000;

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
  // 'unknown' : session pas encore vérifiée, ou vérification impossible pour
  // l'instant (erreur temporaire) ; 'authenticated' / 'unauthenticated' :
  // réponse explicite du serveur (200 / 401).
  const authStatus = ref('unknown');
  const loading = ref(false);
  const isLoggingOut = ref(false); // Flag pour éviter les appels multiples
  let initPromise = null;
  let initFailedAt = 0;
  // AUTH3-02 : époque d'authentification. Elle avance à chaque changement
  // d'identité (connexion réussie, passage à authentifié / non authentifié).
  // Chaque requête est marquée de l'époque courante à son envoi : une réponse
  // émise sous une époque antérieure est périmée et ne doit plus modifier
  // l'identité (ex. 401 d'une ancienne session arrivant après une reconnexion).
  let authEpoch = 0;
  const currentAuthEpoch = () => authEpoch;
  let loginInFlight = null;
  let registerInFlight = null;

  // AUTH3-04 : adresse à vérifier transmise à la page /verify-email après une
  // inscription ou une connexion refusée (en mémoire uniquement, jamais stockée).
  const pendingVerification = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userName = computed(() => user.value?.name || '');
  // Session existante dont l'adresse n'est pas vérifiée (session antérieure à AUTH3-04).
  const isEmailVerified = computed(() => !!user.value?.email_verified_at);

  // Oublie l'identité locale (session expirée, déconnexion...).
  const clearSession = () => {
    if (authStatus.value !== 'unauthenticated') authEpoch++;
    user.value = null;
    authStatus.value = 'unauthenticated';
    purgeLegacyAuthStorage();
  };

  // Identité confirmée par le serveur. Une connexion ouvre toujours une
  // nouvelle époque ; une simple confirmation de la même session non.
  const setAuthenticated = (authenticatedUser, { newLogin = false } = {}) => {
    if (newLogin || authStatus.value !== 'authenticated') authEpoch++;
    user.value = authenticatedUser;
    authStatus.value = 'authenticated';
  };

  // Actions
  // Un seul appel à la fois : une double soumission réutilise la requête en cours.
  // Si le cookie CSRF ne peut pas être obtenu, l'inscription n'est pas envoyée.
  const register = (userData) => {
    registerInFlight ??= (async () => {
      loading.value = true;

      try {
        await authApi.csrfCookie();
        const response = await authApi.register(userData);

        // Contrat actuel : l'inscription ne connecte pas l'utilisateur.
        // AUTH3-04 : l'adresse doit ensuite être vérifiée (lien envoyé par email).
        pendingVerification.value = { email: userData.email, reason: 'registered' };
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, ...describeAuthError(error, 'register') };
      } finally {
        loading.value = false;
        registerInFlight = null;
      }
    })();

    return registerInFlight;
  };

  const login = (credentials) => {
    loginInFlight ??= (async () => {
      loading.value = true;

      try {
        await authApi.csrfCookie();
        const response = await authApi.login(credentials);

        // La session est ouverte côté serveur ; seule l'identité est gardée en mémoire.
        setAuthenticated(response.data.user, { newLogin: true });

        return { success: true, data: response.data };
      } catch (error) {
        // Un échec de connexion ne déconnecte personne : l'état reste inchangé.
        const result = describeAuthError(error, 'login');
        if (result.kind === 'email_unverified') {
          pendingVerification.value = { email: credentials.email, reason: 'login' };
        }
        return { success: false, ...result };
      } finally {
        loading.value = false;
        loginInFlight = null;
      }
    })();

    return loginInFlight;
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
  // Retourne 'authenticated', 'unauthenticated' (401 uniquement) ou 'unknown'
  // (429, 5xx, réseau...) : une panne temporaire n'efface jamais l'identité.
  // Si l'identité a changé pendant la requête (époque différente), la réponse
  // est périmée : elle ne modifie rien et l'état courant est renvoyé ('stale').
  const fetchUser = async () => {
    const epoch = authEpoch;

    try {
      const response = await authApi.getUser();
      if (epoch !== authEpoch) return 'stale';
      setAuthenticated(response.data);
      return 'authenticated';
    } catch (error) {
      if (epoch !== authEpoch) return 'stale';
      if (error?.response?.status === 401) {
        clearSession();
        return 'unauthenticated';
      }
      return 'unknown';
    }
  };

  // Vérification de la session au démarrage, partagée par les gardes du routeur.
  // Après un échec temporaire, elle peut être retentée (au plus une fois par
  // période INIT_RETRY_COOLDOWN_MS), jamais en boucle.
  const initAuth = () => {
    const retryAllowed = initFailedAt !== 0 && Date.now() - initFailedAt >= INIT_RETRY_COOLDOWN_MS;

    if (!initPromise || retryAllowed) {
      initFailedAt = 0;
      initPromise = fetchUser().then((state) => {
        if (state === 'unknown') initFailedAt = Date.now();
        return state;
      });
    }

    return initPromise;
  };

  // Garde du routeur : session invérifiable pour l'instant (pas une déconnexion).
  const notifyAuthUnavailable = () => {
    showWarning('Impossible de vérifier votre session pour le moment. Veuillez réessayer dans un instant.');
  };

  return {
    user,
    authStatus,
    loading,
    isAuthenticated,
    isEmailVerified,
    pendingVerification,
    userName,
    register,
    login,
    logout,
    fetchUser,
    initAuth,
    clearSession,
    notifyAuthUnavailable,
    currentAuthEpoch,
  };
});
