// Contrôles statiques et dynamiques de sécurité FE-01, étendus à FE-02 :
// aucun appel réseau, aucun stockage, aucune donnée réelle ou financière.
// FE-02 : exception ciblée et vérifiée pour le champ mot de passe (voir ci-dessous).
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
  ['journalisation', /console\.(log|info|debug|warn|error|trace)/],
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

// FE-02 — Le formulaire de connexion a legitimement besoin d'un champ
// mot de passe. L'exception est limitee a UN seul fichier : toutes les
// autres regles globales (reseau, stockage, journalisation, secrets) restent
// applicables, y compris a ce composant.
describe('Champ mot de passe FE-02 — exception ciblée', () => {
  const passwordField = '../../src/components/auth/PasswordField.vue'
  const pattern = /type=["']password["']/

  it('n’existe que dans le composant dédié autorisé', () => {
    expect(sources).toHaveProperty(passwordField)
    const offenders = Object.entries(sources)
      .filter(([file, content]) => file !== passwordField && pattern.test(content))
      .map(([file]) => file)
    expect(offenders).toEqual([])
  })

  it('le composant dédié n’écrit ni ne journalise le mot de passe', () => {
    const content = sources[passwordField]
    expect(pattern.test(content)).toBe(true)
    expect(content).not.toMatch(/console\.(log|info|debug|warn|error|trace)/)
    expect(content).not.toMatch(/localStorage|sessionStorage|document\.cookie|indexedDB/)
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
