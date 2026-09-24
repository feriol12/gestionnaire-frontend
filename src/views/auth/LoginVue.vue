<template>
  <AuthShell variant="login">
    <template #topbar>
      <span class="auth-topbar-note auth-desktop-only">Espace sécurisé</span>
    </template>

    <template #hero>
      <AuthMobileHero variant="login" />
    </template>

    <template #visual>
      <AuthLoginVisual />
    </template>

    <div class="auth-intro">
      <p class="auth-badge auth-desktop-only">Connexion à votre espace</p>
      <h1 class="auth-title">Bon retour <span aria-hidden="true">👋</span></h1>
      <p class="auth-subtitle auth-desktop-only">
        Renseignez vos identifiants pour accéder à vos dépenses et à votre budget mensuel.
      </p>
      <p class="auth-subtitle auth-mobile-only">
        Connectez-vous pour retrouver vos budgets et transactions du mois.
      </p>
    </div>

    <form class="auth-form" @submit.prevent="handleLogin">
      <AuthField
        id="login-email"
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
        id="login-password"
        v-model="form.password"
        name="password"
        :type="showPassword ? 'text' : 'password'"
        label="Mot de passe"
        autocomplete="current-password"
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

      <div v-if="errorMessage" class="auth-error" role="alert">
        {{ errorMessage }}
      </div>

      <div class="auth-cta-wrap">
        <AppButton
          text="Se connecter"
          type="submit"
          variant="primary"
          :loading="loading"
          fullWidth
          class="auth-cta"
        >
          <span>Se connecter</span>
          <ArrowRight class="auth-cta-arrow" aria-hidden="true" />
        </AppButton>
      </div>
    </form>

    <div class="auth-switch">
      <p>
        Pas encore de compte ?
        <router-link to="/register" class="auth-link">Créer un compte</router-link>
      </p>
    </div>

    <p class="auth-security">
      <ShieldCheck class="auth-security-icon" aria-hidden="true" />
      <span class="auth-desktop-only">Espace personnel sécurisé • Gestion en FCFA</span>
      <span class="auth-mobile-only">Espace personnel sécurisé • Devises en FCFA</span>
    </p>

    <template #footer>
      <span class="auth-desktop-only">© 2026 MONEVA</span>
      <span class="auth-mobile-only">MONEVA • Gestion sereine de vos dépenses personnelles</span>
    </template>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { Eye, EyeOff, AtSign, Lock, ArrowRight, ShieldCheck } from 'lucide-vue-next'
import AuthShell from '@/components/auth/AuthShell.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthMobileHero from '@/components/auth/AuthMobileHero.vue'
import AuthLoginVisual from '@/components/auth/AuthLoginVisual.vue'
import AppButton from '@/components/common/AppButton.vue'

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
/* Stitch Login Desktop 56a14bfa… (>= 1024px) / Login Mobile a4dd4c94… (< 1024px). */
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

/* ---------- intro ---------- */
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

/* ---------- form ---------- */
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

/* ---------- switch link / security ---------- */
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

/* ================= DESKTOP ================= */
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

  .auth-cta.btn:active:not(:disabled) {
    transform: scale(0.99);
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
