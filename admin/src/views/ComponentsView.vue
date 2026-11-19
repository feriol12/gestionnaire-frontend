<script setup>
// Catalogue des composants génériques FE-01 (réutilisables par FE-02 et suivants).
import { onBeforeUnmount, ref } from 'vue'
import AdminButton from '@admin/components/AdminButton.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import CheckboxField from '@admin/components/CheckboxField.vue'
import DemoTag from '@admin/components/DemoTag.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import KpiCard from '@admin/components/KpiCard.vue'
import SelectField from '@admin/components/SelectField.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'
import TextField from '@admin/components/TextField.vue'

const search = ref('')
const scope = ref('all')
const hideInactive = ref(true)
const invalidValue = ref('compte-inconnu')
const loadingDemo = ref(false)

const scopeOptions = [
  { value: 'all', label: "Tous les niveaux d'autorisation" },
  { value: 'active', label: 'Comptes actifs' },
  { value: 'review', label: 'Comptes à examiner' },
]

let timer = null

function toggleLoading() {
  loadingDemo.value = true
  timer = setTimeout(() => {
    loadingDemo.value = false
  }, 1200)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="catalog">
    <p class="catalog__intro">
      Composants Vue 3 (JavaScript, Composition API) stylés par variables CSS <code>--fm-*</code> et styles scoped.
      Tous les contenus affichés sont fictifs.
    </p>

    <div class="catalog__grid">
      <BaseCard title="Boutons — AdminButton" description="Variantes primary, secondary, danger et ghost ; états désactivé et chargement.">
        <div class="catalog__row">
          <AdminButton>Valider</AdminButton>
          <AdminButton variant="secondary">Exporter</AdminButton>
          <AdminButton variant="danger">Suspendre</AdminButton>
          <AdminButton variant="ghost" icon="settings">Paramètres</AdminButton>
        </div>
        <div class="catalog__row">
          <AdminButton disabled>Désactivé</AdminButton>
          <AdminButton :loading="loadingDemo" @click="toggleLoading">
            {{ loadingDemo ? 'Chargement simulé…' : 'Tester le chargement' }}
          </AdminButton>
        </div>
        <div class="catalog__row">
          <AdminButton to="/etats" variant="secondary">Voir les états</AdminButton>
          <AdminButton to="/etats" disabled>Lien désactivé</AdminButton>
          <AdminButton to="/etats" loading>Lien en chargement</AdminButton>
        </div>
        <template #footer><span>Hauteur 40px, rayon 8px, focus visible (contour + halo)</span></template>
      </BaseCard>

      <BaseCard title="Badges de statut — StatusBadge" description="La couleur double toujours un libellé texte.">
        <ul class="catalog__list">
          <li><span>Succès / opérationnel</span><StatusBadge tone="success">Actif</StatusBadge></li>
          <li><span>Avertissement / examen</span><StatusBadge tone="warning">À réviser</StatusBadge></li>
          <li><span>Critique / révocation</span><StatusBadge tone="danger">Suspendu</StatusBadge></li>
          <li><span>Information</span><StatusBadge tone="info">Mis à jour</StatusBadge></li>
          <li><span>Neutre / métadonnée</span><StatusBadge tone="neutral">Fictif</StatusBadge></li>
          <li><span>Étiquette de démonstration</span><DemoTag /></li>
        </ul>
      </BaseCard>

      <BaseCard
        class="catalog__wide"
        title="Champs de formulaire et filtres"
        description="Saisie locale uniquement : aucune valeur n'est transmise ni conservée."
      >
        <div class="catalog__fields">
          <TextField
            v-model="search"
            label="Recherche super-administrateur"
            type="search"
            icon="search"
            placeholder="Filtrer par identifiant fictif…"
            hint="Recherche simulée, aucune requête."
          />
          <SelectField v-model="scope" label="Segmentation par périmètre" :options="scopeOptions" />
          <TextField
            v-model="invalidValue"
            label="Champ en erreur (exemple)"
            error="Identifiant introuvable dans le jeu de démonstration."
          />
          <CheckboxField v-model="hideInactive" label="Masquer les simulations inactives" />
        </div>
      </BaseCard>

      <BaseCard title="Carte indicateur — KpiCard" description="Valeur formatée fr-FR, étiquette Démonstration.">
        <KpiCard
          label="Comptes suspendus"
          short-label="Suspendus"
          :value="214"
          icon="suspended"
          tone="warning"
          :trend="{ label: 'À examiner', tone: 'warning' }"
          note="fictif"
        />
      </BaseCard>

      <BaseCard title="Alertes — InlineAlert" description="Information, avertissement et erreur.">
        <div class="catalog__stack">
          <InlineAlert tone="info" title="Information de démonstration">
            <p>Ce prototype n'est relié à aucun service.</p>
          </InlineAlert>
          <InlineAlert tone="warning" title="Vérification requise (fictive)">
            <p>Trois comptes fictifs attendent un examen.</p>
          </InlineAlert>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.catalog {
  display: flex;
  flex-direction: column;
  gap: var(--fm-gutter);
}

.catalog__intro code {
  font-family: var(--fm-font-mono);
  font-size: 0.8125rem;
}

.catalog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
  gap: var(--fm-gutter);
}

.catalog__wide {
  grid-column: 1 / -1;
}

.catalog__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fm-space-sm);
}

.catalog__row + .catalog__row {
  margin-top: var(--fm-space-md);
}

.catalog__list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.catalog__list li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fm-space-sm);
  padding: var(--fm-space-sm) 0;
  border-bottom: 1px solid var(--fm-border-subtle);
}

.catalog__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  align-items: start;
  gap: var(--fm-space-lg);
}

.catalog__stack {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
}
</style>
