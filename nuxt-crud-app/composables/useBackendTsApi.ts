import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/authStore'

export interface BackendTsDevice {
  id: number;
  name: string;
  notes: string;
  deviceKey: string;
  lastAccess: string | null;
  battery: number | null;
  sleepDuration: number;
  activityNumber: number;
  recentEventTime: string | null;
  recentEventId: number | null;
  checkInterval: number;
}

export interface BackendTsPoint {
  id: number;
  name: string;
  deviceId: number;
  plantId: number | null;
  capacityId: number | null;
  index: number;
  address: string | null;
  status: string;
  humidity: number | null;
  lastWatering: string | null;
  notes: string;
  wateringType: number;
  wateringValue: number;
  wateringHour: number;
}

export interface BackendTsCapacitor {
  id: number;
  userId: number | null;
  capacity: number;
  value: number;
}

export interface BackendTsPlace {
  id: number;
  userId: number | null;
  index: number;
  name: string;
}

export interface BackendTsPlant {
  id: number;
  userId: number;
  name: string;
  species: string;
  location: string;
  targetHumidityMin: number | null;
  targetHumidityMax: number | null;
  targetWateringDurationSec: number | null;
  active: boolean;
}

export interface BackendTsDeviceUpsertInput {
  name?: string;
  notes?: string;
  deviceKey: string;
}

export interface BackendTsCapacitorUpsertInput {
  userId?: number;
  capacity: number;
  value: number;
}

export interface BackendTsPlaceUpsertInput {
  userId?: number;
  index: number;
  name: string;
}

export interface BackendTsPointUpsertInput {
  userId?: number;
  deviceId: number;
  plantId?: number | null;
  capacityId?: number | null;
  index: number;
  address?: string;
  status?: string;
  humidity?: number | null;
  notes?: string;
  wateringType: number;
  wateringValue: number;
  wateringHour: number;
}

export interface BackendTsPlantUpsertInput {
  userId?: number;
  name: string;
  species?: string;
  location?: string;
  targetHumidityMin?: number | null;
  targetHumidityMax?: number | null;
  targetWateringDurationSec?: number | null;
  active?: boolean;
}

export function useBackendTsApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  authStore.ensureHydrated()

  const client = $fetch.create({
    baseURL: config.public.backendTsBaseUrl || 'http://localhost:3001',
    onRequest({ options }) {
      const authHeader = authStore.authHeader
      if (!authHeader) {
        return
      }

      const headers = new Headers(options.headers as HeadersInit | undefined)
      headers.set('Authorization', authHeader)
      options.headers = headers
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        authStore.clearSession()
        await navigateTo('/login')
      }
    },
  })

  return {
    listDevices() {
      return client<BackendTsDevice[]>('/api/ui/v1/devices')
    },

    getDevice(id: number) {
      return client<BackendTsDevice>(`/api/ui/v1/devices/${id}`)
    },

    createDevice(input: BackendTsDeviceUpsertInput) {
      return client<BackendTsDevice>('/api/ui/v1/devices', {
        method: 'POST',
        body: input,
      })
    },

    updateDevice(id: number, input: BackendTsDeviceUpsertInput) {
      return client<BackendTsDevice>(`/api/ui/v1/devices/${id}`, {
        method: 'PUT',
        body: input,
      })
    },

    deleteDevice(id: number) {
      return client<void>(`/api/ui/v1/devices/${id}`, {
        method: 'DELETE',
      })
    },

    listPoints() {
      return client<BackendTsPoint[]>('/api/ui/v1/points')
    },

    getPoint(id: number) {
      return client<BackendTsPoint>(`/api/ui/v1/points/${id}`)
    },

    createPoint(input: BackendTsPointUpsertInput) {
      return client<BackendTsPoint>('/api/ui/v1/points', {
        method: 'POST',
        body: input,
      })
    },

    updatePoint(id: number, input: BackendTsPointUpsertInput) {
      return client<BackendTsPoint>(`/api/ui/v1/points/${id}`, {
        method: 'PUT',
        body: input,
      })
    },

    deletePoint(id: number) {
      return client<void>(`/api/ui/v1/points/${id}`, {
        method: 'DELETE',
      })
    },

    listPlaces() {
      return client<BackendTsPlace[]>('/api/ui/v1/places')
    },

    getPlace(id: number) {
      return client<BackendTsPlace>(`/api/ui/v1/places/${id}`)
    },

    createPlace(input: BackendTsPlaceUpsertInput) {
      return client<BackendTsPlace>('/api/ui/v1/places', {
        method: 'POST',
        body: input,
      })
    },

    updatePlace(id: number, input: BackendTsPlaceUpsertInput) {
      return client<BackendTsPlace>(`/api/ui/v1/places/${id}`, {
        method: 'PUT',
        body: input,
      })
    },

    deletePlace(id: number) {
      return client<void>(`/api/ui/v1/places/${id}`, {
        method: 'DELETE',
      })
    },

    listPlants() {
      return client<BackendTsPlant[]>('/api/ui/v1/plants')
    },

    getPlant(id: number) {
      return client<BackendTsPlant>(`/api/ui/v1/plants/${id}`)
    },

    createPlant(input: BackendTsPlantUpsertInput) {
      return client<BackendTsPlant>('/api/ui/v1/plants', {
        method: 'POST',
        body: input,
      })
    },

    updatePlant(id: number, input: BackendTsPlantUpsertInput) {
      return client<BackendTsPlant>(`/api/ui/v1/plants/${id}`, {
        method: 'PUT',
        body: input,
      })
    },

    deletePlant(id: number) {
      return client<void>(`/api/ui/v1/plants/${id}`, {
        method: 'DELETE',
      })
    },

    listCapacitors() {
      return client<BackendTsCapacitor[]>('/api/ui/v1/capacitors')
    },

    getCapacitor(id: number) {
      return client<BackendTsCapacitor>(`/api/ui/v1/capacitors/${id}`)
    },

    createCapacitor(input: BackendTsCapacitorUpsertInput) {
      return client<BackendTsCapacitor>('/api/ui/v1/capacitors', {
        method: 'POST',
        body: input,
      })
    },

    updateCapacitor(id: number, input: BackendTsCapacitorUpsertInput) {
      return client<BackendTsCapacitor>(`/api/ui/v1/capacitors/${id}`, {
        method: 'PUT',
        body: input,
      })
    },

    deleteCapacitor(id: number) {
      return client<void>(`/api/ui/v1/capacitors/${id}`, {
        method: 'DELETE',
      })
    },
  }
}
