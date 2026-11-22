<script setup>
import AdminButton from '@admin/components/AdminButton.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import StatusTarget from '@admin/components/status/StatusTarget.vue'
import { statusTargets } from '@admin/mocks/status-transitions.js'
import '@admin/styles/users.css'
import '@admin/styles/status-transitions.css'
</script>

<template>
  <div class="fe-status-page">
    <InlineAlert tone="info" title="FE-05 · Simulation uniquement">
      Comptes fictifs, aucun changement de compte, aucun email envoyé. Les résultats sont effacés à
      la sortie.
    </InlineAlert>
    <AdminButton :to="{ name: 'users' }" variant="secondary"
      >Consulter le répertoire fictif FE-04</AdminButton
    >
    <BaseCard v-for="user in statusTargets" :key="user.id" :title="'Cible fictive #' + user.id">
      <StatusTarget :user="user" />
      <div class="fe-status-actions">
        <AdminButton :to="{ name: 'status-suspend', params: { id: user.id } }" variant="danger"
          >Simuler la suspension de #{{ user.id }}</AdminButton
        >
        <AdminButton
          :to="{ name: 'status-reactivate', params: { id: user.id } }"
          variant="secondary"
          >Simuler la réactivation de #{{ user.id }}</AdminButton
        >
      </div>
    </BaseCard>
  </div>
</template>
