<template>
  <TransitionGroup 
    name="toast" 
    tag="div"
    class="fixed bottom-4 right-4 z-50 flex flex-col gap-3"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'min-w-[320px] max-w-md rounded-lg shadow-lg p-4 pointer-events-auto transform transition-all duration-300',
        'flex items-start gap-3 backdrop-blur-sm',
        variantClasses[toast.variant]
      ]"
      @mouseenter="pauseTimer(toast.id)"
      @mouseleave="resumeTimer(toast.id)"
    >
      <!-- Icône -->
      <div class="shrink-0">
        <component :is="getIcon(toast.variant)" class="w-5 h-5" />
      </div>
      
      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <h4 v-if="toast.title" class="font-semibold text-sm mb-1">
          {{ toast.title }}
        </h4>
        <p class="text-sm">{{ toast.message }}</p>
      </div>
      
      <!-- Bouton fermer -->
      <button
        @click="removeToast(toast.id)"
        class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X 
} from 'lucide-vue-next'

// État
const toasts = ref([])
const timers = new Map()

// Variantes de couleurs
const variantClasses = {
  success: 'bg-green-50 border border-green-200 text-green-800',
  error: 'bg-red-50 border border-red-200 text-red-800',
  warning: 'bg-amber-50 border border-amber-200 text-amber-800',
  info: 'bg-blue-50 border border-blue-200 text-blue-800'
}

// Icônes par variante
const getIcon = (variant) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }
  return icons[variant] || Info
}

// Ajouter un toast
const addToast = (toast) => {
  const id = Date.now() + Math.random()
  const newToast = {
    id,
    message: toast.message,
    title: toast.title || '',
    variant: toast.variant || 'info',
    duration: toast.duration || 3000
  }
  
  toasts.value.push(newToast)
  
  // Auto-suppression
  if (newToast.duration > 0) {
    const timer = setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
    
    timers.set(id, timer)
  }
  
  return id
}

// Supprimer un toast
const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
    
    // Nettoyer le timer
    if (timers.has(id)) {
      clearTimeout(timers.get(id))
      timers.delete(id)
    }
  }
}

// Pause le timer
const pauseTimer = (id) => {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

// Reprend le timer
const resumeTimer = (id) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && toast.duration > 0) {
    const timer = setTimeout(() => {
      removeToast(id)
    }, toast.duration)
    timers.set(id, timer)
  }
}

// Méthodes globales
const toast = {
  success: (message, options = {}) => addToast({ message, variant: 'success', ...options }),
  error: (message, options = {}) => addToast({ message, variant: 'error', ...options }),
  warning: (message, options = {}) => addToast({ message, variant: 'warning', ...options }),
  info: (message, options = {}) => addToast({ message, variant: 'info', ...options })
}

// Exposer les méthodes
defineExpose({ toast, addToast, removeToast })

// Nettoyage
onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>