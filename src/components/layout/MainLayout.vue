<!-- src/components/layout/MainLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <main class="pt-4 pb-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/common/Navbar.vue';
</script>