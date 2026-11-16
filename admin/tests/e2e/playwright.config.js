// FE-01 — Vérifications navigateur locales de l'Admin (Chromium + axe-core).
// Hors CI. Lancement : npm run test:admin:e2e (build Admin puis tests).
// Sorties (captures, traces) sous __screenshots__/, ignoré par Git.
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const port = 4174

export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.js',
  outputDir: './__screenshots__/test-results',
  fullyParallel: true,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    browserName: 'chromium',
    locale: 'fr-FR',
    trace: 'retain-on-failure',
  },
  webServer: {
    // Sert le build de production admin/dist (aucun serveur de dev, aucun proxy API).
    command: 'npx vite preview --config vite.admin.config.js',
    cwd: repoRoot,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
