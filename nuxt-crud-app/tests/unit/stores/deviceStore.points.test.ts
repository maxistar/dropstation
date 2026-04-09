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

describe('deviceStore point actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchPoints loads points into state', async () => {
    apiMock.listPoints.mockResolvedValueOnce([
      { id: 1, name: '04ABC20A', deviceId: 7, plantId: 20, capacityId: 2, index: 1, address: '04ABC20A', status: 'ok', humidity: 55, lastWatering: null, notes: 'Window pot', wateringType: 0, wateringValue: 50, wateringHour: 8 },
    ])

    const store = useDeviceStore()
    const result = await store.fetchPoints()

    expect(apiMock.listPoints).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
    expect(store.points).toHaveLength(1)
  })

  it('create/update/delete point actions call backend API and refresh list', async () => {
    apiMock.listPoints.mockResolvedValue([
      { id: 2, name: '04ABC20B', deviceId: 8, plantId: 21, capacityId: 3, index: 2, address: '04ABC20B', status: 'ok', humidity: 57, lastWatering: null, notes: 'Updated notes', wateringType: 1, wateringValue: 65, wateringHour: 9 },
    ])
    apiMock.createPoint.mockResolvedValueOnce({ id: 2 })
    apiMock.updatePoint.mockResolvedValueOnce({ id: 2 })
    apiMock.deletePoint.mockResolvedValueOnce(undefined)

    const store = useDeviceStore()

    await store.createPoint({
      deviceId: 7,
      plantId: 20,
      capacityId: 2,
      index: 1,
      address: '04ABC20A',
      status: 'ok',
      humidity: 55,
      notes: 'Window pot',
      wateringType: 0,
      wateringValue: 50,
      wateringHour: 8,
    })
    expect(apiMock.createPoint).toHaveBeenCalledTimes(1)

    await store.updatePoint(2, {
      deviceId: 8,
      plantId: 21,
      capacityId: 3,
      index: 2,
      address: '04ABC20B',
      status: 'ok',
      humidity: 57,
      notes: 'Updated notes',
      wateringType: 1,
      wateringValue: 65,
      wateringHour: 9,
    })
    expect(apiMock.updatePoint).toHaveBeenCalledWith(2, expect.objectContaining({ deviceId: 8, index: 2 }))

    await store.deletePoint(2)
    expect(apiMock.deletePoint).toHaveBeenCalledWith(2)

    expect(apiMock.listPoints).toHaveBeenCalledTimes(3)
  })
})
