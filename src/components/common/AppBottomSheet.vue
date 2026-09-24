<!--
  AppBottomSheet — generic mobile bottom-sheet primitive (MONEVA V2, Phase 2).
  Presentational/interaction infrastructure only, mirrors AppModal's
  contract shape (modelValue/closable/closeOnEscape/closeOnBackdrop/ariaLabel)
  so a consumer can later switch between the two shells without relearning
  an API. `maxHeight` is caller-configured (design doc: ~82vh for the
  Expense form, ~60vh for the Budget form) rather than hardcoded here.

  `closable=false` is the master gate for every USER-INITIATED dismissal
  path (close button, Escape, backdrop, AND drag) — see AppModal's header
  comment for the full rationale; the same rule applies here.
-->
<template>
  <Teleport to="body">
    <Transition name="moneva-sheet-backdrop">
      <div
        v-if="modelValue"
        class="moneva-sheet-backdrop"
        @mousedown="onBackdropMouseDown"
      >
        <Transition name="moneva-sheet-panel" appear>
          <div
            v-if="modelValue"
            ref="panelRef"
            class="moneva-sheet-panel"
            :class="{ 'moneva-sheet-panel-no-actions': !$slots.actions }"
            :style="{ maxHeight }"
            tabindex="-1"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="hasVisibleTitle ? titleId : undefined"
            :aria-label="!hasVisibleTitle && ariaLabel ? ariaLabel : undefined"
            @mousedown.stop
          >
            <div
              v-if="showHandle"
              class="moneva-sheet-handle-row"
              @pointerdown="onHandlePointerDown"
            >
              <span class="moneva-sheet-handle" aria-hidden="true"></span>
            </div>

            <div class="moneva-sheet-header" v-if="hasVisibleTitle || closable">
              <h2 v-if="hasVisibleTitle" :id="titleId" class="moneva-sheet-title">
                <slot name="title">{{ title }}</slot>
              </h2>
              <span v-else class="moneva-sheet-title-spacer" aria-hidden="true"></span>
              <button
                v-if="closable"
                type="button"
                class="moneva-sheet-close"
                aria-label="Fermer"
                @click="requestClose('close-button')"
              >
                &times;
              </button>
            </div>

            <div class="moneva-sheet-body">
              <slot />
            </div>

            <div v-if="$slots.actions" class="moneva-sheet-actions">
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
  ariaLabel: { type: String, default: '' },
  closable: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  showHandle: { type: Boolean, default: true },
  /** Caller-configured; e.g. '82vh' for a long form, '60vh' for a short one. */
  maxHeight: { type: String, default: '90vh' }
});

const emit = defineEmits(['update:modelValue', 'close']);

const slots = useSlots();
const panelRef = ref(null);
const titleId = `moneva-sheet-title-${Math.random().toString(36).slice(2, 9)}`;
// One token per instance, shared across scroll-lock ownership and overlay-
// stack registration — both have the same open/close lifecycle.
const owner = Symbol('AppBottomSheet');

const hasVisibleTitle = computed(() => Boolean(props.title || slots.title));

let previouslyFocusedEl = null;
let isMounted = true;
let openGeneration = 0;

// Drag-to-dismiss state — declared here (not further down, near the drag
// handlers that use them) because `closeOverlay()` calls `resetDrag()`
// synchronously from the `immediate: true` watcher below, which runs
// during setup: referencing a `let` binding before its own declaration
// line has executed throws (temporal dead zone), even though the
// functions themselves are hoisted.
let activePointerId = null;
let dragStartY = 0;
let dragCurrentY = 0;

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

// P2-R02: robust tabbable filtering — see AppModal.vue's identical helper
// for the rationale (offsetParent alone misses visibility:hidden and
// doesn't reliably cover inert/aria-hidden ancestors or fieldset-disabled
// descendants).
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
  // P2-R03: a single, final defensive gate for every user-initiated
  // dismissal reason (button/escape/backdrop/drag), re-checking the
  // *current* prop rather than trusting whatever state the gesture (e.g.
  // a drag) started under. Programmatic modelValue changes never call
  // this function, so they remain unaffected.
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
    // never process the same physical keypress — ordering-independent via
    // stopImmediatePropagation, regardless of which overlay's document
    // listener happens to be registered first. Applies even when
    // closable/closeOnEscape are false.
    event.preventDefault();
    event.stopImmediatePropagation();
    if (props.closable && props.closeOnEscape) requestClose('escape');
    return;
  }

  if (event.key === 'Tab') {
    // P2-R02: full manual ownership of Tab — see AppModal.vue's identical
    // handler for the rationale (native sequential focus order still
    // includes elements our filtering excludes, e.g. aria-hidden).
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
  // P2-R02: recover unless focus landed on the panel itself or one of the
  // currently admissible candidates — see AppModal.vue's identical check.
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
  if (!isMounted || !props.modelValue || myGeneration !== openGeneration) return;

  const focusable = getFocusableElements();
  (focusable[0] || panelRef.value)?.focus();
}

