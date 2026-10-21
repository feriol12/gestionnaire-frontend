// composable/useInactivityTimer.js
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import router from '@/router'

export function useInactivityTimer(minutes = 1440) {
  const authStore = useAuthStore()
  let timer = null

  const reset = () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      // SEO-07 : un visiteur sans session (accueil public) n'est pas « déconnecté ».
      if (!authStore.isAuthenticated) return
      // AUTH3-01 : fermer aussi la session serveur (sinon elle survivrait côté cookie).
      // En cas d'échec, on reste connecté (message affiché) : pas de nouvel essai
      // automatique ; CheckLastActivity reste la protection serveur à 24 h.
      if (await authStore.logout()) router.push('/login')
    }, minutes * 60 * 1000)
  }

  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

  onMounted(() => {
    events.forEach(e => window.addEventListener(e, reset))
    reset() // démarre le timer
  })

  onUnmounted(() => {
    events.forEach(e => window.removeEventListener(e, reset))
    clearTimeout(timer)
  })
}