<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AlertForm from './components/AlertForm.vue'
import AlertList from './components/AlertList.vue'
import FlagIcon from './components/FlagIcon.vue'
import XeLogo from './components/XeLogo.vue'
import { useAlertsStore } from './stores/alerts'

const store = useAlertsStore()

const triggeredPairs = computed(() =>
  store.triggeredAlerts.map((a) => a.pair).join(', '),
)

const cards = [
  { pair: 'USD/CAD', base: 'USD', quote: 'CAD', caption: '1 US dollar in Canadian dollars' },
  { pair: 'GBP/USD', base: 'GBP', quote: 'USD', caption: '1 British pound in US dollars' },
  { pair: 'EUR/USD', base: 'EUR', quote: 'USD', caption: '1 euro in US dollars' },
]

function display(pair: string): string {
  const rate = store.rateFor(pair)
  return rate === undefined ? '…' : rate.toFixed(4)
}

onMounted(() => {
  store.refresh()
})
</script>

<template>
  <div class="app">
    <div class="top">
      <header id="siteHeader" class="site-header">
        <a
          class="brand"
          href="https://www.xe.com/"
          target="_blank"
          rel="noopener"
          aria-label="Xe home"
        >
          <XeLogo />
          <span class="brand__divider" aria-hidden="true"></span>
          <span class="brand__name">Rate Board</span>
        </a>
        <span class="updated" v-if="store.lastUpdated">Updated {{ store.lastUpdated }}</span>
      </header>

      <div class="hero">
        <h1>Live exchange rates</h1>
        <p>Mid-market rates from the Xe Currency Data API — set an alert and we'll flag it when it crosses your threshold.</p>
      </div>
    </div>

    <main class="page">
      <p v-if="store.error" class="error" role="alert">{{ store.error }}</p>

      <section class="panel rates-panel">
        <div class="rate" v-for="card in cards" :key="card.pair">
          <div class="rate__pair">
            <FlagIcon :currency="card.base" />{{ card.base }}
            <span class="rate__sep">/</span>
            <FlagIcon :currency="card.quote" />{{ card.quote }}
          </div>
          <div class="rate__value">{{ display(card.pair) }}</div>
          <div class="rate__caption">{{ card.caption }}</div>
        </div>
      </section>

      <div class="rates-actions">
        <button class="btn btn--ghost" :disabled="store.loading" @click="store.refresh()">
          {{ store.loading ? 'Refreshing…' : 'Refresh rates' }}
        </button>
      </div>

      <section class="panel alerts-panel">
        <h2>Rate alerts</h2>
        <AlertForm />

        <p v-if="store.triggeredCount" class="triggered-banner" role="status">
          <span class="triggered-banner__dot" aria-hidden="true"></span>
          <strong>{{ store.triggeredCount }} {{ store.triggeredCount === 1 ? 'alert' : 'alerts' }} triggered</strong>
          <span class="triggered-banner__pairs">{{ triggeredPairs }}</span>
        </p>

        <AlertList />
      </section>
    </main>
  </div>
</template>

<style>
:root {
  --xe-blue: #0533ff;
  --xe-blue-hover: #1658ff;
  --xe-blue-active: #0c37bd;
  --xe-navy-from: #010a4d; /* deep hero blue */
  --xe-navy-to: #0b2fd6;

  --xe-ink: #18191a; /* neutral-1000 */
  --xe-text: #434341; /* xe.com body copy */
  --xe-muted: #636e82; /* greyblue-300 */

  --xe-surface: #ffffff;
  --xe-bg: #f6f7fb;
  --xe-border: #edeff3; /* neutral-400 */

  --xe-success: #009256;
  --xe-danger: #d60009;
  --xe-danger-bg: #fff8f6;

  --xe-radius: 20px;
  --xe-radius-sm: 12px;
  --xe-shadow: 0 18px 48px -20px rgba(4, 16, 70, 0.28);
  --xe-shadow-sm: 0 8px 24px -14px rgba(4, 16, 70, 0.22);

  --xe-font: 'Zalando Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--xe-font);
  background: var(--xe-bg);
  color: var(--xe-text);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1,
h2,
h3 {
  color: var(--xe-ink);
  letter-spacing: -0.03em;
}

/* ---- Blue hero: header + intro share one gradient, like xe.com ---- */
.top {
  background: radial-gradient(120% 140% at 15% 0%, var(--xe-navy-to) 0%, var(--xe-navy-from) 62%);
  color: #ffffff;
  padding-bottom: 84px;
}

.site-header {
  max-width: 1120px;
  margin: 0 auto;
  height: 72px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #ffffff;
  text-decoration: none;
}

.brand__divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.35);
}

