<script setup>
// FE-02 — Connexion Super Admin (simulation locale sur mocks fictifs).
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import DemoTag from '@admin/components/DemoTag.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import TextField from '@admin/components/TextField.vue'
import AuthLayout from '@admin/layouts/AuthLayout.vue'
import PasswordField from '@admin/components/auth/PasswordField.vue'
import { useAuthSimulation } from '@admin/composables/useAuthSimulation.js'
import { DEMO_ADMIN } from '@admin/mocks/auth.js'

const router = useRouter()
const auth = useAuthSimulation()

const email = ref('')
const password = ref('')
const busy = ref(false)
const announcement = ref('')

const error = computed(() => auth.state.lastError)
const emailError = computed(() => (error.value?.code === '422' && !email.value ? error.value.message : ''))
const passwordError = computed(() => (error.value?.code === '422' && email.value ? error.value.message : ''))

async function submit() {
  busy.value = true
  announcement.value = 'Verification simulee en cours.'
  await new Promise((resolve) => setTimeout(resolve, 120))
  const result = auth.login(email.value, password.value)
  busy.value = false
  if (!result.ok) {
    announcement.value = result.message
    return
  }
  password.value = ''
  announcement.value = 'Mot de passe accepte. Etape suivante : facteur MFA.'
  if (auth.state.phase === 'pending_enrollment') await router.push({ name: 'auth-mfa-enrollment' })
  else await router.push({ name: 'auth-mfa-verify' })
}
</script>

<template>
  <AuthLayout
    title="Connexion Super Admin"
    subtitle="Parcours fictif — aucune identite reelle n'est utilisee."
    step="Etape 1 sur 3 — identifiant et mot de passe"
  >
    <DemoTag label="Simulation FE-02" />

    <p v-if="auth.state.notice" class="fe02-login__notice" role="status">{{ auth.state.notice }}</p>

    <form class="fe02-login__form" novalidate @submit.prevent="submit">
      <TextField
        v-model="email"
        label="Adresse e-mail administrative"
        type="email"
        autocomplete="username"
        :placeholder="DEMO_ADMIN.email"
        :hint="`Compte fictif : ${DEMO_ADMIN.email}`"
        :error="emailError"
      />
      <PasswordField
        v-model="password"
        label="Mot de passe"
        hint="Utilisez le mot de passe fictif documente dans les mocks FE-02."
        :error="passwordError"
      />
      <InlineAlert v-if="error && error.code !== '422'" tone="danger" :title="`Erreur ${error.code} — ${error.message}`">
        <p>Aucun appel n’a ete envoye. Modifiez le scenario simule ou recommencez.</p>
      </InlineAlert>
      <AdminButton type="submit" block :loading="busy">Continuer</AdminButton>
    </form>

    <p class="fe02-login__recovery">
      Code TOTP perdu ?
      <RouterLink :to="{ name: 'auth-mfa-recovery' }">Utiliser un code de recuperation fictif</RouterLink>
    </p>
    <p class="fe02-login__no-bypass">
      Aucune recuperation par e-mail n’est prevue : la procedure exceptionnelle est hors application et n’est pas simulee.
    </p>
    <p class="fm-visually-hidden" role="status">{{ announcement }}</p>
  </AuthLayout>
</template>

<style scoped>
.fe02-login__form {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
}

.fe02-login__notice {
  padding: var(--fm-space-sm) var(--fm-space-md);
  border-radius: var(--fm-radius-control);
  background: var(--fm-primary-soft);
  color: var(--fm-primary-text);
  font: var(--fm-body-sm);
}

.fe02-login__recovery {
  font: var(--fm-body-sm);
}

.fe02-login__recovery a {
  color: var(--fm-primary-text);
  font-weight: 600;
}

.fe02-login__no-bypass {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}
</style>
