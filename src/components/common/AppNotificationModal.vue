<!-- src/components/common/AppNotificationModal.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-modal">
      
      <!-- Icône -->
      <div class="text-center">
        <div 
          class="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
          :class="iconBgClass"
        >
          <component :is="iconComponent" class="w-7 h-7" :class="iconColorClass" />
        </div>
        
        <!-- Titre -->
        <h3 class="text-lg font-semibold text-slate-900 mb-2">
          {{ title }}
        </h3>
        
        <!-- Message -->
        <p class="text-sm text-slate-500 mb-6">
          {{ message }}
        </p>
        
        <!-- Bouton -->
        <button 
          @click="close"
          class="px-6 py-2.5 rounded-xl text-sm font-medium transition w-full"
          :class="buttonClass"
        >
          {{ buttonText }}
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-vue-next';

// ========== PROPS ==========
const props = defineProps({
  visible: { type: Boolean, default: false },
  type: { type: String, default: 'success', validator: (v) => ['success', 'error', 'warning', 'info'].includes(v) },
  title: { type: String, default: '' },
  message: { type: String, required: true },
  buttonText: { type: String, default: 'Fermer' },
  autoClose: { type: Number, default: 2000 } // Auto-fermeture en ms (0 = désactivé)
});

// ========== EMITS ==========
const emit = defineEmits(['close']);

// ========== COMPUTED ==========
const iconComponent = computed(() => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };
  return icons[props.type] || Info;
});

const iconBgClass = computed(() => {
  const classes = {
    success: 'bg-emerald-100',
    error: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100'
  };
  return classes[props.type] || 'bg-slate-100';
});

const iconColorClass = computed(() => {
  const classes = {
    success: 'text-emerald-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600'
  };
  return classes[props.type] || 'text-slate-600';
});

const buttonClass = computed(() => {
  const classes = {
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white'
  };
  return classes[props.type] || 'bg-slate-600 hover:bg-slate-700 text-white';
});

// ========== MÉTHODES ==========
const close = () => {
  emit('close');
};

// Auto-fermeture
let autoCloseTimer = null;

watch(() => props.visible, (newVal) => {
  if (newVal && props.autoClose > 0) {
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      close();
    }, props.autoClose);
  }
  
  if (!newVal && autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
});
</script>

<style scoped>
@keyframes modal {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-modal {
  animation: modal 0.2s ease-out;
}
</style>