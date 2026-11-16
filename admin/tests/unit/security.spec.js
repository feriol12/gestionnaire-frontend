// Contrôles statiques et dynamiques de sécurité FE-01 :
// aucun appel réseau, aucun stockage, aucune donnée réelle ou financière.
import { describe, expect, it } from 'vitest'
import * as mocks from '@admin/mocks/dashboard.js'
import { mountAt } from './helpers.js'

const sources = import.meta.glob('../../src/**/*.{js,vue,css}', { query: '?raw', import: 'default', eager: true })
const indexHtml = import.meta.glob('../../index.html', { query: '?raw', import: 'default', eager: true })['../../index.html']

const forbiddenInSources = [
  ['axios', /\baxios\b/],
  ['fetch()', /\bfetch\s*\(/],
  ['XMLHttpRequest', /XMLHttpRequest/],
  ['WebSocket', /WebSocket/],
  ['EventSource', /EventSource/],
  ['sendBeacon', /sendBeacon/],
  ['chemin /api', /\/api\b/],
  ['URL absolue', /https?:\/\//],
  ['localStorage', /localStorage/],
  ['sessionStorage', /sessionStorage/],
  ['indexedDB', /indexedDB/],
  ['document.cookie', /document\.cookie/],
  ['garde global', /beforeEach|beforeResolve/],
  ['garde de route', /beforeEnter/],
  ['champ mot de passe', /type=["']password["']/],
  ['Tailwind', /tailwindcss|@tailwind|@apply/],
  ['variable d’environnement', /import\.meta\.env/],
]

describe('Sources Admin', () => {
  it('couvre bien les fichiers de admin/src', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20)
  })

  it.each(forbiddenInSources)('aucune occurrence : %s', (_label, pattern) => {
    const offenders = Object.entries(sources)
      .filter(([, content]) => pattern.test(content))
      .map(([file]) => file)
    expect(offenders).toEqual([])
  })

  it('index.html : aucune ressource externe (ni police, ni script, ni préconnexion)', () => {
    expect(indexHtml.match(/https?:\/\/[^"' )]+/g) ?? []).toEqual([])
    expect(indexHtml).not.toMatch(/\b(src|href)=["']\/\//)
    expect(indexHtml).not.toMatch(/preconnect|dns-prefetch/)
    expect(indexHtml).toContain('noindex')
  })

  it('styles : aucune police ou ressource distante (@import url, url() absolue, @font-face)', () => {
    const offenders = Object.entries(sources)
      .filter(([file]) => /\.(css|vue)$/.test(file))
      .filter(([, content]) => /@import\s+url|url\(\s*["']?(https?:)?\/\/|@font-face/.test(content))
      .map(([file]) => file)
    expect(offenders).toEqual([])
  })
})

describe('Données fictives', () => {
  const serialized = JSON.stringify(mocks)

  it('adresses uniquement sous example.test', () => {
    const emails = serialized.match(/[\w.+-]+@[\w.-]+/g) ?? []
    expect(emails.length).toBeGreaterThan(0)
    emails.forEach((email) => expect(email).toMatch(/@example\.test$/))
  })

  it('aucune donnée financière', () => {
    expect(serialized).not.toMatch(/FCFA|XOF|€|\$|montant|solde|budget|dépense|amount|balance|iban/i)
  })

  it('les jeux de données sont figés', () => {
    expect(Object.isFrozen(mocks.kpis)).toBe(true)
    expect(Object.isFrozen(mocks.auditEvents)).toBe(true)
    expect(Object.isFrozen(mocks.accessActivity)).toBe(true)
  })
})

describe('Exécution', () => {
  it('parcourt tous les écrans sans réseau, stockage ni cookie', async () => {
    const paths = [
      '/',
      '/utilisateurs',
      '/audit',
      '/notifications',
      '/securite',
      '/etats',
      '/composants',
      '/connexion',
      '/mfa/enrolement',
      '/mfa/verification',
      '/mfa/recuperation',
      '/reauthentification',
      '/inconnue',
    ]
    for (const path of paths) {
      const { wrapper } = await mountAt(path)
      wrapper.unmount()
    }
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    expect(document.cookie).toBe('')
  })
})
