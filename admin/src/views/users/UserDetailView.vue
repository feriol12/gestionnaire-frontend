<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'
import UsersDemoControls from '@admin/components/users/UsersDemoControls.vue'
import UsersState from '@admin/components/users/UsersState.vue'
import { useUsersDemo } from '@admin/composables/useUsersDemo.js'
import { readUser, listContext, displayDate } from '@admin/mocks/users.js'
import '@admin/styles/users.css'

const route = useRoute()
const { result, state, reload } = useUsersDemo(() => readUser(route.params.id), true)
const user = computed(() => result.value?.data)
const providedStatus = computed(() =>
  typeof user.value?.administrative_status === 'string' && user.value.administrative_status.trim()
    ? user.value.administrative_status
    : null,
)
const back = computed(() => ({ name: 'users', query: listContext(route.query) }))
const announcement = computed(
  () =>
    ({
      loading: 'Chargement de la fiche',
      ready: 'Fiche fictive chargée',
      error: 'Erreur de chargement de la fiche',
      forbidden: 'Accès refusé, simulation',
      'not-found': 'Utilisateur introuvable',
    })[state.value],
)
</script>

<template>
  <div class="fe-users-page">
    <div>
      <AdminButton :to="back" variant="secondary" icon="arrow-left"
        >Retour aux utilisateurs</AdminButton
      >
    </div>
    <UsersDemoControls detail />
    <BaseCard title="Informations du compte" description="Fiche fictive · Consultation uniquement">
      <p class="fe-users-announcement" role="status" aria-live="polite" aria-atomic="true">
        {{ announcement }}
      </p>
      <div :aria-busy="state === 'loading' ? 'true' : 'false'">
        <template v-if="state === 'ready'">
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
            <div v-if="providedStatus">
              <dt>Statut administratif</dt>
              <dd>
                <StatusBadge tone="neutral">{{ providedStatus }}</StatusBadge>
              </dd>
            </div>
          </dl>
          <p class="fe-users-note">
            Les champs non renseignés ne sont pas déduits. Cette démonstration ne permet aucune
            modification de compte.
          </p>
        </template>
        <UsersState v-else :state="state">
          <AdminButton v-if="state === 'error'" variant="secondary" @click="reload"
            >Réessayer la simulation</AdminButton
          >
        </UsersState>
      </div>
    </BaseCard>
  </div>
</template>
