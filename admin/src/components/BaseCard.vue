<script setup>
// Carte de niveau 1 (fond blanc, bordure, ombre légère, rayon 12px).
// Rendue comme <section> titrée lorsqu'un titre est fourni.
import { useId } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  headingLevel: { type: Number, default: 2 },
  tag: { type: String, default: 'section' },
})

const titleId = useId()
</script>

<template>
  <component :is="tag" class="base-card" :aria-labelledby="props.title ? titleId : undefined">
    <header v-if="title || $slots.actions" class="base-card__header">
      <div class="base-card__heading">
        <component :is="`h${headingLevel}`" v-if="title" :id="titleId" class="base-card__title">
          {{ title }}
        </component>
        <p v-if="description" class="base-card__description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="base-card__actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </component>
</template>

<style scoped>
.base-card {
  min-width: 0;
  padding: var(--fm-space-lg);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-card);
  background: var(--fm-surface);
  box-shadow: var(--fm-shadow-1);
}

.base-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--fm-space-md);
  margin-bottom: var(--fm-space-lg);
}

.base-card__heading {
  min-width: 0;
  flex: 1 1 14rem;
}

.base-card__title {
  font: var(--fm-headline-md);
  letter-spacing: -0.01em;
}

.base-card__description {
  margin-top: var(--fm-space-xs);
  color: var(--fm-text-muted);
}

.base-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fm-space-sm);
}

.base-card__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fm-space-sm);
  margin-top: var(--fm-space-lg);
  color: var(--fm-text-muted);
}

@media (max-width: 767px) {
  .base-card {
    padding: var(--fm-space-md);
  }

  .base-card__header {
    margin-bottom: var(--fm-space-md);
  }
}
</style>
