<template>
  <AuthShell tagline="Gérez vos finances simplement">
    <AppCard hoverable>
      <div class="auth-heading-block">
        <h1 class="auth-heading">Connexion</h1>
        <p class="auth-subheading">Connectez-vous à votre compte</p>
      </div>

      <form @submit.prevent="handleLogin">
        <AppInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="ex: jean@exemple.com"
          required
          :error="errors.email"
        />

        <div class="auth-password-field">
          <AppInput
            v-model="form.password"
            label="Mot de passe"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
            :error="errors.password"
          />

          <button
            type="button"
            @click="showPassword = !showPassword"
            class="auth-password-toggle"
            :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
          >
            <component :is="showPassword ? EyeOff : Eye" class="auth-password-toggle-icon" aria-hidden="true" />
          </button>
        </div>

        <div v-if="errorMessage" class="auth-error" role="alert">
          {{ errorMessage }}
        </div>

        <AppButton
          text="Se connecter"
          type="submit"
          variant="primary"
          :loading="loading"
          fullWidth
        />

        <p class="auth-footer-link">
          Pas encore de compte ?
          <router-link to="/register" class="auth-link">S'inscrire</router-link>
        </p>
      </form>
    </AppCard>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { Eye, EyeOff } from 'lucide-vue-next'
import AuthShell from '@/components/auth/AuthShell.vue'
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

<style scoped>
.auth-heading-block {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.auth-heading {
  font-size: var(--text-headline-lg);
  line-height: var(--text-headline-lg--line-height);
  font-weight: var(--text-headline-lg--font-weight);
  color: var(--color-ink);
}

.auth-subheading {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-md);
  color: var(--color-text-muted);
}

.auth-password-field {
  position: relative;
}

.auth-password-toggle {
  position: absolute;
  right: 2px;
  top: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--color-text-muted-light);
  border-radius: var(--radius-moneva-sm);
  cursor: pointer;
}

.auth-password-toggle:hover {
  color: var(--color-text-muted);
}

.auth-password-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.auth-password-toggle-icon {
  width: 18px;
  height: 18px;
}

.auth-error {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-expense-bg);
  border: 1px solid var(--color-expense);
  color: var(--color-ink);
  border-radius: var(--radius-moneva);
  font-size: var(--text-body-sm);
}

.auth-footer-link {
  text-align: center;
  margin-top: var(--spacing-lg);
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
}

.auth-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 4px;
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  vertical-align: middle;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
