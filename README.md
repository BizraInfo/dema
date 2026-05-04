# Dema

**Your sovereign AI node companion.**

Dema helps you run a private AI workspace on your own machine -- with memory, safe actions, receipts, and a clear next step.

Local-first.
Consent-bound.
Receipt-backed.
No coding required.

```text
Install Dema
-> create your profile
-> connect a local model
-> see your node health
-> approve one bounded action
-> receive your first proof receipt
```

BIZRA is the ecosystem.
Dema is the door.

---

## The 60-second version

Dema is for people who want local AI without invisible autonomy.

It shows:

- what is ready on your machine
- what is blocked
- what Dema can safely preview
- what requires your exact consent
- what receipt will prove the result

Dema does not ask you to trust a black box. It tells you what it knows, what it will not touch, and what the next safe action is.

---

## First run

```bash
dema welcome
dema setup
dema status
dema doctor
dema mission propose
```

Expected first impression:

```text
Welcome to Dema.

Your node is local-first.
Your actions are consent-bound.
Your important steps can produce receipts.

Next:
1. Run setup
2. Check status
3. Preview first bounded diagnostic
```

`dema mission propose` is a preview command. It checks readiness and consent state, then stops. It does not start a daemon, execute work, or create the first runtime receipt.

---

## Install

### Guided installer

Download Dema, open it, and follow the first-run wizard.

The wizard guides you through:

1. Welcome
2. Privacy mode
3. Profile
4. Model detection
5. Local health check
6. Receipt folder
7. First safe action preview

### Terminal install

The terminal installer endpoint is planned for the packaged alpha release. Until release assets are published, use the developer install below.

Planned Linux / macOS command:

```bash
curl -fsSL https://install.dema.ai | sh
```

Planned Windows PowerShell command:

```powershell
irm https://install.dema.ai | iex
```

### Developer install

```bash
git clone https://github.com/BizraInfo/Dema
cd Dema
npm install
npm test
npm run check
```

---

## What setup creates

`dema setup` creates local state in your Dema home directory, usually `~/.dema`:

```text
~/.dema/
  profile.json
  config.local.json
  receipts/
  memory/
  logs/
  skills/
```

Setup is idempotent and non-destructive. If a profile or config already exists, Dema leaves it in place.

Setup does not start a background process.
Setup does not execute a mission.
Setup does not issue ARTIFACT-011.

---

## Receipts

A receipt is Dema's way of saying:

```text
what happened,
what did not happen,
what evidence exists,
and what the next safe action is.
```

Use:

```bash
dema receipts
dema receipts ARTIFACT-011
```

Learn more in [`docs/RECEIPTS.md`](docs/RECEIPTS.md).

---

## Product promise

Dema says:

> Here is what I know.  
> Here is what is safe.  
> Here is what is blocked.  
> Here is what I can preview with your consent.
> Here is the receipt.

---

## Current boundary

The next runtime artifact is:

```text
ARTIFACT-011 -- First Bounded Diagnostic Receipt
```

ARTIFACT-011 remains locked behind the governed one-shot runtime path and the exact consent phrase:

```text
GO: Node0 bounded diagnostic activation only
```

Until that receipt exists, Dema's public language remains local-first, consent-bound, and proof-safe.
