<!--
  AuthMobileHero — compact financial card at the top of the mobile/tablet
  auth composition (< 1024px; AuthShell hides it on desktop).
    variant="login"    — Stitch Login Mobile a4dd4c9401374a03ba3da2e2860ccb62
    variant="register" — Stitch Register Mobile da569c36af6749a4b680614012fd7afe
  Static marketing illustration: the 72% progress, the 250 XXX FCFA budget
  and the 45/25/15 split are decorative Stitch demo values, never user
  data. Hook copy stays readable; demo figures and bars are aria-hidden.
-->
<template>
  <div v-if="variant === 'login'" class="amh amh--login">
    <div class="amh-orb amh-orb--blue" aria-hidden="true"></div>
    <div class="amh-orb amh-orb--mint" aria-hidden="true"></div>

    <div class="amh-login-row">
      <div class="amh-login-hook">
        <span class="amh-login-icon" aria-hidden="true"><CircleDollarSign /></span>
        <div>
          <p class="amh-login-kicker">Prenez le contrôle</p>
          <p class="amh-login-title">Gardez l'esprit léger</p>
        </div>
      </div>
      <div class="amh-login-aside">
        <p class="amh-login-badge"><Check aria-hidden="true" /> Budgets FCFA</p>
        <p class="amh-login-note">Dépenses maîtrisées</p>
      </div>
    </div>

    <div class="amh-login-foot">
      <span>Suivi mensuel instantané</span>
      <span class="amh-login-progress" aria-hidden="true">
        <span class="amh-login-track"><span class="amh-login-fill"></span></span>
        <span class="amh-login-pct">72%</span>
      </span>
    </div>
  </div>

  <div v-else class="amh amh--register">
    <div class="amh-orb amh-orb--primary" aria-hidden="true"></div>

    <div class="amh-reg-head">
      <p class="amh-reg-kicker">Votre suivi prend forme</p>
      <span class="amh-reg-pill">Devise FCFA</span>
    </div>
    <div aria-hidden="true">
      <p class="amh-reg-title">Budget du mois : 250 XXX FCFA</p>
      <div class="amh-reg-bar">
        <span class="amh-reg-seg amh-reg-seg--food"></span>
        <span class="amh-reg-seg amh-reg-seg--transport"></span>
        <span class="amh-reg-seg amh-reg-seg--bills"></span>
      </div>
      <div class="amh-reg-legend">
        <span><i class="amh-reg-dot amh-reg-dot--food"></i>Nourriture</span>
        <span><i class="amh-reg-dot amh-reg-dot--transport"></i>Transport</span>
        <span><i class="amh-reg-dot amh-reg-dot--bills"></i>Factures</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CircleDollarSign, Check } from 'lucide-vue-next';

defineProps({
  variant: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
});
</script>

<style scoped>
.amh {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 16px;
}

.amh > :not(.amh-orb) {
  position: relative;
  z-index: 1;
}

.amh-orb {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
}

/* ================= login ================= */
.amh--login {
  border: 1px solid #1e293b;
  border-radius: 16px;
  background-image: linear-gradient(to bottom right, #0b1120, #0b1120, #0f172a);
  box-shadow: 0 20px 25px -5px rgba(11, 17, 32, 0.1), 0 8px 10px -6px rgba(11, 17, 32, 0.1);
  color: #ffffff;
}

.amh-orb--blue {
  right: -32px;
  bottom: -32px;
  width: 128px;
  height: 128px;
  background-color: rgba(37, 99, 235, 0.3);
  filter: blur(40px);
}

.amh-orb--mint {
  top: -32px;
  left: -32px;
  width: 96px;
  height: 96px;
  background-color: rgba(16, 185, 129, 0.2);
  filter: blur(24px);
}

.amh-login-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.amh-login-hook {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amh-login-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  background-color: rgba(37, 99, 235, 0.25);
  color: #60a5fa;
}

.amh-login-icon svg {
  width: 20px;
  height: 20px;
  transform-origin: 50% 50%;
  animation: amh-money-drift 5.5s ease-in-out infinite;
}

/* Calm decorative drift (slightly smaller than the Register desktop wallet);
   transform-only, so the 40px tile keeps its layout size. */
@keyframes amh-money-drift {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(1.5deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .amh-login-icon svg {
    animation: none;
    transform: none;
  }
}

.amh-login-kicker {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #94a3b8;
}

.amh-login-title {
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.amh-login-aside {
  text-align: right;
}

.amh-login-badge {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 600;
  color: #34d399;
}

.amh-login-badge svg {
  width: 12px;
  height: 12px;
}

.amh-login-note {
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  color: #cbd5e1;
}

.amh-login-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(30, 41, 59, 0.8);
  font-size: 10px;
  line-height: 15px;
  color: #94a3b8;
}

.amh-login-progress {
  display: flex;
  align-items: center;
  gap: 6px;
}

.amh-login-track {
  display: inline-block;
  width: 48px;
  height: 6px;
  overflow: hidden;
  border-radius: 9999px;
  background-color: #1e293b;
}

.amh-login-fill {
  display: block;
  width: 72%;
  height: 100%;
  border-radius: 9999px;
  background-image: linear-gradient(to right, #3b82f6, #34d399);
}

.amh-login-pct {
  font-weight: 500;
  color: #cbd5e1;
}

/* ================= register ================= */
.amh--register {
  border-radius: 12px;
  background-color: #213145;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  color: #eaf1ff;
}

.amh-orb--primary {
  right: -24px;
  bottom: -24px;
  width: 112px;
  height: 112px;
  background-color: rgba(0, 74, 198, 0.2);
  filter: blur(24px);
}

.amh-reg-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.amh-reg-kicker,
.amh-reg-pill,
.amh-reg-legend {
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.amh-reg-kicker {
  color: #d3e4fe;
}

.amh-reg-pill {
  padding: 2px 8px;
  border-radius: 9999px;
  background-color: #2563eb;
  color: #eeefff;
  white-space: nowrap;
}

.amh-reg-title {
  margin-bottom: 8px;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #f8f9ff;
}

.amh-reg-bar {
  display: flex;
  width: 100%;
  height: 6px;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 9999px;
  background-color: rgba(86, 94, 116, 0.3);
}

.amh-reg-seg {
  display: block;
  height: 100%;
}

.amh-reg-seg--food {
  width: 45%;
  background-color: #4edea3;
}

.amh-reg-seg--transport {
  width: 25%;
  background-color: #2563eb;
}

.amh-reg-seg--bills {
  width: 15%;
  background-color: #dae2fd;
}

.amh-reg-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(211, 228, 254, 0.8);
}

.amh-reg-legend span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.amh-reg-dot {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
}

.amh-reg-dot--food {
  background-color: #4edea3;
}

.amh-reg-dot--transport {
  background-color: #2563eb;
}

.amh-reg-dot--bills {
  background-color: #dae2fd;
}
</style>
