<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow p-8 text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        Dashboard
      </h1>
      <p class="text-gray-600">
        Bienvenue sur votre tableau de bord
      </p>
      <p class="text-gray-500 mt-4 text-sm">
        La navbar est visible en haut de la page
      </p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
</script>