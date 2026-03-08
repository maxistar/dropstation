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
  getPoint: vi.fn(),
  createPoint: vi.fn(),
  updatePoint: vi.fn(),
  deletePoint: vi.fn(),
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

describe('deviceStore plant actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchPlants loads plants into state', async () => {
    apiMock.listPlants.mockResolvedValueOnce([
      { id: 1, userId: 1, name: 'Monstera', species: 'Monstera deliciosa', location: 'Living room', targetHumidityMin: 45, targetHumidityMax: 65, targetWateringDurationSec: 40, active: true },
    ])

    const store = useDeviceStore()
    const result = await store.fetchPlants()

    expect(apiMock.listPlants).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
    expect(store.plants).toHaveLength(1)
  })

  it('create/update/delete plant actions call backend API and refresh list', async () => {
    apiMock.listPlants.mockResolvedValue([
      { id: 2, userId: 1, name: 'Snake Plant', species: 'Dracaena trifasciata', location: 'Office', targetHumidityMin: 35, targetHumidityMax: 55, targetWateringDurationSec: 25, active: false },
    ])
    apiMock.createPlant.mockResolvedValueOnce({ id: 2 })
    apiMock.updatePlant.mockResolvedValueOnce({ id: 2 })
    apiMock.deletePlant.mockResolvedValueOnce(undefined)

    const store = useDeviceStore()

    await store.createPlant({
      name: 'Monstera',
      species: 'Monstera deliciosa',
      location: 'Living room',
      targetHumidityMin: 45,
      targetHumidityMax: 65,
      targetWateringDurationSec: 40,
      active: true,
    })
    expect(apiMock.createPlant).toHaveBeenCalledTimes(1)

    await store.updatePlant(2, {
      name: 'Snake Plant',
      species: 'Dracaena trifasciata',
      location: 'Office',
      targetHumidityMin: 35,
      targetHumidityMax: 55,
      targetWateringDurationSec: 25,
      active: false,
    })
    expect(apiMock.updatePlant).toHaveBeenCalledWith(2, expect.objectContaining({ name: 'Snake Plant' }))

    await store.deletePlant(2)
    expect(apiMock.deletePlant).toHaveBeenCalledWith(2)

    expect(apiMock.listPlants).toHaveBeenCalledTimes(3)
  })
})
