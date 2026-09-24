<!--
  AuthLoginVisual — Login Desktop left pane (Stitch 56a14bfa4a1a4726a77f7620d2324c73).
  Static marketing illustration: every figure below is decorative demo
  content copied from Stitch, never user data, never fetched.
  The four-card financial composition is aria-hidden; the pill, headline,
  paragraph and trust line stay readable.

  Stitch references an undefined `brand-400` token (icon tile, chip dot,
  headline gradient start, trust icon); it renders here as Tailwind's
  blue-400 (#60a5fa), the value the `brand` scale was modelled on.
-->
<template>
  <section class="alv">
    <!-- Ambient backdrops -->
    <div class="alv-grid" aria-hidden="true"></div>
    <div class="alv-orb alv-orb--blue" aria-hidden="true"></div>
    <div class="alv-orb alv-orb--mint" aria-hidden="true"></div>
    <div class="alv-glow" aria-hidden="true"></div>

    <!-- Top pill -->
    <div class="alv-top">
      <p class="alv-pill">
        <span class="alv-pill-dot" aria-hidden="true"></span>
        <span>Gestion personnelle intelligente &amp; sereine</span>
      </p>
    </div>

    <!-- Center composition -->
    <div class="alv-center">
      <div class="alv-stage" aria-hidden="true">
        <!-- 1. Chart card -->
        <div class="alv-card alv-chart">
          <div class="alv-chart-head">
            <div class="alv-chart-title">
              <span class="alv-chart-icon"><TrendingUp /></span>
              <div>
                <p class="alv-chart-name">Suivi du mois en cours</p>
                <p class="alv-chart-sub">Plafond budgétaire mensuel</p>
              </div>
            </div>
            <span class="alv-chart-badge">+18.4% restant</span>
          </div>

          <div class="alv-chart-body">
            <div class="alv-chart-figure">
              <span class="alv-chart-caption">Dépenses réelles vs prévu</span>
              <span class="alv-chart-amount">428 500 <span class="alv-unit">FCFA</span></span>
            </div>
            <svg class="alv-chart-svg" viewBox="0 0 340 70" fill="none">
              <defs>
                <linearGradient :id="areaGradId" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2563EB" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#2563EB" stop-opacity="0" />
                </linearGradient>
                <linearGradient :id="lineGradId" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#2563EB" />
                  <stop offset="50%" stop-color="#3B82F6" />
                  <stop offset="100%" stop-color="#10B981" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="340" y2="20" stroke="#334155" stroke-dasharray="4 4" stroke-width="1.2" />
              <path d="M0 55 C 40 50, 70 42, 110 44 C 150 46, 180 30, 220 28 C 260 26, 290 16, 340 12 L 340 68 L 0 68 Z" :fill="`url(#${areaGradId})`" />
              <path d="M0 55 C 40 50, 70 42, 110 44 C 150 46, 180 30, 220 28 C 260 26, 290 16, 340 12" :stroke="`url(#${lineGradId})`" stroke-width="2.5" stroke-linecap="round" />
              <circle cx="340" cy="12" r="4.5" fill="#10B981" stroke="#0F172A" stroke-width="2.5" />
              <circle cx="220" cy="28" r="3" fill="#3B82F6" />
            </svg>
            <div class="alv-chart-axis">
              <span>Semaine 1</span>
              <span>Semaine 2</span>
              <span>Semaine 3</span>
              <span class="alv-chart-today">Aujourd'hui</span>
            </div>
          </div>
        </div>

        <!-- 2. Recent ticket (floating) -->
        <div class="alv-card alv-ticket alv-float">
          <div class="alv-ticket-head">
            <div class="alv-ticket-title">
              <span class="alv-ticket-icon"><FileText /></span>
              <span class="alv-ticket-label">Ticket récent</span>
            </div>
            <span class="alv-ticket-time">14:32</span>
          </div>
          <div class="alv-ticket-body">
            <div class="alv-ticket-row">
              <span class="alv-ticket-merchant">Supermarché</span>
              <span class="alv-ticket-amount">32 400 F</span>
            </div>
            <div class="alv-ticket-row alv-ticket-row--meta">
              <span>Catégorie</span>
              <span class="alv-ticket-chip">Nourriture</span>
            </div>
          </div>
          <div class="alv-ticket-foot">
            <span class="alv-ticket-impact">Impact budget</span>
            <span class="alv-ticket-ok"><Check /> Conforme</span>
          </div>
        </div>

        <!-- 3. Available budget (floating, delayed) -->
        <div class="alv-card alv-balance alv-float alv-float--delayed">
          <div class="alv-balance-head">
            <span>Budget disponible</span>
            <span class="alv-balance-dot"></span>
          </div>
          <p class="alv-balance-amount">271 500 <span class="alv-balance-unit">FCFA</span></p>
          <div class="alv-balance-track">
            <div class="alv-balance-fill"></div>
          </div>
          <div class="alv-balance-foot">
            <span>68% du mois écoulé</span>
            <span class="alv-balance-ok">Budget sous contrôle</span>
          </div>
        </div>

        <!-- 4. Monthly spend chip -->
        <div class="alv-chip">
          <span class="alv-chip-dot"></span>
          <span>Dépenses du mois : 156 900 FCFA</span>
        </div>
      </div>

      <!-- Emotional headline & value proposition -->
      <div class="alv-copy">
        <h2 class="alv-headline">
          Gérez votre argent.<br />
          <span class="alv-headline-accent">Gardez l'esprit léger.</span>
        </h2>
        <p class="alv-lead">
          Visualisez chaque dépense, maîtrisez vos budgets mensuels et prenez des décisions financières en toute sérénité.
        </p>
      </div>
    </div>

    <!-- Bottom trust line -->
    <div class="alv-trust">
      <div class="alv-trust-group">
        <span>Gestion personnelle</span>
        <span class="alv-trust-item"><ShieldCheck class="alv-trust-icon" aria-hidden="true" /> Devise FCFA native</span>
      </div>
      <span>© 2026 MONEVA</span>
    </div>
  </section>
</template>

<script setup>
import { useId } from 'vue';
import { TrendingUp, FileText, Check, ShieldCheck } from 'lucide-vue-next';

const uid = useId();
const areaGradId = `alvArea-${uid}`;
const lineGradId = `alvLine-${uid}`;
</script>

<style scoped>
.alv {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  overflow: hidden;
  background-color: #070c18;
  border-right: 1px solid rgba(30, 41, 59, 0.4);
  color: #ffffff;
  user-select: none;
}

/* ---------- backdrops ---------- */
.alv-grid,
.alv-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.alv-grid {
  opacity: 0.75;
  background-size: 32px 32px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
}

.alv-glow {
  background: radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.18) 0%, rgba(16, 185, 129, 0.12) 35%, transparent 70%);
}

