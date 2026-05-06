import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile, readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import {
  formatBanner,
  gatherBannerInputs,
  probeGateway
} from "../packages/core/src/banner.js";
import { tokenize } from "../packages/core/src/shell.js";
import {
  TASK_REGISTRY,
  formatTaskReceipt,
  runDownloadsAuditPreview
} from "../packages/tasks/src/downloads-audit-preview.js";
import {
  formatVerdict,
  verifyReceiptPlaceholder
} from "../packages/verifier/src/sat-placeholder.js";

const execFileAsync = promisify(execFile);
const cliPath = new URL("../apps/cli/src/index.js", import.meta.url).pathname;
const HEALTHY_DOMAIN = "bizra-cognition-gateway-v1";

function startFakeGateway(routes) {
  const server = createServer((req, res) => {
    const handler = routes[req.url];
    if (!handler) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "not found" }));
      return;
    }
    const result = handler(req);
    res.writeHead(result.status ?? 200, result.headers ?? { "content-type": "application/json" });
    res.end(typeof result.body === "string" ? result.body : JSON.stringify(result.body));
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        async stop() {
          await new Promise((r) => server.close(r));
        }
      });
    });
  });
}

// ─── probeGateway ─────────────────────────────────────────────────────

test("probeGateway returns reachable when /health responds with correct domain", async () => {
  const gw = await startFakeGateway({
    "/health": () => ({ body: { status: "ok", domain: HEALTHY_DOMAIN } })
  });
  try {
    const result = await probeGateway(gw.url);
    assert.equal(result.reachable, true);
    assert.equal(result.domain, HEALTHY_DOMAIN);
    assert.equal(result.status, "ok");
  } finally {
    await gw.stop();
  }
});

test("probeGateway returns unreachable when domain mismatches", async () => {
  const gw = await startFakeGateway({
    "/health": () => ({ body: { status: "ok", domain: "some-other-server" } })
  });
  try {
    const result = await probeGateway(gw.url);
    assert.equal(result.reachable, false);
    assert.equal(result.domain, "some-other-server");
  } finally {
    await gw.stop();
  }
});

test("probeGateway returns unreachable on connection failure", async () => {
  const result = await probeGateway("http://127.0.0.1:1", { timeoutMs: 500 });
  assert.equal(result.reachable, false);
  assert.ok(result.error);
});

// ─── gatherBannerInputs + formatBanner ─────────────────────────────────

test("gatherBannerInputs returns null profile + null bizraContext when ~/.dema is empty", async () => {
  const root = await mkdtemp(join(tmpdir(), "dema-banner-empty-"));
  await mkdir(join(root, "memory"), { recursive: true });
  const inputs = await gatherBannerInputs({
    home: root,
    gatewayUrl: "http://127.0.0.1:1"
  });
  assert.equal(inputs.profile, null);
  assert.equal(inputs.bizraContext, null);
  assert.equal(inputs.receiptCount, 0);
  assert.equal(inputs.gateway.reachable, false);
});

test("gatherBannerInputs surfaces profile name + stage + receipt count", async () => {
  const root = await mkdtemp(join(tmpdir(), "dema-banner-full-"));
  await mkdir(join(root, "memory"), { recursive: true });
  await mkdir(join(root, "receipts"), { recursive: true });
  await writeFile(
    join(root, "profile.json"),
    JSON.stringify({ schema: "bizra.dema.profile.v0.1", preferred_name: "Mumu" })
  );
  await writeFile(
    join(root, "memory", "bizra-context.json"),
    JSON.stringify({ stage: { current: "SPROUT", next: "TREE" } })
  );
  await writeFile(
    join(root, "receipts", "artifact-011.json"),
    JSON.stringify({
      receipt_id: "r-1",
      artifact_id: "ARTIFACT-011",
      action: "bounded_diagnostic_activation",
      truth_label: "MEASURED",
      created_at: "2026-05-06T00:00:00Z"
    })
  );

  const inputs = await gatherBannerInputs({
    home: root,
    gatewayUrl: "http://127.0.0.1:1"
  });
  assert.equal(inputs.profile.preferred_name, "Mumu");
  assert.equal(inputs.bizraContext.stage.current, "SPROUT");
  assert.equal(inputs.receiptCount, 1);
  assert.ok(inputs.receiptHighlights.find((r) => r.artifact_id === "ARTIFACT-011"));
});

