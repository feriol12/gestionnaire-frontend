<!--
  AuthRegisterVisual — Register Desktop left pane (Stitch b87bb90cf68a441ca06ab70e377419b2).
  Static marketing illustration: figures and categories are decorative demo
  content copied from Stitch, never user data, never fetched.
  The widget stack is aria-hidden; the pill, headline, lead and trust line
  stay readable.
-->
<template>
  <section class="arv">
    <!-- Decorative radial lights + dot grid -->
    <div class="arv-orb arv-orb--1" aria-hidden="true"></div>
    <div class="arv-orb arv-orb--2" aria-hidden="true"></div>
    <div class="arv-orb arv-orb--3" aria-hidden="true"></div>
    <div class="arv-dots" aria-hidden="true"></div>

    <!-- Top pill -->
    <div class="arv-top">
      <p class="arv-pill">
        <span class="arv-pill-dot" aria-hidden="true"></span>
        <span>Gestion personnelle intelligente &amp; sereine</span>
      </p>
    </div>

    <!-- Central composition: "Votre suivi prend forme" -->
    <div class="arv-center" aria-hidden="true">
      <!-- 1. Budget du mois -->
      <div class="arv-card arv-budget">
        <div class="arv-budget-head">
          <span class="arv-budget-icon"><Wallet /></span>
          <p class="arv-budget-title">Budget du mois</p>
        </div>
        <div class="arv-budget-figure">
          <span class="arv-budget-amount">250 XXX <span class="arv-budget-unit">FCFA</span></span>
          <span class="arv-budget-spent">0 FCFA dépensé</span>
        </div>
        <div class="arv-budget-track">
          <div class="arv-budget-fill"></div>
          <div class="arv-budget-knob"></div>
        </div>
      </div>

      <div class="arv-split">
        <!-- 2. Checklist -->
        <div class="arv-card arv-mini">
          <div class="arv-check-head">
            <BadgeCheck class="arv-check-icon" />
            <p class="arv-check-title">Votre suivi prend forme</p>
          </div>
          <ul class="arv-check-list">
            <li><span class="arv-check-tick">✓</span><span>Budget mensuel</span></li>
            <li><span class="arv-check-tick">✓</span><span>Dépenses catégorisées</span></li>
            <li><span class="arv-check-tick">✓</span><span>Vue d'ensemble</span></li>
          </ul>
        </div>

        <!-- 3. Daily expense -->
        <div class="arv-card arv-mini">
          <div class="arv-daily-head">
            <span class="arv-daily-tag">Dépense quotidienne</span>
            <Ellipsis class="arv-daily-more" />
          </div>
          <div class="arv-daily-row">
            <span class="arv-daily-icon"><TrainFront /></span>
            <div>
              <p class="arv-daily-name">Transport</p>
              <p class="arv-daily-date">Aujourd'hui</p>
            </div>
          </div>
          <p class="arv-daily-amount">- 4 500 <span class="arv-daily-unit">FCFA</span></p>
        </div>
      </div>

      <!-- 4. Category chips -->
      <div class="arv-card arv-cats">
        <span class="arv-cats-label">Catégories clés :</span>
        <span class="arv-cat arv-cat--food">Nourriture</span>
        <span class="arv-cat arv-cat--transport">Transport</span>
        <span class="arv-cat arv-cat--bills">Factures</span>
        <span class="arv-cat arv-cat--leisure">Loisirs</span>
        <span class="arv-cat arv-cat--misc">Imprévu</span>
      </div>
    </div>

    <!-- Bottom headline + trust line -->
    <div class="arv-bottom">
      <h2 class="arv-headline">Commencez sereinement.</h2>
      <p class="arv-lead">
        Créez votre espace et posez les bases d'un meilleur suivi de vos dépenses et budgets.
      </p>
      <div class="arv-trust">
        <span>Gestion personnelle</span>
        <span class="arv-trust-dot" aria-hidden="true"></span>
        <span>Gestion en FCFA</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Wallet, BadgeCheck, Ellipsis, TrainFront } from 'lucide-vue-next';
</script>

<style scoped>
.arv {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  overflow: hidden;
  background-color: #070d17;
  color: #f1f5f9;
  user-select: none;
}

/* ---------- backdrops ---------- */
.arv-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(64px);
  pointer-events: none;
}

.arv-orb--1 {
  top: -128px;
  left: -128px;
  width: 384px;
  height: 384px;
  background-color: rgba(30, 58, 138, 0.3);
}

.arv-orb--2 {
  top: 50%;
  right: -96px;
  width: 320px;
  height: 320px;
  background-color: rgba(2, 44, 34, 0.4);
}

