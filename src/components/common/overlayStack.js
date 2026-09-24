// Shared overlay stack for top-most focus/keyboard ownership coordination
// (MONEVA V2, Phase 2 final correction). Purely generic infrastructure —
// no Vue, no business/domain dependency. When overlay B opens above
// overlay A, only the top-most overlay should react to Escape, Tab
// trapping, or focus-recovery events; A stays registered (so it can
// resume the instant B unregisters) but inactive while B is above it.

const stack = [];

export function registerOverlay(owner) {
  if (!stack.includes(owner)) stack.push(owner);
}

export function unregisterOverlay(owner) {
  const index = stack.indexOf(owner);
  if (index !== -1) stack.splice(index, 1);
}

export function isTopOverlay(owner) {
  return stack.length > 0 && stack[stack.length - 1] === owner;
}
