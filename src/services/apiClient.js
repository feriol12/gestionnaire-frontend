import axios from "axios"
import router from "@/router"
import { useAuthStore } from "@/stores/useAuthStore"

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

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
  const token = localStorage.getItem("token")

  // If we're already redirecting, abort ALL new requests immediately
  if (isRedirecting) {
    return Promise.reject({ __silent: true })
  }

  if (token && !config.url.includes('/login') && !config.url.includes('/register')) {
    config.headers.Authorization = `Bearer ${token}`
  }

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

    const isAuthRoute = ['/login', '/register'].some(
      (path) => error.config?.url?.includes(path)
    )
    if (isAuthRoute) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      const currentPath = router.currentRoute.value.path
      if (currentPath === '/login') {
        return Promise.reject(error)
      }

      isRedirecting = true

      const authStore = useAuthStore()
      await authStore.logout({ skipApiCall: true })

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