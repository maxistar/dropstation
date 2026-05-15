import type { DeviceState, ScenarioName } from "./twin-types.js";

const DEFAULT_ADDRESSES = ["0x01", "0x02", "0x03"];

export function buildInitialState(scenario: ScenarioName, addresses: string[] = DEFAULT_ADDRESSES): DeviceState {
  switch (scenario) {
    case "healthy":
      return {
        battery: 100,
        points: addresses.map((address) => ({ address, status: "idle", humidity: 80 })),
      };

    case "dry":
      return {
        battery: 80,
        points: addresses.map((address) => ({ address, status: "idle", humidity: 10 })),
      };

    case "low-battery":
      return {
        battery: 5,
        points: addresses.map((address) => ({ address, status: "idle", humidity: 60 })),
      };
  }
}
