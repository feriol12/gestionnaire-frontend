<!--
  MonevaMark — exact compact MONEVA symbol (P3-04).
  Source: Google Stitch project 16709603789976532773, screen
  0add764e645149b1998197be3f933f03 ("MONEVA Logo", 240×60, image/svg+xml).
  The rect/path/circle below are copied verbatim from that SVG; only the
  viewBox is cropped (0 0 240 60 → 4 8 44 44) to the symbol's own rounded-rect
  bounds so the embedded <text> wordmark is excluded. No geometry, fill or
  gradient stop is altered. The gradient id is suffixed per instance because
  the desktop and mobile shells are mounted together and one is always
  display:none — a url(#id) resolving into a hidden SVG would drop the stroke.
  Decorative: the adjacent visible "MONEVA" text carries the brand name.
-->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="4 8 44 44"
    fill="none"
    aria-hidden="true"
    focusable="false"
    class="moneva-mark"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2563EB"/>
        <stop offset="100%" stop-color="#10B981"/>
      </linearGradient>
    </defs>
    <rect x="4" y="8" width="44" height="44" rx="12" fill="#0F172A"/>
    <path d="M14 38V22L21 31L26 25L33 34L38 22V38" :stroke="`url(#${gradientId})`" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="38" cy="18" r="3" fill="#10B981"/>
  </svg>
</template>

<script setup>
import { useId } from 'vue';

const gradientId = `monevaGrad-${useId()}`;
</script>

<style scoped>
.moneva-mark {
  display: block;
  flex-shrink: 0;
}
</style>
