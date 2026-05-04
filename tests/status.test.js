import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { defaultStatus, formatStatus } from "../packages/core/src/status.js";
import {
  BOUNDED_DIAGNOSTIC_CONSENT_PHRASE,
  previewBoundedDiagnostic,
  proposeBoundedDiagnostic
} from "../packages/core/src/mission.js";
import { readTodayTick, recordTodayTick } from "../packages/core/src/today.js";
import { evaluateConsent } from "../packages/fate/src/fate.js";
import { runSetup } from "../packages/installer/src/setup.js";
import {
  normalizeNode0Status,
  parseCommandLine
} from "../packages/node-adapter/src/node0-adapter.js";
import { listReceipts, readReceipt } from "../packages/receipts/src/receipt-store.js";

test("default status is safe and blocked", () => {
  const status = defaultStatus();
  assert.equal(status.ready, false);
  assert.equal(status.activationGate, "BLOCKED");
});

test("status formatting includes consent boundary", () => {
  const output = formatStatus(defaultStatus());
  assert.match(output, /Boundary: no action without explicit consent/);
  assert.match(output, /Runtime pulse fired: false/);
});

test("bounded diagnostic requires ready node and explicit gate", () => {
  const proposal = proposeBoundedDiagnostic({
    ready: true,
    consoleReady: true,
    activationGate: "EXPLICIT_GO_REQUIRED",
    daemonStatus: "stopped",
    missionExecuted: false,
    runtimePulse: { fired: false }
  });
  assert.equal(proposal.allowed, true);
  assert.equal(proposal.expectedArtifact, "ARTIFACT-011");
});

test("bounded diagnostic blocks hidden daemon and previous runtime pulse", () => {
  const daemon = proposeBoundedDiagnostic({
    ready: true,
    consoleReady: true,
    activationGate: "EXPLICIT_GO_REQUIRED",
    daemonStatus: "running",
    missionExecuted: false,
    runtimePulse: { fired: false }
  });
  assert.equal(daemon.allowed, false);
  assert.match(daemon.reason, /Daemon/);

  const pulse = proposeBoundedDiagnostic({
    ready: true,
    consoleReady: true,
    activationGate: "EXPLICIT_GO_REQUIRED",
    daemonStatus: "stopped",
    missionExecuted: false,
    runtimePulse: { fired: true }
  });
  assert.equal(pulse.allowed, false);
  assert.match(pulse.reason, /Runtime pulse/);
});

test("mission preview does not execute runtime and requires exact consent", () => {
  const status = {
    ready: true,
    consoleReady: true,
    activationGate: "EXPLICIT_GO_REQUIRED",
    daemonStatus: "stopped",
    missionExecuted: false,
    runtimePulse: { fired: false }
  };
  const rejected = previewBoundedDiagnostic(status, "GO");
  assert.equal(rejected.executes, false);
  assert.equal(rejected.consent.accepted, false);

  const accepted = previewBoundedDiagnostic(status, BOUNDED_DIAGNOSTIC_CONSENT_PHRASE);
  assert.equal(accepted.executes, false);
  assert.equal(accepted.consent.accepted, true);
});

test("fate consent requires exact phrase", () => {
  assert.equal(
    evaluateConsent({
      phrase: `${BOUNDED_DIAGNOSTIC_CONSENT_PHRASE} `,
      requiredPhrase: BOUNDED_DIAGNOSTIC_CONSENT_PHRASE
    }).accepted,
    false
  );
});

test("setup creates local profile and config without daemon activation", async () => {
  const root = await mkdtemp(join(tmpdir(), "dema-setup-"));
  const result = await runSetup(root);
  assert.equal(result.root, root);
  assert.equal(result.created, true);

  const profile = JSON.parse(await readFile(join(root, "profile.json"), "utf8"));
  assert.equal(profile.hidden_autonomy, false);

  const config = JSON.parse(await readFile(join(root, "config.local.json"), "utf8"));
  assert.equal(config.noHiddenDaemon, true);
  assert.equal(config.requireExplicitConsent, true);
});

test("today tick records continuity without mission execution", async () => {
  const root = await mkdtemp(join(tmpdir(), "dema-today-"));
  const { tick, path } = await recordTodayTick({
    root,
    now: new Date("2026-05-04T18:20:00.000Z"),
    status: {
      ready: true,
      consoleReady: true,
      activationGate: "EXPLICIT_GO_REQUIRED",
      daemonStatus: "stopped",
      proof: { nextArtifact: "ARTIFACT-011" },
      nextAdmissibleAction: "bounded_diagnostic_activation"
    }
  });
  assert.equal(tick.date, "2026-05-04");
  assert.equal(tick.missionExecuted, false);
  assert.equal(tick.runtimePulse.fired, false);
  assert.equal(JSON.parse(await readFile(path, "utf8")).activationGate, "EXPLICIT_GO_REQUIRED");
  assert.equal((await readTodayTick(root)).nextArtifact, "ARTIFACT-011");
});

test("node0 status normalization preserves measured onboarding seal fields", () => {
  const status = normalizeNode0Status({
    profile: { preferred_name: "Mumu" },
    ready: true,
    dema_console: { console_ready: true, activation_gate: "EXPLICIT_GO_REQUIRED" },
    daemon_status: "stopped",
    mission_executed: false,
    runtime_pulse: { fired: false },
    lm_studio: {
      connected: true,
      loaded_model_ids: ["qwen/qwen3.5-9b"],
      token_present: true
    },
    rust_bus: { ready: true },
    findings: []
  });

  assert.equal(status.human, "Mumu");
  assert.equal(status.ready, true);
  assert.equal(status.consoleReady, true);
  assert.equal(status.daemonStatus, "stopped");
  assert.equal(status.model.connected, true);
  assert.deepEqual(status.model.loadedModelIds, ["qwen/qwen3.5-9b"]);
  assert.equal(status.rustBus.ready, true);
});

test("node0 command parser preserves quoted paths with spaces", () => {
  assert.deepEqual(
    parseCommandLine('python -m core.sovereign node0 status --root "/tmp/my node"'),
    ["python", "-m", "core.sovereign", "node0", "status", "--root", "/tmp/my node"]
  );
});

test("receipt store lists and reads receipts by artifact id", async () => {
  const root = await mkdtemp(join(tmpdir(), "dema-receipts-"));
  await mkdir(join(root, "receipts"), { recursive: true });
  await writeFile(join(root, "receipts", "artifact-011.json"), JSON.stringify({
    receipt_id: "receipt-1",
    artifact_id: "ARTIFACT-011",
    action: "bounded_diagnostic_activation",
    truth_label: "MEASURED",
    created_at: "2026-05-04T18:20:00.000Z"
  }));

  const receipts = await listReceipts(root);
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].artifact_id, "ARTIFACT-011");

  const receipt = await readReceipt("ARTIFACT-011", root);
  assert.equal(receipt.receipt_id, "receipt-1");

  const byFile = await readReceipt("artifact-011.json", root);
  assert.equal(byFile.artifact_id, "ARTIFACT-011");
});
