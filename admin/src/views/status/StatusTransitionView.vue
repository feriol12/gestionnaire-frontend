<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import SelectField from '@admin/components/SelectField.vue'
import TextField from '@admin/components/TextField.vue'
import UsersState from '@admin/components/users/UsersState.vue'
import StatusTarget from '@admin/components/status/StatusTarget.vue'
import { listContext } from '@admin/mocks/users.js'
import {
  readStatusTarget,
  simulateTransition,
  transitionErrors,
  transitionScenarios,
  validateTransition,
} from '@admin/mocks/status-transitions.js'
import '@admin/styles/users.css'
import '@admin/styles/status-transitions.css'

const route = useRoute()
const phase = ref('loading')
const scenario = ref('success')
const user = ref(null)
const reason = ref('')
const email = ref('')
const errors = ref({})
const result = ref(null)
const notice = ref('')
const form = ref(null)
const outcome = ref(null)
let timer
let revision = 0
const action = computed(() => (route.name === 'status-suspend' ? 'suspend' : 'reactivate'))
const operation = computed(() => (action.value === 'suspend' ? 'suspension' : 'réactivation'))
const available = computed(
  () => user.value?.email && ['active', 'suspended'].includes(user.value.administrative_status),
)
const back = computed(() => ({ name: 'users', query: listContext(route.query) }))
const message = computed(() => transitionErrors[result.value?.error] ?? '')

function clearPending() {
  clearTimeout(timer)
  revision++
}
function clearInputs() {
  reason.value = ''
  email.value = ''
  errors.value = {}
}
function initialize() {
  clearPending()
  clearInputs()
  result.value = null
  user.value = null
  notice.value = ''
  phase.value = 'loading'
  const current = revision
  timer = setTimeout(() => {
    if (current !== revision) return
    user.value = readStatusTarget(route.params.id)
    phase.value = user.value ? 'form' : 'missing'
  }, 180)
}
watch(
  () => route.fullPath,
  () => {
    scenario.value = 'success'
    initialize()
  },
  { immediate: true },
)
watch(scenario, initialize)
onBeforeUnmount(() => {
  clearPending()
  clearInputs()
  result.value = null
})

