import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import App from '@admin/App.vue'
import { createAdminRouter } from '@admin/router'

// Monte l'application complète sur une route donnée (historique en mémoire).
export async function mountAt(path) {
  const router = createAdminRouter(createMemoryHistory())
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}
