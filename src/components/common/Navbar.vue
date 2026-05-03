<!-- src/components/common/Navbar.vue -->
<template>
  <!-- Enlève le max-w-7xl et mx-auto ici -->
  <nav class="bg-white shadow-lg fixed top-0 w-full z-50">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        
        <!-- Logo à GAUCHE -->
        <div class="flex items-center">
          <router-link to="/dashboard" class="flex items-center space-x-2">
            <span class="text-2xl">💰</span>
            <span class="font-bold text-gray-800 text-xl hidden sm:block">Dépenses</span>
          </router-link>
          
          <!-- Navigation desktop -->
          <div class="hidden md:flex ml-8 space-x-4">
            <router-link 
              to="/dashboard" 
              class="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              :class="{ 'text-green-600 border-b-2 border-green-600': $route.path === '/dashboard' }"
            >
              📊 Tableau de bord
            </router-link>
          </div>
        </div>
        
        <!-- Section DROITE - tout à droite -->
        <div class="flex items-center space-x-4">
          <div v-if="authStore.isAuthenticated" class="relative">
            <button @click="toggleDropdown" class="flex items-center space-x-2 focus:outline-none">
              <div class="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                {{ userInitial }}
              </div>
              <span class="hidden sm:block text-gray-700">{{ authStore.userName }}</span>
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                🚪 Déconnexion
              </button>
            </div>
          </div>
          
          <div v-else class="flex items-center space-x-3">
            <router-link to="/login" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
              Connexion
            </router-link>
            <router-link to="/register" class="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition">
              Inscription
            </router-link>
          </div>
          
          <button 
            @click="toggleMobileMenu" 
            class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg v-if="!isMobileMenuOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Menu mobile (inchangé) -->
    <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-t shadow-lg">
      <div class="px-4 pt-2 pb-3 space-y-1">
        <router-link 
          to="/dashboard" 
          class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
          :class="{ 'bg-green-50 text-green-600': $route.path === '/dashboard' }"
          @click="closeMobileMenu"
        >
          📊 Tableau de bord
        </router-link>
        
        <div v-if="!authStore.isAuthenticated" class="pt-4 border-t">
          <router-link to="/login" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition" @click="closeMobileMenu">
            🔑 Connexion
          </router-link>
          <router-link to="/register" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition" @click="closeMobileMenu">
            📝 Inscription
          </router-link>
        </div>
        
        <div v-if="authStore.isAuthenticated" class="pt-4 border-t">
          <button @click="handleLogoutMobile" class="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50 rounded-md transition">
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </div>
  </nav>
  
  <div class="h-16"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

// Pour déboguer, ajoute ceci
console.log('État de authStore:', {
  isAuthenticated: authStore.isAuthenticated,
  user: authStore.user,
  token: authStore.token
});

const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);

const userInitial = computed(() => {
  return authStore.user.name ? authStore.user.name.charAt(0).toUpperCase() : '?';
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

const handleLogout = async () => {
  await authStore.logout();
  isDropdownOpen.value = false;
  router.push('/login');
};

const handleLogoutMobile = async () => {
  await authStore.logout();
  closeMobileMenu();
  router.push('/login');
};

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.relative');
  if (dropdown && !dropdown.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.body.style.overflow = '';
});
</script>