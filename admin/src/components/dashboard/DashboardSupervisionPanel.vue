<script setup>
// FE-03 — Flux de supervision non financier avec états simulés :
// chargement, normal, vide et erreur avec reprise. Aucun appel réel.
import { computed } from 'vue'
import BaseCard from '@admin/components/BaseCard.vue'
import DemoTag from '@admin/components/DemoTag.vue'
import InlineAlert from '@admin/components/InlineAlert.vue'
import SkeletonBlock from '@admin/components/SkeletonBlock.vue'
import StatePanel from '@admin/components/StatePanel.vue'
import StatusBadge from '@admin/components/StatusBadge.vue'

const props = defineProps({
  state: { type: String, required: true },
  events: { type: Array, required: true },
  messages: { type: Object, required: true },
})

const emit = defineEmits(['retry'])
const statusText = computed(() => props.messages[props.state] ?? '')
</script>

<template>
  <BaseCard
    title="Événements de supervision fictifs"
    description="Journal illustratif d'actions administratives simulées."
  >
    <template #actions><DemoTag label="Données fictives — Démonstration" /></template>

    <div :aria-busy="state === 'loading' ? 'true' : 'false'">
      <div v-if="state === 'loading'" class="fe03-feed__loading" data-fe03-state="loading">
        <p class="fm-visually-hidden">{{ messages.loading }}</p>
        <div v-for="n in 3" :key="n" class="fe03-feed__skeleton">
          <SkeletonBlock width="4rem" />
          <SkeletonBlock width="70%" height="1.5rem" />
        </div>
      </div>

      <InlineAlert v-else-if="state === 'error'" tone="danger" :title="messages.error">
        <p>Aucun appel n’a été envoyé. Vous pouvez rejouer la reprise simulée.</p>
        <template #actions>
          <button type="button" class="fe03-feed__retry" @click="emit('retry')">
            Réessayer (simulation)
          </button>
        </template>
      </InlineAlert>

      <StatePanel
        v-else-if="state === 'empty'"
        icon="inbox"
        tone="neutral"
        title="Aucun événement"
        :heading-level="3"
      >
        <p>{{ messages.empty }}</p>
      </StatePanel>

      <ul v-else class="fe03-feed__list">
        <li v-for="event in events" :key="event.id" class="fe03-feed__item">
          <span class="fe03-feed__time">{{ event.time }}</span>
          <span class="fe03-feed__body">
            <span class="fe03-feed__label">{{ event.label }}</span>
            <span class="fe03-feed__subject">{{ event.subject }}</span>
          </span>
          <StatusBadge :tone="event.tone" :dot="false">Fictif</StatusBadge>
        </li>
      </ul>
    </div>

    <p class="fm-visually-hidden" role="status">{{ statusText }}</p>
  </BaseCard>
</template>

<style scoped>
.fe03-feed__list,
.fe03-feed__loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fe03-feed__item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fm-space-sm);
  padding: var(--fm-space-sm) var(--fm-space-md);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
}

.fe03-feed__time {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.fe03-feed__body {
  display: flex;
  min-width: 0;
  flex: 1 1 12rem;
  flex-direction: column;
}

.fe03-feed__label {
  color: var(--fm-heading);
  font: var(--fm-label-md);
}

.fe03-feed__subject {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.fe03-feed__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--fm-space-xs);
  padding: var(--fm-space-sm) var(--fm-space-md);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
}

.fe03-feed__retry {
  min-height: var(--fm-control-height);
  padding: 0 var(--fm-space-md);
  border: 1px solid var(--fm-primary);
  border-radius: var(--fm-radius-control);
  background: var(--fm-primary-soft);
  color: var(--fm-primary-text);
  font: var(--fm-label-md);
  cursor: pointer;
}

.fe03-feed__retry:focus-visible {
  outline: 2px solid var(--fm-primary);
  outline-offset: 2px;
}
</style>
