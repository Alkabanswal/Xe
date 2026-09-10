<script setup lang="ts">
import { onMounted } from 'vue'
import AlertForm from './components/AlertForm.vue'
import AlertList from './components/AlertList.vue'
import { useAlertsStore } from './stores/alerts'

const store = useAlertsStore()

const cards = [
  { pair: 'USD/CAD', caption: '1 US dollar in Canadian dollars' },
  { pair: 'GBP/USD', caption: '1 British pound in US dollars' },
  { pair: 'EUR/USD', caption: '1 euro in US dollars' },
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
  <main class="page">
    <header class="header">
      <h1>Xe Rate Board</h1>
      <span class="updated" v-if="store.lastUpdated">Last updated {{ store.lastUpdated }}</span>
    </header>

    <p v-if="store.error" class="error" role="alert">{{ store.error }}</p>

    <section class="cards">
      <div class="card" v-for="card in cards" :key="card.pair">
        <div class="pair">{{ card.pair.replace('/', ' / ') }}</div>
        <div class="rate">{{ display(card.pair) }}</div>
        <div class="caption">{{ card.caption }}</div>
      </div>
    </section>

    <button class="refresh" :disabled="store.loading" @click="store.refresh()">
      {{ store.loading ? 'Refreshing…' : 'Refresh rates' }}
    </button>

    <section class="alerts-section">
      <h2>Rate alerts</h2>
      <AlertForm />
      <AlertList />
    </section>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #f4f6f8;
  color: #1a2233;
}

.page {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 20px;
}

.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
}

h1 {
  font-size: 1.6rem;
  margin: 0;
}

.updated {
  font-size: 0.85rem;
  color: #66718a;
}

.error {
  background: #fdecea;
  border: 1px solid #f5c2bd;
  color: #b42318;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  background: #ffffff;
  border: 1px solid #e1e6ee;
  border-radius: 10px;
  padding: 20px;
}

.pair {
  font-size: 0.9rem;
  font-weight: 600;
  color: #66718a;
  letter-spacing: 0.04em;
}

.rate {
  font-size: 2rem;
  font-weight: 700;
  margin: 8px 0 4px;
  font-variant-numeric: tabular-nums;
}

.caption {
  font-size: 0.8rem;
  color: #8a93a8;
}

.refresh {
  margin-top: 24px;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #16345c;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
}

.refresh:hover {
  background: #1d4377;
}

.refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alerts-section {
  margin-top: 40px;
}

.alerts-section h2 {
  font-size: 1.2rem;
  margin: 0 0 16px;
}

.alerts-section .alert-form {
  margin-bottom: 20px;
}
</style>
