import { describe, expect, it } from 'vitest'
import {
  demoUsers,
  readUsers,
  readUser,
  parseUsersQuery,
  displayDate,
  listContext,
} from '@admin/mocks/users.js'

describe('FE-04 : contrat local de consultation', () => {
  it('32 fixtures figées, quatre champs uniquement et domaines fictifs', () => {
    expect(demoUsers).toHaveLength(32)
    expect(Object.isFrozen(demoUsers)).toBe(true)
    for (const user of demoUsers) {
      expect(Object.isFrozen(user)).toBe(true)
      expect(Object.keys(user).sort()).toEqual(['created_at', 'email', 'id', 'nom'])
      if (user.email) expect(user.email).toMatch(/@example\.test$/)
    }
    expect(JSON.stringify(demoUsers)).not.toMatch(
      /amount|balance|budget|iban|password|token|auth_version|administrative_status|suspended_at/i,
    )
  })
  it.each([
    ['DIALLO', 1001],
    ['emile', 1002],
    ['compte.demo.17@EXAMPLE.TEST', 1017],
    ['  Émile  ', 1002],
  ])('recherche nom/email littérale : %s', (q, id) => {
    expect(readUsers({ q }).data.map((user) => user.id)).toEqual([id])
  })
  it.each(['introuvable', '%', '_', '<script>'])('aucun résultat pour %s', (q) => {
    expect(readUsers({ q }).meta.total).toBe(0)
    expect(readUsers({ q }).data).toEqual([])
  })
  it('pagination ordonnée, sans doublons ni omission, défaut 15', () => {
    const first = readUsers()
    const second = readUsers({ page: '2' })
    const third = readUsers({ page: '3' })
    expect(first.meta).toEqual({ current_page: 1, per_page: 15, total: 32, last_page: 3 })
    expect([first.data.length, second.data.length, third.data.length]).toEqual([15, 15, 2])
    expect([...first.data, ...second.data, ...third.data]).toEqual(demoUsers)
    expect(readUsers({ page: '4' }).data).toEqual([])
  })
  it.each([1, 5, 15, 50])('taille de page contractuelle %s', (per_page) => {
    expect(readUsers({ per_page }).data).toHaveLength(Math.min(per_page, 32))
  })
  it.each([
    { q: 'a'.repeat(101) },
    { q: ['nom', 'email'] },
    { q: null },
    { page: '0' },
    { page: '-1' },
    { page: '1.2' },
    { page: 'abc' },
    { page: ['1'] },
    { page: '9007199254740992' },
    { per_page: '0' },
    { per_page: '51' },
    { per_page: '2.5' },
  ])('refuse les paramètres invalides %j', (query) => {
    expect(() => readUsers(query)).toThrow('INVALID_QUERY')
  })
  it('accepte une recherche de 100 caractères, rejette au-delà sans tronquer', () => {
    expect(parseUsersQuery({ q: 'a'.repeat(100) }).q).toHaveLength(100)
    expect(() => parseUsersQuery({ q: 'a'.repeat(101) })).toThrow()
  })
  it('fiche existante et champs absents sans valeurs inventées', () => {
    expect(readUser('1001').data.nom).toBe('Amina Diallo')
    expect(readUser('1032').data).toEqual({ id: 1032, nom: null, email: null, created_at: null })
    expect(readUser('1001').data).not.toHaveProperty('administrative_status')
  })
  it.each(['9999', '0', '-1', '1001.5', 'abc', '1001x', ['1001']])(
    'fiche introuvable : %j',
    (id) => {
      expect(() => readUser(id)).toThrow('USER_NOT_FOUND')
    },
  )
  it('date stable en UTC et champs absents ou invalides signalés', () => {
    expect(displayDate('2026-10-01T23:30:00.000Z')).toBe('1 octobre 2026')
    expect(displayDate(null)).toBe('Non renseignée')
    expect(displayDate('invalid-date')).toBe('Non renseignée')
  })
  it('le retour liste transporte seulement q/page/per_page valides', () => {
    expect(
      listContext({ q: 'Diallo', page: '2', per_page: '5', demo: 'error', unknown: 'value' }),
    ).toEqual({ q: 'Diallo', page: '2', per_page: '5' })
    expect(listContext({ page: '-1' })).toEqual({})
  })
})
