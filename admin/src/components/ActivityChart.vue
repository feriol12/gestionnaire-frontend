<script setup>
// Histogramme SVG empilé (accès autorisés / bloqués), sans bibliothèque.
// Accessibilité : le SVG est purement visuel (aria-hidden) ; l'information
// passe par la légende de la figure (figcaption, résumé chiffré) et par le
// tableau de données dans un <details>. Évite la double lecture qu'entraînait
// un role="img" nommé par la figcaption elle-même.
import { computed } from 'vue'

const props = defineProps({
  points: { type: Array, required: true },
  label: { type: String, required: true },
})

const width = 600
const height = 200
const gap = 18

const maxTotal = computed(() => Math.max(...props.points.map((p) => p.allowed + p.blocked), 1))
const barWidth = computed(() => (width - gap * (props.points.length + 1)) / props.points.length)

const bars = computed(() =>
  props.points.map((point, index) => {
    const scale = (height - 8) / maxTotal.value
    const allowedH = point.allowed * scale
    const blockedH = point.blocked * scale
    const x = gap + index * (barWidth.value + gap)
    return {
      ...point,
      x,
      allowedY: height - allowedH,
      allowedH,
      blockedY: height - allowedH - blockedH - (point.blocked ? 3 : 0),
      blockedH,
    }
  }),
)

const totals = computed(() => ({
  allowed: props.points.reduce((sum, p) => sum + p.allowed, 0),
  blocked: props.points.reduce((sum, p) => sum + p.blocked, 0),
}))

const axisLabels = computed(() => props.points.filter((_, i) => i % 2 === 0).map((p) => p.slot))
</script>

<template>
  <figure class="activity-chart">
    <ul class="activity-chart__legend" aria-label="Légende">
      <li><span class="activity-chart__swatch is-allowed" aria-hidden="true" />Connexions réussies</li>
      <li><span class="activity-chart__swatch is-blocked" aria-hidden="true" />Connexions bloquées</li>
    </ul>
    <svg
      class="activity-chart__svg"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="0" :y1="height - 0.5" :x2="width" :y2="height - 0.5" class="activity-chart__axis" />
      <line x1="0" :y1="height / 2" :x2="width" :y2="height / 2" class="activity-chart__grid" />
      <g v-for="bar in bars" :key="bar.slot">
        <rect :x="bar.x" :y="bar.allowedY" :width="barWidth" :height="bar.allowedH" rx="3" class="is-allowed" />
        <rect
          v-if="bar.blocked"
          :x="bar.x"
          :y="bar.blockedY"
          :width="barWidth"
          :height="bar.blockedH"
          rx="2"
          class="is-blocked"
        />
      </g>
    </svg>
    <div class="activity-chart__axis-labels" aria-hidden="true">
      <span v-for="slot in axisLabels" :key="slot">{{ slot }}</span>
      <span>23:59</span>
    </div>
    <figcaption class="activity-chart__summary">
      {{ label }} : {{ totals.allowed }} connexions réussies et {{ totals.blocked }} bloquées sur 24 heures
      (valeurs fictives).
    </figcaption>
    <details class="activity-chart__details">
      <summary>Voir les données du graphique</summary>
      <table class="activity-chart__table">
        <caption class="fm-visually-hidden">{{ label }} — données fictives</caption>
        <thead>
          <tr>
            <th scope="col">Tranche</th>
            <th scope="col">Réussies</th>
            <th scope="col">Bloquées</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="point in points" :key="point.slot">
            <th scope="row">{{ point.slot }}</th>
            <td>{{ point.allowed }}</td>
            <td>{{ point.blocked }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </figure>
</template>

<style scoped>
.activity-chart {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-md);
}

.activity-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fm-space-sm) var(--fm-space-lg);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--fm-text);
}

.activity-chart__legend li {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-space-sm);
}

.activity-chart__swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.activity-chart__swatch.is-allowed,
.activity-chart__svg .is-allowed {
  background: var(--fm-primary);
  fill: var(--fm-primary);
}

.activity-chart__swatch.is-blocked,
.activity-chart__svg .is-blocked {
  background: var(--fm-danger);
  fill: var(--fm-danger);
}

.activity-chart__svg {
  display: block;
  width: 100%;
  height: 200px;
}

.activity-chart__axis {
  stroke: var(--fm-border);
}

.activity-chart__grid {
  stroke: var(--fm-border);
  stroke-dasharray: 4 4;
}

.activity-chart__axis-labels {
  display: flex;
  justify-content: space-between;
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.activity-chart__summary {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.activity-chart__details summary {
  width: fit-content;
  color: var(--fm-primary-text);
  font-weight: 600;
  cursor: pointer;
}

.activity-chart__table {
  width: 100%;
  margin-top: var(--fm-space-sm);
  border-spacing: 0;
}

.activity-chart__table th,
.activity-chart__table td {
  padding: var(--fm-space-xs) var(--fm-space-sm);
  border-bottom: 1px solid var(--fm-border-subtle);
  text-align: left;
}

@media (max-width: 479px) {
  .activity-chart__svg {
    height: 160px;
  }

  .activity-chart__axis-labels span:nth-child(even) {
    display: none;
  }
}
</style>
