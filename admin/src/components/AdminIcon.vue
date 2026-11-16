<script setup>
// Icônes Lucide en SVG inline (pas de police d'icônes), décoratives par défaut.
// Nom inconnu : avertissement Vue en développement (validateur), puis icône
// générique de repli en production pour ne jamais casser le rendu.
import { computed } from 'vue'
import { FALLBACK_ICON, adminIcons, isAdminIcon } from './icon-registry.js'

const props = defineProps({
  name: { type: String, required: true, validator: isAdminIcon },
  size: { type: Number, default: 20 },
})

const component = computed(() => adminIcons[props.name] ?? FALLBACK_ICON)
</script>

<template>
  <component
    :is="component"
    :size="size"
    :stroke-width="1.75"
    aria-hidden="true"
    focusable="false"
    class="admin-icon"
  />
</template>

<style scoped>
.admin-icon {
  flex: none;
}
</style>
