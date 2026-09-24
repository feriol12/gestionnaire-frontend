<template>
  <AuthShell variant="register">
    <template #topbar>
      <span class="auth-topbar-pill auth-desktop-only">
        <Lock class="auth-topbar-pill-icon" aria-hidden="true" />
        Espace sécurisé
      </span>
      <span class="auth-topbar-tag auth-mobile-only">Inscription</span>
    </template>

    <template #hero>
      <AuthMobileHero variant="register" />
    </template>

    <template #visual>
      <AuthRegisterVisual />
    </template>

    <div class="auth-intro">
      <p class="auth-badge">
        <ShieldUser class="auth-badge-icon auth-mobile-only" aria-hidden="true" />
        Créer votre espace
      </p>
      <h1 class="auth-title">Bienvenue chez MONEVA <span aria-hidden="true">👋</span></h1>
      <p class="auth-subtitle auth-desktop-only">
        Quelques informations suffisent pour commencer à mieux suivre vos dépenses et votre budget.
      </p>
      <p class="auth-subtitle auth-mobile-only">
        Quelques informations suffisent pour commencer à mieux suivre vos dépenses.
      </p>
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <AuthField
        id="register-name"
        v-model="form.name"
        name="name"
        type="text"
        label="Nom"
        autocomplete="name"
        placeholder="Votre nom"
        required
        :error="errors.name"
        tone="register"
      >
        <template #icon><User /></template>
      </AuthField>

      <AuthField
        id="register-email"
        v-model="form.email"
        name="email"
        type="email"
        label="Adresse email"
        autocomplete="email"
        placeholder="votre.nom@exemple.com"
        required
        :error="errors.email"
        tone="register"
      >
        <template #icon><AtSign /></template>
      </AuthField>

      <AuthField
        id="register-password"
        v-model="form.password"
        name="password"
        :type="showPassword ? 'text' : 'password'"
        label="Mot de passe"
        autocomplete="new-password"
        placeholder="Votre mot de passe"
        required
        :error="errors.password"
        tone="register"
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
        <template #hint>
          <Info class="auth-mobile-only" aria-hidden="true" />
          8 caractères minimum
        </template>
      </AuthField>

      <AuthField
        id="register-password-confirmation"
        v-model="form.password_confirmation"
        name="password_confirmation"
        :type="showConfirm ? 'text' : 'password'"
        label="Confirmer le mot de passe"
        autocomplete="new-password"
        placeholder="Confirmez votre mot de passe"
        required
        tone="register"
      >
        <template #icon>
          <Lock class="auth-desktop-only" />
          <RotateCcwKey class="auth-mobile-only" />
        </template>
        <template #action>
          <button
            type="button"
            @click="showConfirm = !showConfirm"
            :aria-label="showConfirm ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'"
          >
            <component :is="showConfirm ? EyeOff : Eye" aria-hidden="true" />
          </button>
        </template>
      </AuthField>

      <div v-if="errorMessage" class="auth-error" role="alert">
        {{ errorMessage }}
      </div>

      <div class="auth-cta-wrap">
        <AppButton
          text="Créer mon compte"
          type="submit"
          variant="primary"
          :loading="loading"
          fullWidth
          class="auth-cta"
        >
          <span>Créer mon compte</span>
          <ArrowRight class="auth-cta-arrow" aria-hidden="true" />
        </AppButton>
      </div>
    </form>

    <p class="auth-switch">
      Vous avez déjà un compte ?
      <router-link to="/login" class="auth-link">Se connecter</router-link>
    </p>

    <p class="auth-security-pill auth-mobile-only">
      <ShieldCheck class="auth-security-icon" aria-hidden="true" />
      <span>Espace personnel sécurisé • Gestion en FCFA</span>
    </p>

    <template #footer>
      <p class="auth-footer-security auth-desktop-only">Espace personnel sécurisé • Gestion en FCFA</p>
      <p class="auth-footer-tagline auth-mobile-only">MONEVA • Gestion sereine de vos dépenses personnelles</p>
      <p class="auth-footer-copy">© 2026 MONEVA</p>
    </template>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/composables/useToast';
