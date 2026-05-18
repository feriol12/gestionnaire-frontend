<!-- src/components/common/ExportButton.vue -->
<template>
  <AppButton
    variant="success"
    :loading="loading"
    :disabled="loading"
    @click="handleExport"
  >
    📄 Exporter PDF
  </AppButton>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
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
  loading.value = true;
  emit('export-start');
  
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/export/budgets/pdf', {
      params: { period: props.period },
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` }
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