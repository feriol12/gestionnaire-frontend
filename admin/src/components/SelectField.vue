<script setup>
// Liste déroulante native étiquetée (accessibilité clavier du navigateur).
import { useId } from 'vue'

const model = defineModel({ type: String, default: '' })

defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  hint: { type: String, default: '' },
})

const id = useId()
</script>

<template>
  <div class="select-field">
    <label :for="id" class="select-field__label">{{ label }}</label>
    <select
      :id="id"
      v-model="model"
      class="select-field__input"
      :aria-describedby="hint ? `${id}-hint` : undefined"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <p v-if="hint" :id="`${id}-hint`" class="select-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.select-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--fm-space-xs);
}

.select-field__label {
  color: var(--fm-heading);
  font: var(--fm-label-md);
}

.select-field__input {
  width: 100%;
  height: var(--fm-control-height);
  padding: 0 0.75rem;
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  background: var(--fm-surface);
  color: var(--fm-heading);
}

.select-field__input:focus-visible {
  border-color: var(--fm-primary);
  outline-offset: 0;
}

.select-field__hint {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}
</style>
