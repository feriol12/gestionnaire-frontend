<script setup>
// FE-03 — Répartition administrative fictive, avec définition explicite de
// chaque libellé. Aucune donnée financière, aucun appel réel.
import BaseCard from '@admin/components/BaseCard.vue'
import DemoTag from '@admin/components/DemoTag.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  metrics: { type: Array, required: true },
})
</script>

<template>
  <BaseCard :title="title" :description="description">
    <template #actions><DemoTag label="Données fictives — Démonstration" /></template>
    <dl class="fe03-metrics">
      <div v-for="metric in metrics" :key="metric.id" class="fe03-metrics__item">
        <dt class="fe03-metrics__label">{{ metric.label }}</dt>
        <dd class="fe03-metrics__value">{{ metric.value.toLocaleString('fr-FR') }}</dd>
        <p class="fe03-metrics__definition">{{ metric.definition }}</p>
        <StatusBadge v-if="metric.tone" :tone="metric.tone" :dot="false">Valeur fictive</StatusBadge>
      </div>
    </dl>
  </BaseCard>
</template>

<style scoped>
.fe03-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--fm-gutter);
  margin: 0;
}

.fe03-metrics__item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--fm-space-xs);
  padding: var(--fm-space-md);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-card);
  background: var(--fm-canvas);
}

.fe03-metrics__label {
  color: var(--fm-heading);
  font: var(--fm-label-md);
}

.fe03-metrics__value {
  margin: 0;
  color: var(--fm-heading);
  font: var(--fm-display-md);
}

.fe03-metrics__definition {
  margin: 0;
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}
</style>
