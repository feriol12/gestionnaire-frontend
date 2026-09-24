<!--
  AuthField — auth-only text field (Login/Register Stitch fidelity).
  Reproduces the Stitch auth inputs (left icon, ~48px height, 12px radius,
  filled surface) without touching the global AppInput primitive.
  Keeps AppInput's accessibility contract: label[for], aria-invalid,
  aria-describedby -> `${id}-error` / `${id}-hint`, error text role="alert".

  tone="login"    — Login Desktop/Mobile inputs (bordered slate fill).
  tone="register" — Register Desktop/Mobile inputs (borderless tinted fill).

  Slots: #icon (decorative left icon), #action (right-side control such as
  the password visibility toggle — owned by the parent view), #hint.
-->
<template>
  <div :class="['auth-field', `auth-field--${tone}`, { 'is-invalid': hasError }]">
    <label :for="id" class="auth-field-label">{{ label }}</label>

    <div class="auth-field-control">
      <span v-if="$slots.icon" class="auth-field-icon" aria-hidden="true">
        <slot name="icon" />
      </span>

      <input
        :id="id"
        :name="name || undefined"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder || undefined"
        :autocomplete="autocomplete || undefined"
        :required="required"
        :disabled="disabled"
        :aria-invalid="hasError ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="['auth-field-input', { 'has-icon': $slots.icon, 'has-action': $slots.action }]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur')"
      />

      <span v-if="$slots.action" class="auth-field-action">
        <slot name="action" />
      </span>
    </div>

    <p v-if="hasHint" :id="`${id}-hint`" class="auth-field-hint">
      <slot name="hint">{{ hint }}</slot>
    </p>

    <p v-if="hasError" :id="`${id}-error`" class="auth-field-error" role="alert">
      {{ errorText }}
    </p>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // Laravel 422 responses map each field to an array of messages; plain
  // strings (client-side checks) are accepted too.
  error: {
    type: [String, Array],
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
});

defineEmits(['update:modelValue', 'blur']);

const slots = useSlots();

const errorText = computed(() =>
  Array.isArray(props.error) ? props.error.join(' ') : props.error
);
const hasError = computed(() => Boolean(errorText.value));
const hasHint = computed(() => Boolean(props.hint || slots.hint));

const describedBy = computed(() => {
  const ids = [];
  if (hasError.value) ids.push(`${props.id}-error`);
  if (hasHint.value) ids.push(`${props.id}-hint`);
  return ids.length ? ids.join(' ') : undefined;
});
</script>

<style scoped>
.auth-field-label {
  display: block;
  margin-bottom: 6px;
}

.auth-field-control {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-field-icon {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 14px;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.auth-field-icon :slotted(svg) {
  display: block;
}

.auth-field-input {
  display: block;
  width: 100%;
  border-radius: 12px;
  font-family: inherit;
  transition: background-color 150ms, border-color 150ms, box-shadow 150ms;
}

.auth-field-input:focus {
  outline: none;
}

.auth-field-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.auth-field-action {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
}

.auth-field-action :slotted(button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: color 150ms, background-color 150ms;
}

.auth-field-action :slotted(button:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.auth-field-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding-left: 4px;
}

.auth-field-error {
  margin-top: 6px;
  font-size: 12px;
  line-height: 16px;
  color: var(--color-expense);
}

/* ---------- tone: login (Stitch Login Desktop / Mobile) ---------- */
.auth-field--login .auth-field-label {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #1e293b;
}

.auth-field--login .auth-field-icon {
  color: #94a3b8;
}

.auth-field--login .auth-field-icon :slotted(svg) {
  width: 16px;
  height: 16px;
}

.auth-field--login .auth-field-input {
  height: 46px;
  padding: 0 16px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: #0b1120;
}

.auth-field--login .auth-field-input.has-icon {
  padding-left: 40px;
}

.auth-field--login .auth-field-input.has-action {
  padding-right: 48px;
}

.auth-field--login .auth-field-input::placeholder {
  color: #94a3b8;
}

.auth-field--login .auth-field-input:focus {
  background-color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}

.auth-field--login .auth-field-action :slotted(button) {
  color: #94a3b8;
}

.auth-field--login .auth-field-action :slotted(button:hover) {
  color: #475569;
}

.auth-field--login .auth-field-action :slotted(svg) {
  width: 16px;
  height: 16px;
}

@media (min-width: 1024px) {
  .auth-field--login .auth-field-input {
    background-color: #f8fafc;
  }

  .auth-field--login .auth-field-input:hover:not(:focus):not(:disabled) {
    border-color: #cbd5e1;
  }
}

/* ---------- tone: register (Stitch Register Desktop / Mobile) ---------- */
.auth-field--register .auth-field-label {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #0b1c30;
}

.auth-field--register .auth-field-icon {
  color: #565e74;
}

.auth-field--register .auth-field-icon :slotted(svg) {
  width: 20px;
  height: 20px;
}

.auth-field--register .auth-field-input {
  height: 48px;
  padding: 0 16px;
  border: 1px solid transparent;
  background-color: #eff4ff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #0b1c30;
}

.auth-field--register .auth-field-input.has-icon {
  padding-left: 44px;
}

.auth-field--register .auth-field-input.has-action {
  padding-right: 48px;
}

.auth-field--register .auth-field-input::placeholder {
  color: rgba(86, 94, 116, 0.6);
}

/* Stitch shifts the fill and lifts the shadow on focus; a soft primary ring
   is added so keyboard focus stays visible (WCAG 2.4.7). */
.auth-field--register .auth-field-input:focus {
  background-color: #ffffff;
  box-shadow:
    0 0 0 2px rgba(37, 99, 235, 0.35),
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.auth-field--register .auth-field-action :slotted(button) {
  color: #565e74;
}

.auth-field--register .auth-field-action :slotted(button:hover) {
  color: #0b1c30;
  background-color: #dce9ff;
}

.auth-field--register .auth-field-action :slotted(svg) {
  width: 20px;
  height: 20px;
}

.auth-field--register .auth-field-hint {
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #565e74;
}

.auth-field--register .auth-field-hint :slotted(svg) {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .auth-field--register .auth-field-label {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.01em;
  }

  .auth-field--register .auth-field-input {
    box-shadow: none;
  }

  .auth-field--register .auth-field-input::placeholder {
    color: #737686;
  }

  .auth-field--register .auth-field-input:focus {
    background-color: #f8f9ff;
  }

  .auth-field--register .auth-field-action :slotted(button:hover) {
    background-color: transparent;
  }

  .auth-field--register .auth-field-hint {
    font-size: 12px;
    line-height: 18px;
    font-weight: 400;
    letter-spacing: 0;
  }
}

/* ---------- error state (both tones) ---------- */
.auth-field.is-invalid .auth-field-input {
  border-color: var(--color-expense);
}

.auth-field.is-invalid .auth-field-input:focus {
  border-color: var(--color-expense);
  box-shadow: 0 0 0 1px var(--color-expense);
}
</style>
