import { render } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'
import * as api from './api'
import App from './App.vue'

vi.mock('./api')

beforeEach(() => {
  setActivePinia(createPinia())
  vi.mocked(api.getRates).mockResolvedValue([
    { pair: 'USD/CAD', rate: 1.365, asOf: '2026-01-01T00:00:00Z' },
    { pair: 'GBP/USD', rate: 1.271, asOf: '2026-01-01T00:00:00Z' },
    { pair: 'EUR/USD', rate: 1.083, asOf: '2026-01-01T00:00:00Z' },
  ])
  vi.mocked(api.getAlerts).mockResolvedValue([])
})

test('renders the rate board and loads rates on mount', async () => {
  const { findByText, getByText } = render(App, {
    global: { plugins: [createPinia()] },
  })

  expect(getByText('1 US dollar in Canadian dollars')).toBeTruthy()
  expect(await findByText('1.3650')).toBeTruthy()
  expect(api.getRates).toHaveBeenCalled()
  expect(api.getAlerts).toHaveBeenCalled()
})

test('shows the empty state when there are no alerts', async () => {
  const { findByText } = render(App, { global: { plugins: [createPinia()] } })
  expect(await findByText('No alerts yet — add one above.')).toBeTruthy()
})
