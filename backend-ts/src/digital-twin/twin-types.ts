export type ScenarioName = "healthy" | "dry" | "low-battery";

export interface TwinConfig {
  deviceKey: string;
  backendUrl: string;
  scenario: ScenarioName;
  intervalMs: number;
}

export interface PointState {
  address: string;
  status: string;
  humidity: number; // 0–100 %
}

export interface DeviceState {
  battery: number; // 0–100 %
  points: PointState[];
}

export type WateringResponse = Record<string, number>;
