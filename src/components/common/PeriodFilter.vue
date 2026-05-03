<!-- src/components/common/PeriodFilter.vue -->
<template>
  <div class="flex gap-2 bg-slate-100 rounded-xl p-1">
    <button
      v-for="option in options"
      :key="option.value"
      @click="$emit('update:period', option.value)"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        period === option.value
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
      ]"
    >
      <span class="mr-1">{{ option.icon }}</span>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
// ========== PROPS ==========
const props = defineProps({
  period: {
    type: String,
    default: 'month',
    validator: (value) => ['today', 'week', 'month', 'year'].includes(value)
  },
  options: {
    type: Array,
    default: () => [
      { value: 'today', label: 'Aujourd\'hui', icon: '📅' },
      { value: 'week', label: 'Cette semaine', icon: '📆' },
      { value: 'month', label: 'Ce mois', icon: '📊' },
      { value: 'year', label: 'Cette année', icon: '📈' }
    ]
  }
});

// ========== EMITS ==========
const emit = defineEmits(['update:period']);
</script>