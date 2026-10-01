<!-- src/components/common/ExportButton.vue -->
<template>
  <AppButton
    variant="success"
    :loading="loading"
    :disabled="loading"
    @click="handleExport"
  >
    📄 Exporter 
  </AppButton>
</template>

<script setup>
import { ref } from 'vue';
import apiClient from '@/services/apiClient';
import { currentPrivateGeneration, isStaleGeneration } from '@/stores/privateState';
import AppButton from './AppButton.vue';

const props = defineProps({
  period: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['export-start', 'export-end']);

const loading = ref(false);

const handleExport = async () => {
  // AUTH3-06 : un PDF demandé sous une identité précédente n'est jamais téléchargé.
  const generation = currentPrivateGeneration();
  loading.value = true;
  emit('export-start');

  try {
    const response = await apiClient.get('/export/pdf', {
      params: { period: props.period },
      responseType: 'blob',
    });
    if (isStaleGeneration(generation)) return;

    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `depenses_${props.period}.pdf`;
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