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
      <h1 class="auth-title">Mot de passe oublié ?</h1>
      <p class="auth-subtitle">
        Indiquez votre adresse email. Si elle correspond à un compte, vous recevrez un lien
        pour choisir un nouveau mot de passe.
      </p>
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <AuthField
        id="forgot-email"
        v-model="email"
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

      <div v-if="successMessage" class="auth-success" role="status">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="auth-error" role="alert">
        {{ errorMessage }}
      </div>

      <div class="auth-cta-wrap">
        <AppButton
          type="submit"
          variant="primary"
          :loading="loading"
          fullWidth
          class="auth-cta"
        >
          <span>Envoyer le lien</span>
          <ArrowRight class="auth-cta-arrow" aria-hidden="true" />
        </AppButton>
      </div>
    </form>

    <div class="auth-switch">
      <p>
        Vous vous en souvenez ?
        <router-link to="/login" class="auth-link">Retour à la connexion</router-link>
      </p>
    </div>

    <p class="auth-security">
      <ShieldCheck class="auth-security-icon" aria-hidden="true" />
      <span>Espace personnel sécurisé • Gestion en FCFA</span>
    </p>

    <template #footer>
      <span class="auth-desktop-only">© 2026 FluxMoneva</span>
      <span class="auth-mobile-only">FluxMoneva • Gestion sereine de vos dépenses personnelles</span>
    </template>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue'
import { AtSign, ArrowRight, ShieldCheck } from 'lucide-vue-next'
import AuthShell from '@/components/auth/AuthShell.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthLoginVisual from '@/components/auth/AuthLoginVisual.vue'
import AppButton from '@/components/common/AppButton.vue'
import { authApi } from '@/services/apiAuth'
import { describeAuthError } from '@/stores/useAuthStore'

// AUTH3-03 : la réponse est neutre (identique que le compte existe ou non).
// Ce flux public ne touche pas à l'état d'authentification.
const NEUTRAL_MESSAGE = "Si cette adresse correspond à un compte, un lien de réinitialisation vient d'être envoyé."

const email = ref('')
const errors = ref({})
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  // Pas de seconde demande tant que la première n'est pas terminée.
  if (loading.value) return

  errors.value = {}
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    // Sans cookie CSRF, la demande n'est pas envoyée.
    await authApi.csrfCookie()
    await authApi.forgotPassword(email.value)
    successMessage.value = NEUTRAL_MESSAGE
  } catch (error) {
    const result = describeAuthError(error, 'forgot')
    errors.value = result.errors ?? {}
    errorMessage.value = result.message
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
  margin-left: 4px;
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
