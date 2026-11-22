import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { mountAt } from './helpers.js'
import * as users from '@admin/mocks/users.js'

enableAutoUnmount(afterEach)
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())
async function settled(path) {
  const app = await mountAt(path)
  await finish()
  return app
}
async function finish() {
  await vi.advanceTimersByTimeAsync(200)
  await flushPromises()
}
const rows = (wrapper) => wrapper.findAll('.fe-users-table tbody tr')

describe('FE-04 : liste et navigation', () => {
  it('chargement initial puis 15 résultats, total et aucun statut inventé', async () => {
    const { wrapper } = await mountAt('/utilisateurs')
    expect(wrapper.find('[data-users-state="loading"]').exists()).toBe(true)
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
    await finish()
    expect(rows(wrapper)).toHaveLength(15)
    expect(wrapper.get('.fe-users-announcement').text()).toContain('32 résultats fictifs')
    expect(wrapper.get('main').text()).not.toMatch(/Statut administratif|Actif|Suspendu/)
  })
  it.each([
    ['Diallo', 'Amina Diallo'],
    ['compte.demo.17', 'Mariam Fall'],
  ])('recherche %s depuis le formulaire', async (q, expected) => {
    const { wrapper, router } = await settled('/utilisateurs?page=2')
    await wrapper.get('.fe-users-search input').setValue(q)
    await wrapper.get('.fe-users-search').trigger('submit')
    await flushPromises()
    await finish()
    expect(router.currentRoute.value.query).toMatchObject({ q, page: '1', per_page: '15' })
    expect(rows(wrapper)).toHaveLength(1)
    expect(rows(wrapper)[0].text()).toContain(expected)
  })
  it('recherche trop longue : erreur reliée au champ, aucune navigation', async () => {
    const { wrapper, router } = await settled('/utilisateurs')
    const input = wrapper.get('.fe-users-search input')
    await input.setValue('x'.repeat(101))
    await wrapper.get('.fe-users-search').trigger('submit')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('.fe-users-announcement').text()).toContain('100 caractères')
    expect(router.currentRoute.value.query).toEqual({})
    expect(rows(wrapper)).toHaveLength(15)
  })
  it('pagination, taille de page et retour de fiche conservent les critères', async () => {
    const { wrapper, router } = await settled('/utilisateurs?q=compte&page=2&per_page=5')
    expect(rows(wrapper)[0].text()).toContain('#1006')
    await rows(wrapper)[0].get('a').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('user-detail'))
    await flushPromises()
    await finish()
    expect(router.currentRoute.value.name).toBe('user-detail')
    expect(wrapper.get('h1').text()).toBe('Fiche utilisateur')
    expect(document.activeElement.id).toBe('admin-page-title')
    await wrapper.get('.fe-users-page > div a').trigger('click')
    await flushPromises()
    await finish()
    expect(router.currentRoute.value.name).toBe('users')
    expect(router.currentRoute.value.query).toMatchObject({ q: 'compte', page: '2', per_page: '5' })
    await wrapper.get('.fe-users-pagination select').setValue('15')
    await flushPromises()
    await finish()
    expect(router.currentRoute.value.query.page).toBe('1')
    expect(rows(wrapper)).toHaveLength(15)
  })
  it('affiche une taille valide issue de l’URL, même hors des choix usuels', async () => {
    const { wrapper, router } = await settled('/utilisateurs?per_page=7')
    expect(rows(wrapper)).toHaveLength(7)
    expect(wrapper.get('.fe-users-pagination select').element.value).toBe('7')
    expect(wrapper.get('.fe-users-pagination option:checked').text()).toBe('7 par page')
    await router.push('/utilisateurs?q=Diallo&per_page=7')
    await finish()
    expect(wrapper.get('.fe-users-announcement').text()).toBe('1 résultat fictif · 1–1 affichés')
  })
  it('limites de pagination et page hors plage récupérable', async () => {
    const { wrapper, router } = await settled('/utilisateurs')
    expect(
      wrapper.get('nav[aria-label="Pagination des utilisateurs"] a').attributes('aria-disabled'),
    ).toBe('true')
    await router.push('/utilisateurs?page=3')
    await finish()
    expect(rows(wrapper)).toHaveLength(2)
    const links = wrapper.findAll('nav[aria-label="Pagination des utilisateurs"] a')
    expect(links[1].attributes('aria-disabled')).toBe('true')
    await router.push('/utilisateurs?page=999')
    await finish()
    expect(wrapper.find('[data-users-state="empty"]').exists()).toBe(true)
    expect(wrapper.get('.fe-users-announcement').text()).toContain('32 résultats fictifs')
    await wrapper.get('[data-users-state="empty"] a').trigger('click')
    await flushPromises()
    await finish()
    expect(rows(wrapper)).toHaveLength(15)
  })
  it.each([
    ['?q=inexistant', 'empty'],
    ['?demo=empty', 'empty'],
    ['?demo=loading', 'loading'],
    ['?demo=error', 'error'],
    ['?demo=forbidden', 'forbidden'],
    ['?page=0', 'invalid'],
    ['?q=' + 'x'.repeat(101), 'invalid'],
    ['?per_page=51', 'invalid'],
  ])('état %s : %s sans exposer des résultats', async (query, state) => {
    const { wrapper } = await settled('/utilisateurs' + query)
    expect(wrapper.find(`[data-users-state="${state}"]`).exists()).toBe(true)
    expect(rows(wrapper)).toHaveLength(0)
    expect(wrapper.get('main').text()).not.toContain('Amina Diallo')
  })
  it('réinitialisation de recherche et navigation arrière', async () => {
    const { wrapper, router } = await settled('/utilisateurs?q=Diallo')
    await wrapper.get('.fe-users-search a').trigger('click')
    await flushPromises()
    await finish()
    expect(rows(wrapper)).toHaveLength(15)
    router.back()
    await flushPromises()
    await finish()
    expect(wrapper.get('.fe-users-search input').element.value).toBe('Diallo')
    expect(rows(wrapper)).toHaveLength(1)
  })
  it('les transitions rapides ne restaurent pas les anciennes données', async () => {
    const { wrapper, router } = await mountAt('/utilisateurs')
    await router.push('/utilisateurs?demo=forbidden')
    await finish()
    expect(wrapper.find('[data-users-state="forbidden"]').exists()).toBe(true)
    expect(rows(wrapper)).toHaveLength(0)
    await router.push('/utilisateurs?q=Diallo')
    await router.push('/utilisateurs?q=Mariam')
    await finish()
    expect(rows(wrapper)).toHaveLength(1)
    expect(rows(wrapper)[0].text()).toContain('Mariam Fall')
    wrapper.unmount()
  })
  it('annule la lecture locale lorsque la vue est démontée pendant le chargement', async () => {
    const read = vi.spyOn(users, 'readUsers')
    const { wrapper } = await mountAt('/utilisateurs')
    wrapper.unmount()
    await finish()
    expect(read).not.toHaveBeenCalled()
  })
})

