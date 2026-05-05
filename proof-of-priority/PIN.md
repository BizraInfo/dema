# Proof-of-Priority — Canonical Pin

This file pins the canonical BIZRA proof-of-priority state on disk and on `main`. Until the OpenTimestamps attestation lands, this is the authoritative record of *which root, by which algorithm, over which named documents, on which commit.*

| Field | Value |
|---|---|
| `algorithm_id` | `bizra.priority-anchor.v1` |
| `algorithm_spec` | [`docs/PRIORITY_ANCHOR.md`](../docs/PRIORITY_ANCHOR.md) |
| `algorithm_script` | [`scripts/priority-anchor.mjs`](../scripts/priority-anchor.mjs) |
| `root_hash` | `45aa2789b6085558a387cd3d6bbae894defdfa71fdd5a1db18135e6039e1477a` |
| `manifest` | [`proof-of-priority/manifest.json`](./manifest.json) |
| `algorithm_commit` | `685e51b` (PR #7) |
| `merge_commit` | `7b35964` (main) |
| `pinned_at` | `2026-05-05` |
| `stamp_status` | `STAMPED` — OpenTimestamps submission accepted; awaiting calendar→Bitcoin upgrade (~24h) |
| `stamped_at` | `2026-05-05T16:07Z` |
| `stamped_file_sha256` | `637f067e1200909c08294b20e1d4be9063862a2fd53dcf47bb07ad1d93c98702` (sha256 of `merkle-root.txt` bytes — the value OTS actually attests to; binds to `root_hash` via the file's content) |
| `ots_artifact` | [`proof-of-priority/merkle-root.txt.ots`](./merkle-root.txt.ots) |
| `pending_calendars` | `https://alice.btc.calendar.opentimestamps.org`<br/>`https://btc.calendar.catallaxy.com`<br/>`https://finney.calendar.eternitywall.com` |

## Frozen filenames

The v1 algorithm binds `filename + file_size_bytes + file_sha256` into each leaf. The following names are part of the proof and **must not be renamed** while this pin is in force; any rename invalidates the anchor and requires minting a v2 artifact.

| File | Role | SHA-256 (first 16) |
|---|---|---|
| `themassage.pdf` | الرسالة — personal letter, 2023 | `e05b73b933df3196` |
| `bizra.pdf` | البذرة — the seed, 2023 | `f95bc6f76acdc933` |
| `BIZRA_Third_Fact_v0_1_FINAL.pdf` | Third Fact v0.1 — public manifesto, 2026 | `1deacd63f42315d7` |

## Reproduce

From the repo root:

```bash
npm run priority-anchor:verify
```

Expected output:

```text
✔ bizra.priority-anchor.v1
✔ root_hash reproduced: 45aa2789b6085558a387cd3d6bbae894defdfa71fdd5a1db18135e6039e1477a
```

## Stamp lifecycle

This pin advances through the following states. Each transition requires an explicit human GO and a follow-up commit that updates this file.

| State | Meaning | Update on transition |
|---|---|---|
| `PENDING` | Algorithm + manifest + root committed on `main`; no OpenTimestamps action yet. | — |
| `STAMPED` | `ots stamp proof-of-priority/merkle-root.txt` run; `merkle-root.txt.ots` committed. **(current)** | set `stamp_status: STAMPED`; add `stamped_at`, `stamped_file_sha256`, `pending_calendars` |
| `UPGRADED` | `ots upgrade` run after the calendar window (~24h); upgraded `.ots` committed | set `stamp_status: UPGRADED`; add `upgraded_at` and (when known) `bitcoin_block_height` |

The stamp action is irreversible (it writes to public timestamp calendars) and identity-binding. It is out of scope for any auto-mode session and requires explicit human authorization.