function closeOverlay() {
  // Order matters: unregister from the stack FIRST so a lower overlay (if
  // any) is immediately eligible to react again, then tear down this
  // instance's own listeners/lock/drag state, then restore focus — see
  // AppModal.vue's identical comment for the full rationale.
  unregisterOverlay(owner);
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('focusin', onFocusIn);
  releaseScrollLock(owner);
  resetDrag();
  if (previouslyFocusedEl && document.contains(previouslyFocusedEl)) {
    previouslyFocusedEl.focus();
  }
  previouslyFocusedEl = null;
}

// P2-R03: if a consumer flips `closable` to false while a drag is actively
// in progress, cancel it immediately rather than letting a gesture that
// started under a different permission finish and potentially dismiss.
watch(
  () => props.closable,
  (isClosable) => {
    if (!isClosable && activePointerId !== null) {
      resetDrag();
    }
  }
);

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
  removeDragListeners();
});

// ---- Drag-to-dismiss — restricted to the handle row, never sheet content ----
// (state variables declared earlier, above the immediate watcher — see note there)

function addDragListeners() {
  window.addEventListener('pointermove', onHandlePointerMove);
  window.addEventListener('pointerup', onHandlePointerUp);
  window.addEventListener('pointercancel', onHandlePointerCancel);
}

function removeDragListeners() {
  window.removeEventListener('pointermove', onHandlePointerMove);
  window.removeEventListener('pointerup', onHandlePointerUp);
  window.removeEventListener('pointercancel', onHandlePointerCancel);
}

function resetDrag() {
  removeDragListeners();
  activePointerId = null;
  dragCurrentY = 0;
  if (panelRef.value) {
    panelRef.value.style.transition = '';
    panelRef.value.style.transform = '';
  }
}

function onHandlePointerDown(event) {
  if (!props.closable || activePointerId !== null) return;
  activePointerId = event.pointerId;
  dragStartY = event.clientY;
  dragCurrentY = 0;
  // setPointerCapture can throw (e.g. NotFoundError) for a pointer the
  // browser doesn't consider active for capture purposes; delivery of
  // move/up/cancel already relies on the window-level listeners below,
  // not on capture, so a capture failure must not abort the drag setup.
  try {
    event.currentTarget.setPointerCapture?.(event.pointerId);
  } catch {
    // capture is a best-effort enhancement, not required for correctness
  }
  addDragListeners();
}

function onHandlePointerMove(event) {
  if (event.pointerId !== activePointerId || !panelRef.value) return;
  dragCurrentY = Math.max(0, event.clientY - dragStartY);
  panelRef.value.style.transition = 'none';
  panelRef.value.style.transform = `translateY(${dragCurrentY}px)`;
}

function onHandlePointerUp(event) {
  if (event.pointerId !== activePointerId) return;
  const dismissThreshold = 120;
  // Defensive recheck of props.closable here too, even though the watcher
  // above already cancels an in-progress drag the moment closable flips to
  // false — requestClose() itself also re-verifies it, per P2-R03's
  // "keep the final close path defensive" requirement.
  const shouldDismiss = props.closable && dragCurrentY > dismissThreshold;
  resetDrag();
  if (shouldDismiss) requestClose('drag');
}

function onHandlePointerCancel(event) {
  if (event.pointerId !== activePointerId) return;
  resetDrag();
}
</script>

<style scoped>
.moneva-sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: rgb(15 23 42 / 0.3);
  backdrop-filter: blur(4px);
}

.moneva-sheet-panel {
  width: 100%;
  max-width: 40rem;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  border-top-left-radius: var(--radius-moneva-xl);
  border-top-right-radius: var(--radius-moneva-xl);
  box-shadow: var(--shadow-high);
  overflow: hidden;
}

.moneva-sheet-panel:focus {
  outline: none;
}
.moneva-sheet-panel:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

/* Safe-area is applied exactly once: on the actions row when present,
   otherwise here on the body, so it's never doubled up. */
.moneva-sheet-panel-no-actions .moneva-sheet-body {
  padding-bottom: calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px));
}

.moneva-sheet-handle-row {
  display: flex;
  justify-content: center;
  padding: var(--spacing-sm) 0;
  touch-action: none;
  cursor: grab;
}

.moneva-sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: var(--radius-moneva-sm);
  background-color: var(--color-border);
}

.moneva-sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg) var(--spacing-sm);
}

.moneva-sheet-title {
  font-size: var(--text-headline-sm);
  line-height: var(--text-headline-sm--line-height);
  font-weight: var(--text-headline-sm--font-weight);
  color: var(--color-ink);
}

.moneva-sheet-title-spacer {
  flex: 1;
}

.moneva-sheet-close {
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

.moneva-sheet-close:hover {
  background-color: var(--color-border-soft);
  color: var(--color-ink);
}

.moneva-sheet-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.moneva-sheet-body {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  overflow-y: auto;
}

.moneva-sheet-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg) calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--color-border-soft);
}

.moneva-sheet-backdrop-enter-active,
.moneva-sheet-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.moneva-sheet-backdrop-enter-from,
.moneva-sheet-backdrop-leave-to {
  opacity: 0;
}

.moneva-sheet-panel-enter-active,
.moneva-sheet-panel-leave-active {
  transition: transform 0.25s ease;
}
.moneva-sheet-panel-enter-from,
.moneva-sheet-panel-leave-to {
  transform: translateY(100%);
}
</style>
