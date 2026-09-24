<!--
  DashboardEvolutionChart (MONEVA V2, Phase 7) — no-dependency inline SVG
  area chart of the existing /dashboard/evolution points. Presentational
  only: values are never transformed, only mapped to coordinates. When every
  point is 0 (or there is no positive maximum) the line sits on the baseline
  instead of producing NaN coordinates.
-->
<template>
  <figure class="evo">
    <div v-if="points.length" class="evo-plot">
      <svg
        class="evo-svg"
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.22" />
            <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <line
          v-for="y in GRID_LINES"
          :key="y"
          class="evo-grid"
          x1="0"
          :x2="WIDTH"
          :y1="y"
          :y2="y"
          vector-effect="non-scaling-stroke"
        />
        <path :d="areaPath" :fill="`url(#${gradientId})`" />
        <path :d="linePath" class="evo-line" fill="none" vector-effect="non-scaling-stroke" />
      </svg>

      <!-- HTML markers keep their round shape despite the stretched SVG. -->
      <span
        v-for="(point, index) in points"
        :key="`dot-${index}`"
        class="evo-dot"
        :class="{ 'is-current': index === currentIndex }"
        :style="{ left: `${(point.x / WIDTH) * 100}%`, top: `${(point.y / HEIGHT) * 100}%` }"
        :title="`${point.label} : ${formatAmount(point.montant)} FCFA`"
        aria-hidden="true"
      ></span>
    </div>

    <ol v-if="points.length" class="evo-labels" aria-hidden="true">
      <li
        v-for="(point, index) in points"
        :key="`label-${index}`"
        :class="{ 'is-current': index === currentIndex }"
        :style="{ left: `${(point.x / WIDTH) * 100}%` }"
      >
        {{ point.label }}
      </li>
    </ol>

    <p v-else class="evo-empty">Aucune donnée d'évolution disponible.</p>

    <!-- Textual equivalent of the chart for assistive technology. -->
    <table v-if="points.length" class="sr-only">
      <caption>{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">Mois</th>
          <th scope="col">Dépenses</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(point, index) in points" :key="`row-${index}`">
          <th scope="row">{{ point.label }}</th>
          <td>{{ formatAmount(point.montant) }} FCFA</td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // [{ label, montant }] exactly as loaded by the Dashboard.
  data: { type: Array, default: () => [] },
  caption: { type: String, default: 'Évolution des dépenses' }
});

const WIDTH = 700;
const HEIGHT = 200;
const PAD_X = 24;
const TOP = 20;
const BASE = 185;
const GRID_LINES = [40, 90, 140];

const gradientId = `evo-gradient-${Math.random().toString(36).slice(2, 9)}`;

const formatAmount = (value) => new Intl.NumberFormat('fr-FR').format(Number(value) || 0);

const points = computed(() => {
  const items = Array.isArray(props.data) ? props.data : [];
  if (!items.length) return [];
  const values = items.map((item) => Number(item.montant));
  const max = Math.max(...values.filter((v) => Number.isFinite(v)), 0);
  const step = items.length > 1 ? (WIDTH - 2 * PAD_X) / (items.length - 1) : 0;
  return items.map((item, index) => {
    const value = values[index];
    const ratio = max > 0 && Number.isFinite(value) ? Math.max(value, 0) / max : 0;
    return {
      label: item.label,
      montant: item.montant,
      x: items.length > 1 ? PAD_X + index * step : WIDTH / 2,
      y: BASE - ratio * (BASE - TOP)
    };
  });
});

// Smooth curve: horizontal-tangent cubic segments never overshoot vertically.
const linePath = computed(() =>
  points.value
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = points.value[index - 1];
      const mid = (prev.x + point.x) / 2;
      return `C ${mid} ${prev.y}, ${mid} ${point.y}, ${point.x} ${point.y}`;
    })
    .join(' ')
);

const areaPath = computed(() => {
  if (!points.value.length) return '';
  const first = points.value[0];
  const last = points.value[points.value.length - 1];
  return `${linePath.value} L ${last.x} ${BASE} L ${first.x} ${BASE} Z`;
});

// The endpoint returns the 12 months of the current calendar year.
const currentIndex = computed(() => (points.value.length === 12 ? new Date().getMonth() : -1));
</script>

<style scoped>
.evo {
  margin: 0;
}

.evo-plot {
  position: relative;
  height: 200px;
}

.evo-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.evo-grid {
  stroke: var(--color-border-soft);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
}

.evo-line {
  stroke: var(--color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.evo-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border-radius: 999px;
}

.evo-dot.is-current::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.evo-dot.is-current::after {
  content: '';
  position: absolute;
  inset: 3px;
  border: 2px solid var(--color-surface);
  border-radius: 999px;
  background-color: var(--color-primary);
}

.evo-labels {
  position: relative;
  height: var(--text-label-sm--line-height);
  margin: var(--spacing-sm) 0 0;
  padding: 0;
  list-style: none;
}

.evo-labels li {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: var(--text-label-sm);
  line-height: var(--text-label-sm--line-height);
  font-weight: 500;
  color: var(--color-text-muted-light);
  white-space: nowrap;
}

.evo-labels li.is-current {
  font-weight: 700;
  color: var(--color-primary);
}

.evo-empty {
  padding: var(--spacing-xl) 0;
  text-align: center;
  font-size: var(--text-body-md);
  color: var(--color-text-muted);
}

/* Narrow screens: every other month label (all 12 stay in the data table). */
@media (max-width: 767px) {
  .evo-plot {
    height: 160px;
  }

  .evo-labels li:nth-child(even):not(.is-current) {
    visibility: hidden;
  }
}
</style>
