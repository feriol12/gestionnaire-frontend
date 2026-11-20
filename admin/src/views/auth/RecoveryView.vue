<script setup>
// FE-02 — Recuperation par code fictif : usage unique puis ré-enrolement
// obligatoire. Aucune recuperation web apres perte simultanee du TOTP et
// des codes : la procedure exceptionnelle GOV-06 est hors application.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import StatePanel from '@admin/components/StatePanel.vue'
import TextField from '@admin/components/TextField.vue'
import AuthLayout from '@admin/layouts/AuthLayout.vue'
import { useAuthSimulation } from '@admin/composables/useAuthSimulation.js'

const router = useRouter()
const auth = useAuthSimulation()

const code = ref('')
const busy = ref(false)
const announcement = ref('')

const error = computed(() => auth.state.lastError)
const exhausted = computed(() => error.value?.code === '401' && !auth.canRecoverWeb.value)

async function logout() {
  auth.logout()
  await router.push({ name: 'auth-login' })
}

async function submit() {
  busy.value = true
  await new Promise((resolve) => setTimeout(resolve, 120))
  const result = auth.consumeRecoveryCode(code.value)
  busy.value = false
  if (!result.ok) {
    announcement.value = result.message
    return
  }
  code.value = ''
  announcement.value = 'Code consume une seule fois. Enrolement MFA obligatoire.'
  await router.push({ name: 'auth-mfa-enrollment' })
}
</script>

<template>
  <AuthLayout
    title="Recuperation MFA"
    subtitle="Code fictif a usage unique — jamais de session complete avant nouvel enrolement."
    step="Recuperation — reenrolement obligatoire"
    :show-logout="true"
    @logout="logout"
  >
    <StatePanel
      v-if="!auth.canRecoverWeb.value"
      icon="shield-alert"
      tone="danger"
      title="Aucune recuperation web possible"
      :heading-level="2"
    >
      <p>
        Le facteur TOTP et tous les codes de recuperation sont perdus dans cette simulation. Aucun courriel,
        aucun second administrateur et aucun contournement ne sont disponibles. La procedure exceptionnelle
        GOV-06 est hors application et n’est pas simulee ici.
      </p>
      <AdminButton :to="{ name: 'auth-login' }" variant="secondary">Retour a la connexion</AdminButton>
    </StatePanel>

    <template v-else>
      <InlineAlert tone="warning" title="Conséquence du code de recuperation">
        <p>
          Apres validation, le code est consomme, le facteur TOTP precedent et les autres codes sont invalides, et
          un nouvel enrolement est exige.
        </p>
      </InlineAlert>

      <form class="fe02-recovery__form" novalidate @submit.prevent="submit">
        <TextField
          v-model="code"
          label="Code de recuperation fictif"
          placeholder="DEMO-RC-01"
          hint="Exemples fictifs : DEMO-RC-01 a DEMO-RC-10."
          :error="error?.message ?? ''"
        />
        <AdminButton type="submit" block :loading="busy">Valider le code</AdminButton>
      </form>
      <InlineAlert v-if="error && !exhausted" tone="danger" :title="`Erreur ${error.code} — ${error.message}`">
        <p>Aucun appel n’a ete envoye.</p>
      </InlineAlert>
    </template>
    <p class="fm-visually-hidden" role="status">{{ announcement }}</p>
  </AuthLayout>
</template>

<style scoped>
.fe02-recovery__form {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
}
</style>
