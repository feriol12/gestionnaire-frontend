// src/composables/useToast.js
import { ref } from 'vue'

let toastInstance = null
let pendingQueue = []

export const registerToast = (instance) => {
  toastInstance = instance
  
  if (pendingQueue.length > 0) {
    pendingQueue.forEach(({ type, message, options }) => {
      if (toastInstance && toastInstance.toast && toastInstance.toast[type]) {
        toastInstance.toast[type](message, options)
      }
    })
    pendingQueue = []
  }
}

export const useToast = () => {
  const queueOrExecute = (type, message, options = {}) => {
    // Petit délai pour laisser le temps à registerToast de s'exécuter
    setTimeout(() => {
      if (toastInstance && toastInstance.toast && toastInstance.toast[type]) {
        toastInstance.toast[type](message, options)
      } else {
        pendingQueue.push({ type, message, options })
      }
    }, 50) // Délai de 50ms
  }

  const success = (message, options = {}) => queueOrExecute('success', message, options)
  const error = (message, options = {}) => queueOrExecute('error', message, options)
  const warning = (message, options = {}) => queueOrExecute('warning', message, options)
  const info = (message, options = {}) => queueOrExecute('info', message, options)

  return { success, error, warning, info }
}