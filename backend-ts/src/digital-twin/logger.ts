import type { TwinConfig, DeviceState, WateringResponse } from "./twin-types.js";

function ts(): string {
  return new Date().toISOString();
}

export function logStartup(config: TwinConfig): void {
  console.log(`
[twin] ─────────────────────────────────────────
[twin]  Digital Twin Starting
[twin]  Backend:   ${config.backendUrl}
[twin]  Device:    ${config.deviceKey}
[twin]  Scenario:  ${config.scenario}
[twin]  Interval:  ${config.intervalMs}ms
[twin] ─────────────────────────────────────────
  `.trim());
}

export function logCycle(
  cycle: number,
  ttt: Record<string, string>,
  response: WateringResponse | null,
  error: string | null,
  state: DeviceState,
): void {
  console.log(`\n[twin] ── Cycle ${cycle} @ ${ts()}`);
  console.log(`[twin]  → sent ttt:  ${JSON.stringify(ttt)}`);

  if (error) {
    console.log(`[twin]  ✗ error:     ${error}`);
  } else {
    console.log(`[twin]  ← response:  ${JSON.stringify(response)}`);
    for (const [addr, duration] of Object.entries(response ?? {})) {
      console.log(`[twin]    ${addr}: ${duration > 0 ? `watered ${duration}s` : "skip"}`);
    }
  }

  console.log(`[twin]  state: battery=${state.battery.toFixed(1)}%`);
  for (const p of state.points) {
    console.log(`[twin]    ${p.address}  humidity=${p.humidity.toFixed(1)}%  status=${p.status}`);
  }
}
