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
      await authStore.logout({ skipApiCall: true })
      router.push('/login')
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