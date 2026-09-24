<!--
  AuthShell — MONEVA V2 auth-page shell (Stitch fidelity remediation).
  Canonical Stitch screens (project 16709603789976532773):
    Login    desktop 56a14bfa4a1a4726a77f7620d2324c73 · mobile a4dd4c9401374a03ba3da2e2860ccb62
    Register desktop b87bb90cf68a441ca06ab70e377419b2 · mobile da569c36af6749a4b680614012fd7afe

  Breakpoint follows Stitch's `lg` semantics:
    < 1024px  — mobile/tablet stack: brand header -> #hero -> form -> #footer.
    >= 1024px — desktop split: #visual pane (left) + white form pane (right).
  Login splits 54/46 (56/44 from 1280px); Register splits 50/50.

  One form pane is rendered at every width (the form is never duplicated);
  only presentation moves via CSS. The visual pane is placed after the form
  pane in the DOM and shown first with `order`, so reading and Tab order
  reach the form first.

  Slots: default (page content), #topbar (right side of the brand bar),
  #hero (mobile/tablet only), #visual (desktop only), #footer.
-->
<template>
  <div :class="['auth-shell', `auth-shell--${variant}`]">
    <div class="auth-shell-pane">
      <header class="auth-shell-topbar">
        <div class="auth-shell-topbar-inner">
          <span class="auth-brand">
            <MonevaMark class="auth-brand-mark" />
            <span class="auth-brand-text">
              <span class="auth-brand-name">MONEVA</span>
              <span class="auth-brand-tagline" aria-hidden="true">Budget &amp; Dépenses</span>
            </span>
          </span>
          <slot name="topbar" />
        </div>
      </header>

      <main class="auth-shell-content">
        <div v-if="$slots.hero" class="auth-shell-hero">
          <slot name="hero" />
        </div>
        <slot />
      </main>

      <footer v-if="$slots.footer" class="auth-shell-footer">
        <slot name="footer" />
      </footer>
    </div>

    <aside v-if="$slots.visual" class="auth-shell-visual">
      <slot name="visual" />
    </aside>
  </div>
</template>

<script setup>
import MonevaMark from '@/components/brand/MonevaMark.vue';

defineProps({
  variant: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
});
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  color: #0f172a;
}

.auth-shell-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.auth-shell-visual {
  display: none;
}

.auth-shell-topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.auth-shell-content {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

/* Brand lockup — MonevaMark + wordmark, scaled from the Stitch logo asset
   (0add764e…, 240×60: mark 44/60, wordmark 24/60, tagline 8.5/60 of height). */
.auth-brand {
  --brand-h: 28px;
  display: inline-flex;
  align-items: center;
  gap: calc(var(--brand-h) * 0.17);
}

.auth-brand-mark {
  width: calc(var(--brand-h) * 0.733);
  height: calc(var(--brand-h) * 0.733);
}

.auth-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.auth-brand-name {
  font-size: calc(var(--brand-h) * 0.4);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.auth-brand-tagline {
  margin-top: 2px;
  font-size: max(4px, calc(var(--brand-h) * 0.142));
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #64748b;
  white-space: nowrap;
}

/* ================= MOBILE / TABLET (< 1024px) ================= */

/* Login Mobile — slate-50 page, sticky blurred header, centered 420px column,
   radial glow, full-width footer bar. */
.auth-shell--login {
  background-color: #f8fafc;
}

.auth-shell--login .auth-shell-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 24px 24px 8px;
  border-bottom: 1px solid #f1f5f9;
  background-color: rgba(255, 255, 255, 0.8);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.auth-shell--login .auth-shell-content {
  max-width: 420px;
  padding: 16px 24px 32px;
  justify-content: center;
  background: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.06) 45%, transparent 70%);
}

.auth-shell--login .auth-shell-hero {
  margin-bottom: 20px;
}

.auth-shell--login .auth-shell-footer {
  padding: 12px 24px;
  border-top: 1px solid #f1f5f9;
  background-color: #ffffff;
  text-align: center;
  font-size: 11px;
  line-height: 16px;
  color: #94a3b8;
}

/* Register Mobile — tinted surface, 16px gutters, in-flow header and footer.
   The column is capped at 448px so tablets (768–1023px) keep the phone
   composition instead of stretching the form edge to edge. */
.auth-shell--register {
  background-color: #f8f9ff;
}

.auth-shell--register .auth-shell-pane {
  padding: 0 16px 32px;
}

.auth-shell--register .auth-shell-topbar,
.auth-shell--register .auth-shell-footer {
  width: 100%;
  max-width: 448px;
  margin: 0 auto;
}

.auth-shell--register .auth-shell-topbar {
  padding: 8px 0;
}

.auth-shell--register .auth-shell-content {
  max-width: 448px;
}

.auth-shell--register .auth-shell-hero {
  margin-top: 8px;
  margin-bottom: 24px;
}

.auth-shell--register .auth-shell-footer {
  margin-top: 24px;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(86, 94, 116, 0.7);
}

/* ================= DESKTOP (>= 1024px) ================= */
@media (min-width: 1024px) {
  .auth-shell {
    flex-direction: row;
    background-color: #ffffff;
  }

  .auth-shell-hero {
    display: none;
  }

  .auth-shell-visual {
    order: -1;
    position: relative;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }

  .auth-shell-pane {
    justify-content: space-between;
    background-color: #ffffff;
  }

  .auth-shell-content {
    flex: 0 0 auto;
    margin: auto;
  }

  /* Login Desktop — 54/46 split (56/44 at xl), 48px pane padding (64 at xl). */
  .auth-shell--login .auth-shell-visual {
    width: 54%;
  }

  .auth-shell--login .auth-shell-pane {
    padding: 48px;
  }

  .auth-shell--login .auth-shell-topbar {
    position: static;
    margin-bottom: 32px;
    padding: 0;
    border-bottom: none;
    background: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .auth-shell--login .auth-brand {
    --brand-h: 36px;
  }

  .auth-shell--login .auth-shell-content {
    max-width: 420px;
    padding: 16px 0;
    background: none;
  }

  .auth-shell--login .auth-shell-footer {
    padding: 24px 0 0;
    border-top: none;
    background: none;
  }

  /* Register Desktop — 50/50 split, 56px pane padding, 448px column. */
  .auth-shell--register .auth-shell-visual {
    width: 50%;
  }

  .auth-shell--register .auth-shell-pane {
    padding: 56px;
  }

  .auth-shell--register .auth-shell-topbar {
    padding: 0;
  }

  .auth-shell--register .auth-brand {
    --brand-h: 32px;
  }

  .auth-shell--register .auth-shell-content {
    padding: 24px 0;
  }

  .auth-shell--register .auth-shell-footer {
    margin-top: 0;
    padding-top: 24px;
    gap: 8px;
    letter-spacing: 0;
  }
}

@media (min-width: 1280px) {
  .auth-shell--login .auth-shell-visual {
    width: 56%;
  }

  .auth-shell--login .auth-shell-pane {
    padding: 64px;
  }
}
</style>
