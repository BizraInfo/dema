import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { defaultStatus } from "../../core/src/status.js";

const execFileAsync = promisify(execFile);

export function parseCommandLine(command) {
  const tokens = [];
  let current = "";
  let quote = null;
  let escaping = false;

  for (const char of command) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'" || char === "\"") {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (escaping) current += "\\";
  if (quote) throw new Error("Unclosed quote in DEMA_NODE0_STATUS_COMMAND");
  if (current) tokens.push(current);
  return tokens;
}

export function normalizeNode0Status(raw) {
  return {
    schema: "bizra.dema.status.v0.1",
    node: "Node0",
    human: raw?.profile?.preferred_name ?? raw?.human ?? "Mumu",
    ready: Boolean(raw?.ready),
    consoleReady: Boolean(raw?.console_ready ?? raw?.dema_console?.console_ready),
    activationGate: raw?.activation_gate ?? raw?.dema_console?.activation_gate ?? "BLOCKED",
    daemonStatus: raw?.daemon_status ?? raw?.daemon?.status ?? "unknown",
    missionExecuted: Boolean(raw?.mission_executed),
    runtimePulse: {
      fired: Boolean(raw?.runtime_pulse?.fired ?? raw?.runtime_pulse_fired)
    },
    findings: raw?.findings ?? [],
    model: {
      connected: Boolean(raw?.lm_studio?.connected ?? raw?.model_backend?.connected),
      loadedModelIds: raw?.lm_studio?.loaded_model_ids ?? raw?.model_backend?.loaded_model_ids ?? [],
      tokenPresent: Boolean(raw?.lm_studio?.token_present ?? raw?.model_backend?.token_present)
    },
    rustBus: {
      ready: Boolean(raw?.rust_bus?.ready ?? raw?.dependencies?.rust_bus?.ready)
    },
    proof: {
      latestChainHash: raw?.proof?.latest_chain_hash,
      nextArtifact: "ARTIFACT-011"
    },
    nextAdmissibleAction: raw?.next_admissible_action ?? "bounded_diagnostic_activation"
  };
}

export function createNode0Adapter(options = {}) {
  const command = options.command ?? process.env.DEMA_NODE0_STATUS_COMMAND;

  return {
    async status() {
      if (!command) return defaultStatus();

      const [bin, ...args] = parseCommandLine(command);
      if (!bin) throw new Error("DEMA_NODE0_STATUS_COMMAND is empty");
      const { stdout } = await execFileAsync(bin, args, { timeout: 30000 });
      return normalizeNode0Status(JSON.parse(stdout));
    },

    async listReceipts() {
      return [];
    },

    async proposeBoundedDiagnostic() {
      const status = await this.status();
      return {
        status,
        requiredConsentPhrase: "GO: Node0 bounded diagnostic activation only"
      };
    }
  };
}
