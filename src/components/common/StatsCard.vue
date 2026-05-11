<template>
  <div class="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100">
    <div class="flex items-center justify-between mb-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="iconBgClass">
        <span class="text-xl">{{ icon }}</span>
      </div>
      <span class="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{{ label }}</span>
    </div>
    <p class="text-2xl font-bold text-slate-800">{{ formattedValue }}</p>
    <p class="text-xs text-slate-400 mt-1">{{ subtitle }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  iconBgClass: {
    type: String,
    default: 'bg-blue-100'
  }
});

const formattedValue = computed(() => {
  if (props.value === undefined || props.value === null) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(props.value) + ' €';
});
</script>