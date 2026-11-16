<script setup>
import AdminButton from '@admin/components/AdminButton.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import StatePanel from '@admin/components/StatePanel.vue'
</script>

<template>
  <BaseCard>
    <StatePanel
      icon="circle-alert"
      title="Cette page n'existe pas dans le prototype"
      description="Vérifiez l'adresse ou revenez au tableau de bord de démonstration."
      :heading-level="2"
    >
      <AdminButton :to="{ name: 'dashboard' }" variant="secondary" icon="arrow-left">Retour au tableau de bord</AdminButton>
    </StatePanel>
  </BaseCard>
</template>
