<!-- src/components/common/AppSelect.vue -->
<template>
  <div class="mb-5">
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-[13px] font-medium text-slate-500 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    
    <!-- Select -->
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :required="required"
      :disabled="disabled"
      :class="[
        'w-full h-11 px-4 py-2.5 text-sm rounded-xl border transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500',
        error 
          ? 'border-red-500 bg-red-50' 
          : 'border-slate-200 bg-white hover:border-slate-300',
        disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <option v-if="placeholder" value="" disabled selected class="text-slate-400">
        {{ placeholder }}
      </option>
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    
    <!-- Message d'erreur -->
    <p v-if="error" class="text-xs text-red-500 mt-1">
      {{ error }}
    </p>
    
    <!-- Hint d'aide -->
    <p v-if="hint" class="text-xs text-slate-400 mt-1">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => Array.isArray(value) && value.every(opt => opt.value && opt.label)
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
    default: () => `select-${Math.random().toString(36).substr(2, 9)}`
  }
});

defineEmits(['update:modelValue']);
</script>