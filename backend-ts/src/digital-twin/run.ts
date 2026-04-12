import { loadTwinConfig } from "./load-twin-config.js";
import { buildInitialState } from "./scenarios.js";
import { checkConnection, runCycle } from "./poller.js";
import { logStartup, logCycle } from "./logger.js";
import type { DeviceState } from "./twin-types.js";

const config = loadTwinConfig();
let state: DeviceState = buildInitialState(config.scenario);

await checkConnection(config);
logStartup(config);

let cycle = 0;

setInterval(async () => {
  cycle += 1;
  const result = await runCycle(config, state);
  logCycle(cycle, result.ttt, result.response, result.error, result.nextState);
  state = result.nextState;
}, config.intervalMs);
