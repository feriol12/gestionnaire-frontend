<script setup>
import StatusBadge from '@admin/components/StatusBadge.vue'
import { displayDate } from '@admin/mocks/users.js'
defineProps({ user: { type: Object, required: true } })
</script>

<template>
  <dl class="fe-users-details">
    <div>
      <dt>Identifiant utilisateur</dt>
      <dd>#{{ user.id }}</dd>
    </div>
    <div>
      <dt>Nom</dt>
      <dd>{{ user.nom || 'Non renseigné' }}</dd>
    </div>
    <div>
      <dt>Adresse email</dt>
      <dd>{{ user.email || 'Non renseignée' }}</dd>
    </div>
    <div>
      <dt>Date de création (UTC)</dt>
      <dd>{{ displayDate(user.created_at) }}</dd>
    </div>
    <div>
      <dt>Statut administratif simulé</dt>
      <dd>
        <StatusBadge tone="neutral">{{
          user.administrative_status || 'Non renseigné'
        }}</StatusBadge>
      </dd>
    </div>
  </dl>
</template>
