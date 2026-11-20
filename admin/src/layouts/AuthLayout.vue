<script setup>
// FE-02 — Layout des ecrans d'authentification, hors shell Admin.
// Fournit le h1 #admin-page-title attendu par le routeur FE-01, le selecteur
// de scenario simule et, si demande, l'action de deconnexion.
// Aucune donnee financiere, aucun lien vers une identite client.
import BrandMark from '@admin/components/BrandMark.vue'
import DemoBanner from '@admin/components/DemoBanner.vue'
import SelectField from '@admin/components/SelectField.vue'
import AdminButton from '@admin/components/AdminButton.vue'
import { useAuthSimulation } from '@admin/composables/useAuthSimulation.js'
import { SCENARIOS } from '@admin/mocks/auth.js'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  step: { type: String, default: '' },
  showLogout: { type: Boolean, default: false },
})

const emit = defineEmits(['logout'])
const auth = useAuthSimulation()
</script>

<template>
  <DemoBanner />
  <main class="fe02-auth-layout">
    <div class="fe02-auth-layout__card">
      <BrandMark />
      <div class="fe02-auth-layout__heading">
        <p v-if="step" class="fe02-auth-layout__step">{{ step }}</p>
        <h1 id="admin-page-title" class="fe02-auth-layout__title" tabindex="-1">{{ title }}</h1>
        <p v-if="subtitle" class="fe02-auth-layout__subtitle">{{ subtitle }}</p>
      </div>

      <SelectField
        v-model="auth.state.scenario"
        class="fe02-auth-layout__scenario"
        label="Scenario simule"
        :options="SCENARIOS"
        hint="Aucun appel reel : ce choix ne fait que selectionner un resultat fictif."
      />

      <slot />

      <div v-if="showLogout" class="fe02-auth-layout__logout">
        <AdminButton variant="secondary" icon="arrow-left" @click="emit('logout')">
          Deconnexion (simulation)
        </AdminButton>
      </div>

      <p class="fe02-auth-layout__notice">
        Parcours FE-02 fictif : aucun secret reel, aucune donnee financiere, aucune session durable.
      </p>
    </div>
  </main>
</template>

<style scoped>
.fe02-auth-layout {
  display: grid;
  min-height: calc(100vh - 40px);
  place-items: center;
  padding: var(--fm-space-xl) var(--fm-margin-mobile);
}

.fe02-auth-layout__card {
  display: flex;
  width: min(100%, 34rem);
  flex-direction: column;
  align-items: stretch;
  gap: var(--fm-space-md);
  padding: var(--fm-space-xl);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-card);
  background: var(--fm-surface);
  box-shadow: var(--fm-shadow-2);
}

.fe02-auth-layout__heading {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-xs);
}

.fe02-auth-layout__step {
  color: var(--fm-primary-text);
  font: var(--fm-label-md);
  font-weight: 700;
}

.fe02-auth-layout__title {
  font: var(--fm-headline-lg);
}

.fe02-auth-layout__subtitle {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.fe02-auth-layout__scenario {
  padding-top: var(--fm-space-xs);
  border-top: 1px solid var(--fm-border-subtle);
}

.fe02-auth-layout__logout {
  padding-top: var(--fm-space-sm);
  border-top: 1px solid var(--fm-border-subtle);
}

.fe02-auth-layout__notice {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

@media (max-width: 479px) {
  .fe02-auth-layout__card {
    padding: var(--fm-space-lg) var(--fm-space-md);
  }
}
</style>
