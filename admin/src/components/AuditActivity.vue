<script setup>
// Activité d'audit fictive : tableau (≥ 768px) ou cartes empilées (mobile).
// Les deux rendus existent dans le DOM ; celui qui est masqué l'est par
// display:none, donc absent de l'arbre d'accessibilité.
//
// La zone du tableau n'entre dans l'ordre de tabulation (tabindex=0, pour le
// défilement au clavier) que si elle défile réellement : mesure au montage
// puis à chaque redimensionnement de la zone ou du tableau (texte agrandi…).
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import AdminIcon from './AdminIcon.vue'
import StatusBadge from './StatusBadge.vue'

defineProps({
  events: { type: Array, required: true },
  caption: { type: String, required: true },
})

const captionId = useId()
const tableWrap = ref(null)
const table = ref(null)
const scrollable = ref(false)
let observer = null

function measure() {
  const el = tableWrap.value
  scrollable.value = Boolean(el) && el.scrollWidth > el.clientWidth
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(measure)
    observer.observe(tableWrap.value)
    observer.observe(table.value)
  }
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="audit-activity">
    <div
      ref="tableWrap"
      class="audit-activity__table-wrap"
      role="region"
      :aria-labelledby="captionId"
      :tabindex="scrollable ? 0 : undefined"
      :data-scrollable="scrollable ? 'true' : 'false'"
    >
      <table ref="table" class="audit-activity__table">
        <caption :id="captionId" class="fm-visually-hidden">{{ caption }}</caption>
        <thead>
          <tr>
            <th scope="col">Date &amp; heure</th>
            <th scope="col">Événement administratif</th>
            <th scope="col">Utilisateur concerné</th>
            <th scope="col">Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event.id">
            <td class="audit-activity__when">
              {{ event.day }} <span class="audit-activity__time">{{ event.time }}</span>
            </td>
            <td>
              <span class="audit-activity__event">
                <span class="audit-activity__event-icon" :class="`is-${event.kind}`">
                  <AdminIcon :name="event.kind" :size="16" />
                </span>
                {{ event.label }}
              </span>
            </td>
            <td class="fm-mono">{{ event.subject }}</td>
            <td><StatusBadge :tone="event.status.tone">{{ event.status.label }}</StatusBadge></td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="audit-activity__cards" :aria-label="caption">
      <li v-for="event in events" :key="event.id" class="audit-activity__card">
        <div class="audit-activity__card-top">
          <span class="audit-activity__chip">{{ event.day }} {{ event.time }}</span>
          <StatusBadge :tone="event.status.tone">{{ event.status.label }}</StatusBadge>
        </div>
        <p class="audit-activity__event">
          <span class="audit-activity__event-icon" :class="`is-${event.kind}`">
            <AdminIcon :name="event.kind" :size="16" />
          </span>
          <span>
            <span class="audit-activity__card-title">{{ event.label }}</span>
            <span class="audit-activity__card-meta">Opérateur : {{ event.operator }}</span>
          </span>
        </p>
        <p class="audit-activity__card-subject fm-mono">{{ event.subject }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.audit-activity__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
}

.audit-activity__table {
  width: 100%;
  min-width: 40rem;
  border-spacing: 0;
}

.audit-activity__table th {
  height: 44px;
  padding: 0 var(--fm-space-md);
  border-bottom: 1px solid var(--fm-border);
  background: var(--fm-canvas);
  color: var(--fm-text-muted);
  font: var(--fm-label-md);
  letter-spacing: 0.04em;
  text-align: left;
  text-transform: uppercase;
}

.audit-activity__table td {
  height: 52px;
  padding: var(--fm-space-sm) var(--fm-space-md);
  border-bottom: 1px solid var(--fm-border-subtle);
  color: var(--fm-heading);
  vertical-align: middle;
}

.audit-activity__table tbody tr:last-child td {
  border-bottom: 0;
}

.audit-activity__table tbody tr:hover td {
  background: var(--fm-surface-hover);
}

.audit-activity__when {
  white-space: nowrap;
}

.audit-activity__time {
  color: var(--fm-text-muted);
}

.audit-activity__event {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.audit-activity__event-icon {
  display: inline-grid;
  width: 32px;
  height: 32px;
  flex: none;
  place-items: center;
  border-radius: var(--fm-radius-control);
  background: var(--fm-primary-soft);
  color: var(--fm-primary-text);
}

.audit-activity__event-icon.is-suspension {
  background: var(--fm-danger-soft);
  color: var(--fm-danger-text);
}

.audit-activity__event-icon.is-email {
  background: var(--fm-success-soft);
  color: var(--fm-success-text);
}

.audit-activity__cards {
  display: none;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.audit-activity__card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: var(--fm-space-md);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-card);
  background: var(--fm-surface);
}

.audit-activity__card-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fm-space-sm);
}

.audit-activity__chip {
  padding: 0.125rem 0.5rem;
  border-radius: var(--fm-radius-sm);
  background: var(--fm-neutral-soft);
  color: var(--fm-neutral-text);
  font: var(--fm-label-md);
}

.audit-activity__card .audit-activity__event {
  align-items: flex-start;
}

.audit-activity__card-title {
  display: block;
  color: var(--fm-heading);
  font: var(--fm-headline-sm);
  font-size: 0.9375rem;
}

.audit-activity__card-meta {
  display: block;
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.audit-activity__card-subject {
  overflow-wrap: anywhere;
  color: var(--fm-text);
}

@media (max-width: 767px) {
  .audit-activity__table-wrap {
    display: none;
  }

  .audit-activity__cards {
    display: flex;
  }
}
</style>