.alv-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(120px);
  pointer-events: none;
}

.alv-orb--blue {
  top: -128px;
  left: -128px;
  width: 520px;
  height: 520px;
  background-color: rgba(37, 99, 235, 0.2);
}

.alv-orb--mint {
  right: 0;
  bottom: -128px;
  width: 480px;
  height: 480px;
  background-color: rgba(16, 185, 129, 0.15);
}

/* ---------- top pill ---------- */
.alv-top {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
}

.alv-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: #cbd5e1;
}

.alv-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: #34d399;
  animation: alv-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* ---------- center composition ---------- */
.alv-center {
  position: relative;
  z-index: 10;
  margin: auto 0;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.alv-stage {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 360px;
}

.alv-card {
  position: absolute;
  border-radius: 16px;
}

/* 1. chart */
.alv-chart {
  top: 16px;
  left: 32px;
  width: 380px;
  padding: 20px;
  border: 1px solid rgba(51, 65, 85, 0.6);
  background-color: rgba(11, 17, 32, 0.9);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  transition: transform 700ms cubic-bezier(0.4, 0, 0.2, 1);
}

.alv-chart:hover {
  transform: scale(1.01);
}

.alv-chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #1e293b;
}

.alv-chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alv-chart-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
}

.alv-chart-icon svg {
  width: 16px;
  height: 16px;
}

.alv-chart-name {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #e2e8f0;
}

.alv-chart-sub {
  font-size: 11px;
  line-height: 16px;
  color: #94a3b8;
}

.alv-chart-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 9999px;
  background-color: rgba(16, 185, 129, 0.15);
  font-size: 10px;
  line-height: 15px;
  font-weight: 600;
  color: #34d399;
}

.alv-chart-body {
  padding-top: 12px;
}

.alv-chart-figure {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}

.alv-chart-caption {
  font-size: 12px;
  line-height: 16px;
  color: #94a3b8;
}

