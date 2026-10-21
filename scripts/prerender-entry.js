// SEO-07 : rendu serveur de la seule page d'accueil publique, appelé par
// scripts/prerender-landing.mjs via Vite (mêmes plugins et alias que le build).
// Routeur mémoire minimal : uniquement les cibles des liens de l'accueil ; le
// routeur de l'application (historique navigateur, store d'authentification)
// n'est pas chargé.
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';
import LandingView from '@/views/LandingView.vue';

const Empty = { render: () => null };

export async function renderLanding() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: LandingView },
      { path: '/login', component: Empty },
      { path: '/register', component: Empty },
    ],
  });
  const app = createSSRApp(LandingView);
  app.use(router);
  await router.push('/');
  await router.isReady();

  return renderToString(app);
}
