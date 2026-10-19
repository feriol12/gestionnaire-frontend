<template>
  <div class="account-page">
    <header class="account-header">
      <h1 class="account-title">Sécurité du compte</h1>
      <p class="account-subtitle">Modifiez le mot de passe de votre compte FluxMoneva.</p>
    </header>

    <section class="account-card" aria-labelledby="account-password-heading">
      <div class="account-card-heading">
        <span class="account-card-icon" aria-hidden="true"><KeyRound /></span>
        <div>
          <h2 id="account-password-heading" class="account-card-title">Changer le mot de passe</h2>
          <p class="account-card-text">
            Vous restez connecté sur cet appareil ; vos autres sessions ouvertes seront fermées.
          </p>
        </div>
      </div>

      <form class="account-form" @submit.prevent="handleSubmit">
        <AuthField
          id="current-password"
          v-model="form.current_password"
          name="current_password"
          :type="showPasswords ? 'text' : 'password'"
          label="Mot de passe actuel"
          autocomplete="current-password"
          required
          :error="errors.current_password"
          tone="login"
        >
          <template #icon><Lock /></template>
          <template #action>
            <button
              type="button"
              @click="showPasswords = !showPasswords"
              :aria-label="showPasswords ? 'Masquer les mots de passe' : 'Afficher les mots de passe'"
            >
              <component :is="showPasswords ? EyeOff : Eye" aria-hidden="true" />
            </button>
          </template>
        </AuthField>

        <AuthField
          id="new-password"
          v-model="form.password"
          name="password"
          :type="showPasswords ? 'text' : 'password'"
          label="Nouveau mot de passe"
          autocomplete="new-password"
          hint="8 caractères minimum."
          required
          :error="errors.password"
          tone="login"
        >
          <template #icon><Lock /></template>
        </AuthField>

        <AuthField
          id="new-password-confirmation"
          v-model="form.password_confirmation"
          name="password_confirmation"
          :type="showPasswords ? 'text' : 'password'"
          label="Confirmer le nouveau mot de passe"
          autocomplete="new-password"
          required
          :error="errors.password_confirmation"
          tone="login"
        >
          <template #icon><Lock /></template>
        </AuthField>

        <div v-if="successMessage" class="account-success" role="status">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="account-error" role="alert">
          {{ errorMessage }}
        </div>

        <div class="account-actions">
          <AppButton type="submit" variant="primary" :loading="loading">
            Mettre à jour le mot de passe
          </AppButton>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Eye, EyeOff, KeyRound, Lock } from 'lucide-vue-next'
import AuthField from '@/components/auth/AuthField.vue'
import AppButton from '@/components/common/AppButton.vue'
import { authApi } from '@/services/apiAuth'
import { describeAuthError } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

const { success } = useToast()

// AUTH3-05 : les mots de passe ne vivent que dans ce formulaire (jamais stockés),
// et sont effacés après un changement réussi.
const emptyForm = () => ({ current_password: '', password: '', password_confirmation: '' })
const form = ref(emptyForm())
const errors = ref({})
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)
const showPasswords = ref(false)

const handleSubmit = async () => {
  // Pas de seconde demande tant que la première n'est pas terminée.
  if (loading.value) return

  errors.value = {}
  errorMessage.value = ''
  successMessage.value = ''

  if (form.value.password !== form.value.password_confirmation) {
    errors.value = { password_confirmation: 'Les mots de passe ne correspondent pas' }
    return
  }

  loading.value = true

  try {
    // Jeton CSRF à jour avant la modification ; sans lui, rien n'est envoyé.
    await authApi.csrfCookie()
    const response = await authApi.changePassword({ ...form.value })

    // La session courante reste ouverte : aucun changement d'état d'authentification.
    form.value = emptyForm()
    successMessage.value = response.data?.message || 'Votre mot de passe a été mis à jour.'
    success('Vos autres sessions ont été fermées.', { title: 'Mot de passe mis à jour', duration: 5000 })
  } catch (error) {
    const result = describeAuthError(error, 'password')
    errors.value = result.errors ?? {}
    errorMessage.value = result.kind === 'validation' && result.errors?.current_password
      ? 'Le mot de passe actuel est incorrect.'
      : result.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.account-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 640px;
}

.account-title {
  font-size: var(--text-display-hero-mobile);
  line-height: var(--text-display-hero-mobile--line-height);
  font-weight: var(--text-display-hero-mobile--font-weight);
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.account-subtitle {
  margin-top: var(--spacing-xs);
  font-size: var(--text-body-md);
  line-height: var(--text-body-md--line-height);
  color: var(--color-text-muted);
}

.account-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-moneva);
  background-color: var(--color-surface);
}

.account-card-heading {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.account-card-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-moneva-sm);
  background-color: var(--color-border-soft);
  color: var(--color-primary);
}

.account-card-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.account-card-title {
  font-size: var(--text-body-md);
  font-weight: 700;
  color: var(--color-ink);
}

.account-card-text {
  margin-top: 2px;
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
}

.account-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.account-error {
  padding: 8px 16px;
  border: 1px solid var(--color-expense);
  border-radius: 12px;
  background-color: var(--color-expense-bg);
  font-size: 12px;
  line-height: 18px;
  color: var(--color-ink);
}

.account-success {
  padding: 8px 16px;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  background-color: #ecfdf5;
  font-size: 12px;
  line-height: 18px;
  color: #065f46;
}

.account-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
