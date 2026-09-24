<!--
  AppModal — generic centered dialog primitive (MONEVA V2, Phase 2).
  Presentational/interaction infrastructure only: knows nothing about
  Expense/Budget rules, stores, or API calls. Domain forms are wired to
  this shell in a later phase.

  Dismissal policy (whether the modal can be closed while a consumer's own
  async action is in flight) is intentionally NOT decided here — that is
  an open product decision per MONEVA_V2_DESIGN.md §17. This component only
  exposes the generic knobs (`closable`, `closeOnEscape`, `closeOnBackdrop`)
  so a consumer can wire its own submission state to them later
  (e.g. :closable="!isSubmitting"); it does not hardcode any policy itself.

  `closable=false` is the master gate for every USER-INITIATED dismissal
  path (close button, Escape, backdrop) — `closeOnEscape`/`closeOnBackdrop`
  only refine behavior when `closable` is already true. Programmatic
  `v-model` changes from the consumer are never blocked by this component.
-->
<template>
  <Teleport to="body">
    <Transition name="moneva-modal-backdrop">
      <div
        v-if="modelValue"
        class="moneva-modal-backdrop"
        @mousedown="onBackdropMouseDown"
      >
        <Transition name="moneva-modal-panel" appear>
          <div
            v-if="modelValue"
            ref="panelRef"
            class="moneva-modal-panel"
            tabindex="-1"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="hasVisibleTitle ? titleId : undefined"
            :aria-label="!hasVisibleTitle && ariaLabel ? ariaLabel : undefined"
            @mousedown.stop
          >
            <div class="moneva-modal-header" v-if="hasVisibleTitle || closable">
              <h2 v-if="hasVisibleTitle" :id="titleId" class="moneva-modal-title">
                <slot name="title">{{ title }}</slot>
              </h2>
              <span v-else class="moneva-modal-title-spacer" aria-hidden="true"></span>
              <button
                v-if="closable"
                type="button"
                class="moneva-modal-close"
                aria-label="Fermer"
                @click="requestClose('close-button')"
              >
                &times;
              </button>
            </div>

            <div class="moneva-modal-body">
              <slot />
            </div>

            <div v-if="$slots.actions" class="moneva-modal-actions">
              <slot name="actions" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick, useSlots } from 'vue';
import { acquireScrollLock, releaseScrollLock } from './overlayScrollLock.js';
import { registerOverlay, unregisterOverlay, isTopOverlay } from './overlayStack.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  /** Accessible name to use when no visible title (prop or slot) is present. */
  ariaLabel: { type: String, default: '' },
  /** Master gate for all user-initiated dismissal (close button/Escape/backdrop). */
  closable: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'close']);

const slots = useSlots();
const panelRef = ref(null);
const titleId = `moneva-modal-title-${Math.random().toString(36).slice(2, 9)}`;
// One token per instance, shared across scroll-lock ownership and overlay-
// stack registration — both have the same open/close lifecycle.
const owner = Symbol('AppModal');

const hasVisibleTitle = computed(() => Boolean(props.title || slots.title));

let previouslyFocusedEl = null;
let isMounted = true;
let openGeneration = 0;

// Candidate selector only — actual tabbability is decided by isFocusable()
// below, not by baking disabled/tabindex exclusions into the selector.
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]',
  '[contenteditable]:not([contenteditable="false"])'
].join(',');

// P2-R02: robust tabbable filtering. offsetParent-based visibility checks
// miss visibility:hidden and don't reliably cover inert/aria-hidden
// ancestors or fieldset-disabled descendants; this uses browser-native
// checks wherever one exists instead of reimplementing that logic by hand.
function isFocusable(el) {
  if (!el.isConnected) return false;
  if (el.hasAttribute('hidden')) return false;
  if (el.closest('[aria-hidden="true"]')) return false;
  if (el.closest('[inert]')) return false;
  if (typeof el.matches === 'function' && el.matches(':disabled')) return false;
  if (el.tabIndex < 0) return false;
  const style = getComputedStyle(el);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden' || style.visibility === 'collapse') return false;
  if (el.getClientRects().length === 0) return false;
  return true;
}

function getFocusableElements() {
  const container = panelRef.value;
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isFocusable);
}

function requestClose(reason) {
  // P2-R03-equivalent hardening for AppModal: a single, final defensive
  // gate for every user-initiated dismissal reason (button/escape/backdrop),
  // re-checking the *current* prop rather than trusting whatever state the
  // gesture started under. Programmatic modelValue changes never call this
  // function, so they remain unaffected.
  if (!props.closable) return;
  emit('update:modelValue', false);
  emit('close', { reason });
}

function onBackdropMouseDown(event) {
  if (event.target !== event.currentTarget) return;
  if (!isTopOverlay(owner)) return;
  if (props.closeOnBackdrop) requestClose('backdrop');
}

