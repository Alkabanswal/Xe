<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlertsStore } from '../stores/alerts'

const store = useAlertsStore()
const error = ref<string | null>(null)

// Triggered alerts float to the top; sort is stable so each group keeps
// its original creation order.
const sortedAlerts = computed(() =>
  [...store.alerts].sort((a, b) => Number(b.triggered) - Number(a.triggered)),
)

async function remove(id: string) {
  error.value = null
  try {
    await store.removeAlert(id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not delete alert.'
  }
}

function currentRate(pair: string): string | null {
  const rate = store.rateFor(pair)
  return rate === undefined ? null : rate.toFixed(4)
}
</script>

<template>
  <p v-if="!store.alerts.length" class="empty">No alerts yet — add one above.</p>

  <ul v-else class="alerts">
    <li v-for="alert in sortedAlerts" :key="alert.id" :class="{ triggered: alert.triggered }">
      <div class="detail">
        <span class="pair">{{ alert.pair }}</span>
        <span class="rule">
          {{ alert.direction === 'above' ? 'above' : 'below' }} {{ alert.threshold }}
        </span>
        <span v-if="currentRate(alert.pair)" class="now">now {{ currentRate(alert.pair) }}</span>
      </div>

      <span v-if="alert.triggered" class="badge" role="status">Triggered</span>

      <button class="delete" @click="remove(alert.id)">Delete</button>
    </li>
  </ul>

  <p v-if="error" class="form-error" role="alert">{{ error }}</p>
</template>

<style scoped>
.empty {
  color: #8a93a8;
  font-size: 0.9rem;
}

.alerts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e1e6ee;
  border-radius: 8px;
}

li.triggered {
  border-color: #f0a202;
  background: #fff8e8;
}

.detail {
  display: flex;
  gap: 10px;
  align-items: baseline;
  flex: 1;
  flex-wrap: wrap;
}

.pair {
  font-weight: 600;
}

.rule {
  color: #66718a;
  font-size: 0.9rem;
}

.now {
  color: #8a93a8;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.badge {
  background: #f0a202;
  color: #1a2233;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}

.delete {
  border: 1px solid #cdd4e0;
  background: #fff;
  color: #66718a;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.delete:hover {
  border-color: #b42318;
  color: #b42318;
}

.form-error {
  margin: 8px 0 0;
  color: #b42318;
  font-size: 0.85rem;
}
</style>