test("formatBanner suggests setup when profile is missing", async () => {
  const root = await mkdtemp(join(tmpdir(), "dema-banner-no-profile-"));
  await mkdir(join(root, "memory"), { recursive: true });
  const inputs = await gatherBannerInputs({ home: root, gatewayUrl: "http://127.0.0.1:1" });
  const banner = formatBanner(inputs);
  assert.match(banner, /Operator:\s+operator/);
  assert.match(banner, /\$ dema setup/);
  assert.match(banner, /First run/i);
});

test("formatBanner suggests downloads.audit.preview when fully ready", async () => {
  const root = await mkdtemp(join(tmpdir(), "dema-banner-ready-"));
  await mkdir(join(root, "memory"), { recursive: true });
  await mkdir(join(root, "receipts"), { recursive: true });
  await writeFile(
    join(root, "profile.json"),
    JSON.stringify({ preferred_name: "Mumu" })
  );
  await writeFile(
    join(root, "memory", "bizra-context.json"),
    JSON.stringify({ stage: { current: "SPROUT", next: "TREE" } })
  );
  await writeFile(
    join(root, "receipts", "artifact-011.json"),
    JSON.stringify({ receipt_id: "r-1", artifact_id: "ARTIFACT-011" })
  );

  const gw = await startFakeGateway({
    "/health": () => ({ body: { status: "ok", domain: HEALTHY_DOMAIN } })
  });
  try {
    const inputs = await gatherBannerInputs({ home: root, gatewayUrl: gw.url });
    const banner = formatBanner(inputs);
    assert.match(banner, /Operator:\s+Mumu/);
    assert.match(banner, /Stage:\s+SPROUT/);
    assert.match(banner, /Gateway:\s+connected/);
    assert.match(banner, /\$ dema task downloads\.audit\.preview/);
  } finally {
    await gw.stop();
  }
});

// ─── shell tokenize ────────────────────────────────────────────────────

test("shell tokenize handles plain words, quotes, and escapes", () => {
  assert.deepEqual(tokenize("status"), ["status"]);
  assert.deepEqual(tokenize("memory show profile"), ["memory", "show", "profile"]);
  assert.deepEqual(tokenize('mission propose --consent "GO: phrase"'), [
    "mission",
    "propose",
    "--consent",
    "GO: phrase"
  ]);
  assert.deepEqual(tokenize("a\\ b c"), ["a b", "c"]);
});

test("shell tokenize throws on unclosed quote", () => {
  assert.throws(() => tokenize('say "hello'), /Unclosed quote/);
});

// ─── downloads.audit.preview task ──────────────────────────────────────

async function makeFixtureDownloads() {
  const downloadsRoot = await mkdtemp(join(tmpdir(), "dema-fixture-downloads-"));
  const demaRoot = await mkdtemp(join(tmpdir(), "dema-fixture-home-"));
  await writeFile(join(downloadsRoot, "alpha.txt"), "hello\n");
  await writeFile(join(downloadsRoot, "bravo.pdf"), "fake-pdf\n");
  await writeFile(join(downloadsRoot, "charlie.pdf"), "another-fake\n");
  await mkdir(join(downloadsRoot, "subdir"), { recursive: true });
  return { downloadsRoot, demaRoot };
}

