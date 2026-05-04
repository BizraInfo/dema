# Dema Unified Installer Architecture v0.1

## Goal

A non-technical user can install Dema and reach a safe local status screen without touching code, without starting hidden processes, and without dispatching a mission.

## Install levels

1. GUI installer: Windows, macOS, Linux
2. Terminal installer: curl/PowerShell
3. Developer install: clone + npm install

## Installer responsibilities

- detect OS
- create local Dema home
- create profile skeleton only when missing
- create local config only when missing
- create receipt/memory/log/skills folders idempotently
- detect LM Studio or Ollama when available
- show local-only default
- list exactly what was created
- list exactly what was left untouched
- never start hidden daemon
- never dispatch mission
- never issue ARTIFACT-011

## Local state

```text
~/.dema/
  profile.json
  config.local.json
  receipts/
  memory/
  logs/
  skills/
```

## Idempotency contract

The installer is safe to run more than once.

If a file already exists, the installer must preserve it and report it as existing. This protects local identity, memory preference, and receipt history.

Expected setup report:

```text
Created:
- ~/.dema/receipts/
- ~/.dema/memory/
- ~/.dema/logs/
- ~/.dema/skills/

Preserved:
- ~/.dema/profile.json
- ~/.dema/config.local.json

Not touched:
- daemon state
- mission runtime
- receipt history
- external provider settings
```

## Release rule

No public release until:

- first receipt flow works
- no-code install tested
- uninstall tested
- no hidden background daemon
- signed release artifacts planned
