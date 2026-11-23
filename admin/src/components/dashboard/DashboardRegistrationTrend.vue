<script setup>
// FE-03 — Inscriptions fictives sur sept jours. Tableau accessible : la barre
// est purement décorative (aria-hidden), l'information passe par les cellules.
import { computed } from 'vue'
import BaseCard from '@admin/components/BaseCard.vue'
import DemoTag from '@admin/components/DemoTag.vue'

const props = defineProps({
  points: { type: Array, required: true },
})

const highest = computed(() => Math.max(1, ...props.points.map((point) => point.value)))

function share(value) {
  return `${Math.round((value / highest.value) * 100)}%`
}
</script>

<template>
  <BaseCard
    title="Inscriptions fictives sur sept jours"
    description="Série fictive de démonstration, sans lien avec une activité réelle."
  >
    <template #actions><DemoTag label="Données fictives — Démonstration" /></template>
    <table class="fe03-trend">
      <caption>Inscriptions fictives par jour — valeurs de démonstration</caption>
      <thead>
        <tr>
          <th scope="col">Jour</th>
          <th scope="col">Inscriptions fictives</th>
          <th scope="col">Représentation visuelle</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="point in points" :key="point.day">
          <th scope="row">{{ point.day }}</th>
          <td>{{ point.value }}</td>
          <td>
            <span class="fe03-trend__track" aria-hidden="true">
              <span class="fe03-trend__bar" :style="{ width: share(point.value) }" />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </BaseCard>
</template>

<style scoped>
.fe03-trend {
  width: 100%;
  border-spacing: 0;
  table-layout: fixed;
  font: var(--fm-body-sm);
}

.fe03-trend caption {
  margin-bottom: var(--fm-space-sm);
  color: var(--fm-text-muted);
  text-align: left;
}

.fe03-trend th,
.fe03-trend td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--fm-border-subtle);
  text-align: left;
}

.fe03-trend thead th {
  color: var(--fm-heading);
  font: var(--fm-label-md);
}

.fe03-trend__track {
  display: block;
  width: 100%;
  height: 0.6rem;
  border-radius: var(--fm-radius-pill);
  background: var(--fm-surface-hover);
}

.fe03-trend__bar {
  display: block;
  height: 100%;
  border-radius: var(--fm-radius-pill);
  background: var(--fm-primary);
}

@media (max-width: 479px) {
  .fe03-trend th,
  .fe03-trend td {
    padding: 0.35rem 0.25rem;
    font-size: 0.8125rem;
  }
}
</style>
