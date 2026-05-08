<!-- <script setup>
import { RouterLink, RouterView } from 'vue-router'
</script> -->

<template>
  

  <RouterView />
   <AppToast ref="toastComponent" />

</template>


<script setup>
import { RouterView, RouterLink } from 'vue-router'
import AppToast from '@/components/common/AppToast.vue'
import { registerToast } from '@/composables/useToast'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const toastComponent = ref(null)
const authStore = useAuthStore()

// Enregistrer l'instance du toast quand le composant est monté
onMounted(() => {
   console.log('Toast component:', toastComponent.value) // Debug

    // Charge l'utilisateur si un token existe
  if (authStore.token) {
    authStore.fetchUser()
  }
  if (toastComponent.value) {
    registerToast(toastComponent.value)
     console.log('Toast enregistré avec succès ✅')
  } else {
    console.error('Toast non trouvé ❌')
  }
})
</script>
<!-- <style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style> -->