test("runDownloadsAuditPreview produces a schema-tagged read-only receipt with payload digest", async () => {
  const { downloadsRoot, demaRoot } = await makeFixtureDownloads();
  const before = await readdir(downloadsRoot);
  before.sort();

  const receipt = await runDownloadsAuditPreview({ downloadsRoot, demaRoot });

  assert.equal(receipt.schema, "bizra.dema.task_receipt.v0.1");
  assert.equal(receipt.task_id, "downloads.audit.preview");
  assert.equal(receipt.scope, "read-only");
  assert.equal(receipt.rollback_required, false);
  assert.equal(receipt.truth_label, "MEASURED");
  assert.equal(receipt.sat_verdict, "PARTIAL_PLACEHOLDER");
  assert.match(receipt.payload_digest, /^[0-9a-f]{64}$/);
  assert.equal(receipt.target, downloadsRoot);
  assert.equal(receipt.result.file_count, 3);
  assert.equal(receipt.result.dir_count, 1);
  assert.equal(receipt.result.by_extension[".pdf"], 2);
  assert.equal(receipt.result.by_extension[".txt"], 1);

  // CRITICAL: source dir must be byte-for-byte unchanged.
  const after = await readdir(downloadsRoot);
  after.sort();
  assert.deepEqual(after, before, "downloads dir must not be mutated by a read-only preview");
});

test("runDownloadsAuditPreview writes the receipt under ~/.dema/receipts/", async () => {
  const { downloadsRoot, demaRoot } = await makeFixtureDownloads();
  const receipt = await runDownloadsAuditPreview({ downloadsRoot, demaRoot });
  assert.ok(receipt.written_to);
  const written = JSON.parse(await readFile(receipt.written_to, "utf8"));
  assert.equal(written.receipt_id, receipt.receipt_id);
  assert.equal(written.payload_digest, receipt.payload_digest);
});

test("runDownloadsAuditPreview reports error gracefully when target missing", async () => {
  const { demaRoot } = await makeFixtureDownloads();
  const receipt = await runDownloadsAuditPreview({
    downloadsRoot: "/nonexistent-dema-test-target-xyz",
    demaRoot
  });
  assert.match(receipt.error, /not_found/);
  assert.equal(receipt.scope, "read-only");
});

test("formatTaskReceipt renders the key fields without throwing", async () => {
  const { downloadsRoot, demaRoot } = await makeFixtureDownloads();
  const receipt = await runDownloadsAuditPreview({ downloadsRoot, demaRoot });
  const text = formatTaskReceipt(receipt);
  assert.match(text, /Task:\s+downloads\.audit\.preview/);
  assert.match(text, /Scope:\s+read-only/);
  assert.match(text, /SAT verdict:\s+PARTIAL_PLACEHOLDER/);
});

test("TASK_REGISTRY exposes downloads.audit.preview with autonomy_level", () => {
  const t = TASK_REGISTRY["downloads.audit.preview"];
  assert.ok(t);
  assert.equal(t.id, "downloads.audit.preview");
  assert.match(t.autonomy_level, /L0\/L1/);
});

// ─── SAT placeholder verifier ──────────────────────────────────────────

test("verifyReceiptPlaceholder returns PARTIAL_PLACEHOLDER on a valid task receipt", async () => {
  const { downloadsRoot, demaRoot } = await makeFixtureDownloads();
  const receipt = await runDownloadsAuditPreview({ downloadsRoot, demaRoot });
  const verdict = verifyReceiptPlaceholder(receipt);
  assert.equal(verdict.verdict, "PARTIAL_PLACEHOLDER");
  assert.equal(verdict.truth_label, "DECLARED");
  assert.ok(verdict.checks.every((c) => c.pass), `all shallow checks should pass; got ${JSON.stringify(verdict.checks)}`);
});

