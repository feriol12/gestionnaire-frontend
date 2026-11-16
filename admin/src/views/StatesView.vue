<script setup>
// Galerie des 6 états UI de référence FE-01, tous SIMULÉS et étiquetés.
// Aucun état ne reflète un contrôle d'accès, une session ou un appel réel.
import { nextTick, ref } from 'vue'
import AdminButton from '@admin/components/AdminButton.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import DemoTag from '@admin/components/DemoTag.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import SkeletonBlock from '@admin/components/SkeletonBlock.vue'
import StatePanel from '@admin/components/StatePanel.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'

const announcement = ref('')
const errorVisible = ref(true)
const errorDetails = ref(false)
const restoreButton = ref(null)

function announce(message) {
  announcement.value = ''
  nextTick(() => {
    announcement.value = message
  })
}

async function dismissError() {
  errorVisible.value = false
  announce('Alerte simulée masquée.')
  await nextTick()
  restoreButton.value?.$el?.focus()
}
</script>

<template>
  <div class="states">
    <p class="states__intro">
      Chaque panneau illustre un état d'interface avec des données fictives. Ces rendus sont des
      <strong>simulations</strong> : ils n'appliquent aucun contrôle d'accès, n'ouvrent aucune session et
      n'envoient aucune requête.
    </p>
    <p class="fm-visually-hidden" role="status">{{ announcement }}</p>

    <div class="states__grid">
      <BaseCard title="1. État nominal « Normal »" :heading-level="2" data-state="normal">
        <template #actions><StatusBadge tone="success">Nominal</StatusBadge><DemoTag label="Simulation" /></template>
        <div class="states__stats">
          <div class="states__stat">
            <p class="states__stat-label">Sessions de démonstration</p>
            <p class="states__stat-value">14</p>
            <p class="states__stat-trend">+2 cette semaine (fictif)</p>
          </div>
          <div class="states__stat">
            <p class="states__stat-label">Disponibilité simulée</p>
            <p class="states__stat-value">99,98 %</p>
            <p class="states__stat-trend">Valeur fictive</p>
          </div>
        </div>
        <template #footer>
          <span>Composants : carte, badge, statistique</span>
          <AdminButton :to="{ name: 'dashboard' }" icon-right="arrow-right">Consulter</AdminButton>
        </template>
      </BaseCard>

      <BaseCard title="2. État de chargement « Squelettes »" :heading-level="2" data-state="loading">
        <template #actions><StatusBadge tone="info">Chargement</StatusBadge><DemoTag label="Simulation" /></template>
        <div class="states__loading" aria-busy="true">
          <p class="fm-visually-hidden">Chargement simulé en cours.</p>
          <div class="states__loading-cards">
            <div class="states__loading-card">
              <SkeletonBlock width="50%" />
              <SkeletonBlock width="70%" height="1.75rem" />
            </div>
            <div class="states__loading-card">
              <SkeletonBlock width="40%" />
              <SkeletonBlock width="60%" height="1.75rem" />
            </div>
          </div>
          <SkeletonBlock height="2.5rem" radius="var(--fm-radius-control)" />
        </div>
        <template #footer><span>Squelettes réservant la place du contenu (pas de décalage de mise en page)</span></template>
      </BaseCard>

      <BaseCard title="3. État vide « Aucun résultat »" :heading-level="2" data-state="empty">
        <template #actions><StatusBadge tone="neutral">Zéro résultat</StatusBadge><DemoTag label="Simulation" /></template>
        <StatePanel
          icon="inbox"
          title="Aucun utilisateur trouvé"
          description="Vos filtres ne correspondent à aucun compte du jeu de données de démonstration."
        >
          <AdminButton variant="secondary" icon="retry" @click="announce('Filtres réinitialisés (simulation).')">
            Réinitialiser les filtres
          </AdminButton>
        </StatePanel>
      </BaseCard>

      <BaseCard title="4. État d'erreur « Alerte »" :heading-level="2" data-state="error">
        <template #actions><StatusBadge tone="danger">Erreur</StatusBadge><DemoTag label="Simulation" /></template>
        <InlineAlert
          v-if="errorVisible"
          tone="danger"
          title="Échec de la simulation de chargement des journaux"
          dismissible
          @dismiss="dismissError"
        >
          <p>Erreur simulée (code fictif DEMO-503). Aucune requête n'a été envoyée.</p>
          <p v-if="errorDetails" class="states__details">
            Détail fictif : interruption volontaire du scénario de démonstration. Aucune donnée n'est perdue.
          </p>
          <template #actions>
            <AdminButton variant="danger" icon="retry" @click="announce('Nouvelle tentative simulée : aucune requête envoyée.')">
              Réessayer
            </AdminButton>
            <AdminButton
              variant="secondary"
              :aria-expanded="errorDetails ? 'true' : 'false'"
              @click="errorDetails = !errorDetails"
            >
              {{ errorDetails ? 'Masquer le détail' : 'Consulter le détail' }}
            </AdminButton>
          </template>
        </InlineAlert>
        <AdminButton v-else ref="restoreButton" variant="secondary" @click="errorVisible = true">
          Réafficher l'alerte simulée
        </AdminButton>
      </BaseCard>

      <BaseCard title="5. Accès refusé « 403 »" :heading-level="2" data-state="forbidden">
        <template #actions><StatusBadge tone="danger">Accès refusé</StatusBadge><DemoTag label="Simulation" /></template>
        <StatePanel
          icon="shield-alert"
          tone="danger"
          title="Autorisation requise"
          description="Rendu illustratif : ce prototype n'applique aucun contrôle d'accès. Les autorisations réelles relèvent exclusivement du serveur."
        >
          <AdminButton :to="{ name: 'dashboard' }" variant="secondary" icon="arrow-left">
            Retour au tableau de bord
          </AdminButton>
        </StatePanel>
      </BaseCard>

      <BaseCard title="6. Session expirée « Inactivité »" :heading-level="2" data-state="expired">
        <template #actions><StatusBadge tone="warning">Expirée</StatusBadge><DemoTag label="Simulation" /></template>
        <StatePanel
          icon="clock"
          tone="info"
          title="Session suspendue"
          description="Rendu illustratif d'une inactivité de 15 minutes. Aucune session réelle n'existe dans ce prototype."
        >
          <AdminButton :to="{ name: 'auth-login' }" icon="login">Se reconnecter</AdminButton>
        </StatePanel>
        <template #footer><span>« Se reconnecter » mène à l'emplacement réservé FE-02 (sans formulaire)</span></template>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.states {
  display: flex;
  flex-direction: column;
  gap: var(--fm-gutter);
}

.states__intro {
  max-width: 60rem;
  color: var(--fm-text);
}

.states__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
  gap: var(--fm-gutter);
}

.states__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--fm-space-md);
}

.states__stat {
  padding: var(--fm-space-md);
  border-radius: var(--fm-radius-control);
  background: var(--fm-canvas);
}

.states__stat-label {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.states__stat-value {
  color: var(--fm-heading);
  font: var(--fm-headline-lg);
}

.states__stat-trend {
  color: var(--fm-success-text);
  font: var(--fm-body-sm);
  font-weight: 600;
}

.states__loading {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
}

.states__loading-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--fm-space-md);
}

.states__loading-card {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-sm);
  padding: var(--fm-space-md);
  border-radius: var(--fm-radius-control);
  background: var(--fm-canvas);
}

.states__details {
  margin-top: var(--fm-space-xs);
  font: var(--fm-body-sm);
}
</style>
