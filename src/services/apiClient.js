import axios from "axios"
import router from "@/router"
import { useAuthStore } from "@/stores/useAuthStore"

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

let isRedirecting = false
let failedQueue = []   // ← queue requests that arrive during the redirect




// Reset du flag à chaque navigation réussie
router.afterEach((to, from) => {
  if (from.path === '/login' || to.path !== '/login') {
    isRedirecting = false
  }
})
// Silently reject everything queued — no error bubbles to components
const flushQueue = () => {
  failedQueue.forEach(({ reject }) => reject(null))
  failedQueue = []
}

apiClient.interceptors.request.use((config) => {
  // If we're already redirecting, abort ALL new requests immediately
  if (isRedirecting) {
    return Promise.reject({ __silent: true })
  }

  // AUTH3-01 : plus d'en-tête Authorization — la session suffit.
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Swallow our own silent abort errors
    if (error?.__silent) {
      return new Promise(() => {}) // pending forever — never resolves or rejects
    }

    // Already redirecting — queue this and keep it silent
    if (isRedirecting) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
    }

    // Login / inscription / déconnexion et vérification de session au
    // démarrage gèrent eux-mêmes leurs erreurs (pas de redirection ici).
    const isAuthRoute = ['/login', '/register', '/logout'].some(
      (path) => error.config?.url?.includes(path)
    )
    if (isAuthRoute || error.config?.skipAuthRedirect) {
      return Promise.reject(error)
    }

    // 401 : session absente ou expirée. 419 : jeton CSRF invalide (session
    // perdue). Dans les deux cas l'identité locale n'est plus valable.
    const status = error.response?.status
    if (status === 401 || status === 419) {
      const authStore = useAuthStore()
      authStore.clearSession() // pas d'appel API : la session serveur est déjà invalide

      const currentPath = router.currentRoute.value.path
      if (currentPath === '/login') {
        return Promise.reject(error)
      }

      isRedirecting = true

      flushQueue() // drain the queue silently

      router.push('/login')

      setTimeout(() => {
        isRedirecting = false
      }, 2000)

      // Return a forever-pending promise so THIS request also never reaches the catch block
      return new Promise(() => {})
    }

    return Promise.reject(error)
  }
)

export default apiClient