test("verifyReceiptPlaceholder REJECTs a tampered receipt that claims a stronger verdict", async () => {
  const { downloadsRoot, demaRoot } = await makeFixtureDownloads();
  const receipt = await runDownloadsAuditPreview({ downloadsRoot, demaRoot });
  const tampered = { ...receipt, sat_verdict: "PERMIT" };
  const verdict = verifyReceiptPlaceholder(tampered);
  assert.equal(verdict.verdict, "REJECT");
  assert.ok(verdict.checks.find((c) => c.check === "verdict_honestly_declared_as_placeholder" && !c.pass));
});

test("verifyReceiptPlaceholder REJECTs receipt missing payload_digest", () => {
  const verdict = verifyReceiptPlaceholder({
    scope: "read-only",
    rollback_required: false,
    sat_verdict: "PARTIAL_PLACEHOLDER"
  });
  assert.equal(verdict.verdict, "REJECT");
});

test("formatVerdict renders all checks with pass/fail marks", async () => {
  const { downloadsRoot, demaRoot } = await makeFixtureDownloads();
  const receipt = await runDownloadsAuditPreview({ downloadsRoot, demaRoot });
  const verdict = verifyReceiptPlaceholder(receipt);
  const text = formatVerdict(verdict);
  assert.match(text, /SAT verdict:\s+PARTIAL_PLACEHOLDER/);
  assert.match(text, /✓ scope_declared_read_only/);
});

// ─── CLI integration ───────────────────────────────────────────────────

test("dema task (no arg) lists registered tasks as schema-tagged JSON", async () => {
  const { stdout } = await execFileAsync("node", [cliPath, "task"]);
  const output = JSON.parse(stdout);
  assert.equal(output.schema, "bizra.dema.task_list.v0.1");
  assert.ok(output.tasks.find((t) => t.id === "downloads.audit.preview"));
});

test("dema task downloads.audit.preview runs end-to-end with DEMA_DOWNLOADS_ROOT override", async () => {
  const { downloadsRoot, demaRoot } = await makeFixtureDownloads();
  const { stdout } = await execFileAsync("node", [cliPath, "task", "downloads.audit.preview"], {
    env: {
      ...process.env,
      DEMA_DOWNLOADS_ROOT: downloadsRoot,
      DEMA_HOME: demaRoot
    }
  });
  assert.match(stdout, /Task:\s+downloads\.audit\.preview/);
  assert.match(stdout, /SAT verdict:\s+PARTIAL_PLACEHOLDER/);
  assert.match(stdout, /✓ scope_declared_read_only/);
  // Receipt must be on disk.
  const receiptsDir = join(demaRoot, "receipts");
  const files = await readdir(receiptsDir);
  assert.ok(files.find((f) => f.includes("downloads.audit.preview")));
});

test("dema bare invocation (no args) prints the active-kernel banner", async () => {
  const { downloadsRoot, demaRoot } = await makeFixtureDownloads();
  const { stdout } = await execFileAsync("node", [cliPath], {
    env: {
      ...process.env,
      DEMA_HOME: demaRoot,
      // Force gateway probe to fail fast — fixture demaRoot has no profile.
      DEMA_NODE0_ADAPTER: ""
    }
  });
  assert.match(stdout, /Dema — Sovereign AI Node Companion/);
  assert.match(stdout, /Operator:\s+operator/);
  assert.match(stdout, /Next safe task/);
  assert.match(stdout, /Boundary: no action without explicit consent/);
});

test("dema help still works after the active-kernel refactor", async () => {
  const { stdout } = await execFileAsync("node", [cliPath, "help"]);
  assert.match(stdout, /Dema CLI/);
  assert.match(stdout, /dema task/);
  assert.match(stdout, /v0\.3\.0/);
});

test("bin/dema script exists and is executable", async () => {
  const binPath = new URL("../bin/dema", import.meta.url).pathname;
  const s = await stat(binPath);
  assert.ok(s.isFile(), "bin/dema should be a regular file");
  // Owner execute bit (0o100 in mode):
  assert.ok((s.mode & 0o100) !== 0, "bin/dema should be executable by owner");
});
