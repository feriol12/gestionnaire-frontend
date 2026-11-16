<script setup>
// Emplacement réservé FE-02 (connexion, MFA, récupération, réauthentification).
// Volontairement sans formulaire, sans champ secret et sans session.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import BrandMark from '@admin/components/BrandMark.vue'
import DemoBanner from '@admin/components/DemoBanner.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'

const route = useRoute()
const title = computed(() => route.meta.title ?? 'Authentification')
const mission = computed(() => route.meta.reservedFor ?? 'FE-02')
</script>

<template>
  <DemoBanner />
  <main class="reserved-auth" :data-reserved-for="mission">
    <div class="reserved-auth__card">
      <BrandMark />
      <StatusBadge tone="neutral">Emplacement réservé {{ mission }}</StatusBadge>
      <h1 id="admin-page-title" class="reserved-auth__title" tabindex="-1">{{ title }}</h1>
      <p class="reserved-auth__text">
        Cet écran sera conçu par la mission {{ mission }}, d'abord sur données fictives. Dans FE-01, il ne contient aucun
        formulaire : aucune authentification, aucun code MFA et aucune session ne sont gérés ici.
      </p>
      <AdminButton :to="{ name: 'dashboard' }" variant="secondary" icon="arrow-left">
        Retour au tableau de bord (démonstration)
      </AdminButton>
    </div>
  </main>
</template>

<style scoped>
.reserved-auth {
  display: grid;
  min-height: calc(100vh - 40px);
  place-items: center;
  padding: var(--fm-space-xl) var(--fm-margin-mobile);
}

.reserved-auth__card {
  display: flex;
  width: min(100%, 30rem);
  flex-direction: column;
  align-items: flex-start;
  gap: var(--fm-space-md);
  padding: var(--fm-space-xl);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-card);
  background: var(--fm-surface);
  box-shadow: var(--fm-shadow-2);
}

.reserved-auth__title {
  font: var(--fm-headline-lg);
}

.reserved-auth__text {
  color: var(--fm-text);
}

@media (max-width: 479px) {
  .reserved-auth__card {
    padding: var(--fm-space-lg) var(--fm-space-md);
  }
}
</style>
