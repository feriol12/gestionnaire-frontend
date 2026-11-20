<script setup>
// FE-02 — Challenge TOTP : validation simulee, invalide, expire, limitee.
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import AuthLayout from '@admin/layouts/AuthLayout.vue'
import OtpField from '@admin/components/auth/OtpField.vue'
import { useAuthSimulation } from '@admin/composables/useAuthSimulation.js'
import { MAX_IDENTITY_ATTEMPTS } from '@admin/mocks/auth.js'

const router = useRouter()
const auth = useAuthSimulation()

const code = ref('')
const busy = ref(false)
const announcement = ref('')

const error = computed(() => auth.state.lastError)
const expired = computed(() => auth.isExpired())

async function submit() {
  busy.value = true
  await new Promise((resolve) => setTimeout(resolve, 120))
  const result = auth.submitTotp(code.value)
  busy.value = false
  if (result.ok) {
    code.value = ''
    announcement.value = 'Facteur TOTP accepte (simulation).'
    await router.push({ name: 'auth-reauth' })
  } else {
    announcement.value = result.message
  }
}

async function logout() {
  auth.logout()
  await router.push({ name: 'auth-login' })
}
</script>

<template>
  <AuthLayout
    title="Vérification TOTP"
    subtitle="Saisie du code TOTP fictif recu lors de l’enrolement."
    step="Etape 3 sur 3 — challenge TOTP"
    :show-logout="true"
    @logout="logout"
  >
    <form class="fe02-challenge__form" novalidate @submit.prevent="submit">
      <OtpField v-model="code" :error="error?.message ?? ''" />
      <p class="fe02-challenge__meta" role="status">
        Challenge valable {{ auth.challengeSeconds.value }} s (300 s simulees) · tentatives
        {{ auth.state.attempts }} / {{ MAX_IDENTITY_ATTEMPTS }}.
      </p>
      <InlineAlert v-if="expired" tone="warning" title="Challenge expire (simulation)">
        <p>Recommencez la connexion : aucun code ne peut etre accepte apres 300 secondes.</p>
        <template #actions>
          <AdminButton variant="secondary" :to="{ name: 'auth-login' }">Retour a la connexion</AdminButton>
        </template>
      </InlineAlert>
      <AdminButton type="submit" block :loading="busy">Valider le code TOTP</AdminButton>
    </form>

    <InlineAlert v-if="error && !expired" tone="danger" :title="`Erreur ${error.code} — ${error.message}`">
      <p>Le nombre de tentatives est limite (5 par identite et 20 par adresse, simulees).</p>
    </InlineAlert>

    <p class="fe02-challenge__recovery">
      <RouterLink :to="{ name: 'auth-mfa-recovery' }">Utiliser un code de recuperation fictif</RouterLink>
    </p>
    <p class="fm-visually-hidden" role="status">{{ announcement }}</p>
  </AuthLayout>
</template>

<style scoped>
.fe02-challenge__form {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
}

.fe02-challenge__meta {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.fe02-challenge__recovery {
  font: var(--fm-body-sm);
}

.fe02-challenge__recovery a {
  color: var(--fm-primary-text);
  font-weight: 600;
}
</style>
