<script setup>
// Champ texte étiqueté (label visible ou masqué), aide et erreur reliées par aria.
import { computed, useId } from 'vue'
import AdminIcon from './AdminIcon.vue'

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  label: { type: String, required: true },
  hideLabel: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  icon: { type: String, default: null },
  autocomplete: { type: String, default: 'off' },
})

const id = useId()
const describedBy = computed(
  () => [props.hint && `${id}-hint`, props.error && `${id}-error`].filter(Boolean).join(' ') || undefined,
)
</script>

<template>
  <div class="text-field" :class="{ 'has-error': error, 'has-icon': icon }">
    <label :for="id" class="text-field__label" :class="{ 'fm-visually-hidden': hideLabel }">{{ label }}</label>
    <div class="text-field__control">
      <AdminIcon v-if="icon" :name="icon" :size="16" class="text-field__icon" />
      <input
        :id="id"
        v-model="model"
        class="text-field__input"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
      />
    </div>
    <p v-if="hint" :id="`${id}-hint`" class="text-field__hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="text-field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.text-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--fm-space-xs);
}

.text-field__label {
  color: var(--fm-heading);
  font: var(--fm-label-md);
}

.text-field__control {
  position: relative;
}

.text-field__icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  color: var(--fm-text-muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.text-field__input {
  width: 100%;
  height: var(--fm-control-height);
  padding: 0 0.75rem;
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  background: var(--fm-surface);
  color: var(--fm-heading);
}

.has-icon .text-field__input {
  padding-left: 2.25rem;
}

.text-field__input::placeholder {
  color: var(--fm-text-muted);
}

.text-field__input:focus-visible {
  border-color: var(--fm-primary);
  outline-offset: 0;
}

.has-error .text-field__input {
  border-color: var(--fm-danger-text);
}

.text-field__hint {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.text-field__error {
  color: var(--fm-danger-text);
  font: var(--fm-body-sm);
  font-weight: 600;
}
</style>
