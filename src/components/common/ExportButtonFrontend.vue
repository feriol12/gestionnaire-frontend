<template>
  <AppButton
    variant="success"
    :loading="loading"
    @click="exportToPDF"
  >
    <template #default>
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Exporter 
    </template>
  </AppButton>
</template>

<script setup>
import { ref } from 'vue';
import AppButton from './AppButton.vue';

const props = defineProps({
  tableId: {
    type: String,
    default: 'expenses-table'
  },
  title: {
    type: String,
    default: 'Mes dépenses'
  },
  period: {
    type: String,
    default: 'month'
  },
  periodLabel: {
    type: String,
    default: 'Ce mois'
  },
  allExpenses: {
    type: Array,
    default: () => []
  }
});

const loading = ref(false);

const getFileName = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  
  const periodMap = {
    'today': 'jour',
    'week': 'semaine',
    'month': 'mois',
    'year': 'annee'
  };
  
  const periodName = periodMap[props.period] || 'depenses';
  return `depenses_${periodName}_${dateStr}.pdf`;
};

const exportToPDF = async () => {
  loading.value = true;
  
  const categoriesIcon = {
    'Nourriture': '🍔',
    'Transport': '🚕',
    'Factures': '💡',
    'Loisirs': '🎮',
    'Imprévu': '⚠️'
  };
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };
  
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  };
  
  // Générer les lignes du tableau SANS la colonne Actions
  let rows = '';
  let total = 0;
  
  props.allExpenses.forEach(expense => {
    total += parseFloat(expense.amount) || 0;
    rows += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(expense.date)}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${expense.description}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${categoriesIcon[expense.category] || '📌'} ${expense.category}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAmount(expense.amount)}</td>
      </tr>
    `;
  });
  
  const tableHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Catégorie</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="background-color: #f5f5f5; font-weight: bold;">
          <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total :</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAmount(total)}</td>
        </tr>
      </tfoot>
    </table>
  `;
  
  // Nom suggéré pour le fichier (passé dans le titre de la page)
  const suggestedFileName = getFileName();
  
  // Créer une fenêtre d'impression
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${suggestedFileName}</title>
      <meta charset="UTF-8">
      <style>
        body {
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .print-header h1 {
          font-size: 24px;
          margin: 0;
        }
        .print-header p {
          font-size: 12px;
          color: #666;
          margin: 5px 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>${props.title}</h1>
        <p>Période : ${props.periodLabel}</p>
        <p>Exporté le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <p>Nombre de dépenses : ${props.allExpenses.length}</p>
      </div>
      ${tableHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 500);
  };
  
  loading.value = false;
};
</script>