.brand__name {
  font-size: 1.05rem;
  font-weight: 600;
}

.updated {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
}

.hero {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 24px 0;
  text-align: center;
}

.hero h1 {
  color: #ffffff;
  font-size: clamp(2rem, 5vw, 3.1rem);
  line-height: 1.05;
  font-weight: 700;
  margin: 0 0 16px;
}

.hero p {
  margin: 0 auto;
  max-width: 560px;
  font-size: 1.05rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.82);
}

/* ---- Content floats up over the blue ---- */
.page {
  width: 100%;
  max-width: 860px;
  margin: -64px auto 0;
  padding: 0 20px 72px;
  position: relative;
}

.panel {
  background: var(--xe-surface);
  border-radius: var(--xe-radius);
  box-shadow: var(--xe-shadow);
  padding: 28px;
}

.rates-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 0;
  overflow: hidden;
}

.rate {
  padding: 26px 24px;
}

.rate + .rate {
  border-left: 1px solid var(--xe-border);
}

.rate__pair {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--xe-muted);
}

.rate__pair .flag {
  width: 1.4em;
  height: 1.4em;
}

.rate__sep {
  color: var(--xe-border);
  margin: 0 -2px;
}

.rate__value {
  font-size: 2.3rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--xe-ink);
  margin: 8px 0 6px;
  font-variant-numeric: tabular-nums;
}

.rate__caption {
  font-size: 0.8rem;
  color: var(--xe-muted);
}

.rates-actions {
  display: flex;
  justify-content: center;
  margin: 20px 0 40px;
}

.alerts-panel h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 20px;
}

.alerts-panel .alert-form {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--xe-border);
}

/* ---- Pills — xe.com buttons are fully rounded ---- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 11px 22px;
  font: inherit;
  font-weight: 550;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.btn--primary {
  background: var(--xe-blue);
  color: #ffffff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--xe-blue-hover);
}

.btn--primary:active:not(:disabled) {
  background: var(--xe-blue-active);
}

.btn--ghost {
  background: var(--xe-surface);
  border-color: #dfe3ec;
  color: var(--xe-ink);
  box-shadow: var(--xe-shadow-sm);
}

.btn--ghost:hover:not(:disabled) {
  border-color: var(--xe-blue);
  color: var(--xe-blue);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ---- Banners ---- */
.error {
  background: var(--xe-danger-bg);
  border: 1px solid #f3c8c4;
  color: var(--xe-danger);
  padding: 14px 18px;
  border-radius: var(--xe-radius-sm);
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.triggered-banner {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  background: var(--xe-blue); /* solid xe blue, like an xe.com CTA */
  color: #ffffff;
  padding: 13px 20px;
  border-radius: 999px;
  font-size: 0.92rem;
  margin-bottom: 16px;
  box-shadow: 0 10px 24px -12px rgba(5, 51, 255, 0.5);
}

.triggered-banner strong {
  color: #ffffff;
}

.triggered-banner__dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.25);
}

.triggered-banner__pairs {
  color: rgba(255, 255, 255, 0.82);
}

@media (max-width: 640px) {
  .top {
    padding-bottom: 60px;
  }

  .hero {
    padding-top: 28px;
  }

  .hero h1 {
    font-size: 1.9rem;
  }

  .hero p {
    font-size: 0.98rem;
  }

  .page {
    margin-top: -44px;
  }

  .panel {
    padding: 20px;
  }

  .rates-panel {
    grid-template-columns: 1fr;
    padding: 0;
  }

  .rate {
    padding: 20px;
  }

  .rate + .rate {
    border-left: none;
    border-top: 1px solid var(--xe-border);
  }

  .rates-actions {
    margin: 16px 0 32px;
  }
}
</style>
