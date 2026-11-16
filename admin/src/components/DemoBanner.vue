<script setup>
// Bandeau opérationnel permanent : tout le contenu de l'Admin est fictif.
import AdminIcon from './AdminIcon.vue'
</script>

<template>
  <div class="demo-banner" role="note" aria-label="Avertissement de démonstration">
    <p class="demo-banner__message">
      <AdminIcon name="shield-check" :size="16" />
      <span>Données fictives — Démonstration</span>
    </p>
    <span class="demo-banner__tag">Prototype Admin V1</span>
  </div>
</template>

<style scoped>
.demo-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fm-space-xs) var(--fm-space-md);
  padding: 0.375rem var(--fm-margin-mobile);
  background: var(--fm-banner-bg);
  color: var(--fm-banner-text);
  font: var(--fm-label-md);
}

.demo-banner__message {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-space-sm);
}

.demo-banner__tag {
  padding: 0.125rem 0.5rem;
  border: 1px solid rgba(248, 250, 252, 0.3);
  border-radius: var(--fm-radius-sm);
  background: rgba(248, 250, 252, 0.08);
}

@media (min-width: 1024px) {
  .demo-banner {
    padding-inline: var(--fm-margin);
  }
}
</style>
