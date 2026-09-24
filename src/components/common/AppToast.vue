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
          'min-w-[320px] max-w-[28rem] rounded-lg shadow-lg p-4 pointer-events-auto transform transition-all duration-300',
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
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70]">
      <div
        :ref="(el) => setModalToastEl(toast.id, el)"
        class="bg-white rounded-2xl shadow-xl w-full max-w-[24rem] p-6 transform transition-all animate-modal"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="`modal-toast-${toast.domKey}-title`"
        :aria-describedby="`modal-toast-${toast.domKey}-message`"
      >
        <div class="text-center">
          <div class="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4" :class="modalIconBgClass(toast.variant)">
            <component :is="getIcon(toast.variant)" class="w-7 h-7" :class="modalIconColorClass(toast.variant)" />
          </div>
          
          <h3 :id="`modal-toast-${toast.domKey}-title`" class="text-lg font-semibold text-slate-900 mb-2">
            {{ toast.title || modalDefaultTitle(toast.variant) }}
          </h3>
          
          <p :id="`modal-toast-${toast.domKey}-message`" class="text-sm text-slate-500 mb-6">
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
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-vue-next'
import { registerOverlay, unregisterOverlay, isTopOverlay } from './overlayStack.js'

const toasts = ref([])
const timers = new Map()

const variantClasses = {
  success: 'bg-green-50 border border-green-200 text-green-800',
  error: 'bg-red-50 border border-red-200 text-red-800',
  warning: 'bg-amber-50 border border-amber-200 text-amber-800',
  info: 'bg-blue-50 border border-blue-200 text-blue-800'
}

const modalToasts = computed(() => toasts.value.filter(t => t.modal))

// ========== MODAL TOASTS IN THE SHARED OVERLAY STACK ==========
// A modal toast can appear above an open AppModal/AppBottomSheet. Registering
// it as the top overlay makes those primitives stand down (they ignore
// keyboard/focus events while not top); the toast then owns Tab/focus until
// it closes and hands focus back. Regular corner toasts never register.
const modalEntries = new Map() // toast id -> { owner, el, restoreFocusEl }
let modalSeq = 0

const topModalEntry = () => {
  for (const entry of modalEntries.values()) {
    if (isTopOverlay(entry.owner)) return entry
  }
  return null
}

const getFocusable = (entry) =>
  entry?.el ? Array.from(entry.el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled) : []

const focusModalToast = (entry) => {
  const target = getFocusable(entry)[0] || entry?.el
  target?.focus()
}

const setModalToastEl = (id, el) => {
  const entry = modalEntries.get(id)
  if (entry) entry.el = el
}

const onModalToastKeydown = (event) => {
  if (event.key !== 'Tab') return
  const entry = topModalEntry()
  if (!entry?.el) return
  event.preventDefault()
  const focusable = getFocusable(entry)
  if (focusable.length === 0) return entry.el.focus()
  const index = focusable.indexOf(document.activeElement)
  const next = event.shiftKey
    ? (index <= 0 ? focusable.length - 1 : index - 1)
    : (index === -1 || index === focusable.length - 1 ? 0 : index + 1)
  focusable[next].focus()
}

const onModalToastFocusIn = (event) => {
  const entry = topModalEntry()
  if (entry?.el && !entry.el.contains(event.target)) focusModalToast(entry)
}

const registerModalToast = (id) => {
  const active = document.activeElement
  const entry = { owner: Symbol('AppToastModal'), el: null, restoreFocusEl: active instanceof HTMLElement ? active : null }
  if (modalEntries.size === 0) {
    document.addEventListener('keydown', onModalToastKeydown)
    document.addEventListener('focusin', onModalToastFocusIn)
  }
  modalEntries.set(id, entry)
  registerOverlay(entry.owner)
  nextTick(() => {
    if (modalEntries.get(id) === entry && isTopOverlay(entry.owner)) focusModalToast(entry)
  })
}

const unregisterModalToast = (id) => {
  const entry = modalEntries.get(id)
  if (!entry) return
  const wasTop = isTopOverlay(entry.owner)
  unregisterOverlay(entry.owner)
  modalEntries.delete(id)
  // A toast stacked above this one may have captured this toast's button as
  // its restore target; hand it this toast's own origin instead.
  for (const other of modalEntries.values()) {
    if (entry.el && other.restoreFocusEl && entry.el.contains(other.restoreFocusEl)) {
      other.restoreFocusEl = entry.restoreFocusEl
    }
  }
  if (modalEntries.size === 0) {
    document.removeEventListener('keydown', onModalToastKeydown)
    document.removeEventListener('focusin', onModalToastFocusIn)
  }
  if (wasTop && entry.restoreFocusEl?.isConnected) entry.restoreFocusEl.focus()
}

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
  
  // ✅ Durée : 4000 pour les modales, 3000 pour les toasts
  let duration = toast.duration || 3000
  if (toast.modal && !toast.duration) {
    duration = 4000
  }
  
  const newToast = {
    id,
    message: toast.message,
    title: toast.title || '',
    variant: toast.variant || 'info',
    duration: duration,
    modal: toast.modal || false
  }
  if (newToast.modal) newToast.domKey = ++modalSeq
  
  toasts.value.push(newToast)
  if (newToast.modal) registerModalToast(id)
  
  if (newToast.duration > 0) {
    const timer = setTimeout(() => removeToast(id), newToast.duration)
    timers.set(id, timer)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
    unregisterModalToast(id)
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
  Array.from(modalEntries.keys()).forEach(unregisterModalToast)
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