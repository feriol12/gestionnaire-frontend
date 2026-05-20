<template>
  <!-- Toasts en bas à droite (option modal: false) -->
  <TransitionGroup 
    name="toast" 
    tag="div"
    class="fixed bottom-4 right-4 z-50 flex flex-col gap-3"
  >
    <template v-for="toast in toasts" :key="toast.id">
      <div
        v-if="!toast.modal"
        :class="[
          'min-w-[320px] max-w-md rounded-lg shadow-lg p-4 pointer-events-auto transform transition-all duration-300',
          'flex items-start gap-3 backdrop-blur-sm',
          variantClasses[toast.variant]
        ]"
        @mouseenter="pauseTimer(toast.id)"
        @mouseleave="resumeTimer(toast.id)"
      >
        <div class="shrink-0">
          <component :is="getIcon(toast.variant)" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 v-if="toast.title" class="font-semibold text-sm mb-1">{{ toast.title }}</h4>
          <p class="text-sm">{{ toast.message }}</p>
        </div>
        <button @click="removeToast(toast.id)" class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600">
          <X class="w-4 h-4" />
        </button>
      </div>
    </template>
  </TransitionGroup>

  <!-- Modales centrées (option modal: true) -->
  <template v-for="toast in modalToasts" :key="toast.id">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-modal">
        <div class="text-center">
          <div class="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4" :class="modalIconBgClass(toast.variant)">
            <component :is="getIcon(toast.variant)" class="w-7 h-7" :class="modalIconColorClass(toast.variant)" />
          </div>
          
          <h3 class="text-lg font-semibold text-slate-900 mb-2">
            {{ toast.title || modalDefaultTitle(toast.variant) }}
          </h3>
          
          <p class="text-sm text-slate-500 mb-6">
            {{ toast.message }}
          </p>
          
          <button 
            @click="removeToast(toast.id)"
            class="px-6 py-2.5 rounded-xl text-sm font-medium transition w-full"
            :class="modalButtonClass(toast.variant)"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-vue-next'

const toasts = ref([])
const timers = new Map()

const variantClasses = {
  success: 'bg-green-50 border border-green-200 text-green-800',
  error: 'bg-red-50 border border-red-200 text-red-800',
  warning: 'bg-amber-50 border border-amber-200 text-amber-800',
  info: 'bg-blue-50 border border-blue-200 text-blue-800'
}

const modalToasts = computed(() => toasts.value.filter(t => t.modal))

const getIcon = (variant) => {
  const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info }
  return icons[variant] || Info
}

const modalIconBgClass = (variant) => {
  const classes = { success: 'bg-emerald-100', error: 'bg-red-100', warning: 'bg-amber-100', info: 'bg-blue-100' }
  return classes[variant] || 'bg-slate-100'
}

const modalIconColorClass = (variant) => {
  const classes = { success: 'text-emerald-600', error: 'text-red-600', warning: 'text-amber-600', info: 'text-blue-600' }
  return classes[variant] || 'text-slate-600'
}

const modalButtonClass = (variant) => {
  const classes = { 
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white', 
    error: 'bg-red-600 hover:bg-red-700 text-white', 
    warning: 'bg-amber-600 hover:bg-amber-700 text-white', 
    info: 'bg-blue-600 hover:bg-blue-700 text-white' 
  }
  return classes[variant] || 'bg-slate-600 hover:bg-slate-700 text-white'
}

const modalDefaultTitle = (variant) => {
  const titles = { success: 'Succès !', error: 'Erreur', warning: 'Attention', info: 'Information' }
  return titles[variant] || 'Notification'
}

const addToast = (toast) => {
  const id = Date.now() + Math.random()
  const newToast = {
    id,
    message: toast.message,
    title: toast.title || '',
    variant: toast.variant || 'info',
    duration: toast.modal ? 0 : (toast.duration || 3000),
    modal: toast.modal || false
  }
  
  toasts.value.push(newToast)
  
  if (!newToast.modal && newToast.duration > 0) {
    const timer = setTimeout(() => removeToast(id), newToast.duration)
    timers.set(id, timer)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
    if (timers.has(id)) {
      clearTimeout(timers.get(id))
      timers.delete(id)
    }
  }
}

const pauseTimer = (id) => {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

const resumeTimer = (id) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && !toast.modal && toast.duration > 0) {
    const timer = setTimeout(() => removeToast(id), toast.duration)
    timers.set(id, timer)
  }
}

const toast = {
  success: (message, options = {}) => addToast({ message, variant: 'success', ...options }),
  error: (message, options = {}) => addToast({ message, variant: 'error', ...options }),
  warning: (message, options = {}) => addToast({ message, variant: 'warning', ...options }),
  info: (message, options = {}) => addToast({ message, variant: 'info', ...options })
}

defineExpose({ toast, addToast, removeToast })

onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }
.toast-move { transition: transform 0.3s ease; }

@keyframes modal {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-modal { animation: modal 0.2s ease-out; }
</style>