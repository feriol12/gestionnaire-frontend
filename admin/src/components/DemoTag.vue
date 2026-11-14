<script setup>
// Étiquette rectangulaire « Démonstration » / « Simulation » : signale qu'un
// contenu est fictif. Volontairement non cliquable et distincte des badges.
defineProps({
  label: { type: String, default: 'Démonstration' },
})
</script>

<template>
  <span class="demo-tag">{{ label }}</span>
</template>

<style scoped>
.demo-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-sm);
  background: var(--fm-neutral-soft);
  color: var(--fm-neutral-text);
  font: var(--fm-label-md);
  white-space: nowrap;
}
</style>
