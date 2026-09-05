<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <p class="text-sm font-medium text-slate-500 tracking-wide uppercase mb-1">Bienvenue</p>
        <h1 class="brand-title text-4xl mb-2">MONEVA</h1>
        <p class="text-slate-500 text-sm">Gérez vos finances simplement</p>
      </div>
      <AppCard title="Connexion" subtitle="Connectez-vous à votre compte" hoverable>
        <form @submit.prevent="handleLogin">
          <AppInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="ex: jean@exemple.com"
            required
            :error="errors.email"
          />
        
          <div class="relative">
            <AppInput
              v-model="form.password"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              :error="errors.password"
            />

            <!-- bouton œil -->
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
            >
              <span v-if="showPassword">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>

          <div
            v-if="errorMessage"
            class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
          >
            {{ errorMessage }}
          </div>

          <AppButton
            text="Se connecter"
            type="submit"
            variant="primary"
            :loading="loading"
            fullWidth
          />

          <p class="text-center mt-6 text-sm text-slate-600">
            Pas encore de compte ?
            <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-medium">
              S'inscrire
            </router-link>
          </p>
        </form>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})

const errors = ref({})
const errorMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  errors.value = {}
  errorMessage.value = ''
  loading.value = true

  const result = await authStore.login(form.value)

  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.message
  }

  loading.value = false
}
</script>
