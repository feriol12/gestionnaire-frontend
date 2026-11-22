import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// Lecture locale différée et annulable pour exercer aussi les états de transition.
export function useUsersDemo(read, detail = false) {
  const route = useRoute()
  const result = ref(null)
  const state = ref('loading')
  const revision = ref(0)

  watch(
    [() => route.fullPath, revision],
    (_value, _old, onCleanup) => {
      result.value = null
      state.value = 'loading'
      const scenario = route.query.demo
      if (scenario === 'loading') return
      const timer = setTimeout(() => {
        if (['error', 'forbidden'].includes(scenario)) {
          state.value = scenario
          return
        }
        if (scenario === 'empty') {
          state.value = detail ? 'not-found' : 'empty'
          return
        }
        try {
          result.value = read()
          state.value = !detail && !result.value.data.length ? 'empty' : 'ready'
        } catch (error) {
          state.value =
            error.code === 'USER_NOT_FOUND'
              ? 'not-found'
              : error.code === 'INVALID_QUERY'
                ? 'invalid'
                : 'error'
        }
      }, 180)
      onCleanup(() => clearTimeout(timer))
    },
    { immediate: true },
  )

  return { result, state, reload: () => revision.value++ }
}
