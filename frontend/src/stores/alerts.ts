import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as api from '../api'
import type { Alert, CreateAlertInput, Rate } from '../types'

/**
 * Holds the rate board and the user's alerts. Rates and alerts are refreshed
 * together because the backend computes each alert's `triggered` flag against
 * the latest rates, so a stale rate board would mean a stale trigger state.
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
    try {
      const [nextRates, nextAlerts] = await Promise.all([api.getRates(), api.getAlerts()])
      rates.value = nextRates
      alerts.value = nextAlerts
      lastUpdated.value = new Date().toLocaleTimeString()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Something went wrong.'
    } finally {
      loading.value = false
    }
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
