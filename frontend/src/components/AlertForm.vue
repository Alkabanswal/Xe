<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlertsStore } from '../stores/alerts'
import type { Direction } from '../types'

// Fallback until the rate board has loaded; the stub only accepts these three.
const FALLBACK_PAIRS = ['USD/CAD', 'GBP/USD', 'EUR/USD']

const store = useAlertsStore()

const pairs = computed(() =>
  store.rates.length ? store.rates.map((r) => r.pair) : FALLBACK_PAIRS,
)

const pair = ref(FALLBACK_PAIRS[0])
const direction = ref<Direction>('above')
const threshold = ref<number | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)

const valid = computed(() => threshold.value !== null && threshold.value > 0)

async function submit() {
  if (!valid.value || submitting.value) return
  submitting.value = true
  error.value = null
  try {
    await store.addAlert({
      pair: pair.value,
      threshold: threshold.value as number,
      direction: direction.value,
    })
    threshold.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not create alert.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="alert-form" @submit.prevent="submit">
    <label>
      Pair
      <select v-model="pair">
        <option v-for="p in pairs" :key="p" :value="p">{{ p }}</option>
      </select>
    </label>

    <label>
      Direction
      <select v-model="direction">
        <option value="above">Above</option>
        <option value="below">Below</option>
      </select>
    </label>

    <label>
      Threshold
      <input
        v-model.number="threshold"
        type="number"
        step="0.0001"
        min="0"
        placeholder="1.8400"
      />
    </label>

    <button type="submit" :disabled="!valid || submitting">
      {{ submitting ? 'Adding…' : 'Add alert' }}
    </button>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
  </form>
</template>

<style scoped>
.alert-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: #66718a;
}

select,
input {
  padding: 8px 10px;
  border: 1px solid #cdd4e0;
  border-radius: 6px;
  font-size: 0.9rem;
}

button {
  padding: 9px 16px;
  border: none;
  border-radius: 6px;
  background: #16345c;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-error {
  flex-basis: 100%;
  margin: 0;
  color: #b42318;
  font-size: 0.85rem;
}
</style>
