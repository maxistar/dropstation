import type { DeviceState, TwinConfig, WateringResponse } from "./twin-types.js";
import { buildTttPayload, applyWateringResponse } from "./twin-state.js";

export interface CycleResult {
  ttt: Record<string, string>;
  response: WateringResponse | null;
  error: string | null;
  nextState: DeviceState;
}

export async function runCycle(config: TwinConfig, state: DeviceState): Promise<CycleResult> {
  const ttt = buildTttPayload(state);
  const url = `${config.backendUrl}/api/device/v1/watering?device=${encodeURIComponent(config.deviceKey)}&ttt=${encodeURIComponent(JSON.stringify(ttt))}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return {
        ttt,
        response: null,
        error: `HTTP ${res.status} ${res.statusText}`,
        nextState: state,
      };
    }

    const response = await res.json() as WateringResponse;
    const nextState = applyWateringResponse(state, response);
    return { ttt, response, error: null, nextState };
  } catch (err) {
    return {
      ttt,
      response: null,
      error: err instanceof Error ? err.message : String(err),
      nextState: state,
    };
  }
}

export async function checkConnection(config: TwinConfig): Promise<void> {
  const url = `${config.backendUrl}/health`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[twin] Backend health check failed: HTTP ${res.status}`);
      process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[twin] Cannot reach backend at ${config.backendUrl}: ${message}`);
    process.exit(1);
  }
}
