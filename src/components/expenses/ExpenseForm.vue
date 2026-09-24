<!-- src/components/expenses/ExpenseForm.vue -->
<!--
  One form instance, two shells (MONEVA V2, Phase 5): AppModal at >=768px,
  AppBottomSheet below. The shell is chosen once when the form opens and is
  held for the whole open session (LOCKED_OVERLAY_MODE_RULE) — crossing the
  breakpoint while open never switches shell, remounts, or resets fields.
-->
<template>
  <component
    :is="overlayMode === 'sheet' ? AppBottomSheet : AppModal"
    :model-value="open"
    :title="isEditing ? 'Modifier la dépense' : 'Nouvelle dépense'"
    :close-on-escape="false"
    :close-on-backdrop="false"
    v-bind="overlayMode === 'sheet' ? { maxHeight: '82vh' } : {}"
    @close="$emit('close')"
  >
    <div class="expense-form" :data-overlay-mode="overlayMode">
      <!-- Description -->
      <div class="expense-field">
        <label :for="fieldId('description')" class="expense-label">
          Description <span class="expense-required">*</span>
        </label>
        <input
          :id="fieldId('description')"
          v-model="form.description"
          type="text"
          placeholder="Ex: Courses Carrefour"
          class="expense-input"
          :class="{ 'is-invalid': errors.description }"
          :aria-invalid="errors.description ? 'true' : undefined"
          :aria-describedby="errors.description ? fieldId('description-error') : undefined"
        />
        <p v-if="errors.description" :id="fieldId('description-error')" class="expense-error" role="alert">
          {{ errors.description[0] }}
        </p>
      </div>

      <!-- Montant -->
      <div class="expense-field">
        <label :for="fieldId('amount')" class="expense-label">
          Montant (FCFA) <span class="expense-required">*</span>
        </label>
        <div class="expense-amount">
          <input
            :id="fieldId('amount')"
            v-model="form.amount"
            type="number"
            step="0.01"
            placeholder="0,00"
            class="expense-input expense-input-amount"
            :class="{ 'is-invalid': errors.amount }"
            :aria-invalid="errors.amount ? 'true' : undefined"
            :aria-describedby="errors.amount ? fieldId('amount-error') : undefined"
          />
          <span class="expense-amount-suffix" aria-hidden="true">FCFA</span>
        </div>
        <p v-if="errors.amount" :id="fieldId('amount-error')" class="expense-error" role="alert">
          {{ errors.amount[0] }}
        </p>
      </div>

      <!-- Catégorie -->
      <fieldset
        class="expense-field"
        :aria-describedby="errors.category ? fieldId('category-error') : undefined"
      >
        <legend class="expense-label">
          Catégorie <span class="expense-required">*</span>
        </legend>
        <div class="expense-categories">
          <label
            v-for="category in EXPENSE_CATEGORIES"
            :key="category.value"
            class="expense-category"
            :class="{ 'is-selected': form.category === category.value }"
          >
            <input
              v-model="form.category"
              type="radio"
              class="sr-only"
              :name="fieldId('category')"
              :value="category.value"
            />
            <component :is="category.icon" class="expense-category-icon" aria-hidden="true" />
            <span class="expense-category-label">{{ category.label }}</span>
          </label>
        </div>
        <p v-if="errors.category" :id="fieldId('category-error')" class="expense-error" role="alert">
          {{ errors.category[0] }}
        </p>
      </fieldset>

      <!-- Date -->
      <div class="expense-field">
        <label :for="fieldId('date')" class="expense-label">
          Date <span class="expense-required">*</span>
        </label>
        <input
          :id="fieldId('date')"
          v-model="form.date"
          type="date"
          :max="today"
          class="expense-input"
          :class="{ 'is-invalid': errors.date }"
          :aria-invalid="errors.date ? 'true' : undefined"
          :aria-describedby="[errors.date ? fieldId('date-error') : '', fieldId('date-hint')].join(' ').trim()"
        />
        <p v-if="errors.date" :id="fieldId('date-error')" class="expense-error" role="alert">
          {{ errors.date[0] }}
        </p>
        <p :id="fieldId('date-hint')" class="expense-hint">
          <Info class="expense-hint-icon" aria-hidden="true" />
          Seulement le mois en cours ({{ currentMonth }})
        </p>
      </div>
    </div>

    <template #actions>
      <button
        type="button"
        class="expense-btn expense-btn-ghost"
        :class="{ 'expense-btn-sheet-cancel': overlayMode === 'sheet' }"
        @click="$emit('close')"
      >
        Annuler
      </button>
      <button
        type="button"
        class="expense-btn expense-btn-primary"
        :class="{ 'expense-btn-sheet-submit': overlayMode === 'sheet' }"
        :disabled="loading"
        @click="submit"
      >
        <Check v-if="!loading" class="expense-btn-icon" aria-hidden="true" />
        {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Enregistrer') }}
      </button>
    </template>
  </component>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Check, Info } from 'lucide-vue-next';
import AppModal from '@/components/common/AppModal.vue';
import AppBottomSheet from '@/components/common/AppBottomSheet.vue';
import { EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORY } from '@/constants/expenseCategories';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { useToast } from '@/composables/useToast';


// ========== TOAST ==========
const toast = useToast();  // ← AJOUTE CETTE LIGNE

const props = defineProps({
  open: { type: Boolean, default: false },
  expense: { type: Object, default: null }
});

