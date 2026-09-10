import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'
import { useAlertsStore } from '../stores/alerts'
import AlertForm from './AlertForm.vue'

let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
})

function mountForm() {
  return mount(AlertForm, { global: { plugins: [pinia] } })
}

test('submit is disabled until the threshold is a positive number', async () => {
  const wrapper = mountForm()
  const button = wrapper.get('button[type="submit"]')

  expect(button.attributes('disabled')).toBeDefined()

  await wrapper.get('input[type="number"]').setValue('-1')
  expect(button.attributes('disabled')).toBeDefined()

  await wrapper.get('input[type="number"]').setValue('1.84')
  expect(button.attributes('disabled')).toBeUndefined()
})

test('submitting calls the store with the entered pair, direction and threshold', async () => {
  const store = useAlertsStore()
  const addAlert = vi.spyOn(store, 'addAlert').mockResolvedValue({
    id: '1',
    pair: 'GBP/USD',
    threshold: 1.84,
    direction: 'below',
    currentRate: 1.271,
    triggered: true,
  })

  const wrapper = mountForm()
  await wrapper.get('select').setValue('GBP/USD') // first select is the pair
  await wrapper.findAll('select')[1].setValue('below')
  await wrapper.get('input[type="number"]').setValue('1.84')
  await wrapper.get('form').trigger('submit')

  expect(addAlert).toHaveBeenCalledWith({ pair: 'GBP/USD', threshold: 1.84, direction: 'below' })
})

test('clears the threshold after a successful create', async () => {
  const store = useAlertsStore()
  vi.spyOn(store, 'addAlert').mockResolvedValue({
    id: '1',
    pair: 'USD/CAD',
    threshold: 1.5,
    direction: 'above',
    currentRate: 1.365,
    triggered: false,
  })

  const wrapper = mountForm()
  const input = wrapper.get('input[type="number"]')
  await input.setValue('1.5')
  await wrapper.get('form').trigger('submit')
  await Promise.resolve()

  expect((input.element as HTMLInputElement).value).toBe('')
})

test('shows the error message when the store rejects', async () => {
  const store = useAlertsStore()
  vi.spyOn(store, 'addAlert').mockRejectedValue(new Error('Unknown pair'))

  const wrapper = mountForm()
  await wrapper.get('input[type="number"]').setValue('1.5')
  await wrapper.get('form').trigger('submit')
  await new Promise((r) => setTimeout(r))

  expect(wrapper.get('[role="alert"]').text()).toContain('Unknown pair')
})
