<script setup>
// FE-02 — Enrolement TOTP fictif et remise unique des codes de recuperation.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import StatePanel from '@admin/components/StatePanel.vue'
import AuthLayout from '@admin/layouts/AuthLayout.vue'
import DemoQrIllustration from '@admin/components/auth/DemoQrIllustration.vue'
import OtpField from '@admin/components/auth/OtpField.vue'
import { useAuthSimulation } from '@admin/composables/useAuthSimulation.js'
import { DEMO_TOTP } from '@admin/mocks/auth.js'

const router = useRouter()
const auth = useAuthSimulation()

const code = ref('')
const busy = ref(false)
const announcement = ref('')

const error = computed(() => auth.state.lastError)
const codes = computed(() => auth.state.recoveryCodes)
const enrolled = computed(() => auth.state.phase === 'authenticated' && codes.value.length > 0)
// FE02-3 : apres confirmation, un retour sur cet ecran n'affiche plus les
// codes, ni le formulaire d'enrolement deja valide.
const codesDone = computed(() => auth.state.codesConfirmed && auth.state.phase === 'authenticated')

async function submit() {
  busy.value = true
  await new Promise((resolve) => setTimeout(resolve, 120))
  const result = auth.submitTotp(code.value, { enrollment: true })
  busy.value = false
  if (result.ok) {
    code.value = ''
    announcement.value = 'Enrolement confirme. Les codes fictifs ne seront affiches qu’une seule fois.'
  } else {
    announcement.value = result.message
  }
}

async function confirmCodes() {
  auth.confirmCodes()
  announcement.value = 'Conservation des codes confirmee (simulation).'
  await router.push({ name: 'dashboard' })
}

async function logout() {
  auth.logout()
  await router.push({ name: 'auth-login' })
}
</script>

<template>
  <AuthLayout
    title="Enrolement MFA"
    subtitle="Secret fictif, illustration non scannable et confirmation par un code de demonstration."
    step="Etape 2 sur 3 — enrolement du facteur TOTP"
    :show-logout="true"
    @logout="logout"
  >
    <InlineAlert v-if="auth.state.recoveryConsumed" tone="warning" title="Retenue : anciens moyens invalides">
      <p>
        Un code de recuperation a ete utilise. Le precedent facteur TOTP et tous les anciens codes sont desormais
        consideres comme invalides dans cette simulation.
      </p>
    </InlineAlert>

    <template v-if="codesDone">
      <StatePanel icon="shield-check" tone="info" title="Codes deja confirmes (simulation)" :heading-level="2">
        <p>La conservation des codes a deja ete confirmee : ils ne sont plus affiches.</p>
      </StatePanel>
      <AdminButton :to="{ name: 'dashboard' }" variant="secondary">
        Retour au tableau de bord (demonstration)
      </AdminButton>
    </template>

    <template v-else-if="!enrolled">
      <div class="fe02-enroll__visual">
        <DemoQrIllustration />
        <div class="fe02-enroll__secret">
          <p class="fe02-enroll__label">Cle fictive affichee a titre d’illustration</p>
          <code class="fe02-enroll__code">{{ DEMO_TOTP.secretLabel }}</code>
          <p class="fe02-enroll__hint">Cette chaine n’est pas un secret TOTP valide et ne doit pas etre scannee.</p>
        </div>
      </div>

      <form class="fe02-enroll__form" novalidate @submit.prevent="submit">
        <OtpField v-model="code" :error="error?.message ?? ''" />
        <p class="fe02-enroll__timer" role="status">
          Challenge valable {{ auth.challengeSeconds.value }} s (300 s simulees).
        </p>
        <AdminButton type="submit" block :loading="busy">Confirmer l’enrolement</AdminButton>
      </form>
    </template>

    <template v-else>
      <StatePanel icon="shield-check" tone="info" title="Enrolement confirme (simulation)" :heading-level="2">
        <p>Conservez ces codes fictifs : ils ne sont affiches qu’une seule fois.</p>
      </StatePanel>
      <ul class="fe02-enroll__codes">
        <li v-for="item in codes" :key="item"><code>{{ item }}</code></li>
      </ul>
      <AdminButton block @click="confirmCodes">
        Je confirme avoir conserve ces codes (simulation)
      </AdminButton>
    </template>

    <InlineAlert v-if="error && !enrolled" tone="danger" :title="`Erreur ${error.code} — ${error.message}`">
      <p>Aucun appel n’a ete envoye. Le challenge peut avoir expire (300 s simulees).</p>
    </InlineAlert>
    <p class="fm-visually-hidden" role="status">{{ announcement }}</p>
  </AuthLayout>
</template>

<style scoped>
.fe02-enroll__visual {
  display: flex;
  align-items: flex-start;
  gap: var(--fm-space-md);
  flex-wrap: wrap;
}

.fe02-enroll__label {
  color: var(--fm-heading);
  font: var(--fm-label-md);
}

.fe02-enroll__code {
  display: block;
  padding: var(--fm-space-xs) var(--fm-space-sm);
  border-radius: var(--fm-radius-control);
  background: var(--fm-canvas);
  color: var(--fm-heading);
  font-size: 1rem;
  letter-spacing: 0.12em;
  overflow-wrap: anywhere;
}

.fe02-enroll__hint {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.fe02-enroll__form {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
}

.fe02-enroll__timer {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.fe02-enroll__codes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--fm-space-xs);
  padding: 0;
  margin: 0;
  list-style: none;
}

.fe02-enroll__codes li {
  padding: var(--fm-space-xs) var(--fm-space-sm);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  text-align: center;
}
</style>
