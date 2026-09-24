<!--
  DashboardAlerts (MONEVA V2, Phase 7) — displays the Dashboard's existing
  computed alerts ({ icon, title, message, bgColor }) in order. No rule lives
  here; the alerts' inert `action` labels are intentionally not rendered.
-->
<template>
  <ul v-if="alerts.length" class="alerts">
    <li v-for="(alerte, index) in alerts" :key="index" class="alert" :class="alerte.bgColor">
      <span class="alert-icon" aria-hidden="true">{{ alerte.icon }}</span>
      <div class="alert-body">
        <p class="alert-title">{{ alerte.title }}</p>
        <p class="alert-message">{{ alerte.message }}</p>
      </div>
    </li>
  </ul>

  <EmptyState v-else title="Aucune alerte" message="Rien à signaler pour le moment." />
</template>

<script setup>
import EmptyState from '@/components/common/EmptyState.vue';

defineProps({
  alerts: { type: Array, default: () => [] }
});
</script>

<style scoped>
.alerts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-moneva-lg);
}

.alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  font-size: 1.125rem;
  line-height: 1;
  background-color: var(--color-surface);
  border-radius: 999px;
}

.alert-body {
  min-width: 0;
}

.alert-title {
  font-size: var(--text-label-lg);
  line-height: var(--text-label-lg--line-height);
  font-weight: var(--text-label-lg--font-weight);
  color: var(--color-ink);
}

.alert-message {
  margin-top: 2px;
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}
</style>