const emit = defineEmits(['close', 'saved']);
const expenseStore = useExpenseStore();

const form = ref({
  description: '',
  amount: '',
  category: DEFAULT_EXPENSE_CATEGORY,
  date: ''
});
const errors = ref({});
const loading = ref(false);

// ========== OVERLAY MODE (verrouillé pendant toute la session ouverte) ==========
// Same 768px boundary as AppTable's page size and the app shell.
const detectOverlayMode = () =>
  window.matchMedia('(min-width: 768px)').matches ? 'modal' : 'sheet';
const overlayMode = ref(detectOverlayMode());

const uid = Math.random().toString(36).slice(2, 9);
const fieldId = (name) => `expense-${uid}-${name}`;

const isEditing = computed(() => !!props.expense);

const today = computed(() => {
  const date = new Date();
  return date.toISOString().split('T')[0];
});

const currentMonth = computed(() => {
  const date = new Date();
  return date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
});

watch(() => props.open, (newOpen) => {
  if (newOpen) {
    overlayMode.value = detectOverlayMode();
    resetForm();
    if (props.expense) {
      fillFormWithExpense();
    } else {
      form.value.date = today.value;
    }
  }
});

const resetForm = () => {
  form.value = { description: '', amount: '', category: DEFAULT_EXPENSE_CATEGORY, date: '' };
  errors.value = {};
};

const fillFormWithExpense = () => {
  if (props.expense) {
    form.value = {
      description: props.expense.description || '',
      amount: props.expense.amount || '',
      category: props.expense.category || DEFAULT_EXPENSE_CATEGORY,
      date: props.expense.date || today.value
    };
  }
};

const submit = async () => {
  loading.value = true;
  errors.value = {};

    // ✅ Validation du montant avant envoi
  const amount = parseFloat(form.value.amount);
  if (isNaN(amount) || amount <= 0) {
    toast.error('Le montant doit être un nombre positif', { modal: true });
    loading.value = false;
    return;
  }

  if (amount > 99999999.99) {
    toast.error('Le montant ne peut pas dépasser 99 999 999,99 FCFA', { modal: true });
    loading.value = false;
    return;
  }

  const result = isEditing.value
    ? await expenseStore.updateExpense(props.expense.id, form.value)
    : await expenseStore.addExpense(form.value);

  if (result.success) {
    emit('saved');
    emit('close');
  } else if (result.errors) {
    errors.value = result.errors;
  }

  loading.value = false;
};
</script>

<style scoped>
.expense-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.expense-field {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.expense-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  padding: 0;
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
  font-weight: var(--text-label-lg--font-weight);
  color: var(--color-ink);
}

.expense-required {
  color: var(--color-expense);
}

.expense-input {
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

.expense-input::placeholder {
  color: var(--color-text-muted-light);
}

.expense-input:focus {
  outline: none;
  background-color: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.expense-input.is-invalid {
  background-color: var(--color-expense-bg);
  border-color: var(--color-expense);
}

.expense-input.is-invalid:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-expense) 15%, transparent);
}

.expense-amount {
  position: relative;
}

.expense-input-amount {
  padding-right: 72px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.expense-amount-suffix {
  position: absolute;
  top: 50%;
  right: var(--spacing-sm);
  transform: translateY(-50%);
  padding: 2px var(--spacing-sm);
  font-size: var(--text-label-md);
  line-height: var(--text-label-md--line-height);
  font-weight: var(--text-label-md--font-weight);
  color: var(--color-text-muted);
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
  border-radius: var(--radius-moneva);
  pointer-events: none;
}

.expense-categories {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--spacing-sm);
}

.expense-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  min-height: 68px;
  padding: var(--spacing-sm) var(--spacing-xs);
  font-size: var(--text-label-sm);
  line-height: var(--text-label-sm--line-height);
  font-weight: var(--text-label-sm--font-weight);
  color: var(--color-text-muted);
  background-color: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
  border: 1px solid transparent;
  border-radius: var(--radius-moneva-md);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.expense-category:hover {
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.expense-category.is-selected {
  color: #ffffff;
  background-color: var(--color-primary);
}

.expense-category:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.expense-category-icon {
  width: 20px;
  height: 20px;
}

.expense-category-label {
  text-align: center;
  overflow-wrap: anywhere;
}

/* Mobile sheet: wrapping chips, icon beside label (Stitch sheet). */
.expense-form[data-overlay-mode='sheet'] .expense-categories {
  display: flex;
  flex-wrap: wrap;
}

.expense-form[data-overlay-mode='sheet'] .expense-category {
  flex: 1 1 auto;
  flex-direction: row;
  justify-content: flex-start;
  gap: 6px;
  min-height: 44px;
  padding: 0 12px;
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
}

.expense-form[data-overlay-mode='sheet'] .expense-category-label {
  text-align: left;
  white-space: nowrap;
}

.expense-error {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-expense);
}

.expense-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-text-muted-light);
}

.expense-hint-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

.expense-btn {
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

.expense-btn-ghost {
  color: var(--color-ink);
  background-color: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
}

.expense-btn-ghost:hover {
  background-color: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
}

.expense-btn-primary {
  color: #ffffff;
  background-color: var(--color-primary);
  box-shadow: var(--shadow-medium);
}

.expense-btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.expense-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.expense-btn-sheet-cancel {
  flex: 1;
}

.expense-btn-sheet-submit {
  flex: 2;
}

.expense-btn-icon {
  width: 18px;
  height: 18px;
}
</style>
