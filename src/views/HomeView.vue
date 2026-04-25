<template>
  <div class="min-h-screen bg-slate-50 from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="text-center">
      <!-- Image/Logo rond -->
      <div class="flex justify-center mb-6">
        <div class="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden">
          <img 
            src="@/assets/logo.svg" 
            alt="Logo" 
            class="w-16 h-16 object-contain"
          />
        </div>
      </div>
      
      <!-- H1: Nom de l'app -->
      <h1 class="font-inter text-[38px] leading-snug font-bold text-gray-800 mb-8">
        MonApp
      </h1>
      
      <!-- H2: Section principale -->
      <h2 class="font-inter text-[22px] leading-normal font-semibold text-gray-700 mb-3">
        Bienvenue sur notre plateforme
      </h2>
      
      <!-- H3: Sous-section -->
      <h3 class="font-inter text-[18px] leading-normal font-semibold text-gray-600 mb-8">
        Découvrez une expérience unique
      </h3>
      
      <!-- Bouton Commencer -->
      <button 
        @click="handleStart"
        class="px-8 py-3 bg-blue-600 leading-normal text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-inter text-base font-medium"
      >
        Commencer
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleStart = () => {
  console.log('Commencer cliqué !')
  router.push('/register')
}
</script>