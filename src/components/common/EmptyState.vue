<!--
  EmptyState — generic empty-state presentation (MONEVA V2, Phase 2).
  Purely presentational: callers supply the icon/title/message and an
  optional action; this component never fabricates sample data.
-->
<template>
  <div class="empty-state">
    <div v-if="icon || $slots.icon" class="empty-state-icon" aria-hidden="true">
      <slot name="icon">{{ icon }}</slot>
    </div>
    <p v-if="title" class="empty-state-title">{{ title }}</p>
    <p v-if="message" class="empty-state-message">{{ message }}</p>
    <div v-if="$slots.actions" class="empty-state-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  message: { type: String, default: '' }
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.empty-state-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-sm);
  line-height: 1;
}

.empty-state-title {
  font-size: var(--text-headline-sm);
  line-height: var(--text-headline-sm--line-height);
  font-weight: var(--text-headline-sm--font-weight);
  color: var(--color-ink);
  margin-bottom: var(--spacing-xs);
}

.empty-state-message {
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted-light);
  max-width: 28rem;
}

.empty-state-actions {
  margin-top: var(--spacing-md);
}
</style>
