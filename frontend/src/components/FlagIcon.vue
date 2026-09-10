<script setup lang="ts">
import { computed } from 'vue'

// Circular flag SVGs (from the public-domain circle-flags set), inlined so the
// app has no runtime asset dependency. Mask ids are made unique per flag to
// avoid collisions when several render on the page.
const CURRENCY_COUNTRY: Record<string, string> = {
  USD: 'us',
  CAD: 'ca',
  GBP: 'gb',
  EUR: 'eu',
}

const FLAGS: Record<string, string> = {
  us: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><mask id="f-us"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#f-us)"><path fill="#eee" d="M256 0h256v64l-32 32 32 32v64l-32 32 32 32v64l-32 32 32 32v64l-256 32L0 448v-64l32-32-32-32v-64z"/><path fill="#d80027" d="M224 64h288v64H224Zm0 128h288v64H256ZM0 320h512v64H0Zm0 128h512v64H0Z"/><path fill="#0052b4" d="M0 0h256v256H0Z"/><path fill="#eee" d="m187 243 57-41h-70l57 41-22-67zm-81 0 57-41H93l57 41-22-67zm-81 0 57-41H12l57 41-22-67zm162-81 57-41h-70l57 41-22-67zm-81 0 57-41H93l57 41-22-67zm-81 0 57-41H12l57 41-22-67Zm162-82 57-41h-70l57 41-22-67Zm-81 0 57-41H93l57 41-22-67zm-81 0 57-41H12l57 41-22-67Z"/></g></svg>',
  ca: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><mask id="f-ca"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#f-ca)"><path fill="#d80027" d="M0 0v512h144l112-64 112 64h144V0H368L256 64 144 0Z"/><path fill="#eee" d="M144 0h224v512H144Z"/><path fill="#d80027" d="m301 289 44-22-22-11v-22l-45 22 23-44h-23l-22-34-22 33h-23l23 45-45-22v22l-22 11 45 22-12 23h45v33h22v-33h45z"/></g></svg>',
  gb: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><mask id="f-gb"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#f-gb)"><path fill="#eee" d="m0 0 8 22-8 23v23l32 54-32 54v32l32 48-32 48v32l32 54-32 54v68l22-8 23 8h23l54-32 54 32h32l48-32 48 32h32l54-32 54 32h68l-8-22 8-23v-23l-32-54 32-54v-32l-32-48 32-48v-32l-32-54 32-54V0l-22 8-23-8h-23l-54 32-54-32h-32l-48 32-48-32h-32l-54 32L68 0H0z"/><path fill="#0052b4" d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z"/><path fill="#d80027" d="M0 0v45l131 131h45L0 0zm208 0v208H0v96h208v208h96V304h208v-96H304V0h-96zm259 0L336 131v45L512 0h-45zM176 336 0 512h45l131-131v-45zm160 0 176 176v-45L381 336h-45z"/></g></svg>',
  eu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><mask id="f-eu"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#f-eu)"><path fill="#0052b4" d="M0 0h512v512H0z"/><path fill="#ffda44" d="m256 100.2 8.3 25.5H291l-21.7 15.7 8.3 25.6-21.7-15.8-21.7 15.8 8.3-25.6-21.7-15.7h26.8zm-110.2 45.6 24 12.2 18.9-19-4.2 26.5 23.9 12.2-26.5 4.2-4.2 26.5-12.2-24-26.5 4.3 19-19zM100.2 256l25.5-8.3V221l15.7 21.7 25.6-8.3-15.8 21.7 15.8 21.7-25.6-8.3-15.7 21.7v-26.8zm45.6 110.2 12.2-24-19-18.9 26.5 4.2 12.2-23.9 4.2 26.5 26.5 4.2-24 12.2 4.3 26.5-19-19zM256 411.8l-8.3-25.5H221l21.7-15.7-8.3-25.6 21.7 15.8 21.7-15.8-8.3 25.6 21.7 15.7h-26.8zm110.2-45.6-24-12.2-18.9 19 4.2-26.5-23.9-12.2 26.5-4.2 4.2-26.5 12.2 24 26.5-4.3-19 19zM411.8 256l-25.5 8.3V291l-15.7-21.7-25.6 8.3 15.8-21.7-15.8-21.7 25.6 8.3 15.7-21.7v26.8zm-45.6-110.2-12.2 24 19 18.9-26.5-4.2-12.2 23.9-4.2-26.5-26.5-4.2 24-12.2-4.3-26.5 19 19z"/></g></svg>',
}

const props = defineProps<{ currency?: string }>()

const svg = computed(() => {
  const country = CURRENCY_COUNTRY[(props.currency ?? '').toUpperCase()]
  return country ? FLAGS[country] : ''
})
</script>

<template>
  <span v-if="svg" class="flag" role="img" :aria-label="currency ?? ''" v-html="svg"></span>
</template>

<style scoped>
.flag {
  display: inline-flex;
  width: 1.25em;
  height: 1.25em;
  flex: none;
}

.flag :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
