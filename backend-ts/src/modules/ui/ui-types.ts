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
