<template>
  <div class="form-group">
    <label v-if="label && labelPosition === 'top'" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="required-star">*</span>
    </label>
    
    <div v-if="label && labelPosition === 'left'" class="label-left">
      <label :for="id" class="form-label">
        {{ label }}
        <span v-if="required" class="required-star">*</span>
      </label>
    </div>
    
   <input
  :id="id"
  :type="type"
  :value="modelValue"
  @input="$emit('update:modelValue', $event.target.value)"
  @blur="
    $emit('blur');
    isFocused = false;
  "
  :placeholder="placeholder"
  :required="required"
  :disabled="disabled"
  :class="['form-input', { 'is-focused': isFocused, 'is-invalid': error }]"
  @focus="isFocused = true"
/>
    
    <!-- Checkbox special case -->
    <div v-if="type === 'checkbox' && label" class="checkbox-label">
      <label :for="id" class="form-label-checkbox">
        {{ label }}
      </label>
    </div>
    
    <div v-if="error" class="form-error">
      {{ error }}
    </div>
    
    <div v-if="hint" class="form-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  labelPosition: {
    type: String,
    default: 'top', // 'top' ou 'left' (pour checkbox)
    validator: (value) => ['top', 'left'].includes(value)
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`
  }
});

const emit = defineEmits(['update:modelValue', 'blur']);
const isFocused = ref(false);
</script>

<style scoped>
.form-group {
  margin-bottom: 1.25rem;
}

/* Label au-dessus du champ */
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

/* Label à gauche (pour checkbox) */
.label-left {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

/* Champ input */
.form-input {
  width: 100%;
  height: 44px; /* Hauteur conforme à la charte */
  padding: 0 0.75rem;
  border: 1px solid #E2E8F0; /* Bordure conforme */
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background-color: white;
  color: #1e293b;
}

.form-input::placeholder {
  color: #cbd5e1; /* Gris clair pour placeholder */
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #E2E8F0;
  box-shadow: 0 0 0 2px #93c5fd; /* ring-2 ring-blue-300 */
  ring: 2px solid #93c5fd;
}

.form-input.is-invalid {
  border-color: #ef4444;
}

.form-input.is-invalid:focus {
  box-shadow: 0 0 0 2px #fecaca;
}

.form-input:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  color: #94a3b8;
}

/* Checkbox spécifique */
.checkbox-label {
  margin-top: 0.5rem;
}

.form-label-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
}

/* Messages d'erreur */
.form-error {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #ef4444;
}

/* Hint d'aide */
.form-hint {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #64748b;
}
</style>