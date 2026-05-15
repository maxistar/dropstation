import type { ScenarioName, TwinConfig } from "./twin-types.js";

const VALID_SCENARIOS: ScenarioName[] = ["healthy", "dry", "low-battery"];

export function loadTwinConfig(): TwinConfig {
  const deviceKey = process.env.TWIN_DEVICE_KEY ?? "";
  if (!deviceKey) {
    console.error("[twin] TWIN_DEVICE_KEY is required");
    process.exit(1);
  }

  const backendUrl = (process.env.TWIN_BACKEND_URL ?? "http://localhost:3001").replace(/\/$/, "");

  const rawScenario = process.env.TWIN_SCENARIO ?? "healthy";
  if (!VALID_SCENARIOS.includes(rawScenario as ScenarioName)) {
    console.error(`[twin] TWIN_SCENARIO must be one of: ${VALID_SCENARIOS.join(", ")}`);
    process.exit(1);
  }

  const intervalMs = Number.parseInt(process.env.TWIN_INTERVAL_MS ?? "10000", 10);
  if (Number.isNaN(intervalMs) || intervalMs < 1000) {
    console.error("[twin] TWIN_INTERVAL_MS must be a number >= 1000");
    process.exit(1);
  }

  return {
    deviceKey,
    backendUrl,
    scenario: rawScenario as ScenarioName,
    intervalMs,
  };
}
