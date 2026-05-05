# ADR-003: Core Truth Lives in bizra-omega

**Status:** Proposed (2026-05-05)
**Original date:** 2026-04-17
**Decision makers:** Mumu (Mohamed Beshr)

## Reconciliation note (2026-05-05)

Imported from the R1 scaffold (`/data/bizra/repos/DEMA`) as part of the v0.2 doctrine absorption. Status downgraded from `Accepted` to `Proposed` because the named substrate `bizra-omega` does not exist as a repo on this host — current Dema consumes Node0 status through the adapter shellout in [packages/node-adapter/src/node0-adapter.js](../../packages/node-adapter/src/node0-adapter.js), not through a `bizra-omega` SDK. Re-accept this ADR once either (a) `bizra-omega` is created and the SDK exists, or (b) the ADR is rewritten to name the actual substrate (`bizra-data-lake` + Node0 adapter).

## Context

The BIZRA system has a clear separation: a constitutional substrate holds missions, receipts, chain, trust engine, admissibility logic. DEMA is the product face.

If DEMA duplicates any core truth (e.g., reimplements receipt validation, invents its own trust scoring, or maintains a parallel mission registry), the system loses its constitutional guarantee.

## Decision

DEMA consumes core truth exclusively through the gateway client SDK. It never:

- Duplicates mission law or mission state machines
- Reimplements admissibility checks
- Creates receipts directly (only reads/displays them)
- Mutates chain truth outside approved gateway contracts
- Maintains a parallel trust score

DEMA may:

- Cache read-only snapshots for display performance
- Render trust state, manifests, and receipts
- Package and present derived views (e.g., current→ideal gap)
- Manage local-only state (preferences, UI state, research library)

## Consequences

- `packages/sdk/` defines the approved contract surface
- Any new core concept requires a gateway contract before DEMA can use it
- `scripts/sync-contracts.sh` validates contract alignment on CI
- DEMA tests mock the gateway, not the core internals
- Breaking contract changes require coordination between repos
