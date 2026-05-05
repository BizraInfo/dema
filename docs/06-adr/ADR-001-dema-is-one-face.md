# ADR-001: DEMA Is the One Face

**Status:** Accepted
**Date:** 2026-04-17
**Decision makers:** Mumu (Mohamed Beshr)

## Context

BIZRA's architecture has multiple specialist systems — core runtime, chain engine, trust engine, admissibility, missions. Users should never interact with these directly. There must be exactly one product-facing surface.

Market analysis shows three proven patterns competing in this space:
- **Claude Code** — terminal-first, codebase-aware, MCP-connected
- **Perplexity** — citation-first research, library, local MCP bridge
- **Manus** — browser/desktop operator with explicit permissions

None of these provides all three under a unified trust model with constitutional memory and proof.

## Decision

DEMA is the sole user-facing product surface for BIZRA. All user interactions — web, CLI, desktop — go through DEMA. No other repo ships a user-facing interface.

DEMA operates in six modes: Ask, Code, Research, Browser, Computer, Memory/Trust. All modes share one trust model, one permission system, and one receipt chain.

## Consequences

- All UX investment concentrates in one repo
- Specialist systems remain behind the DEMA SDK/gateway boundary
- No other repo may ship user-facing UI or CLI commands
- DEMA must maintain parity across web, CLI, and desktop for core trust concepts
- The trust strip is always visible regardless of active mode
