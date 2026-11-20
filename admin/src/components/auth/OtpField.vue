<script setup>
// FE-02 — Champ de code TOTP a six chiffres, saisi au clavier.
// Composant local FE-02 : aucun changement du TextField partage de FE-01.
import { computed, useId } from 'vue'

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  label: { type: String, default: 'Code TOTP (6 chiffres)' },
  hint: { type: String, default: 'Code fictif de demonstration : 123456.' },
  error: { type: String, default: '' },
})

const id = useId()
const describedBy = computed(
  () => [props.hint && `${id}-hint`, props.error && `${id}-error`].filter(Boolean).join(' ') || undefined,
)

function onInput(event) {
  const digits = String(event.target.value).replace(/\D/g, '').slice(0, 6)
  model.value = digits
  event.target.value = digits
}
</script>

<template>
  <div class="fe02-otp" :class="{ 'fe02-otp--invalid': error }">
    <label :for="id" class="fe02-otp__label">{{ label }}</label>
    <input
      :id="id"
      class="fe02-otp__input"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern="[0-9]*"
      maxlength="6"
      :value="model"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      @input="onInput"
    />
    <p v-if="hint" :id="`${id}-hint`" class="fe02-otp__hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="fe02-otp__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.fe02-otp {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--fm-space-xs);
}

.fe02-otp__label {
  color: var(--fm-heading);
  font: var(--fm-label-md);
}

.fe02-otp__input {
  width: min(100%, 14rem);
  height: var(--fm-control-height);
  padding: 0 var(--fm-space-sm);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  background: var(--fm-surface);
  color: var(--fm-heading);
  font-size: 1.25rem;
  letter-spacing: 0.3em;
}

.fe02-otp__input:focus-visible {
  border-color: var(--fm-primary);
  outline-offset: 0;
}

.fe02-otp--invalid .fe02-otp__input {
  border-color: var(--fm-danger-text);
}

.fe02-otp__hint {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.fe02-otp__error {
  color: var(--fm-danger-text);
  font: var(--fm-body-sm);
  font-weight: 600;
}
</style>
