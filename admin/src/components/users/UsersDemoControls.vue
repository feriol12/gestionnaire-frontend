<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SelectField from '@admin/components/SelectField.vue'

const props = defineProps({ detail: { type: Boolean, default: false } })
const route = useRoute()
const router = useRouter()
const options = computed(() => [
  { value: 'normal', label: 'Données de démonstration' },
  { value: 'loading', label: 'Chargement simulé' },
  { value: 'empty', label: props.detail ? 'Utilisateur introuvable' : 'Liste vide' },
  { value: 'error', label: 'Erreur simulée' },
  { value: 'forbidden', label: 'Accès refusé simulé' },
])
const scenario = computed({
  get: () =>
    options.value.some((item) => item.value === route.query.demo) ? route.query.demo : 'normal',
  set: (value) =>
    router.replace({ query: { ...route.query, demo: value === 'normal' ? undefined : value } }),
})
</script>

<template>
  <aside class="fe-users-demo" aria-label="Démonstration du répertoire">
    <p>
      <strong>Répertoire fictif · Lecture seule</strong><br />Les scénarios ci-dessous illustrent
      l’interface, sans connexion à un service ni contrôle d’accès réel.
    </p>
    <SelectField v-model="scenario" label="Scénario de démonstration" :options="options" />
  </aside>
</template>
