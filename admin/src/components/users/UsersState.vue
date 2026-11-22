<script setup>
import { computed } from 'vue'
import StatePanel from '@admin/components/StatePanel.vue'
const props = defineProps({ state: { type: String, required: true } })
const messages = {
  loading: {
    icon: 'loader',
    title: 'Chargement des données fictives…',
    description: 'La consultation sera disponible après le chargement simulé.',
  },
  empty: {
    icon: 'inbox',
    title: 'Aucun utilisateur à afficher',
    description:
      'Aucun résultat sur cette page. Modifiez la recherche ou revenez à la première page.',
  },
  error: {
    icon: 'warning',
    title: 'Impossible de charger les utilisateurs',
    description:
      'Erreur de démonstration. Vous pouvez réessayer ou sélectionner le scénario normal.',
    tone: 'danger',
  },
  forbidden: {
    icon: 'lock',
    title: 'Accès refusé',
    description:
      'État simulé : aucune autorisation réelle n’est évaluée. Les données ne sont pas affichées.',
    tone: 'warning',
  },
  'not-found': {
    icon: 'search',
    title: 'Utilisateur introuvable',
    description: 'Cet identifiant ne correspond à aucun utilisateur du répertoire fictif.',
  },
  invalid: {
    icon: 'warning',
    title: 'Paramètres de consultation invalides',
    description:
      'Recherche : 100 caractères maximum. Page : entier positif. Taille de page : de 1 à 50.',
    tone: 'warning',
  },
}
const message = computed(() => messages[props.state] ?? messages.error)
</script>

<template>
  <div :data-users-state="state">
    <StatePanel v-bind="message" :heading-level="3"><slot /></StatePanel>
  </div>
</template>
