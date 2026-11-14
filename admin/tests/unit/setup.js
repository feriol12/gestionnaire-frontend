// Garde-fous communs : toute tentative réseau depuis l'Admin fait échouer le test.
import { afterEach, beforeEach, expect, vi } from 'vitest'

export const networkCalls = []

function forbidden(kind) {
  return (...args) => {
    networkCalls.push({ kind, target: String(args[0] ?? '') })
    throw new Error(`Appel réseau interdit dans l'Admin FE-01 : ${kind}`)
  }
}

beforeEach(() => {
  networkCalls.length = 0
  vi.stubGlobal('fetch', vi.fn(forbidden('fetch')))
  vi.stubGlobal('XMLHttpRequest', vi.fn(forbidden('XMLHttpRequest')))
  vi.stubGlobal('WebSocket', vi.fn(forbidden('WebSocket')))
  vi.stubGlobal('EventSource', vi.fn(forbidden('EventSource')))
  // jsdom n'implémente pas scrollTo (utilisé par scrollBehavior du router).
  vi.stubGlobal('scrollTo', vi.fn())
  if (globalThis.navigator) {
    Object.defineProperty(globalThis.navigator, 'sendBeacon', {
      configurable: true,
      value: vi.fn(forbidden('sendBeacon')),
    })
  }
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  expect(networkCalls).toEqual([])
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})
