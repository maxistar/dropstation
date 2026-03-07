import { useRuntimeConfig } from "#imports";

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

export interface BackendTsDeviceUpsertInput {
  name?: string;
  notes?: string;
  deviceKey: string;
}

export function useBackendTsApi() {
  const config = useRuntimeConfig();

  const client = $fetch.create({
    baseURL: config.public.backendTsBaseUrl || "http://localhost:3001",
  });

  return {
    listDevices() {
      return client<BackendTsDevice[]>("/api/ui/v1/devices");
    },

    getDevice(id: number) {
      return client<BackendTsDevice>(`/api/ui/v1/devices/${id}`);
    },

    createDevice(input: BackendTsDeviceUpsertInput) {
      return client<BackendTsDevice>("/api/ui/v1/devices", {
        method: "POST",
        body: input,
      });
    },

    updateDevice(id: number, input: BackendTsDeviceUpsertInput) {
      return client<BackendTsDevice>(`/api/ui/v1/devices/${id}`, {
        method: "PUT",
        body: input,
      });
    },

    deleteDevice(id: number) {
      return client<void>(`/api/ui/v1/devices/${id}`, {
        method: "DELETE",
      });
    },

    listPoints() {
      return client<BackendTsPoint[]>("/api/ui/v1/points");
    },
  };
}
