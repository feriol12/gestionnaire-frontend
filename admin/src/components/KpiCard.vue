<script setup>
// Indicateur administratif (valeur fictive), avec étiquette « Démonstration ».
// trend = { label, tone, icon? } : l'icône de tendance est optionnelle et
// portée par la donnée (aucune dépendance à l'icône principale de la carte).
import { computed } from 'vue'
import AdminIcon from './AdminIcon.vue'
import DemoTag from './DemoTag.vue'

const props = defineProps({
  label: { type: String, required: true },
  shortLabel: { type: String, default: '' },
  value: { type: Number, required: true },
  icon: { type: String, default: 'activity' },
  tone: { type: String, default: 'info' },
  trend: { type: Object, default: null },
  note: { type: String, default: '' },
})

const iconNames = { users: 'users', active: 'circle-check', suspended: 'warning', new: 'user-plus' }
const formatted = computed(() => new Intl.NumberFormat('fr-FR').format(props.value))
</script>

<template>
  <article class="kpi-card">
    <div class="kpi-card__top">
      <span class="kpi-card__icon" :class="`kpi-card__icon--${tone}`">
        <AdminIcon :name="iconNames[icon] ?? icon" :size="20" />
      </span>
      <DemoTag class="kpi-card__tag" />
    </div>
    <h3 class="kpi-card__label">
      <span class="kpi-card__label-long">{{ label }}</span>
      <span v-if="shortLabel" class="kpi-card__label-short">{{ shortLabel }}</span>
    </h3>
    <p class="kpi-card__value">{{ formatted }}</p>
    <p v-if="trend || note" class="kpi-card__meta">
      <span v-if="trend" class="kpi-card__trend" :class="`kpi-card__trend--${trend.tone}`">
        <AdminIcon v-if="trend.icon" :name="trend.icon" :size="16" />
        {{ trend.label }}
      </span>
      <span v-if="note" class="kpi-card__note">{{ note }}</span>
    </p>
  </article>
</template>

<style scoped>
.kpi-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--fm-space-sm);
  padding: var(--fm-space-lg);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-card);
  background: var(--fm-surface);
  box-shadow: var(--fm-shadow-1);
}

.kpi-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--fm-space-sm);
  margin-bottom: var(--fm-space-sm);
}

.kpi-card__icon {
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: var(--fm-radius-control);
}

.kpi-card__icon--info {
  background: var(--fm-primary-soft);
  color: var(--fm-primary-text);
}

.kpi-card__icon--success {
  background: var(--fm-success-soft);
  color: var(--fm-success-text);
}

.kpi-card__icon--warning {
  background: var(--fm-warning-soft);
  color: var(--fm-warning-text);
}

.kpi-card__label {
  color: var(--fm-text-muted);
  font: var(--fm-label-md);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.kpi-card__label-short {
  display: none;
}

.kpi-card__value {
  color: var(--fm-heading);
  font: var(--fm-display-lg);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.kpi-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fm-space-xs) var(--fm-space-sm);
  font: var(--fm-body-sm);
}

.kpi-card__trend {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-space-xs);
  font-weight: 600;
}

.kpi-card__trend--success {
  color: var(--fm-success-text);
}

.kpi-card__trend--warning {
  color: var(--fm-warning-text);
}

.kpi-card__trend--info {
  color: var(--fm-primary-text);
}

.kpi-card__note {
  color: var(--fm-text-muted);
}

@media (max-width: 767px) {
  .kpi-card {
    padding: var(--fm-space-md);
  }

  .kpi-card__tag {
    display: none;
  }

  .kpi-card__label-long {
    display: none;
  }

  .kpi-card__label-short {
    display: inline;
  }

  .kpi-card__value {
    font: var(--fm-headline-lg);
    font-size: 1.625rem;
  }
}
</style>
