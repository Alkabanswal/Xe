import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'
import * as api from '../api'
import type { Alert } from '../types'
import { useAlertsStore } from './alerts'

vi.mock('../api')

const rate = (pair: string, r: number) => ({ pair, rate: r, asOf: '2026-01-01T00:00:00Z' })
const alert = (over: Partial<Alert> = {}): Alert => ({
  id: crypto.randomUUID(),
  pair: 'USD/CAD',
  threshold: 1.3,
  direction: 'above',
  currentRate: 1.365,
  triggered: false,
  ...over,
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
})

test('refresh loads rates and alerts and stamps lastUpdated', async () => {
  vi.mocked(api.getRates).mockResolvedValue([rate('USD/CAD', 1.365)])
  vi.mocked(api.getAlerts).mockResolvedValue([alert()])

  const store = useAlertsStore()
  await store.refresh()

  expect(store.rates).toHaveLength(1)
  expect(store.alerts).toHaveLength(1)
  expect(store.lastUpdated).not.toBe('')
  expect(store.error).toBeNull()
})

test('a failing rates fetch does not wipe the alerts list', async () => {
  vi.mocked(api.getRates).mockRejectedValue(new Error('rates are down'))
  vi.mocked(api.getAlerts).mockResolvedValue([alert(), alert()])

  const store = useAlertsStore()
  await store.refresh()

  expect(store.alerts).toHaveLength(2)
  expect(store.rates).toEqual([])
  expect(store.error).toBe('rates are down')
  expect(store.lastUpdated).toBe('')
})

test('triggeredCount / triggeredAlerts reflect the triggered flag', async () => {
  vi.mocked(api.getRates).mockResolvedValue([])
  vi.mocked(api.getAlerts).mockResolvedValue([
    alert({ triggered: true, pair: 'GBP/USD' }),
    alert({ triggered: false }),
    alert({ triggered: true, pair: 'EUR/USD' }),
  ])

  const store = useAlertsStore()
  await store.refresh()

  expect(store.triggeredCount).toBe(2)
  expect(store.triggeredAlerts.map((a) => a.pair)).toEqual(['GBP/USD', 'EUR/USD'])
})

test('rateFor returns the matching rate or undefined', async () => {
  vi.mocked(api.getRates).mockResolvedValue([rate('USD/CAD', 1.365)])
  vi.mocked(api.getAlerts).mockResolvedValue([])

  const store = useAlertsStore()
  await store.refresh()

  expect(store.rateFor('USD/CAD')).toBe(1.365)
  expect(store.rateFor('EUR/USD')).toBeUndefined()
})

test('addAlert appends the created alert', async () => {
  const created = alert({ id: 'new-one', triggered: true })
  vi.mocked(api.createAlert).mockResolvedValue(created)

  const store = useAlertsStore()
  const result = await store.addAlert({ pair: 'USD/CAD', threshold: 1.3, direction: 'above' })

  expect(result).toBe(created)
  expect(store.alerts).toEqual([created])
})

test('removeAlert drops the alert only after the API call resolves', async () => {
  vi.mocked(api.getRates).mockResolvedValue([])
  const keep = alert({ id: 'keep' })
  const drop = alert({ id: 'drop' })
  vi.mocked(api.getAlerts).mockResolvedValue([keep, drop])
  vi.mocked(api.deleteAlert).mockResolvedValue()

  const store = useAlertsStore()
  await store.refresh()
  await store.removeAlert('drop')

  expect(api.deleteAlert).toHaveBeenCalledWith('drop')
  expect(store.alerts).toEqual([keep])
})
