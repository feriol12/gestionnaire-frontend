<script setup>
// FE-02 — Illustration de QR strictement fictive et NON scannable.
// Les modules ci-dessous ne forment aucun symbole valide : pas de motif de
// repérage, pas de données encodees, pas de secret. Aucun lecteur ne peut
// en extraire une cle, même par erreur.
</script>

<template>
  <figure class="fe02-demo-qr">
    <svg viewBox="0 0 120 120" class="fe02-demo-qr__drawing" role="img" aria-label="Illustration de QR fictive, non scannable">
      <rect x="0" y="0" width="120" height="120" fill="#ffffff" />
      <g fill="#1e293b">
        <rect x="12" y="12" width="12" height="12" />
        <rect x="36" y="12" width="12" height="12" />
        <rect x="60" y="24" width="12" height="12" />
        <rect x="84" y="12" width="12" height="12" />
        <rect x="12" y="36" width="12" height="12" />
        <rect x="48" y="36" width="12" height="12" />
        <rect x="72" y="48" width="12" height="12" />
        <rect x="96" y="36" width="12" height="12" />
        <rect x="24" y="60" width="12" height="12" />
        <rect x="36" y="72" width="12" height="12" />
        <rect x="60" y="60" width="12" height="12" />
        <rect x="84" y="72" width="12" height="12" />
        <rect x="12" y="84" width="12" height="12" />
        <rect x="48" y="96" width="12" height="12" />
        <rect x="72" y="84" width="12" height="12" />
        <rect x="96" y="96" width="12" height="12" />
      </g>
      <path d="M8 8 L112 112 M112 8 L8 112" stroke="#b91c1c" stroke-width="4" />
      <text x="60" y="64" text-anchor="middle" font-size="16" font-weight="700" fill="#b91c1c">DEMO</text>
    </svg>
    <figcaption class="fe02-demo-qr__caption">Illustration fictive, non scannable — aucun secret n’est encode.</figcaption>
  </figure>
</template>

<style scoped>
.fe02-demo-qr {
  display: flex;
  max-width: 15rem;
  flex-direction: column;
  align-items: center;
  gap: var(--fm-space-xs);
  margin: 0;
}

.fe02-demo-qr__drawing {
  width: 10rem;
  height: 10rem;
  border: 1px solid var(--fm-border);
  border-radius: var(--fm-radius-control);
}

.fe02-demo-qr__caption {
  color: var(--fm-text-muted);
  font: var(--fm-body-sm);
  text-align: center;
}
</style>
