<!--
  Skeleton — generic loading placeholder (MONEVA V2, Phase 2).
  Shimmer animation is collapsed to a static tint under
  prefers-reduced-motion by the global rule in main.css.
-->
<template>
  <div
    class="skeleton"
    :class="{ 'skeleton-circle': circle }"
    :style="{ width, height, borderRadius: circle ? '9999px' : radius }"
    role="status"
    aria-label="Chargement…"
  ></div>
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
  radius: { type: String, default: 'var(--radius-moneva-sm)' },
  circle: { type: Boolean, default: false }
});
</script>

<style scoped>
.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--color-border-soft) 25%,
    var(--color-border) 37%,
    var(--color-border-soft) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