.arv-orb--3 {
  bottom: -80px;
  left: 25%;
  width: 384px;
  height: 384px;
  background-color: rgba(23, 37, 84, 0.35);
}

.arv-dots {
  position: absolute;
  inset: 0;
  opacity: 0.25;
  background-image: radial-gradient(#1e293b 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

/* ---------- top pill ---------- */
.arv-top {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
}

.arv-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background-color: rgba(15, 23, 42, 0.8);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #cbd5e1;
}

.arv-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: #34d399;
  animation: arv-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ---------- center stack ---------- */
.arv-center {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 512px;
  margin: auto;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.arv-card {
  border-radius: 16px;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* 1. budget */
.arv-budget {
  position: relative;
  padding: 20px;
  background-color: rgba(15, 23, 42, 0.7);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.arv-budget:hover {
  background-color: rgba(15, 23, 42, 0.9);
}

.arv-budget-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.arv-budget-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background-color: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
}

.arv-budget-icon svg {
  width: 20px;
  height: 20px;
  transform-origin: 50% 50%;
  animation: arv-money-drift 5.5s ease-in-out infinite;
}

.arv-budget-title {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.arv-budget-figure {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.arv-budget-amount {
  font-size: 28px;
  line-height: 34px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.arv-budget-unit,
.arv-budget-spent {
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.02em;
  color: #94a3b8;
}

.arv-budget-unit {
  font-weight: 400;
}

.arv-budget-spent {
  font-weight: 600;
}

.arv-budget-track {
  display: flex;
  align-items: center;
  width: 100%;
  height: 10px;
  padding: 2px;
  overflow: hidden;
  border-radius: 9999px;
  background-color: #1e293b;
}

.arv-budget-fill {
  width: 8px;
  height: 100%;
  border-radius: 9999px;
  background-image: linear-gradient(to right, #3b82f6, #34d399);
}

.arv-budget-knob {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: #6ee7b7;
  box-shadow: 0 1px 2px 0 rgba(52, 211, 153, 0.5);
}

/* 2 + 3. split */
.arv-split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.arv-mini {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  background-color: rgba(15, 23, 42, 0.6);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.arv-check-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.arv-check-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #60a5fa;
}

.arv-check-title {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #e2e8f0;
}

.arv-check-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  line-height: 18px;
  color: #cbd5e1;
}

.arv-check-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arv-check-tick {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 9999px;
  background-color: rgba(16, 185, 129, 0.2);
  font-size: 10px;
  font-weight: 700;
  color: #34d399;
}

.arv-daily-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.arv-daily-tag {
  padding: 2px 8px;
  border-radius: 9999px;
  background-color: rgba(59, 130, 246, 0.1);
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #60a5fa;
}

.arv-daily-more {
  width: 18px;
  height: 18px;
  color: #64748b;
}

.arv-daily-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
}

.arv-daily-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 12px;
  background-color: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.arv-daily-icon svg {
  width: 18px;
  height: 18px;
}

.arv-daily-name {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.arv-daily-date {
  font-size: 12px;
  line-height: 18px;
  color: #94a3b8;
}

.arv-daily-amount {
  margin-top: 4px;
  text-align: right;
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #f1f5f9;
}

.arv-daily-unit {
  font-size: 11px;
  line-height: 14px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

/* 4. categories */
.arv-cats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 14px;
  background-color: rgba(15, 23, 42, 0.4);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}

.arv-cats-label {
  margin-right: 4px;
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.arv-cat {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.arv-cat--food {
  background-color: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
}

.arv-cat--transport {
  background-color: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.arv-cat--bills {
  background-color: rgba(139, 92, 246, 0.15);
  color: #c4b5fd;
}

.arv-cat--leisure {
  background-color: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
}

.arv-cat--misc {
  background-color: rgba(244, 63, 94, 0.15);
  color: #fda4af;
}

/* ---------- bottom ---------- */
.arv-bottom {
  position: relative;
  z-index: 10;
  padding-top: 16px;
}

.arv-headline {
  margin-bottom: 8px;
  font-size: 28px;
  line-height: 32px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.arv-lead {
  max-width: 448px;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.625;
  color: #cbd5e1;
}

.arv-trust {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.arv-trust-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: #334155;
}

/* ---------- motion (Stitch: animate-pulse) ---------- */
@keyframes arv-pulse {
  50% {
    opacity: 0.5;
  }
}

/* Calm decorative drift for the wallet icon: transform-only, so the 36px tile
   keeps its layout size. */
@keyframes arv-money-drift {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-4px) rotate(2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .arv-pill-dot {
    animation: none;
    opacity: 1;
  }

  .arv-budget-icon svg {
    animation: none;
    transform: none;
  }

  .arv-budget {
    transition: none;
  }
}
</style>
