<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <AppCard title="Inscription" subtitle="Créez votre compte" hoverable>
        <form @submit.prevent="handleSubmit">
          <AppInput
            v-model="form.name"
            label="Nom complet"
            type="text"
            placeholder="ex: Jean Dupont"
            required
            :error="errors.name"
          />
          
          <AppInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="ex: jean@exemple.com"
            required
            :error="errors.email"
          />
          
          <AppInput
            v-model="form.password"
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            required
            :error="errors.password"
            hint="Au moins 8 caractères"
          />
          
          <AppInput
            v-model="form.password_confirmation"
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            required
          />
          
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {{ errorMessage }}
          </div>
          
          <AppButton
            text="S'inscrire"
            type="submit"
            variant="primary"
            :loading="loading"
            fullWidth
          />
          
          <p class="text-center mt-6 text-sm text-slate-600">
            Déjà un compte ?
            <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium no-underline hover:underline">
              Se connecter
            </router-link>
          </p>
        </form>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/composables/useToast';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';

const router = useRouter();
const authStore = useAuthStore();
const { success, error } = useToast(); // 👈 Récupère seulement ce dont tu as besoin

// Référence vers le toast (sera injectée depuis le parent)
const toast = ref(null);

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const errors = ref({});
const errorMessage = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  // Reset errors
  errors.value = {};
  errorMessage.value = '';
  
  // Vérification password confirmation
  if (form.value.password !== form.value.password_confirmation) {
    errors.value.password = 'Les mots de passe ne correspondent pas';
    return;
  }
  
  loading.value = true;
  
  const result = await authStore.register(form.value);
  
   if (result.success) {
    // Afficher le toast de succès
    success('Compte créé avec succès !', {
      title: 'Félicitations 🎉',
      duration: 5000
    });
    
    // Rediriger après 2 secondes
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } else {
    if (result.errors) {
      errors.value = result.errors;
    } else {
      errorMessage.value = result.message;
      // Afficher un toast d'erreur
      error(result.message || 'Erreur lors de l\'inscription');
    }
  }
  
  loading.value = false;
};
</script>
<!-- <script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppToast from '@/components/common/AppToast.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const errors = ref({});
const errorMessage = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  // Reset errors
  errors.value = {};
  errorMessage.value = '';
  
  // Vérification password confirmation
  if (form.value.password !== form.value.password_confirmation) {
    errors.value.password = 'Les mots de passe ne correspondent pas';
    return;
  }
  
  loading.value = true;
  
  const result = await authStore.register(form.value);
  
  if (result.success) {
    router.push('/login');
  } else {
    if (result.errors) {
      errors.value = result.errors;
    } else {
      errorMessage.value = result.message;
    }
  }
  
  loading.value = false;
};
</script> -->