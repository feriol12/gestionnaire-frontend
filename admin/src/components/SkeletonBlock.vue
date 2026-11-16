<script setup>
// Bloc squelette décoratif ; l'état « chargement » est annoncé par le conteneur.
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
  radius: { type: String, default: 'var(--fm-radius-sm)' },
})
</script>

<template>
  <span
    class="skeleton-block"
    aria-hidden="true"
    :style="{ width, height, borderRadius: radius }"
  />
</template>

<style scoped>
.skeleton-block {
  display: block;
  max-width: 100%;
  background: linear-gradient(90deg, #eef2f7 0%, #e2e8f0 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}
</style>
