<script setup>
// Tableau de bord de démonstration : indicateurs, activité d'audit, graphique
// et informations, uniquement à partir des données fictives de mocks/.
import { onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ActivityChart from '@admin/components/ActivityChart.vue'
import AdminButton from '@admin/components/AdminButton.vue'
import AdminIcon from '@admin/components/AdminIcon.vue'
import AuditActivity from '@admin/components/AuditActivity.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import DemoTag from '@admin/components/DemoTag.vue'
import KpiCard from '@admin/components/KpiCard.vue'
import SkeletonBlock from '@admin/components/SkeletonBlock.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'
import { accessActivity, adminInfo, auditEvents, kpis } from '@admin/mocks/dashboard.js'

const SIMULATED_DELAY_MS = 900

const activityLoading = ref(false)
const activityStatus = ref('')
let timer = null

function replaySimulatedLoad() {
  // Simulation locale : minuterie seulement, aucune requête. Le bouton reste
  // focalisable pendant le chargement (aria-disabled plutôt que disabled).
  if (activityLoading.value) return
  activityLoading.value = true
  activityStatus.value = 'Chargement simulé de l’activité en cours…'
  timer = setTimeout(() => {
    activityLoading.value = false
    activityStatus.value = 'Activité simulée rechargée (mêmes données fictives).'
  }, SIMULATED_DELAY_MS)
}

onBeforeUnmount(() => clearTimeout(timer))

const quickActions = [
  {
    to: { name: 'users' },
    icon: 'search',
    tone: 'info',
    title: 'Rechercher un compte utilisateur',
    description: 'Consulter fiches et profils',
  },
  {
    to: { name: 'users' },
    icon: 'shield',
    tone: 'warning',
    title: 'Gérer les suspensions',
    description: 'Traiter les comptes à vérifier',
  },
]
</script>

<template>
  <div class="dashboard">
    <section class="dashboard__hero" aria-labelledby="dashboard-hero-title">
      <div class="dashboard__hero-text">
        <h2 id="dashboard-hero-title" class="dashboard__hero-title">Aperçu du tableau de bord administrateur</h2>
        <ul class="dashboard__chips" aria-label="Contexte de démonstration">
          <li><StatusBadge tone="success">Environnement de démonstration</StatusBadge></li>
          <li>
            <StatusBadge tone="info" :dot="false">
              <AdminIcon name="shield" :size="14" /> MFA TOTP simulée (Démonstration)
            </StatusBadge>
          </li>
          <li class="dashboard__chip-text">Données fictives — Démonstration</li>
        </ul>
      </div>
      <DemoTag label="Prototype Admin V1" class="dashboard__hero-tag" />
    </section>

    <section class="dashboard__kpis" aria-labelledby="dashboard-kpi-title">
      <div class="dashboard__section-head">
        <h2 id="dashboard-kpi-title" class="dashboard__section-title">Supervision du parc</h2>
        <p class="dashboard__section-note">Données simulées (Démonstration)</p>
      </div>
      <div class="dashboard__kpi-grid">
        <KpiCard
          v-for="kpi in kpis"
          :key="kpi.id"
          :label="kpi.label"
          :short-label="kpi.shortLabel"
          :value="kpi.value"
          :icon="kpi.icon"
          :tone="kpi.tone"
          :trend="kpi.trend"
          :note="kpi.note"
        />
      </div>
    </section>

    <div class="dashboard__grid">
      <div class="dashboard__main">
        <BaseCard
          title="Activité administrative récente"
          description="Historique d'audit des actions sur les comptes utilisateurs."
        >
          <template #actions>
            <DemoTag label="Données fictives — Démonstration" />
            <button
              type="button"
              class="dashboard__icon-button"
              :aria-disabled="activityLoading ? 'true' : 'false'"
              aria-label="Rejouer le chargement simulé"
              @click="replaySimulatedLoad"
            >
              <AdminIcon name="refresh" :size="18" />
            </button>
          </template>

          <div :aria-busy="activityLoading ? 'true' : 'false'">
            <div v-if="activityLoading" class="dashboard__skeleton" data-state="loading">
              <div v-for="n in 4" :key="n" class="dashboard__skeleton-row">
                <SkeletonBlock width="6rem" />
                <SkeletonBlock width="40%" />
                <SkeletonBlock width="25%" />
                <SkeletonBlock width="4.5rem" height="1.5rem" radius="var(--fm-radius-pill)" />
              </div>
            </div>
            <AuditActivity v-else :events="auditEvents" caption="Activité administrative récente (simulée)" />
          </div>
          <p class="fm-visually-hidden" role="status">{{ activityStatus }}</p>

          <template #footer>
            <span>Affichage de {{ auditEvents.length }} événements simulés</span>
            <RouterLink :to="{ name: 'audit' }" class="dashboard__link">
              Voir le journal d'audit complet <AdminIcon name="arrow-right" :size="16" />
            </RouterLink>
          </template>
        </BaseCard>

        <BaseCard
          title="Activité d'accès aux comptes — Simulation fictive (données non réelles)"
          description="Volume de requêtes d'accès réparties sur 24 h."
        >
          <ActivityChart :points="accessActivity" label="Activité d'accès simulée" />
        </BaseCard>
      </div>

      <div class="dashboard__aside">
        <BaseCard title="Informations administratives">
          <template #actions>
            <StatusBadge tone="success">Prototype actif</StatusBadge>
          </template>
          <dl class="dashboard__info">
            <div v-for="item in adminInfo" :key="item.label" class="dashboard__info-row">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
          <AdminButton :to="{ name: 'security' }" variant="ghost" icon="settings" block class="dashboard__info-cta">
            Paramètres de sécurité
          </AdminButton>
        </BaseCard>

        <BaseCard title="Actions d'administration">
          <ul class="dashboard__actions">
            <li v-for="action in quickActions" :key="action.title">
              <RouterLink :to="action.to" class="dashboard__action">
                <span class="dashboard__action-icon" :class="`is-${action.tone}`">
                  <AdminIcon :name="action.icon" :size="20" />
                </span>
                <span class="dashboard__action-text">
                  <span class="dashboard__action-title">{{ action.title }}</span>
                  <span class="dashboard__action-description">{{ action.description }}</span>
                </span>
                <AdminIcon name="chevron-right" :size="18" />
              </RouterLink>
            </li>
          </ul>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--fm-gutter);
}

