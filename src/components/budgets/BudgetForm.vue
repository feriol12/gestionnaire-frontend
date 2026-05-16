<!-- src/components/budgets/BudgetForm.vue -->

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="forceClose"
  >
    <div class="bg-white rounded-2xl shadow-modal w-full max-w-md">
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-slate-100">
        <h2 class="text-xl font-semibold text-slate-900">
          {{ isEditing ? 'Modifier le budget' : 'Nouveau budget' }}
        </h2>
        <button
          @click="forceClose"
          :disabled="loading"
          class="text-slate-400 hover:text-slate-600 text-2xl leading-none transition disabled:opacity-50"
        >
          &times;
        </button>
      </div>

      <!-- FORM -->
      <div class="p-5 space-y-4">
        <div>
          <label class="block text-[13px] font-medium text-slate-500 mb-1">
            Montant (FCFA)
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.amount"
            type="number"
            placeholder="0"
            :disabled="loading"
            :class="[
              'w-full h-11 px-4 py-2.5 text-sm rounded-xl border transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500',
              errors.amount ? 'border-red-500 bg-red-50' : 'border-slate-200',
              loading ? 'bg-gray-100 cursor-not-allowed' : ''
            ]"
          />
          <p v-if="errors.amount" class="text-xs text-red-500 mt-1">
            {{ errors.amount[0] }}
          </p>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-slate-500 mb-1">
            Mois
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.month"
            type="month"
            :disabled="loading"
            :class="[
              'w-full h-11 px-4 py-2.5 text-sm rounded-xl border transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500',
              errors.month ? 'border-red-500 bg-red-50' : 'border-slate-200',
              loading ? 'bg-gray-100 cursor-not-allowed' : ''
            ]"
          />
          <p v-if="errors.month" class="text-xs text-red-500 mt-1">
            {{ errors.month[0] }}
          </p>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="flex justify-end gap-3 p-5 border-t border-slate-100">
        <button
          @click="forceClose"
          :disabled="loading"
          class="px-5 py-2.5 rounded-xl text-sm font-medium transition bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          @click="submit"
          :disabled="loading"
          class="px-5 py-2.5 rounded-xl text-sm font-medium transition bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBudgetStore } from '@/stores/useBudgetStore'

// PROPS
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  budget: {
    type: Object,
    default: null
  }
})

// EMITS
const emit = defineEmits(['close', 'saved'])

// STORE
const budgetStore = useBudgetStore()

// STATE
const form = ref({
  amount: '',
  month: ''
})
const errors = ref({})
const loading = ref(false)

// COMPUTED
const isEditing = computed(() => !!props.budget)

// Force close - méthode directe
const forceClose = () => {
  console.log('Force closing modal')
  loading.value = false
  errors.value = {}
  emit('close')
}

// WATCH
watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      resetForm()
      if (props.budget) {
        fillForm()
      } else {
        form.value.month = new Date().toISOString().slice(0, 7)
      }
    }
  }
)

// METHODS
const resetForm = () => {
  form.value = {
    amount: '',
    month: ''
  }
  errors.value = {}
}

const fillForm = () => {
  form.value = {
    amount: props.budget.amount || '',
    month: props.budget.month?.slice(0, 7) || ''
  }
}

const submit = async () => {
  if (loading.value) return
  
  loading.value = true
  errors.value = {}

  const payload = {
    ...form.value,
    month: `${form.value.month}-01`
  }

  try {
    const result = isEditing.value
      ? await budgetStore.updateBudget(props.budget.id, payload)
      : await budgetStore.addBudget(payload)

    if (result.success) {
      // Fermeture immédiate
      forceClose()
      emit('saved')
    } else if (result.errors) {
      errors.value = result.errors
    }
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}
</script>