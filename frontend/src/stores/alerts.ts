import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as api from '../api'
import type { Alert, CreateAlertInput, Rate } from '../types'

/**
 * Holds the rate board and the user's alerts. `refresh` reloads both together
 * (the backend recomputes each alert's `triggered` flag on read), but the two
 * fetches are independent: if the rates API is down — the README warns it can
 * be — the alerts list still loads, and vice versa.
 */
export const useAlertsStore = defineStore('alerts', () => {
  const rates = ref<Rate[]>([])
  const alerts = ref<Alert[]>([])
  const lastUpdated = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const triggeredAlerts = computed(() => alerts.value.filter((a) => a.triggered))
  const triggeredCount = computed(() => triggeredAlerts.value.length)

  function rateFor(pair: string): number | undefined {
    return rates.value.find((r) => r.pair === pair)?.rate
  }

  async function refresh(): Promise<void> {
    loading.value = true
    error.value = null

    const [ratesResult, alertsResult] = await Promise.allSettled([
      api.getRates(),
      api.getAlerts(),
    ])

    if (ratesResult.status === 'fulfilled') {
      rates.value = ratesResult.value
    }
    if (alertsResult.status === 'fulfilled') {
      alerts.value = alertsResult.value
    }

    const failure = [ratesResult, alertsResult].find((r) => r.status === 'rejected')
    if (failure && failure.status === 'rejected') {
      error.value =
        failure.reason instanceof Error ? failure.reason.message : 'Could not refresh.'
    } else {
      lastUpdated.value = new Date().toLocaleTimeString()
    }

    loading.value = false
  }

  async function addAlert(input: CreateAlertInput): Promise<Alert> {
    const created = await api.createAlert(input)
    alerts.value = [...alerts.value, created]
    return created
  }

  async function removeAlert(id: string): Promise<void> {
    await api.deleteAlert(id)
    alerts.value = alerts.value.filter((a) => a.id !== id)
  }

  return {
    rates,
    alerts,
    lastUpdated,
    loading,
    error,
    triggeredAlerts,
    triggeredCount,
    rateFor,
    refresh,
    addAlert,
    removeAlert,
  }
})