.alv-chart-amount {
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.alv-unit {
  font-size: 10px;
  font-weight: 400;
  color: #94a3b8;
}

.alv-chart-svg {
  display: block;
  width: 100%;
  height: 80px;
  overflow: visible;
}

.alv-chart-axis {
  display: flex;
  justify-content: space-between;
  padding-top: 4px;
  font-size: 10px;
  line-height: 15px;
  color: #64748b;
}

.alv-chart-today {
  font-weight: 600;
  color: #34d399;
}

/* 2. ticket */
.alv-ticket {
  top: 96px;
  left: -12px;
  width: 230px;
  padding: 16px;
  border: 1px solid #f1f5f9;
  background-color: #ffffff;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  color: #0b1120;
}

.alv-ticket-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.alv-ticket-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alv-ticket-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: #eff6ff;
  color: #2563eb;
}

.alv-ticket-icon svg {
  width: 14px;
  height: 14px;
}

.alv-ticket-label {
  font-size: 11px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #1e293b;
}

.alv-ticket-time {
  font-size: 10px;
  line-height: 15px;
  font-weight: 600;
  color: #94a3b8;
}

.alv-ticket-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 12px;
  line-height: 16px;
}

.alv-ticket-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #334155;
}

.alv-ticket-row--meta {
  font-size: 11px;
  color: #64748b;
}

.alv-ticket-merchant {
  font-weight: 500;
}

.alv-ticket-amount {
  font-weight: 700;
  color: #0b1120;
}

.alv-ticket-chip {
  padding: 1px 6px;
  border-radius: 4px;
  background-color: #f1f5f9;
  font-size: 10px;
  font-weight: 500;
  color: #334155;
}

.alv-ticket-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
}

.alv-ticket-impact {
  font-size: 10px;
  line-height: 15px;
  color: #64748b;
}

.alv-ticket-ok {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 700;
  color: #059669;
}

.alv-ticket-ok svg {
  width: 12px;
  height: 12px;
}

/* 3. balance */
.alv-balance {
  right: 0;
  bottom: 4px;
  width: 260px;
  padding: 16px;
  border: 1px solid rgba(51, 65, 85, 0.8);
  background-color: rgba(15, 23, 42, 0.95);
  box-shadow: 0 25px 50px -12px rgba(30, 58, 138, 0.4);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.alv-balance-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #94a3b8;
}

.alv-balance-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: #34d399;
}

.alv-balance-amount {
  margin-bottom: 8px;
  font-size: 20px;
  line-height: 28px;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.alv-balance-unit {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

.alv-balance-track {
  width: 100%;
  height: 8px;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 9999px;
  background-color: #1e293b;
}

.alv-balance-fill {
  width: 68%;
  height: 100%;
  border-radius: 9999px;
  background-image: linear-gradient(to right, #3b82f6, #34d399, #10b981);
}

.alv-balance-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  line-height: 15px;
  font-weight: 500;
  color: #94a3b8;
}

.alv-balance-ok {
  font-weight: 600;
  color: #34d399;
}

/* 4. chip */
.alv-chip {
  position: absolute;
  top: 0;
  right: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid rgba(51, 65, 85, 0.7);
  border-radius: 12px;
  background-color: rgba(30, 41, 59, 0.9);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: #e2e8f0;
}

.alv-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: #60a5fa;
}

/* ---------- headline ---------- */
.alv-copy {
  max-width: 448px;
  margin-top: 32px;
  text-align: center;
}

.alv-headline {
  font-size: 24px;
  line-height: 1.375;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.alv-headline-accent {
  background-image: linear-gradient(to right, #60a5fa, #bfdbfe, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.alv-lead {
  max-width: 384px;
  margin: 12px auto 0;
  font-size: 14px;
  line-height: 1.625;
  color: #94a3b8;
}

/* ---------- trust line ---------- */
.alv-trust {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(30, 41, 59, 0.6);
  font-size: 12px;
  line-height: 16px;
  color: #64748b;
}

.alv-trust-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.alv-trust-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.alv-trust-icon {
  width: 16px;
  height: 16px;
  color: #60a5fa;
}

/* ---------- motion (Stitch: ping, float-slow, float-delayed) ---------- */
.alv-float {
  animation: alv-float 6s ease-in-out infinite;
}

.alv-float--delayed {
  animation-delay: 3s;
}

@keyframes alv-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes alv-ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@media (min-width: 1280px) {
  .alv {
    padding: 64px;
  }

  .alv-headline {
    font-size: 30px;
  }
}

/* Decorative motion stops cleanly; cards and dot rest at their normal state. */
@media (prefers-reduced-motion: reduce) {
  .alv-float,
  .alv-float--delayed,
  .alv-pill-dot {
    animation: none;
    transform: none;
    opacity: 1;
  }

  .alv-chart,
  .alv-chart:hover {
    transition: none;
    transform: none;
  }
}
</style>
