<!-- src/components/common/ExportButton.vue -->
<!--
  Presentation options (MONEVA V2, Phase 6) are opt-in: with none of
  `variant`/`label`/`icon`/`iconOnly` passed, it renders exactly as before.
  `variant="ghost"` is a local restyle of AppButton's `outline` variant.
  `iconOnly` keeps `label` as the button's accessible name.
-->
<template>
  <AppButton
    :variant="variant === 'ghost' ? 'outline' : variant"
    :class="{ 'export-budget-ghost': variant === 'ghost', 'export-budget-icon-only': iconOnly }"
    :aria-label="iconOnly ? label : undefined"
    :title="iconOnly ? label : undefined"
    :loading="loading"
    :disabled="loading"
    @click="handleExport"
  >
    <template v-if="icon || iconOnly">
      <FileText class="export-budget-icon" aria-hidden="true" />
      <span v-if="!iconOnly">{{ label }}</span>
    </template>
    <template v-else>{{ label }}</template>
  </AppButton>
</template>

<script setup>
import { ref } from 'vue';
import { FileText } from 'lucide-vue-next';
import apiClient from '@/services/apiClient';
import AppButton from './AppButton.vue';

const props = defineProps({
  period: {
    type: String,
    required: true
  },
  // AppButton variant, or 'ghost'. Default keeps the historical look.
  variant: {
    type: String,
    default: 'success'
  },
  label: {
    type: String,
    default: '📄 Exporter PDF'
  },
  icon: {
    type: Boolean,
    default: false
  },
  iconOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['export-start', 'export-end']);

const loading = ref(false);

const handleExport = async () => {
  loading.value = true;
  emit('export-start');
  
  try {
    const response = await apiClient.get('/export/budgets/pdf', {
      params: { period: props.period },
      responseType: 'blob',
    });
    
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budgets_${props.period}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur export:', error);
  } finally {
    loading.value = false;
    emit('export-end');
  }
};
</script>

<style scoped>
.export-budget-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Doubled classes outrank AppButton's own scoped .btn / .btn-outline rules. */
.export-budget-ghost.btn-outline {
  color: var(--color-ink);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.export-budget-ghost.btn-outline:hover:not(:disabled) {
  color: var(--color-primary);
  background-color: var(--color-canvas);
}

.export-budget-icon-only.btn {
  width: 44px;
  padding: 0;
}
</style>
