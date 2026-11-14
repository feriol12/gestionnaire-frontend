// FE-01 : build Admin autonome, distinct du client (vite.config.js inchangé).
//
// - racine admin/ : admin/index.html et admin/src/** uniquement ;
// - sortie admin/dist/ (déjà ignorée par le motif « dist » du .gitignore),
//   jamais dist/ ni le pré-rendu du client ;
// - pas de plugin Tailwind : l'Admin est stylé par variables CSS et styles scoped ;
// - publicDir désactivé : aucun fichier de public/ (dont .htaccess) n'est copié.
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: fileURLToPath(new URL('./admin', import.meta.url)),
  base: '/',
  publicDir: false,
  plugins: [vue()],
  resolve: {
    alias: {
      '@admin': fileURLToPath(new URL('./admin/src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: { port: 5174, strictPort: true },
  preview: { port: 4174, strictPort: true },
  // Vitest : tests unitaires de l'Admin seulement (les tests e2e Playwright
  // ont leur propre configuration dans admin/tests/e2e/).
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.js'],
    setupFiles: ['tests/unit/setup.js'],
    restoreMocks: true,
  },
})