function onKeydown(event) {
  // P2-R01: a lower overlay must ignore document-level keyboard events
  // entirely while another overlay is stacked above it.
  if (!isTopOverlay(owner)) return;

  if (event.key === 'Escape') {
    // The top overlay owns this Escape event completely: consumed here,
    // before any close/unregister logic runs, so a lower overlay can
    // never process the same physical keypress. stopImmediatePropagation
    // makes this ordering-independent — it doesn't matter which overlay's
    // document-level listener happens to be registered first; whichever
    // one is actually top stops every other 'keydown' listener on
    // document from running for this event at all. This applies even
    // when closable/closeOnEscape are false: refusing dismissal must not
    // let the same keypress fall through to a lower overlay.
    event.preventDefault();
    event.stopImmediatePropagation();
    if (props.closable && props.closeOnEscape) requestClose('escape');
    return;
  }

  if (event.key === 'Tab') {
    // P2-R02: full manual ownership of Tab, not just boundary interception.
    // Native sequential focus order still includes elements our filtering
    // excludes (e.g. aria-hidden doesn't remove a button from the browser's
    // own tab order) — the only way to guarantee an excluded element is
    // never reached is to prevent the browser's default entirely and pick
    // the destination ourselves for every Tab press.
    event.preventDefault();
    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      panelRef.value?.focus();
      return;
    }
    const currentIndex = focusable.indexOf(document.activeElement);
    let nextIndex;
    if (event.shiftKey) {
      nextIndex = currentIndex === -1 ? focusable.length - 1 : (currentIndex - 1 + focusable.length) % focusable.length;
    } else {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % focusable.length;
    }
    focusable[nextIndex].focus();
  }
}

function onFocusIn(event) {
  // Same top-most gate as onKeydown — a lower overlay must not fight the
  // overlay currently stacked above it for focus.
  if (!isTopOverlay(owner)) return;
  if (!panelRef.value) return;

  const target = event.target;
  const insidePanel = panelRef.value.contains(target);
  const focusable = getFocusableElements();
  // P2-R02: a simple panel.contains(target) check would accept focus that
  // landed on an excluded-but-technically-focusable descendant (e.g. an
  // aria-hidden button someone force-focused programmatically) just
  // because it happens to be inside the panel. Recover unless the target
  // is either the panel itself or one of the currently admissible
  // candidates.
  const isValidTarget = target === panelRef.value || focusable.includes(target);

  if (!insidePanel || !isValidTarget) {
    (focusable[0] || panelRef.value)?.focus();
  }
}

async function openOverlay() {
  const myGeneration = ++openGeneration;
  previouslyFocusedEl = document.activeElement;
  acquireScrollLock(owner);
  registerOverlay(owner);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('focusin', onFocusIn);

  await nextTick();
  // Guard against the modal having closed or the component having
  // unmounted while we were waiting for the DOM to settle.
  if (!isMounted || !props.modelValue || myGeneration !== openGeneration) return;

  const focusable = getFocusableElements();
  (focusable[0] || panelRef.value)?.focus();
}

function closeOverlay() {
  // Order matters: unregister from the stack FIRST so a lower overlay (if
  // any) is immediately eligible to react again, then tear down this
  // instance's own listeners/lock, then restore focus — so the lower
  // overlay's own onFocusIn (now top) sees the restored focus land inside
  // itself and does nothing, instead of two overlays fighting mid-restore.
  unregisterOverlay(owner);
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('focusin', onFocusIn);
  releaseScrollLock(owner);
  if (previouslyFocusedEl && document.contains(previouslyFocusedEl)) {
    previouslyFocusedEl.focus();
  }
  previouslyFocusedEl = null;
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) openOverlay();
    else closeOverlay();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  isMounted = false;
  if (props.modelValue) closeOverlay();
});
</script>

<style scoped>
.moneva-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: rgb(15 23 42 / 0.3);
  backdrop-filter: blur(4px);
}

.moneva-modal-panel {
  width: 100%;
  max-width: 28rem;
  max-height: calc(100vh - 2 * var(--spacing-md));
  overflow-y: auto;
  background-color: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  border-radius: var(--radius-moneva-lg);
  box-shadow: var(--shadow-high);
}

.moneva-modal-panel:focus {
  outline: none;
}
.moneva-modal-panel:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.moneva-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-lg) 0;
}

.moneva-modal-title {
  font-size: var(--text-headline-sm);
  line-height: var(--text-headline-sm--line-height);
  font-weight: var(--text-headline-sm--font-weight);
  color: var(--color-ink);
}

.moneva-modal-title-spacer {
  flex: 1;
}

.moneva-modal-close {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-muted-light);
  font-size: 1.25rem;
  line-height: 1;
  border-radius: var(--radius-moneva-sm);
  cursor: pointer;
  margin: -10px -10px 0 0;
}

.moneva-modal-close:hover {
  background-color: var(--color-border-soft);
  color: var(--color-ink);
}

.moneva-modal-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.moneva-modal-body {
  padding: var(--spacing-lg);
}

.moneva-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}

.moneva-modal-backdrop-enter-active,
.moneva-modal-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.moneva-modal-backdrop-enter-from,
.moneva-modal-backdrop-leave-to {
  opacity: 0;
}

.moneva-modal-panel-enter-active,
.moneva-modal-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.moneva-modal-panel-enter-from,
.moneva-modal-panel-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
