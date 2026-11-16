import { describe, expect, it } from 'vitest'
import { routes } from '@admin/router'
import { mountAt } from './helpers.js'

function flatten(list, parent = '') {
  return list.flatMap((route) => {
    const path = route.path.startsWith('/') ? route.path : `${parent}/${route.path}`.replace('//', '/')
    return [{ ...route, fullPath: path }, ...flatten(route.children ?? [], path)]
  })
}

const all = flatten(routes)

describe('Router Admin', () => {
  it('déclare les écrans FE-01 et les modules réservés', () => {
    const names = all.map((r) => r.name).filter(Boolean)
    expect(names).toEqual(
      expect.arrayContaining(['dashboard', 'users', 'audit', 'notifications', 'security', 'states', 'components']),
    )
  })

  it('réserve les emplacements FE-02 hors du shell, sans composant de formulaire', () => {
    const reserved = all.filter((r) => r.meta?.reservedFor === 'FE-02').map((r) => r.fullPath)
    expect(reserved.sort()).toEqual(
      ['/connexion', '/mfa/enrolement', '/mfa/recuperation', '/mfa/verification', '/reauthentification'].sort(),
    )
  })

  it("n'utilise aucun garde de route (beforeEnter) ni redirection", () => {
    all.forEach((route) => {
      expect(route.beforeEnter, route.fullPath).toBeUndefined()
      expect(route.redirect, route.fullPath).toBeUndefined()
    })
  })

  it('met à jour le titre du document après navigation', async () => {
    const { router } = await mountAt('/etats')
    expect(document.title).toBe('États simulés — FluxMoneva Admin (prototype)')
    await router.push('/composants')
    expect(document.title).toBe('Composants — FluxMoneva Admin (prototype)')
  })

  it('affiche une page introuvable pour une route inconnue, sans redirection', async () => {
    const { wrapper, router } = await mountAt('/route-inexistante')
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(wrapper.text()).toContain("Cette page n'existe pas dans le prototype")
  })
})