describe('FE-04 : fiche administrative', () => {
  it('affiche uniquement les champs de consultation disponibles', async () => {
    const { wrapper } = await settled('/utilisateurs/1001')
    const main = wrapper.get('main')
    expect(main.text()).toContain('Amina Diallo')
    expect(main.text()).toContain('compte.demo.1@example.test')
    expect(main.text()).toContain('1 octobre 2026')
    expect(main.text()).not.toContain('Statut administratif')
    expect(main.text()).not.toMatch(/Supprimer|Suspendre|Réactiver|Modifier|Exporter/)
    expect(wrapper.findAll('h1')).toHaveLength(1)
  })
  it('nom, email et date absents sont signalés sans invention', async () => {
    const { wrapper } = await settled('/utilisateurs/1032')
    expect(wrapper.get('.fe-users-details').text()).toContain('Non renseigné')
    expect(wrapper.get('.fe-users-details').text()).toContain('Non renseignée')
    expect(wrapper.get('.fe-users-details').text()).not.toContain('Statut administratif')
  })
  it.each([undefined, null, '', '   '])('omet un statut non fourni : %j', async (status) => {
    vi.spyOn(users, 'readUser').mockReturnValue({
      data: { ...users.demoUsers[0], administrative_status: status },
    })
    const { wrapper } = await settled('/utilisateurs/1001')
    expect(wrapper.get('.fe-users-details').text()).not.toContain('Statut administratif')
  })
  it('affiche un statut fourni sans en déduire une action ni exposer d’autres champs', async () => {
    vi.spyOn(users, 'readUser').mockReturnValue({
      data: {
        ...users.demoUsers[0],
        administrative_status: 'Exemple fourni',
        auth_version: 777,
        suspended_at: 'valeur-non-affichée',
        extra: 'champ-non-affiché',
      },
    })
    const { wrapper } = await settled('/utilisateurs/1001')
    expect(wrapper.get('.fe-users-details').text()).toContain('Exemple fourni')
    expect(wrapper.get('main').text()).not.toMatch(/777|valeur-non-affichée|champ-non-affiché/)
  })
  it.each([
    ['/utilisateurs/9999', 'not-found'],
    ['/utilisateurs/0', 'not-found'],
    ['/utilisateurs/1001?demo=loading', 'loading'],
    ['/utilisateurs/1001?demo=error', 'error'],
    ['/utilisateurs/1001?demo=forbidden', 'forbidden'],
    ['/utilisateurs/1001?demo=empty', 'not-found'],
  ])('%s : %s sans données résiduelles', async (path, state) => {
    const { wrapper } = await settled(path)
    expect(wrapper.find(`[data-users-state="${state}"]`).exists()).toBe(true)
    expect(wrapper.find('.fe-users-details').exists()).toBe(false)
  })
  it('paramètre non numérique : page introuvable du routeur', async () => {
    const { router } = await settled('/utilisateurs/abc')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
  it('changement d’identifiant sans remonter la vue', async () => {
    const { wrapper, router } = await settled('/utilisateurs/1001')
    await router.push('/utilisateurs/1002')
    expect(wrapper.find('.fe-users-details').exists()).toBe(false)
    await finish()
    expect(wrapper.get('.fe-users-details').text()).toContain('Émile Laurent')
  })
})
