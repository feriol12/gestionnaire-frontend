// Shared body-scroll-lock ownership for AppModal/AppBottomSheet (MONEVA V2, Phase 2).
// Multiple overlays can be open at once (e.g. a modal opening a confirm dialog);
// the body must stay locked until every owner has released it, and the original
// inline overflow value must be restored exactly once, by whichever release
// happens to be the last one.

const owners = new Set();
let originalOverflow = null;

export function acquireScrollLock(owner) {
  if (owners.size === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  owners.add(owner);
}

export function releaseScrollLock(owner) {
  if (!owners.has(owner)) return; // already released — harmless no-op
  owners.delete(owner);
  if (owners.size === 0) {
    document.body.style.overflow = originalOverflow;
    originalOverflow = null;
  }
}
