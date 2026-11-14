<script setup>
import AdminIcon from './AdminIcon.vue'

defineProps({
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <span class="brand-mark" :class="{ 'brand-mark--compact': compact }">
    <span class="brand-mark__logo"><AdminIcon name="shield" :size="compact ? 20 : 22" /></span>
    <span class="brand-mark__text">
      <span class="brand-mark__name">FluxMoneva</span>
      <span class="brand-mark__product">{{ compact ? 'Admin console' : 'Admin V1' }}</span>
    </span>
  </span>
</template>

<style scoped>
.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.brand-mark__logo {
  display: inline-grid;
  width: 40px;
  height: 40px;
  flex: none;
  place-items: center;
  border-radius: var(--fm-radius-control);
  background: var(--fm-primary);
  color: var(--fm-on-primary);
}

.brand-mark--compact .brand-mark__logo {
  width: 36px;
  height: 36px;
}

.brand-mark__text {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.brand-mark__name {
  color: var(--fm-heading);
  font: var(--fm-headline-md);
  letter-spacing: -0.01em;
}

.brand-mark__product {
  color: var(--fm-primary-text);
  font: var(--fm-label-sm);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
