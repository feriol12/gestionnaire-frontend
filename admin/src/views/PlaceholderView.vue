<script setup>
// Emplacement réservé d'un module futur : aucune donnée, action ni requête.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import StatePanel from '@admin/components/StatePanel.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'

const route = useRoute()
const placeholder = computed(() => route.meta.placeholder ?? { icon: 'states', module: 'Module futur' })
</script>

<template>
  <BaseCard :title="placeholder.module" :heading-level="2" data-placeholder="true">
    <template #actions><StatusBadge tone="neutral">Emplacement réservé</StatusBadge></template>
    <StatePanel
      :icon="placeholder.icon"
      title="Module non livré dans FE-01"
      description="Cet écran réserve l'emplacement d'une mission ultérieure. Aucune donnée, aucune action et aucun appel ne sont disponibles dans ce prototype."
    >
      <AdminButton :to="{ name: 'dashboard' }" variant="secondary" icon="arrow-left">Retour au tableau de bord</AdminButton>
    </StatePanel>
  </BaseCard>
</template>
