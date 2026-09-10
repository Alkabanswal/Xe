<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlertsStore } from '../stores/alerts'
import FlagIcon from './FlagIcon.vue'

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
</script>

<template>
  <p v-if="!store.alerts.length" class="empty">No alerts yet — add one above.</p>

  <ul v-else class="alerts">
    <li v-for="alert in sortedAlerts" :key="alert.id" :class="{ triggered: alert.triggered }">
      <div class="detail">
        <span class="pair">
          <span class="pair__flags">
            <FlagIcon :currency="alert.pair.split('/')[0]" />
            <FlagIcon :currency="alert.pair.split('/')[1]" />
          </span>
          {{ alert.pair }}
        </span>
        <span class="rule">
          {{ alert.direction === 'above' ? 'above' : 'below' }} {{ alert.threshold }}
        </span>
        <span v-if="alert.currentRate != null" class="now">now {{ alert.currentRate.toFixed(4) }}</span>
      </div>

      <span v-if="alert.triggered" class="badge" role="status">Triggered</span>

      <button class="delete" @click="remove(alert.id)">Delete</button>
    </li>
  </ul>

  <p v-if="error" class="form-error" role="alert">{{ error }}</p>
</template>

<style scoped>
.empty {
  color: var(--xe-muted);
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
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 18px;
  background: var(--xe-surface);
  border: 1px solid var(--xe-border);
  border-radius: var(--xe-radius-sm);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

li.triggered {
  background: #eaf0ff; /* xe blue tint */
  border-color: #a1bfff; /* xe blue-300 */
  padding-left: 24px;
}

li.triggered::before {
  content: '';
  position: absolute;
  inset-block: 10px;
  left: 8px;
  width: 4px;
  border-radius: 999px;
  background: var(--xe-blue);
}

.detail {
  display: flex;
  gap: 10px;
  align-items: baseline;
  flex: 1;
  flex-wrap: wrap;
}

.pair {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: var(--xe-ink);
}

.pair__flags {
  display: inline-flex;
  gap: 3px;
}

.pair__flags .flag {
  width: 1.2rem;
  height: 1.2rem;
}

.rule {
  color: var(--xe-muted);
  font-size: 0.9rem;
}

.now {
  color: var(--xe-muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.badge {
  background: var(--xe-blue);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 10px;
  border-radius: 999px;
  text-transform: uppercase;
}

.delete {
  border: 1px solid var(--xe-border);
  background: var(--xe-surface);
  color: var(--xe-muted);
  padding: 7px 14px;
  border-radius: 999px;
  font: inherit;
  font-size: 0.83rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.delete:hover {
  border-color: var(--xe-danger);
  color: var(--xe-danger);
}

.form-error {
  margin: 8px 0 0;
  color: var(--xe-danger);
  font-size: 0.85rem;
}
</style>
