export interface RuntimeDeviceRecord {
  id: number;
  userId: number;
  placeId: number;
  deviceKey: string;
  lastAccess: Date | null;
  notes: string;
  battery: number | null;
  sleepDuration: number;
  activityNumber: number;
  recentEventTime: Date | null;
  recentEventId: number | null;
  checkInterval: number;
  timezone: string;
}

export interface RuntimePointRecord {
  id: number;
  userId: number;
  deviceId: number;
  plantId: number | null;
  capacityId: number;
  lastWatering: Date | null;
  notes: string;
  wateringType: number;
  wateringValue: number;
  wateringHour: number;
  index: number;
  address: string | null;
  status: string | null;
  humidity: number | null;
}

export interface RuntimeScheduleRecord {
  id: number;
  externalId: string | null;
  hour: number;
  minute: number;
  eventType: "watering" | "insolation" | "lighting";
  deviceId: number;
  pointId: number;
  plantId: number | null;
  duration: number;
  recurrence: "daily";
  activeFrom: string | null;
  activeUntil: string | null;
  enabled: number;
}

export interface DeviceTelemetryPayload {
  deviceKey: string;
  humidity: number;
  battery: number;
  watered: boolean;
  wateringDurationSec: number;
  timestampUtc: string;
}

export interface CanonicalEventRecord {
  id: number;
  externalId: string;
  legacyEventId: number | null;
  eventType:
    | "device_checkin"
    | "humidity_reading"
    | "watering_decision"
    | "watering"
    | "insolation_decision"
    | "insolation_state_changed"
    | "insolation_patch"
    | "command_requested"
    | "command_applied"
    | "error"
    | "tank_refill";
  occurredAt: Date;
  deviceId: number | null;
  pointId: number | null;
  plantId: number | null;
  amountMl: number | null;
  durationSec: number | null;
  humidity: number | null;
  status: "success" | "failed" | "partial" | "info";
  payload: unknown;
}
