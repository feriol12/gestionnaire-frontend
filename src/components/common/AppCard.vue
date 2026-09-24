<template>
  <div :class="['rounded-moneva-lg shadow-card border border-border/80', cardClass]" :style="cardStyle">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-border-soft">
      <slot name="header" />
    </div>

    <div class="px-6 py-4">
      <slot />
    </div>

    <div v-if="$slots.footer" class="px-6 py-4 border-t border-border-soft bg-canvas/60 rounded-b-moneva-lg">
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

  // Variantes de fond (MONEVA V2 surface tokens; 'transparent' variant keeps no inline background)
  if (props.variant === 'white') {
    styles.backgroundColor = 'var(--color-surface)'
  } else if (props.variant === 'gray') {
    styles.backgroundColor = 'var(--color-canvas)'
  }

  return styles
})
</script>

<style scoped>
/* MONEVA V2 elevation token (design doc §7 "Low" shadow) */
.shadow-card {
  box-shadow: var(--shadow-low);
}
</style>