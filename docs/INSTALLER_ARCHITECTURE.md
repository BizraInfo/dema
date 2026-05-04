# Dema Unified Installer Architecture v0.1

## Goal

A non-technical user can install Dema and reach a safe local status screen without touching code.

## Install levels

1. GUI installer: Windows, macOS, Linux
2. Terminal installer: curl/PowerShell
3. Developer install: clone + npm install

## Installer responsibilities

- detect OS
- create local Dema home
- create profile skeleton
- create local config declaring no hidden daemon
- create receipt/memory/log folders
- detect LM Studio or Ollama
- show local-only default
- never start hidden daemon
- never dispatch mission without consent

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

## Release rule

No public release until:

- first receipt flow works
- no-code install tested
- uninstall tested
- no hidden background daemon
- signed release artifacts planned
