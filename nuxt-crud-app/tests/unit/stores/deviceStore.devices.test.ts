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

describe('deviceStore device actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchDevices loads devices into state', async () => {
    apiMock.listDevices.mockResolvedValueOnce([
      {
        id: 1,
        name: 'Device 1',
        placeId: 1,
        notes: 'Main controller',
        deviceKey: 'dev-1',
        lastAccess: null,
        battery: 4.1,
        sleepDuration: 3600,
        activityNumber: 1,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 900,
      },
    ])

    const store = useDeviceStore()
    const result = await store.fetchDevices()

    expect(apiMock.listDevices).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
    expect(store.devices).toHaveLength(1)
  })

  it('create/update/delete device actions call backend API with full payload and refresh list', async () => {
    apiMock.listDevices.mockResolvedValue([
      {
        id: 2,
        name: 'Device 2',
        placeId: 1,
        notes: 'Updated controller',
        deviceKey: 'dev-2',
        lastAccess: null,
        battery: 3.9,
        sleepDuration: 1800,
        activityNumber: 2,
        recentEventTime: null,
        recentEventId: null,
        checkInterval: 600,
      },
    ])
    apiMock.createDevice.mockResolvedValueOnce({ id: 2 })
    apiMock.updateDevice.mockResolvedValueOnce({ id: 2 })
    apiMock.deleteDevice.mockResolvedValueOnce(undefined)

    const store = useDeviceStore()

    await store.createDevice({
      placeId: 1,
      name: 'Device 2',
      notes: 'Controller',
      deviceKey: 'dev-2',
      sleepDuration: 1200,
      activityNumber: 2,
      checkInterval: 300,
    })
    expect(apiMock.createDevice).toHaveBeenCalledWith({
      placeId: 1,
      name: 'Device 2',
      notes: 'Controller',
      deviceKey: 'dev-2',
      sleepDuration: 1200,
      activityNumber: 2,
      checkInterval: 300,
    })

    await store.updateDevice(2, {
      placeId: 2,
      name: 'Device 2',
      notes: 'Updated controller',
      deviceKey: 'dev-2',
      sleepDuration: 1800,
      activityNumber: 2,
      checkInterval: 600,
    })
    expect(apiMock.updateDevice).toHaveBeenCalledWith(2, {
      placeId: 2,
      name: 'Device 2',
      notes: 'Updated controller',
      deviceKey: 'dev-2',
      sleepDuration: 1800,
      activityNumber: 2,
      checkInterval: 600,
    })

    await store.deleteDevice(2)
    expect(apiMock.deleteDevice).toHaveBeenCalledWith(2)

    expect(apiMock.listDevices).toHaveBeenCalledTimes(3)
  })
})
