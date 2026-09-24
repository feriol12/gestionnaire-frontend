<!-- src/components/budgets/BudgetForm.vue -->
<!--
  One form instance, two shells (MONEVA V2, Phase 6): AppModal at >=768px,
  AppBottomSheet below. The shell is chosen once when the form opens and is
  held for the whole open session — crossing the breakpoint while open never
  switches shell, remounts, or resets fields.
  Dismissal: Escape never closes; ×, Annuler and the backdrop close only
  while no request is in flight (closable = !loading).
-->
<template>
  <component
    :is="overlayMode === 'sheet' ? AppBottomSheet : AppModal"
    :model-value="open"
    :title="isEditing ? 'Modifier le budget' : 'Nouveau budget'"
    :closable="!loading"
    :close-on-escape="false"
    v-bind="overlayMode === 'sheet' ? { maxHeight: '60vh' } : {}"
    @close="forceClose"
  >
    <div class="budget-form" :data-overlay-mode="overlayMode">
      <p class="budget-form-description">
        {{ isEditing
          ? 'Ajustez le plafond budgétaire alloué pour cette période.'
          : 'Définissez le montant prévu pour un mois.' }}
      </p>

      <!-- Mois -->
      <div class="budget-field">
        <label :for="fieldId('month')" class="budget-label">
          Mois <span class="budget-required">*</span>
        </label>
        <div class="budget-input-wrap">
          <CalendarDays class="budget-input-icon" aria-hidden="true" />
          <input
            :id="fieldId('month')"
            v-model="form.month"
            type="month"
            required
            :disabled="loading"
            class="budget-input budget-input-with-icon"
            :class="{ 'is-invalid': errors.month }"
            :aria-invalid="errors.month ? 'true' : undefined"
            :aria-describedby="[errors.month ? fieldId('month-error') : '', fieldId('month-hint')].join(' ').trim()"
          />
        </div>
        <p v-if="errors.month" :id="fieldId('month-error')" class="budget-error" role="alert">
          {{ errors.month[0] }}
        </p>
        <p :id="fieldId('month-hint')" class="budget-hint">
          Le budget s'applique sur l'ensemble du mois sélectionné.
        </p>
      </div>

      <!-- Montant -->
      <div class="budget-field">
        <label :for="fieldId('amount')" class="budget-label">
          Montant <span class="budget-required">*</span>
        </label>
        <div class="budget-input-wrap">
          <Wallet class="budget-input-icon" aria-hidden="true" />
          <input
            :id="fieldId('amount')"
            v-model="form.amount"
            type="number"
            min="1"
            inputmode="numeric"
            placeholder="0"
            required
            :disabled="loading"
            class="budget-input budget-input-with-icon budget-input-amount"
            :class="{ 'is-invalid': errors.amount }"
            :aria-invalid="errors.amount ? 'true' : undefined"
            :aria-describedby="[errors.amount ? fieldId('amount-error') : '', fieldId('amount-hint')].join(' ').trim()"
          />
          <span class="budget-amount-suffix" aria-hidden="true">FCFA</span>
        </div>
        <p v-if="errors.amount" :id="fieldId('amount-error')" class="budget-error" role="alert">
          {{ errors.amount[0] }}
        </p>
        <p :id="fieldId('amount-hint')" class="budget-hint">Montant mensuel global, en FCFA.</p>
      </div>
    </div>

    <template #actions>
      <button
        type="button"
        class="budget-btn budget-btn-ghost"
        :class="{ 'budget-btn-sheet': overlayMode === 'sheet' }"
        :disabled="loading"
        @click="forceClose"
      >
        Annuler
      </button>
      <button
        type="button"
        class="budget-btn budget-btn-primary"
        :class="{ 'budget-btn-sheet': overlayMode === 'sheet' }"
        :disabled="loading"
        @click="submit"
      >
        <Check v-if="!loading" class="budget-btn-icon" aria-hidden="true" />
        {{ submitLabel }}
      </button>
    </template>
  </component>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CalendarDays, Wallet, Check } from 'lucide-vue-next'
import AppModal from '@/components/common/AppModal.vue'
import AppBottomSheet from '@/components/common/AppBottomSheet.vue'
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

// OVERLAY MODE (verrouillé pendant toute la session ouverte)
// Same 768px boundary as AppTable's page size and the app shell.
const detectOverlayMode = () =>
  window.matchMedia('(min-width: 768px)').matches ? 'modal' : 'sheet'
const overlayMode = ref(detectOverlayMode())

const uid = Math.random().toString(36).slice(2, 9)
const fieldId = (name) => `budget-${uid}-${name}`

// COMPUTED
const isEditing = computed(() => !!props.budget)

const submitLabel = computed(() => {
  if (loading.value) return 'Enregistrement...'
  if (isEditing.value && overlayMode.value === 'modal') return 'Enregistrer les modifications'
  return 'Enregistrer'
})

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
      overlayMode.value = detectOverlayMode()
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

<style scoped>
.budget-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.budget-form-description {
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
}

.budget-field {
  min-width: 0;
}

.budget-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
  font-weight: var(--text-label-lg--font-weight);
  color: var(--color-ink);
}

.budget-form[data-overlay-mode='sheet'] .budget-label {
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.budget-required {
  color: var(--color-expense);
}

.budget-input-wrap {
  position: relative;
}

.budget-input-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  width: 20px;
  height: 20px;
  color: var(--color-text-muted-light);
  transform: translateY(-50%);
  pointer-events: none;
}

.budget-input {
  width: 100%;
  height: 48px;
  padding: 0 var(--spacing-md);
  font-size: var(--text-body-lg);
  color: var(--color-ink);
  background-color: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
  border: 1px solid transparent;
  border-radius: var(--radius-moneva-md);
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}

.budget-input-with-icon {
  padding-left: 44px;
}

.budget-input::placeholder {
  color: var(--color-text-muted-light);
}

.budget-input:focus {
  outline: none;
  background-color: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.budget-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.budget-input.is-invalid {
  background-color: var(--color-expense-bg);
  border-color: var(--color-expense);
}

.budget-input.is-invalid:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-expense) 15%, transparent);
}

.budget-input-amount {
  height: 56px;
  padding-right: 72px;
  font-size: var(--text-currency);
  line-height: var(--text-currency--line-height);
  font-weight: var(--text-currency--font-weight);
  font-variant-numeric: tabular-nums;
}

.budget-amount-suffix {
  position: absolute;
  top: 50%;
  right: var(--spacing-sm);
  transform: translateY(-50%);
  padding: 2px var(--spacing-sm);
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  border-radius: var(--radius-moneva);
  pointer-events: none;
}

.budget-error {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-expense);
}

.budget-hint {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted-light);
}

.budget-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  height: 44px;
  padding: 0 var(--spacing-lg);
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
  font-weight: var(--text-label-lg--font-weight);
  border: none;
  border-radius: var(--radius-moneva-md);
  cursor: pointer;
  transition: background-color 0.15s;
}

.budget-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.budget-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.budget-btn-ghost {
  color: var(--color-ink);
  background-color: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
}

.budget-btn-ghost:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
}

.budget-btn-primary {
  color: #ffffff;
  background-color: var(--color-primary);
  box-shadow: var(--shadow-medium);
}

.budget-btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.budget-btn-sheet {
  flex: 1;
  height: 48px;
}

.budget-btn-icon {
  width: 18px;
  height: 18px;
}
</style>
