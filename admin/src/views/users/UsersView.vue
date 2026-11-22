<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminButton from '@admin/components/AdminButton.vue'
import BaseCard from '@admin/components/BaseCard.vue'
import TextField from '@admin/components/TextField.vue'
import SelectField from '@admin/components/SelectField.vue'
import UsersDemoControls from '@admin/components/users/UsersDemoControls.vue'
import UsersState from '@admin/components/users/UsersState.vue'
import { useUsersDemo } from '@admin/composables/useUsersDemo.js'
import {
  readUsers,
  parseUsersQuery,
  listContext,
  userLabel,
  displayDate,
} from '@admin/mocks/users.js'
import '@admin/styles/users.css'

const route = useRoute()
const router = useRouter()
const search = ref('')
const searchError = ref('')
watch(
  () => route.query.q,
  (value) => {
    search.value = typeof value === 'string' ? value : ''
    searchError.value = ''
  },
  { immediate: true },
)
const { result, state, reload } = useUsersDemo(() => readUsers(route.query))
const meta = computed(() => result.value?.meta)
const size = computed(() => String(meta.value?.per_page ?? listContext(route.query).per_page ?? 15))
const sizes = computed(() =>
  [...new Set([5, 15, 30, 50, Number(size.value)])]
    .sort((a, b) => a - b)
    .map((value) => ({ value: String(value), label: `${value} par page` })),
)
const count = computed(() => {
  if (!meta.value) return state.value === 'empty' ? '0 résultat fictif' : ''
  const { total, current_page, per_page } = meta.value
  if (!result.value.data.length)
    return `${total} résultat${total > 1 ? 's' : ''} fictif${total > 1 ? 's' : ''} · Aucun sur cette page`
  return `${total} résultat${total > 1 ? 's' : ''} fictif${total > 1 ? 's' : ''} · ${(current_page - 1) * per_page + 1}–${Math.min(current_page * per_page, total)} affichés`
})
const announcement = computed(
  () =>
    searchError.value ||
    ({
      loading: 'Chargement des utilisateurs',
      error: 'Erreur de chargement',
      forbidden: 'Accès refusé, simulation',
      invalid: 'Paramètres invalides',
    }[state.value] ??
      count.value),
)
function submitSearch() {
  if ([...search.value].length > 100) {
    searchError.value = 'La recherche est limitée à 100 caractères.'
    return
  }
  searchError.value = ''
  router.push({
    name: 'users',
    query: { q: search.value.trim() || undefined, page: '1', per_page: size.value },
  })
}
function changeSize(value) {
  router.push({ name: 'users', query: { ...listContext(route.query), page: '1', per_page: value } })
}
function pageLink(page) {
  return { name: 'users', query: { ...listContext(route.query), page: String(page) } }
}
function detailLink(user) {
  return { name: 'user-detail', params: { id: user.id }, query: listContext(route.query) }
}
const firstPage = computed(() => {
  try {
    const { q, per_page } = parseUsersQuery(route.query)
    return { name: 'users', query: { q: q || undefined, per_page: String(per_page) } }
  } catch {
    return { name: 'users' }
  }
})
</script>

<template>
  <div class="fe-users-page">
    <UsersDemoControls />
    <BaseCard
      title="Répertoire des utilisateurs"
      description="Recherchez un nom ou une adresse email dans les données fictives."
    >
      <form
        class="fe-users-search"
        aria-label="Recherche dans le répertoire"
        @submit.prevent="submitSearch"
      >
        <TextField
          v-model="search"
          label="Nom ou email"
          type="search"
          icon="search"
          hint="100 caractères maximum · Données fictives"
          :error="searchError"
        />
        <div class="fe-users-actions">
          <AdminButton type="submit">Rechercher</AdminButton>
          <AdminButton :to="{ name: 'users' }" variant="secondary">Réinitialiser</AdminButton>
        </div>
      </form>
      <p class="fe-users-announcement" role="status" aria-live="polite" aria-atomic="true">
        {{ announcement }}
      </p>
      <div :aria-busy="state === 'loading' ? 'true' : 'false'">
        <template v-if="state === 'ready'">
          <table class="fe-users-table">
            <caption class="fm-visually-hidden">
              Utilisateurs fictifs — résultats de la recherche
            </caption>
            <thead>
              <tr>
                <th scope="col">Identifiant</th>
                <th scope="col">Nom</th>
                <th scope="col">Email</th>
                <th scope="col">Création (UTC)</th>
                <th scope="col">Fiche</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in result.data" :key="user.id">
                <td>#{{ user.id }}</td>
                <th scope="row">{{ user.nom || 'Non renseigné' }}</th>
                <td>{{ user.email || 'Non renseigné' }}</td>
                <td>{{ displayDate(user.created_at) }}</td>
                <td>
                  <AdminButton
                    :to="detailLink(user)"
                    variant="ghost"
                    :aria-label="`Consulter la fiche de ${userLabel(user)}`"
                    >Consulter</AdminButton
                  >
                </td>
              </tr>
            </tbody>
          </table>
          <ul class="fe-users-cards" aria-label="Utilisateurs fictifs">
            <li v-for="user in result.data" :key="user.id" class="fe-users-person">
              <h3>{{ userLabel(user) }}</h3>
              <dl>
                <div>
                  <dt>Identifiant</dt>
                  <dd>#{{ user.id }}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{{ user.email || 'Non renseigné' }}</dd>
                </div>
                <div>
                  <dt>Création (UTC)</dt>
                  <dd>{{ displayDate(user.created_at) }}</dd>
                </div>
              </dl>
              <AdminButton
                :to="detailLink(user)"
                variant="secondary"
                :aria-label="`Consulter la fiche de ${userLabel(user)}`"
                >Consulter la fiche</AdminButton
              >
            </li>
          </ul>
        </template>
        <UsersState v-else :state="state">
          <AdminButton v-if="state === 'error'" variant="secondary" @click="reload"
            >Réessayer la simulation</AdminButton
          >
          <AdminButton
            v-if="['empty', 'invalid'].includes(state)"
            :to="firstPage"
            variant="secondary"
            >Revenir à la première page</AdminButton
          >
        </UsersState>
      </div>
      <div v-if="meta" class="fe-users-pagination">
        <SelectField
          :model-value="size"
          label="Utilisateurs par page"
          :options="sizes"
          @update:model-value="changeSize"
        />
        <nav aria-label="Pagination des utilisateurs" class="fe-users-actions">
          <AdminButton
            :to="pageLink(Math.max(1, meta.current_page - 1))"
            :disabled="meta.current_page <= 1"
            variant="secondary"
            >Précédente</AdminButton
          >
          <p>Page {{ meta.current_page }} sur {{ meta.last_page }}</p>
          <AdminButton
            :to="pageLink(meta.current_page + 1)"
            :disabled="meta.current_page >= meta.last_page"
            variant="secondary"
            >Suivante</AdminButton
          >
        </nav>
      </div>
    </BaseCard>
  </div>
</template>
