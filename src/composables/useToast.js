// src/composables/useToast.js
import { ref } from 'vue'

let toastInstance = null
let pendingQueue = []

// AUTH3-02 : pendant la redirection vers /login après une session expirée, les
// requêtes en cours échouent (401) et leurs gestionnaires afficheraient des
// erreurs sans objet. Seules les erreurs sont masquées, pour une durée bornée.
let errorsSuppressedUntil = 0
export const suppressErrorToasts = (ms) => {
  errorsSuppressedUntil = Date.now() + ms
}

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
    setTimeout(() => {
      if (toastInstance && toastInstance.toast && toastInstance.toast[type]) {
        toastInstance.toast[type](message, options)
      } else {
        pendingQueue.push({ type, message, options })
      }
    }, 50)
  }

  const success = (message, options = {}) => queueOrExecute('success', message, options)
  const error = (message, options = {}) => {
    if (Date.now() < errorsSuppressedUntil) return
    queueOrExecute('error', message, options)
  }
  const warning = (message, options = {}) => queueOrExecute('warning', message, options)
  const info = (message, options = {}) => queueOrExecute('info', message, options)

  return { success, error, warning, info }
}