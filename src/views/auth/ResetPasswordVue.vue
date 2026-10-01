<template>
  <AuthShell variant="login">
    <template #topbar>
      <span class="auth-topbar-note auth-desktop-only">Espace sécurisé</span>
    </template>

    <template #visual>
      <AuthLoginVisual />
    </template>

    <div class="auth-intro">
      <p class="auth-badge auth-desktop-only">Récupération du compte</p>
      <h1 class="auth-title">Nouveau mot de passe</h1>
      <p class="auth-subtitle">
        Choisissez un nouveau mot de passe pour votre compte (8 caractères minimum).
      </p>
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <AuthField
        id="reset-email"
        v-model="form.email"
        name="email"
        type="email"
        label="Adresse email"
        autocomplete="email"
        placeholder="votre.nom@exemple.com"
        required
        :error="errors.email"
        tone="login"
      >
        <template #icon><AtSign /></template>
      </AuthField>

      <AuthField
        id="reset-password"
        v-model="form.password"
        name="password"
        :type="showPassword ? 'text' : 'password'"
        label="Nouveau mot de passe"
        autocomplete="new-password"
        placeholder="••••••••••••"
        required
        :error="errors.password"
        tone="login"
      >
        <template #icon><Lock /></template>
        <template #action>
          <button
            type="button"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
          >
            <component :is="showPassword ? EyeOff : Eye" aria-hidden="true" />
          </button>
        </template>
      </AuthField>

      <AuthField
        id="reset-password-confirmation"
        v-model="form.password_confirmation"
        name="password_confirmation"
        :type="showPassword ? 'text' : 'password'"
        label="Confirmer le mot de passe"
        autocomplete="new-password"
        placeholder="••••••••••••"
        required
        :error="errors.password_confirmation"
        tone="login"
      >
        <template #icon><Lock /></template>
      </AuthField>

      <div v-if="successMessage" class="auth-success" role="status">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="auth-error" role="alert">
        {{ errorMessage }}
        <router-link v-if="linkInvalid" to="/forgot-password" class="auth-inline-link">
          Demander un nouveau lien
        </router-link>
      </div>

      <div class="auth-cta-wrap">
        <AppButton
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="succeeded"
          fullWidth
          class="auth-cta"
        >
          <span>Réinitialiser le mot de passe</span>
          <ArrowRight class="auth-cta-arrow" aria-hidden="true" />
        </AppButton>
      </div>
    </form>

    <div class="auth-switch">
      <p>
        <router-link to="/login" class="auth-link">Retour à la connexion</router-link>
      </p>
    </div>

    <p class="auth-security">
      <ShieldCheck class="auth-security-icon" aria-hidden="true" />
      <span>Espace personnel sécurisé • Gestion en FCFA</span>
    </p>

    <template #footer>
      <span class="auth-desktop-only">© 2026 MONEVA</span>
      <span class="auth-mobile-only">MONEVA • Gestion sereine de vos dépenses personnelles</span>
    </template>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AtSign, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-vue-next'
