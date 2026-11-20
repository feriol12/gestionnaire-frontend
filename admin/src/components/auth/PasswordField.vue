<script setup>
// FE-02 — Champ mot de passe avec affichage/masquage.
// C'est le SEUL fichier de admin/src autorise a contenir un attribut
// type="password" (exception ciblee au garde-fou FE-01, verifiee par les tests).
// La valeur reste en memoire dans le modele du formulaire : elle n'est jamais
// copiee dans l'etat partage, ni journalisee, ni ecrite dans un stockage.
import { computed, nextTick, ref, useId } from 'vue'

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  autocomplete: { type: String, default: 'current-password' },
})

const id = useId()
const visible = ref(false)
const masked = computed(() => visible.value === false)
const input = ref(null)
const describedBy = computed(
  () => [props.hint && `${id}-hint`, props.error && `${id}-error`].filter(Boolean).join(' ') || undefined,
)

async function toggleVisibility() {
  visible.value = !visible.value
  await nextTick()
  input.value?.focus()
}
</script>

<template>
  <div class="fe02-password" :class="{ 'fe02-password--invalid': error }">
    <label :for="id" class="fe02-password__label">{{ label }}</label>
    <div class="fe02-password__row">
      <input
        v-if="masked"
        ref="input"
        :id="id"
        v-model="model"
        type="password"
        class="fe02-password__input"
        :autocomplete="autocomplete"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
      />
      <input
        v-else
        ref="input"
        :id="id"
        v-model="model"
        type="text"
        class="fe02-password__input"
        :autocomplete="autocomplete"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
      />
      <button
        type="button"
        class="fe02-password__toggle"
        :aria-pressed="visible ? 'true' : 'false'"
        :aria-label="visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="toggleVisibility"
      >
        {{ visible ? 'Masquer' : 'Afficher' }}
      </button>
    </div>
    <p v-if="hint" :id="`${id}-hint`" class="fe02-password__hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="fe02-password__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.fe02-password {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--fm-space-xs);
}

.fe02-password__label {
  color: var(--fm-heading);
  font: var(--fm-label-md);
}

.fe02-password__row {
  display: flex;
  align-items: stretch;
  gap: var(--fm-space-xs);
}

.fe02-password__input {
  width: 100%;
  min-width: 0;
  height: var(--fm-control-height);
  padding: 0 var(--fm-space-sm);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  background: var(--fm-surface);
  color: var(--fm-heading);
}

.fe02-password__input:focus-visible {
  border-color: var(--fm-primary);
  outline-offset: 0;
}

.fe02-password--invalid .fe02-password__input {
  border-color: var(--fm-danger-text);
}

.fe02-password__toggle {
  min-width: 6.5rem;
  padding: 0 var(--fm-space-sm);
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
  background: var(--fm-surface-hover);
  color: var(--fm-heading);
  font: var(--fm-label-md);
  cursor: pointer;
}

.fe02-password__toggle:focus-visible {
  outline: 2px solid var(--fm-primary);
  outline-offset: 2px;
}

.fe02-password__hint {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
}

.fe02-password__error {
  color: var(--fm-danger-text);
  font: var(--fm-body-sm);
  font-weight: 600;
}
</style>
