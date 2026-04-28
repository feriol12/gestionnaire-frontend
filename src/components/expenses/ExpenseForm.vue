<!-- src/components/expenses/ExpenseForm.vue -->
<template>
  <div v-if="open" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-modal w-full max-w-md">
      
      <!-- HEADER -->
      <div class="flex justify-between items-center p-5 border-b border-slate-100">
        <h2 class="text-xl font-semibold text-slate-900">
          {{ isEditing ? 'Modifier la dépense' : 'Nouvelle dépense' }}
        </h2>
        <button 
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 text-2xl leading-none transition"
        >
          &times;
        </button>
      </div>
      
      <!-- FORMULAIRE -->
      <div class="p-5 space-y-4">
        <!-- Description -->
        <div>
          <label class="block text-[13px] font-medium text-slate-500 mb-1">
            Description <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.description"
            type="text"
            placeholder="Ex: Courses Carrefour"
            :class="[
              'w-full h-11 px-4 py-2.5 text-sm rounded-xl border transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500',
              errors.description ? 'border-red-500 bg-red-50' : 'border-slate-200'
            ]"
          />
          <p v-if="errors.description" class="text-xs text-red-500 mt-1">
            {{ errors.description[0] }}
          </p>
        </div>
        
        <!-- Montant -->
        <div>
          <label class="block text-[13px] font-medium text-slate-500 mb-1">
            Montant (€) <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.amount"
            type="number"
            step="0.01"
            placeholder="0,00"
            :class="[
              'w-full h-11 px-4 py-2.5 text-sm rounded-xl border transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500',
              errors.amount ? 'border-red-500 bg-red-50' : 'border-slate-200'
            ]"
          />
          <p v-if="errors.amount" class="text-xs text-red-500 mt-1">
            {{ errors.amount[0] }}
          </p>
        </div>
        
        <!-- Catégorie (AppSelect en Tailwind) -->
        <AppSelect
          v-model="form.category"
          label="Catégorie"
          :options="categoryOptions"
          :required="true"
          :error="errors.category ? errors.category[0] : ''"
        />
        
        <!-- Date -->
        <div>
          <label class="block text-[13px] font-medium text-slate-500 mb-1">
            Date <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.date"
            type="date"
            :max="today"
            :class="[
              'w-full h-11 px-4 py-2.5 text-sm rounded-xl border transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500',
              errors.date ? 'border-red-500 bg-red-50' : 'border-slate-200'
            ]"
          />
          <p v-if="errors.date" class="text-xs text-red-500 mt-1">
            {{ errors.date[0] }}
          </p>
          <p class="text-xs text-slate-400 mt-1">
            Seulement le mois en cours ({{ currentMonth }})
          </p>
        </div>
      </div>
      
      <!-- ACTIONS -->
      <div class="flex justify-end gap-3 p-5 border-t border-slate-100">
        <button 
          @click="$emit('close')"
          class="px-5 py-2.5 rounded-xl text-sm font-medium transition bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Annuler
        </button>
        <button 
          @click="submit"
          :disabled="loading"
          class="px-5 py-2.5 rounded-xl text-sm font-medium transition bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Enregistrer') }}
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AppSelect from '@/components/common/AppSelect.vue';
import { useExpenseStore } from '@/stores/useExpenseStore';

const props = defineProps({
  open: { type: Boolean, default: false },
  expense: { type: Object, default: null }
});

const emit = defineEmits(['close', 'saved']);
const expenseStore = useExpenseStore();

const form = ref({
  description: '',
  amount: '',
  category: 'Nourriture',
  date: ''
});
const errors = ref({});
const loading = ref(false);

const categoryOptions = [
  { value: 'Nourriture', label: '🍔 Nourriture' },
  { value: 'Transport', label: '🚕 Transport' },
  { value: 'Factures', label: '💡 Factures' },
  { value: 'Loisirs', label: '🎮 Loisirs' },
  { value: 'Imprévu', label: '⚠️ Imprévu' }
];

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
    resetForm();
    if (props.expense) {
      fillFormWithExpense();
    } else {
      form.value.date = today.value;
    }
  }
});

const resetForm = () => {
  form.value = { description: '', amount: '', category: 'Nourriture', date: '' };
  errors.value = {};
};

const fillFormWithExpense = () => {
  if (props.expense) {
    form.value = {
      description: props.expense.description || '',
      amount: props.expense.amount || '',
      category: props.expense.category || 'Nourriture',
      date: props.expense.date || today.value
    };
  }
};

const submit = async () => {
  loading.value = true;
  errors.value = {};
  
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