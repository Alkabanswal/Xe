import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'
import { useAlertsStore } from '../stores/alerts'
import type { Alert } from '../types'
import AlertList from './AlertList.vue'

let pinia: ReturnType<typeof createPinia>

const alert = (over: Partial<Alert>): Alert => ({
  id: 'x',
  pair: 'USD/CAD',
  threshold: 1.3,
  direction: 'above',
  currentRate: 1.365,
  triggered: false,
  ...over,
})

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
})

function mountList() {
  return mount(AlertList, { global: { plugins: [pinia] } })
}

test('shows an empty state when there are no alerts', () => {
  expect(mountList().text()).toContain('No alerts yet')
})

test('renders a Triggered badge and highlight only for triggered alerts', () => {
  const store = useAlertsStore()
  store.alerts = [alert({ id: 'a', triggered: false }), alert({ id: 'b', triggered: true })]

  const wrapper = mountList()
  const rows = wrapper.findAll('li')

  expect(rows).toHaveLength(2)
  expect(wrapper.findAll('.badge')).toHaveLength(1)
  expect(rows.filter((r) => r.classes('triggered'))).toHaveLength(1)
})

test('sorts triggered alerts above untriggered ones, keeping creation order otherwise', () => {
  const store = useAlertsStore()
  store.alerts = [
    alert({ id: 'first', pair: 'AAA', triggered: false }),
    alert({ id: 'second', pair: 'BBB', triggered: true }),
    alert({ id: 'third', pair: 'CCC', triggered: false }),
    alert({ id: 'fourth', pair: 'DDD', triggered: true }),
  ]

  const order = mountList()
    .findAll('li')
    .map((r) => r.get('.pair').text())

  expect(order).toEqual(['BBB', 'DDD', 'AAA', 'CCC'])
})

test('delete calls the store with the alert id', async () => {
  const store = useAlertsStore()
  store.alerts = [alert({ id: 'gone' })]
  const removeAlert = vi.spyOn(store, 'removeAlert').mockResolvedValue()

  await mountList().get('.delete').trigger('click')

  expect(removeAlert).toHaveBeenCalledWith('gone')
})