import { Eye, EyeOff, User, AtSign, Lock, RotateCcwKey, Info, ArrowRight, ShieldCheck, ShieldUser } from 'lucide-vue-next';
import AuthShell from '@/components/auth/AuthShell.vue';
import AuthField from '@/components/auth/AuthField.vue';
import AuthMobileHero from '@/components/auth/AuthMobileHero.vue';
import AuthRegisterVisual from '@/components/auth/AuthRegisterVisual.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const { success, error } = useToast();

const showPassword = ref(false)
// Presentation-only: visibility of the confirmation field (no effect on value/validation/payload).
const showConfirm = ref(false)

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

<style scoped>
/* Stitch Register Desktop b87bb90c… (>= 1024px) / Register Mobile da569c36… (< 1024px). */
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

/* ---------- topbar ---------- */
.auth-topbar-tag {
  padding: 4px 10px;
  border-radius: 9999px;
  background-color: #dce9ff;
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #565e74;
}

.auth-topbar-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  background-color: #e5eeff;
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #434655;
}

.auth-topbar-pill-icon {
  width: 16px;
  height: 16px;
  color: #006242;
}

/* ---------- intro ---------- */
.auth-intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 16px;
}

.auth-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 4px 12px;
  border-radius: 9999px;
  background-color: #dce9ff;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #004ac6;
}

.auth-badge-icon {
  width: 14px;
  height: 14px;
}

.auth-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0b1c30;
}

.auth-subtitle {
  margin-top: 4px;
  font-size: 14px;
  line-height: 20px;
  color: #565e74;
}

/* ---------- form ---------- */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  padding: 0 16px;
  border-radius: 12px;
  background-color: #2563eb;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 6px -1px rgba(0, 74, 198, 0.2), 0 2px 4px -2px rgba(0, 74, 198, 0.2);
  transition: background-color 200ms, transform 150ms;
}

.auth-cta.btn:active:not(:disabled) {
  transform: scale(0.99);
}

.auth-cta-arrow {
  width: 20px;
  height: 20px;
  transition: transform 200ms;
}

/* ---------- switch / security ---------- */
.auth-switch {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: #565e74;
}

.auth-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-left: 4px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #2563eb;
  text-decoration: none;
  vertical-align: middle;
}

.auth-link:hover {
  text-decoration: underline;
}

.auth-security-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding: 10px 16px;
  border-radius: 12px;
  background-color: rgba(239, 244, 255, 0.6);
  text-align: center;
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #565e74;
}

.auth-security-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #006242;
}

/* ================= DESKTOP ================= */
@media (min-width: 1024px) {
  .auth-intro {
    display: block;
    margin-bottom: 32px;
  }

  .auth-badge {
    margin-bottom: 12px;
    background-color: #dae2fd;
  }

  .auth-title {
    margin-bottom: 8px;
    font-size: 30px;
    line-height: 36px;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #0f172a;
  }

  .auth-subtitle {
    margin-top: 0;
  }

  .auth-form {
    gap: 16px;
  }

  .auth-cta.btn {
    font-weight: 600;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .auth-cta.btn:active:not(:disabled) {
    transform: none;
  }

  .auth-cta-arrow {
    width: 18px;
    height: 18px;
  }

  .auth-cta.btn:hover:not(:disabled) .auth-cta-arrow {
    transform: translateX(2px);
  }

  .auth-switch {
    margin-top: 24px;
  }

  .auth-footer-security {
    font-size: 11px;
    line-height: 14px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #565e74;
  }

  .auth-footer-copy {
    font-size: 12px;
    line-height: 18px;
    font-weight: 400;
    color: #737686;
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
