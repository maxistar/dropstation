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
  listPlaces: vi.fn(),
  getPlace: vi.fn(),
  createPlace: vi.fn(),
  updatePlace: vi.fn(),
  deletePlace: vi.fn(),
  listPlants: vi.fn(),
  getPlant: vi.fn(),
  createPlant: vi.fn(),
  updatePlant: vi.fn(),
  deletePlant: vi.fn(),
}

vi.mock('~/composables/useBackendTsApi', () => ({
  useBackendTsApi: () => apiMock,
}))

import { useDeviceStore } from '../../../stores/deviceStore'

describe('deviceStore place actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchPlaces loads places into state', async () => {
    apiMock.listPlaces.mockResolvedValueOnce([
      { id: 1, userId: 1, index: 1, name: 'Home' },
    ])

    const store = useDeviceStore()
    const result = await store.fetchPlaces()

    expect(apiMock.listPlaces).toHaveBeenCalledTimes(1)
    expect(result).toEqual([{ id: 1, userId: 1, index: 1, name: 'Home' }])
    expect(store.places).toEqual([{ id: 1, userId: 1, index: 1, name: 'Home' }])
  })

  it('create/update/delete place actions call backend API and refresh list', async () => {
    apiMock.listPlaces.mockResolvedValue([
      { id: 2, userId: 1, index: 2, name: 'Office' },
    ])
    apiMock.createPlace.mockResolvedValueOnce({ id: 2, userId: 1, index: 2, name: 'Office' })
    apiMock.updatePlace.mockResolvedValueOnce({ id: 2, userId: 1, index: 3, name: 'Garden' })
    apiMock.deletePlace.mockResolvedValueOnce(undefined)

    const store = useDeviceStore()

    await store.createPlace(2, 'Office', 1)
    expect(apiMock.createPlace).toHaveBeenCalledWith({ index: 2, name: 'Office', userId: 1 })

    await store.updatePlace(2, 3, 'Garden', 1)
    expect(apiMock.updatePlace).toHaveBeenCalledWith(2, { index: 3, name: 'Garden', userId: 1 })

    await store.deletePlace(2)
    expect(apiMock.deletePlace).toHaveBeenCalledWith(2)

    expect(apiMock.listPlaces).toHaveBeenCalledTimes(3)
  })
})