async function review() {
  if (phase.value !== 'form' || !available.value) return
  errors.value = validateTransition(user.value, reason.value, email.value)
  if (Object.values(errors.value).some(Boolean)) {
    notice.value = 'Vérifiez les champs indiqués.'
    await nextTick()
    form.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
  notice.value = ''
  phase.value = 'confirm'
  await nextTick()
  outcome.value?.focus()
}
async function resume(cancelled = false) {
  clearPending()
  clearInputs()
  result.value = null
  phase.value = 'form'
  notice.value = cancelled
    ? 'Simulation annulée. Les saisies ont été effacées.'
    : 'Reprenez la saisie puis confirmez à nouveau. Aucun effet réel.'
  await nextTick()
  form.value?.querySelector('input')?.focus()
}
function confirm() {
  if (phase.value !== 'confirm') return
  // Verrou synchrone : même deux événements dans le même tour ne relancent rien.
  phase.value = 'pending'
  const current = ++revision
  clearInputs()
  if (scenario.value === 'loading') return
  timer = setTimeout(async () => {
    if (current !== revision) return
    result.value = simulateTransition(user.value, action.value, scenario.value)
    phase.value = result.value.error ? 'error' : 'success'
    await nextTick()
    if (current === revision) outcome.value?.focus()
  }, 600)
}
</script>

<template>
  <div class="fe-status-page" :data-transition-state="phase">
    <InlineAlert tone="info" title="FE-05 · Simulation uniquement">
      Aucune opération réelle : aucun compte modifié, aucun email envoyé. Saisissez uniquement des
      exemples fictifs. Les saisies et résultats disparaissent à la sortie.
    </InlineAlert>
    <div class="fe-status-actions">
      <AdminButton :to="{ name: 'status-demo' }" variant="secondary"
        >Choisir une cible fictive</AdminButton
      >
      <AdminButton :to="back" variant="secondary">Retour aux utilisateurs</AdminButton>
    </div>
    <SelectField
      v-model="scenario"
      label="Scénario FE-05"
      :options="transitionScenarios"
      hint="Changer de scénario efface les saisies et annule la simulation en cours."
    />
    <p role="status" aria-live="polite" aria-atomic="true" class="fe-status-notice">{{ notice }}</p>
    <BaseCard
      :title="'Simulation de ' + operation"
      description="Contexte administratif fictif · Aucun effet sur FE-04"
    >
      <div :aria-busy="phase === 'loading' || phase === 'pending'">
        <UsersState v-if="phase === 'loading'" state="loading" />
        <UsersState v-else-if="phase === 'missing'" state="not-found" />
        <template v-else>
          <StatusTarget :user="user" />
          <InlineAlert v-if="!available" tone="warning" title="Confirmation indisponible">
            L’email exact et un statut administratif connu sont nécessaires. Les champs absents ne
            sont pas déduits.
          </InlineAlert>
          <form
            v-if="phase === 'form' && available"
            ref="form"
            class="fe-status-form"
            novalidate
            @submit.prevent="review"
          >
            <TextField
              v-model="reason"
              label="Motif (obligatoire)"
              :error="errors.reason"
              hint="Exemple fictif uniquement. Aucune conservation du motif."
            />
            <TextField
              v-model="email"
              label="Confirmer l’adresse email exacte (obligatoire)"
              :error="errors.email"
              :hint="'Recopiez exactement : ' + user.email"
            />
            <div class="fe-status-actions">
              <AdminButton type="submit" :variant="action === 'suspend' ? 'danger' : 'primary'"
                >Vérifier la simulation</AdminButton
              >
              <AdminButton variant="secondary" @click="resume(true)">Annuler la saisie</AdminButton>
            </div>
          </form>
          <section
            v-else-if="phase === 'confirm' || phase === 'pending'"
            class="fe-status-result"
            aria-labelledby="fe-status-confirm"
          >
            <h3 id="fe-status-confirm" ref="outcome" tabindex="-1">
              Confirmer la {{ operation }} fictive
            </h3>
            <p>
              Vous ciblez #{{ user.id }} — {{ user.email }}. Cette action simule uniquement le
              résultat à l’écran.
            </p>
            <p v-if="action === 'suspend'">
              La suspension représentée est indéfinie ; aucune suspension réelle n’est appliquée.
            </p>
            <p v-else>
              Aucun ancien accès ne serait rétabli par une réactivation. Ici, aucune session n’est
              modifiée.
            </p>
            <p role="status">
              {{
                phase === 'pending'
                  ? 'Simulation en cours…'
                  : 'Une confirmation explicite est nécessaire.'
              }}
            </p>
            <div class="fe-status-actions">
              <AdminButton
                :loading="phase === 'pending'"
                :variant="action === 'suspend' ? 'danger' : 'primary'"
                @click="confirm"
                >Confirmer la simulation</AdminButton
              >
              <AdminButton variant="secondary" @click="resume(true)"
                >Annuler la simulation</AdminButton
              >
            </div>
          </section>
          <section
            v-else-if="phase === 'success' || phase === 'error'"
            class="fe-status-result"
            aria-labelledby="fe-status-outcome"
          >
            <h3 id="fe-status-outcome" ref="outcome" tabindex="-1">
              {{
                phase === 'success'
                  ? 'Succès simulé'
                  : result.error === 'mfa'
                    ? 'MFA récente requise · Simulation'
                    : 'Erreur ' + result.error + ' simulée'
              }}
            </h3>
            <p v-if="phase === 'success'" role="status">
              Statut résultant simulé : {{ result.administrative_status }}. La fixture initiale
              reste inchangée. Aucun compte modifié ni email envoyé.
            </p>
            <p v-else role="alert">{{ message }}</p>
            <AdminButton variant="secondary" @click="resume()"
              >Reprendre le formulaire fictif</AdminButton
            >
          </section>
        </template>
      </div>
    </BaseCard>
  </div>
</template>
