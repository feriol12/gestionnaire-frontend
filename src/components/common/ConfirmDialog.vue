<!--
  ConfirmDialog — generic confirmation primitive built on AppModal.
  This is interaction infrastructure only: it does not know about Expense
  deletion, Budget deletion, API calls, stores, or permissions. Domain
  pages (Phase 5+) wire the actual confirm handler themselves via the
  `confirm`/`cancel` events; this replaces the two existing ad-hoc inline
  delete-confirm implementations, not AppToast's notification system
  (that separation is intentional — see MONEVA_V2_DESIGN.md §11).
-->
<template>
  <AppModal
    :model-value="modelValue"
    :title="title"
    :closable="!loading"
    :close-on-escape="!loading"
    :close-on-backdrop="!loading"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @close="onDismiss"
  >
    <p class="confirm-dialog-message">
      <slot>{{ message }}</slot>
    </p>

    <template #actions>
      <AppButton variant="secondary" :disabled="loading" @click="onCancel">
        {{ cancelText }}
      </AppButton>
      <AppButton :variant="variant" :loading="loading" @click="onConfirm">
        {{ confirmText }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup>
import AppModal from './AppModal.vue';
import AppButton from './AppButton.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmation' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirmer' },
  cancelText: { type: String, default: 'Annuler' },
  /** Passed straight through to AppButton's own variant prop (e.g. 'danger' for a destructive action). */
  variant: { type: String, default: 'danger' },
  /** Consumer sets this while its own async confirm action is in flight; disables dismissal and shows a busy confirm button. */
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const onConfirm = () => emit('confirm');
const onCancel = () => {
  emit('update:modelValue', false);
  emit('cancel');
};
// AppModal's own escape/backdrop/close-button dismissal always means "cancel"
// here — a successful confirm is closed explicitly by the consumer instead,
// after its own async action resolves, not via AppModal's close event.
const onDismiss = () => emit('cancel');
</script>

<style scoped>
.confirm-dialog-message {
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
}
</style>
