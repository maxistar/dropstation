export interface UiDeviceRecord {
  id: number;
  userId: number | null;
  placeId: number | null;
  deviceKey: string;
  lastAccess: string | null;
  notes: string | null;
  battery: number | null;
  sleepDuration: number;
  activityNumber: number;
  recentEventTime: string | null;
  recentEventId: number | null;
  checkInterval: number;
}

export interface UiDeviceView {
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

export interface UiPointRecord {
  id: number;
  userId: number | null;
  deviceId: number;
  plantId: number | null;
  capacityId: number | null;
  lastWatering: string | null;
  notes: string | null;
  wateringType: number;
  wateringValue: number;
  wateringHour: number;
  index: number;
  address: string | null;
  status: string | null;
  humidity: number | null;
}

export interface UiPointView {
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

export interface CreateUiDeviceInput {
  name?: string;
  notes?: string;
  deviceKey: string;
}

export interface UpdateUiDeviceInput {
  id: number;
  name?: string;
  notes?: string;
  deviceKey: string;
}
