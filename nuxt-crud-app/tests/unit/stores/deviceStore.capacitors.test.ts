import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const apiMock = {
  listCapacitors: vi.fn(),
  getCapacitor: vi.fn(),
  createCapacitor: vi.fn(),
  updateCapacitor: vi.fn(),
  deleteCapacitor: vi.fn(),
  listDevices: vi.fn(),
  getDevice: vi.fn(),
  createDevice: vi.fn(),
  updateDevice: vi.fn(),
  deleteDevice: vi.fn(),
  listPoints: vi.fn(),
}

vi.mock('~/composables/useBackendTsApi', () => ({
  useBackendTsApi: () => apiMock,
}))

import { useDeviceStore } from '../../../stores/deviceStore'

describe('deviceStore capacitor actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchCapacitors loads capacitors into state', async () => {
    apiMock.listCapacitors.mockResolvedValueOnce([
      { id: 1, userId: 1, capacity: 5000, value: 3200 },
    ])

    const store = useDeviceStore()
    const result = await store.fetchCapacitors()

    expect(apiMock.listCapacitors).toHaveBeenCalledTimes(1)
    expect(result).toEqual([{ id: 1, userId: 1, capacity: 5000, value: 3200 }])
    expect(store.capacitors).toEqual([{ id: 1, userId: 1, capacity: 5000, value: 3200 }])
  })

  it('create/update/delete capacitor actions call backend API and refresh list', async () => {
    apiMock.listCapacitors.mockResolvedValue([
      { id: 2, userId: 1, capacity: 9000, value: 8800 },
    ])
    apiMock.createCapacitor.mockResolvedValueOnce({ id: 2, userId: 1, capacity: 9000, value: 8800 })
    apiMock.updateCapacitor.mockResolvedValueOnce({ id: 2, userId: 1, capacity: 9100, value: 8700 })
    apiMock.deleteCapacitor.mockResolvedValueOnce(undefined)

    const store = useDeviceStore()

    await store.createCapacitor(9000, 8800, 1)
    expect(apiMock.createCapacitor).toHaveBeenCalledWith({ capacity: 9000, value: 8800, userId: 1 })

    await store.updateCapacitor(2, 9100, 8700, 1)
    expect(apiMock.updateCapacitor).toHaveBeenCalledWith(2, { capacity: 9100, value: 8700, userId: 1 })

    await store.deleteCapacitor(2)
    expect(apiMock.deleteCapacitor).toHaveBeenCalledWith(2)

    expect(apiMock.listCapacitors).toHaveBeenCalledTimes(3)
  })
})
