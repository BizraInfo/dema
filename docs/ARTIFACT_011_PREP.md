# ARTIFACT-011 Prep

ARTIFACT-011 is the first bounded diagnostic runtime receipt.

## Allowed

- bounded diagnostic activation only
- one diagnostic mission
- receipt creation
- post-run status verification

## Forbidden

- Node1
- public demo
- external provider routing
- token/economic claims
- unbounded daemon autonomy

## Required consent phrase

```text
GO: Node0 bounded diagnostic activation only
```

## Product-shell command

```bash
dema mission propose --consent "GO: Node0 bounded diagnostic activation only"
```

This command previews readiness and consent only. It must report `executes=false`; the actual runtime pulse belongs to the governed Node0 one-shot service path.
