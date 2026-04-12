import type { DeviceState, WateringResponse } from "./twin-types.js";

const BATTERY_DRAIN_PER_CYCLE = 0.5;   // % per poll
const HUMIDITY_DECAY_PER_CYCLE = 2;    // % per poll without watering
const HUMIDITY_RECOVERY_AFTER_WATER = 40; // % added when watered
const HUMIDITY_MAX = 100;

export function buildTttPayload(state: DeviceState): Record<string, string> {
  return Object.fromEntries(
    state.points.map((p) => [p.address, p.status]),
  );
}

export function applyWateringResponse(
  state: DeviceState,
  response: WateringResponse,
): DeviceState {
  const battery = Math.max(0, state.battery - BATTERY_DRAIN_PER_CYCLE);

  const points = state.points.map((point) => {
    const duration = response[point.address] ?? 0;
    const wasWatered = duration > 0;

    const humidity = wasWatered
      ? Math.min(HUMIDITY_MAX, point.humidity + HUMIDITY_RECOVERY_AFTER_WATER)
      : Math.max(0, point.humidity - HUMIDITY_DECAY_PER_CYCLE);

    return { ...point, humidity };
  });

  return { battery, points };
}