import AuthShell from '@/components/auth/AuthShell.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthLoginVisual from '@/components/auth/AuthLoginVisual.vue'
import AppButton from '@/components/common/AppButton.vue'
import { authApi } from '@/services/apiAuth'
import { describeAuthError, useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

const INVALID_LINK = 'Ce lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { success } = useToast()

// AUTH3-03 : le jeton du lien reste uniquement en mémoire (jamais stocké) et
// est retiré de la barre d'adresse / de l'historique dès la lecture.
const token = typeof route.query.token === 'string' ? route.query.token : ''
const form = ref({
  email: typeof route.query.email === 'string' ? route.query.email : '',
  password: '',
  password_confirmation: '',
})
if (route.query.token || route.query.email) {
  router.replace({ path: route.path })
}

const errors = ref({})
const errorMessage = ref(token ? '' : INVALID_LINK)
const linkInvalid = ref(!token)
const successMessage = ref('')
const succeeded = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const handleSubmit = async () => {
  // Pas de seconde soumission pendant une réinitialisation en cours / réussie.
  if (loading.value || succeeded.value) return

  errors.value = {}
  errorMessage.value = ''
  linkInvalid.value = false

  if (!token) {
    errorMessage.value = INVALID_LINK
    linkInvalid.value = true
    return
  }
  if (form.value.password !== form.value.password_confirmation) {
    errors.value = { password_confirmation: 'Les mots de passe ne correspondent pas' }
    return
  }

  loading.value = true

  try {
    // Sans cookie CSRF, la réinitialisation n'est pas envoyée.
    await authApi.csrfCookie()
    const response = await authApi.resetPassword({ token, ...form.value })

    succeeded.value = true
    successMessage.value = response.data?.message || 'Votre mot de passe a été réinitialisé.'
    form.value.password = ''
    form.value.password_confirmation = ''

    // Pas de connexion automatique. Une éventuelle session ouverte dans ce
    // navigateur est déjà invalidée côté serveur (changement de mot de passe).
    if (authStore.isAuthenticated) authStore.clearSession()

    success('Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.', {
      title: 'Mot de passe réinitialisé',
      duration: 5000,
    })
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    const result = describeAuthError(error, 'reset')
    const tokenError = result.errors?.token
    if (tokenError) {
      // Lien invalide, expiré, déjà utilisé ou ne correspondant pas à l'adresse.
      errorMessage.value = INVALID_LINK
      linkInvalid.value = true
    } else {
      errors.value = result.errors ?? {}
      errorMessage.value = result.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Même présentation que la page de connexion (Stitch Login). */
@media (max-width: 1023.98px) {
  .auth-desktop-only {
    display: none !important;
  }
}

@media (min-width: 1024px) {
  .auth-mobile-only {
    display: none !important;
  }
}

.auth-topbar-note {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #94a3b8;
}

.auth-intro {
  margin-bottom: 20px;
}

.auth-badge {
  display: inline-flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  background-color: #eff6ff;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #1d4ed8;
}

.auth-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0b1120;
}

.auth-subtitle {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.625;
  color: #64748b;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-error {
  padding: 8px 16px;
  border: 1px solid var(--color-expense);
  border-radius: 12px;
  background-color: var(--color-expense-bg);
  font-size: 12px;
  line-height: 18px;
  color: var(--color-ink);
}

.auth-inline-link {
  display: block;
  margin-top: 4px;
  font-weight: 700;
  color: #2563eb;
  text-decoration: underline;
}

.auth-success {
  padding: 8px 16px;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  background-color: #ecfdf5;
  font-size: 12px;
  line-height: 18px;
  color: #065f46;
}

.auth-cta-wrap {
  padding-top: 8px;
}

.auth-cta.btn {
  height: 48px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.25), 0 4px 6px -4px rgba(37, 99, 235, 0.25);
  transition: background-color 150ms, box-shadow 150ms, transform 150ms;
}

.auth-cta.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.auth-cta-arrow {
  width: 16px;
  height: 16px;
  transition: transform 150ms;
}

.auth-cta.btn:hover:not(:disabled) .auth-cta-arrow {
  transform: translateX(2px);
}

.auth-switch {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  text-align: center;
  font-size: 12px;
  line-height: 16px;
  color: #475569;
}

.auth-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-weight: 700;
  color: #2563eb;
  text-decoration: underline;
  text-decoration-color: #bfdbfe;
  text-underline-offset: 2px;
  vertical-align: middle;
}

.auth-link:hover {
  color: #1d4ed8;
}

.auth-security {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 11px;
  line-height: 16px;
  color: #94a3b8;
}

.auth-security-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #10b981;
}

@media (min-width: 1024px) {
  .auth-intro {
    margin-bottom: 32px;
  }

  .auth-title {
    font-size: 30px;
    line-height: 36px;
    color: #0f172a;
  }

  .auth-subtitle {
    margin-top: 8px;
    font-size: 14px;
  }

  .auth-form {
    gap: 20px;
  }

  .auth-cta-wrap {
    padding-top: 0;
  }

  .auth-cta.btn {
    font-weight: 600;
  }

  .auth-switch {
    margin-top: 32px;
    padding-top: 24px;
    border-top-color: #f1f5f9;
    font-size: 14px;
    line-height: 20px;
  }

  .auth-link {
    font-weight: 600;
    text-decoration: none;
    text-underline-offset: 4px;
  }

  .auth-link:hover {
    text-decoration: underline;
  }

  .auth-security {
    margin-top: 24px;
    font-weight: 500;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-cta.btn,
  .auth-cta-arrow {
    transition: none;
  }

  .auth-cta.btn:active:not(:disabled),
  .auth-cta.btn:hover:not(:disabled) .auth-cta-arrow {
    transform: none;
  }
}
</style>
