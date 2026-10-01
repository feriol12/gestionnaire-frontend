import axios from "axios"
import router from "@/router"
import { useAuthStore } from "@/stores/useAuthStore"
import { suppressErrorToasts, useToast } from "@/composables/useToast"

const { warning: showWarning } = useToast()

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  // AUTH3-01 : authentification par cookie de session Sanctum (SPA).
  // Les cookies (session HttpOnly + XSRF-TOKEN) accompagnent chaque requête et
  // Axios renvoie XSRF-TOKEN dans l'en-tête X-XSRF-TOKEN, y compris vers une
  // API d'une autre origine (en local : localhost:5173 -> localhost:8000).
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// La route Sanctum /sanctum/csrf-cookie est à la racine du backend, pas sous
// /api : on dérive l'origine du backend de l'URL de base de l'API.
const backendOrigin = new URL(apiClient.defaults.baseURL, window.location.origin).origin

// Obtient le cookie XSRF-TOKEN (et la session) avant login / inscription.
export const ensureCsrfCookie = () =>
  apiClient.get("/sanctum/csrf-cookie", { baseURL: backendOrigin })

// AUTH3-02 (A3-F7) : chaque requête se termine toujours (résolue ou rejetée).
// Plus aucune promesse laissée en attente ni de requête bloquée/mise en file :
// une session expirée rejette la requête d'origine, efface l'identité locale et
// déclenche UNE redirection vers /login (sans nouvel essai automatique).
const AUTH_REDIRECT_WINDOW_MS = 2000
let isRedirecting = false

const redirectToLogin = () => {
  if (isRedirecting || router.currentRoute.value.path === '/login') return

  isRedirecting = true
  // Les requêtes en cours vont échouer à leur tour : pas de toasts d'erreur
  // en cascade, un seul message explicite.
  suppressErrorToasts(AUTH_REDIRECT_WINDOW_MS)
  showWarning('Votre session a expiré. Veuillez vous reconnecter.')
  router.push('/login').finally(() => {
    setTimeout(() => {
      isRedirecting = false
    }, AUTH_REDIRECT_WINDOW_MS)
  })
}

const isAuthRoute = (config) =>
  ['/login', '/register', '/logout'].some((path) => config?.url?.includes(path))

// Chaque requête porte l'époque d'authentification de son envoi : seule une
// réponse de l'époque COURANTE peut modifier l'identité (voir useAuthStore).
apiClient.interceptors.request.use((config) => {
  config.authEpoch = useAuthStore().currentAuthEpoch()
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Login / inscription / déconnexion et vérification de session gèrent
    // eux-mêmes leurs erreurs (pas de redirection ici).
    if (isAuthRoute(error.config) || error.config?.skipAuthRedirect) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const authStore = useAuthStore()

    // Réponse périmée : la requête a été envoyée sous une identité qui a changé
    // depuis (reconnexion, déconnexion...). Elle est rejetée vers son appelant,
    // sans effacer l'identité courante ni rediriger.
    if ((status === 401 || status === 419) && error.config?.authEpoch !== authStore.currentAuthEpoch()) {
      error.isStaleAuth = true
      return Promise.reject(error)
    }

    // 401 : session absente ou expirée.
    if (status === 401) {
      authStore.clearSession()
      redirectToLogin()
      error.isAuthRedirect = true
      return Promise.reject(error)
    }

    // 419 : jeton CSRF refusé. Ce n'est pas forcément une déconnexion : une
    // seule vérification de la session (GET /api/user, qui renouvelle aussi
    // XSRF-TOKEN), jamais de nouvel essai de la requête d'origine.
    if (status === 419) {
      const sessionState = await authStore.fetchUser()

      if (sessionState === 'unauthenticated') {
        redirectToLogin()
        error.isAuthRedirect = true
      } else if (error.response?.data) {
        error.response.data.message = 'La requête a expiré. Veuillez réessayer.'
      }

      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default apiClient
