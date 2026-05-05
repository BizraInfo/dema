# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo at a glance

Dema is the v0.1 product shell that fronts BIZRA's Node0 runtime. It is a small Node.js (>= 20) ESM monorepo, no build step, no workspaces declaration — packages cross-import via relative paths.

Layout:

- `apps/cli/src/index.js` — single entrypoint for every `dema` subcommand; pure switch over `process.argv`.
- `packages/node-adapter/` — talks to Node0 by shelling out to `DEMA_NODE0_STATUS_COMMAND` and normalizing its JSON. Falls back to `defaultStatus()` when unset.
- `packages/core/` — `status.js` (formatting + readiness predicate), `mission.js` (bounded-diagnostic proposal + preview), `today.js` (continuity tick).
- `packages/fate/` — `evaluateConsent()`: exact-string consent gate, no fuzzy match.
- `packages/installer/setup.js` — idempotent `~/.dema/` skeleton creator.
- `packages/receipts/receipt-store.js` — read-only viewer over `~/.dema/receipts/*.json`.
- `tests/status.test.js` — single `node:test` suite covering all packages and the CLI surface.
- `scripts/check.mjs` — runs the test suite plus CLI smoke commands.
- `scripts/install/install-{unix.sh,windows.ps1}` — planned terminal installers (release endpoint not yet live).

## Common commands

```bash
npm install            # install dev deps (currently none — npm install is a noop but keep the muscle memory)
npm test               # node --test (runs tests/status.test.js)
npm run check          # full gate: test suite + CLI smoke (welcome/help/status/mission propose/monetize)
npm run dev            # node apps/cli/src/index.js status
node apps/cli/src/index.js <subcommand>   # invoke any CLI command directly
```

Run a single test file or test name:

```bash
node --test tests/status.test.js
node --test --test-name-pattern="bounded diagnostic" tests/status.test.js
```

CLI surface (alpha):

```text
dema welcome | setup | status | status:json | today | doctor
dema mission propose [--consent "GO: Node0 bounded diagnostic activation only"]
dema receipts [ID|filename|path]
dema monetize | help
```

## Architecture spine

```
CLI → Node0 Adapter → status normalization → mission proposal → FATE consent → (governed runtime path, NOT in this repo) → receipts viewer
```

Invariants the code enforces — do not weaken them:

- **No runtime execution in this repo.** `dema mission propose` returns `executes: false` always. ARTIFACT-011 is created elsewhere by the governed Node0 one-shot path, never by Dema itself.
- **No hidden daemon.** `setup` writes folders only; `today` records a continuity tick with `missionExecuted: false, runtimePulse.fired: false`; `doctor` fails (`exitCode = 1`) if `daemonStatus === "running"`.
- **Setup is idempotent.** `runSetup()` reports `created` vs `existing` paths and never overwrites `profile.json` or `config.local.json`. Tests assert this contract.
- **Consent is exact-string match only.** `evaluateConsent()` compares with `===` — trailing whitespace fails. The required phrase lives in `BOUNDED_DIAGNOSTIC_CONSENT_PHRASE` in [packages/core/src/mission.js](packages/core/src/mission.js).
- **Schema-tagged outputs.** Every JSON envelope carries a `schema: "bizra.dema.<thing>.v0.1"` field. New outputs should follow the same convention.
- **Adapter input is untrusted.** `normalizeNode0Status()` coerces every field with `Boolean()` / `??` defaults and never propagates a private name (`human` defaults to `null`, never to a hard-coded identity).

## Local state contract

Setup writes under `DEMA_HOME` (env override) or `~/.dema/`:

```
~/.dema/{profile.json, config.local.json, receipts/, memory/, logs/, skills/}
```

`receipt-store.js` and `today.js` resolve the same root via `process.env.DEMA_HOME ?? join(homedir(), ".dema")`. Tests use `mkdtemp` + `DEMA_HOME` override — follow that pattern when adding state-touching tests.

## Adapter integration

`createNode0Adapter()` reads `DEMA_NODE0_STATUS_COMMAND` (a shell-tokenized command line via `parseCommandLine`, which supports quoted paths and backslash escapes). The command must print JSON to stdout; non-JSON output produces a labeled error. When the env var is unset the adapter returns the safe `defaultStatus()` (everything blocked) — that is the expected developer-machine state, not a bug.

## PR / contribution checklist

From [CONTRIBUTING.md](CONTRIBUTING.md), enforced informally:

- User-facing language stays simple and non-hype (no token / passive-income / AGI / federation claims).
- No hidden background process introduced.
- Consent boundary remains explicit.
- Tests included; `npm run check` passes.
- README stays understandable to non-technical users.

## Doc map

- [README.md](README.md) — public landing page; first-run flow.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — adapter/runtime/receipt spine.
- [docs/INSTALLER_ARCHITECTURE.md](docs/INSTALLER_ARCHITECTURE.md) — install levels, idempotency contract, release rule.
- [docs/RECEIPTS.md](docs/RECEIPTS.md) — receipt format expectations and ARTIFACT-011 boundary.
- [docs/FIRST_RUN_WIZARD.md](docs/FIRST_RUN_WIZARD.md), [docs/PRODUCT.md](docs/PRODUCT.md), [docs/ROADMAP.md](docs/ROADMAP.md), [docs/GTM.md](docs/GTM.md), [docs/ARTIFACT_011_PREP.md](docs/ARTIFACT_011_PREP.md), [docs/DEMA_CONSTITUTION.md](docs/DEMA_CONSTITUTION.md) — product / governance context.
