<script setup>
// FE-02 — Reauthentification MFA : mot de passe + nouveau TOTP non rejoue,
// fenetre de fraicheur de 300 secondes representee dans la simulation.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import StatePanel from '@admin/components/StatePanel.vue'
import AuthLayout from '@admin/layouts/AuthLayout.vue'
import OtpField from '@admin/components/auth/OtpField.vue'
import PasswordField from '@admin/components/auth/PasswordField.vue'
import { useAuthSimulation } from '@admin/composables/useAuthSimulation.js'

const router = useRouter()
const auth = useAuthSimulation()

const password = ref('')
const code = ref('')
const busy = ref(false)
const announcement = ref('')

const error = computed(() => auth.state.lastError)
const succeeded = ref(false)
const success = computed(() => succeeded.value)

async function submit() {
  busy.value = true
  await new Promise((resolve) => setTimeout(resolve, 120))
  const result = auth.reauthenticate(password.value, code.value)
  busy.value = false
  if (result.ok) {
    password.value = ''
    code.value = ''
    succeeded.value = true
    announcement.value = 'Reauthentification reussie : fenetre de fraicheur renouvelee (300 s).'
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
    title="Reauthentification MFA"
    subtitle="Une action sensible exige un mot de passe et un nouveau code TOTP."
    step="Etape de securite — fraicheur 300 s"
    :show-logout="true"
    @logout="logout"
  >
    <InlineAlert tone="info" title="Fenetre de fraicheur (simulation)">
      <p>
        Duree representee : 300 secondes apres un MFA complet. Le compte a rebours restant est de
        {{ auth.freshnessSeconds.value }} s dans cette simulation.
      </p>
    </InlineAlert>

    <StatePanel v-if="success" icon="shield-check" tone="info" title="Reauthentification reussie" :heading-level="2">
      <p>La fenetre de fraicheur a ete renouvelee pour 300 secondes simulees.</p>
      <AdminButton :to="{ name: 'dashboard' }" variant="secondary">Retour au tableau de bord (demonstration)</AdminButton>
    </StatePanel>

    <form v-else class="fe02-reauth__form" novalidate @submit.prevent="submit">
      <PasswordField
        v-model="password"
        label="Mot de passe administratif"
        hint="Utilisez le mot de passe fictif documente dans les mocks FE-02."
      />
      <OtpField v-model="code" />
      <AdminButton type="submit" block :loading="busy">Confirmer la reauthentification</AdminButton>
    </form>

    <InlineAlert v-if="error" tone="danger" :title="`Erreur ${error.code} — ${error.message}`">
      <p>Aucun appel n’a ete envoye. Un code deja utilise ne peut pas etre presenté de nouveau.</p>
    </InlineAlert>
    <p class="fm-visually-hidden" role="status">{{ announcement }}</p>
  </AuthLayout>
</template>

<style scoped>
.fe02-reauth__form {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
}
</style>
