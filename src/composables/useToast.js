// src/composables/useToast.js
import { ref } from 'vue'

// Instance unique du toast (singleton)
let toastInstance = null

// Fonction pour enregistrer l'instance du toast
export const registerToast = (instance) => {
  toastInstance = instance
}

// Hook principal
export const useToast = () => {
  // Fonction pour afficher un toast de succès
  const success = (message, options = {}) => {
    if (toastInstance) {
      toastInstance.toast.success(message, options)
    } else {
      console.warn('Toast non initialisé')
    }
  }

  // Fonction pour afficher un toast d'erreur
  const error = (message, options = {}) => {
    if (toastInstance) {
      toastInstance.toast.error(message, options)
    } else {
      console.warn('Toast non initialisé')
    }
  }

  // Fonction pour afficher un toast d'avertissement
  const warning = (message, options = {}) => {
    if (toastInstance) {
      toastInstance.toast.warning(message, options)
    } else {
      console.warn('Toast non initialisé')
    }
  }

  // Fonction pour afficher un toast d'information
  const info = (message, options = {}) => {
    if (toastInstance) {
      toastInstance.toast.info(message, options)
    } else {
      console.warn('Toast non initialisé')
    }
  }

  // Retourner toutes les méthodes
  return {
    success,
    error,
    warning,
    info
  }
}