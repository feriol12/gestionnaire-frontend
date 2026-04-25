<template>
  <div :class="['rounded-2xl shadow-card', cardClass]" :style="cardStyle">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-100">
      <slot name="header" />
    </div>
    
    <div class="px-6 py-4">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Classes Tailwind supplémentaires
  cardClass: {
    type: String,
    default: ''
  },
  // Padding personnalisé
  padding: {
    type: Boolean,
    default: true
  },
  // Variantes de couleurs
  variant: {
    type: String,
    default: 'white',
    validator: (value) => ['white', 'gray', 'transparent'].includes(value)
  },
  // Avec hover effect
  hoverable: {
    type: Boolean,
    default: false
  }
})

const cardStyle = computed(() => {
  const styles = {}
  
  // Variantes de fond
  if (props.variant === 'white') {
    styles.backgroundColor = 'white'
  } else if (props.variant === 'gray') {
    styles.backgroundColor = '#f9fafb'
  }
  
  return styles
})
</script>

<style scoped>
/* Tailwind s'occupe de tout via les classes */
.shadow-card {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
}
</style>