.dashboard__hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--fm-space-md);
  padding: var(--fm-space-xl);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-card);
  background: var(--fm-surface);
  box-shadow: var(--fm-shadow-1);
}

.dashboard__hero-text {
  display: flex;
  min-width: 0;
  flex: 1 1 24rem;
  flex-direction: column;
  gap: var(--fm-space-md);
}

.dashboard__hero-title {
  font: var(--fm-display-lg);
  letter-spacing: -0.02em;
}

.dashboard__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fm-space-sm) var(--fm-space-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

.dashboard__chip-text {
  color: var(--fm-text-muted);
}

.dashboard__section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--fm-space-xs) var(--fm-space-md);
  margin-bottom: var(--fm-space-md);
}

.dashboard__section-title {
  font: var(--fm-headline-md);
}

.dashboard__section-note {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.dashboard__kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13.5rem, 1fr));
  gap: var(--fm-gutter);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--fm-gutter);
}

.dashboard__main,
.dashboard__aside {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--fm-gutter);
}

.dashboard__icon-button {
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  background: var(--fm-surface);
  color: var(--fm-text);
  cursor: pointer;
}

.dashboard__icon-button:hover {
  background: var(--fm-surface-hover);
}

.dashboard__icon-button[aria-disabled='true'] {
  cursor: progress;
  opacity: 0.6;
}

.dashboard__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
  padding: var(--fm-space-md);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
}

.dashboard__skeleton-row {
  display: grid;
  grid-template-columns: 6rem 1fr 0.8fr 4.5rem;
  align-items: center;
  gap: var(--fm-space-md);
}

.dashboard__link {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-space-xs);
  font-weight: 600;
  text-decoration: none;
}

.dashboard__link:hover {
  text-decoration: underline;
}

.dashboard__info {
  display: flex;
  flex-direction: column;
}

.dashboard__info-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--fm-space-xs) var(--fm-space-md);
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--fm-border-subtle);
}

.dashboard__info-row dt {
  color: var(--fm-text-muted);
}

.dashboard__info-row dd {
  color: var(--fm-heading);
  font-weight: 600;
  text-align: right;
}

.dashboard__info-cta {
  margin-top: var(--fm-space-lg);
}

.dashboard__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dashboard__action {
  display: flex;
  align-items: center;
  gap: var(--fm-space-md);
  padding: var(--fm-space-md);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-card);
  color: var(--fm-text-muted);
  text-decoration: none;
}

.dashboard__action:hover {
  background: var(--fm-surface-hover);
  box-shadow: var(--fm-shadow-2);
}

.dashboard__action-icon {
  display: inline-grid;
  width: 40px;
  height: 40px;
  flex: none;
  place-items: center;
  border-radius: var(--fm-radius-control);
}

.dashboard__action-icon.is-info {
  background: var(--fm-primary-soft);
  color: var(--fm-primary-text);
}

.dashboard__action-icon.is-warning {
  background: var(--fm-warning-soft);
  color: var(--fm-warning-text);
}

.dashboard__action-text {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.dashboard__action-title {
  color: var(--fm-heading);
  font: var(--fm-headline-sm);
  font-size: 0.9375rem;
}

.dashboard__action-description {
  font: var(--fm-body-sm);
}

@media (min-width: 768px) {
  .dashboard__kpis .dashboard__section-head {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
}

@media (min-width: 1280px) {
  .dashboard__grid {
    grid-template-columns: minmax(0, 2.4fr) minmax(18rem, 1fr);
    align-items: start;
  }
}

@media (max-width: 767px) {
  /* Fond blanc conservé sur mobile : le fond bleuté de la maquette ferait
     passer les badges et le texte secondaire sous le contraste AA. */
  .dashboard__hero {
    padding: var(--fm-space-md);
  }

  .dashboard__hero-title {
    font: var(--fm-headline-md);
  }

  .dashboard__kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .dashboard__skeleton-row {
    grid-template-columns: 1fr;
    gap: var(--fm-space-sm);
  }
}
</style>
