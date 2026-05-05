#!/usr/bin/env node
import { createNode0Adapter } from "../../../packages/node-adapter/src/node0-adapter.js";
import { formatStatus } from "../../../packages/core/src/status.js";
import { previewBoundedDiagnostic } from "../../../packages/core/src/mission.js";
import { recordTodayTick } from "../../../packages/core/src/today.js";
import { listReceipts, readReceipt } from "../../../packages/receipts/src/receipt-store.js";
import { runSetup } from "../../../packages/installer/src/setup.js";

const command = process.argv[2] ?? "help";
const subcommand = process.argv[3];
const adapter = createNode0Adapter();

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  switch (command) {
    case "welcome":
      console.log(`Welcome to Dema.

Your node is local-first.
Your actions are consent-bound.
Your important steps can produce receipts.

Next:
1. Run setup
2. Check status
3. Preview first bounded diagnostic`);
      break;
    case "setup":
      console.log(JSON.stringify(await runSetup(), null, 2));
      break;
    case "status": {
      const status = await adapter.status();
      console.log(formatStatus(status));
      break;
    }
    case "status:json": {
      const status = await adapter.status();
      console.log(JSON.stringify(status, null, 2));
      break;
    }
    case "today": {
      const status = await adapter.status();
      const result = await recordTodayTick({ status });
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "doctor": {
      const status = await adapter.status();
      const ready =
        status.ready &&
        status.consoleReady &&
        status.activationGate === "EXPLICIT_GO_REQUIRED" &&
        status.daemonStatus !== "running";
      console.log(ready ? "Dema doctor: ready and consent-gated." : "Dema doctor: attention required.");
      console.log(formatStatus(status));
      process.exitCode = ready ? 0 : 1;
      break;
    }
    case "mission": {
      if (subcommand !== "propose") {
        throw new Error("Unknown mission command. Use `dema mission propose`.");
      }
      const status = await adapter.status();
      const consent = argValue("--consent") ?? "";
      console.log(JSON.stringify(previewBoundedDiagnostic(status, consent), null, 2));
      break;
    }
    case "receipts": {
      const selector = process.argv[3];
      if (selector) {
        console.log(JSON.stringify(await readReceipt(selector), null, 2));
      } else {
        console.log(JSON.stringify(await listReceipts(), null, 2));
      }
      break;
    }
    case "monetize":
      console.log([
        "Dema monetize: safe offer guardian.",
        "Allowed now: Sovereign Local AI Node Setup + Safety Audit.",
        "Blocked: token claims, passive income claims, AGI claims, public federation claims."
      ].join("\n"));
      break;
    case "help":
    default:
      console.log(`Dema CLI

Usage:
  dema welcome      Show the first-run orientation
  dema setup        Create local Dema folders/profile skeleton
  dema status       Show human-readable Node0 status
  dema status:json  Show machine-readable status
  dema today        Record a local continuity tick without mission execution
  dema doctor       Validate readiness and consent gate
  dema mission propose [--consent "GO: Node0 bounded diagnostic activation only"]
                    Preview ARTIFACT-011 readiness; does not execute runtime
  dema receipts     List local receipts
  dema receipts ID  Show one receipt by ID, artifact ID, or path suffix
  dema monetize     Show proof-safe first offer boundary

Dema v0.1 is local-first and consent-bound.`);
  }
}

main().catch((error) => {
  console.error("Dema error:", error?.message ?? error);
  process.exit(1);
});
