<script setup>
// Avatar à initiales (aucune photo, aucune ressource externe).
defineProps({
  initials: { type: String, required: true },
  size: { type: Number, default: 40 },
})
</script>

<template>
  <span class="admin-avatar" :class="`admin-avatar--${size}`" aria-hidden="true">{{ initials }}</span>
</template>

<style scoped>
.admin-avatar {
  display: inline-grid;
  width: 40px;
  height: 40px;
  flex: none;
  place-items: center;
  border-radius: var(--fm-radius-pill);
  background: var(--fm-primary-hover);
  color: var(--fm-on-primary);
  font: var(--fm-label-md);
  font-size: 0.875rem;
}

.admin-avatar--32 {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}
</style>
