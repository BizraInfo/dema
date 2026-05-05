# ADR-004: Local-First Memory

**Status:** Accepted
**Date:** 2026-04-17
**Decision makers:** Mumu (Mohamed Beshr)

## Context

Users need DEMA to remember context, preferences, and research across sessions. Most AI tools implement "memory" as opaque cloud-stored embeddings the user cannot inspect.

BIZRA's doctrine requires all state to be visible, auditable, and Git-compatible. The user's local machine is the primary trust boundary for personal memory.

## Decision

DEMA memory is local-first:

1. **Storage:** structured files in `~/.dema/memory/` (or user-configured path)
2. **Format:** JSON + Markdown, human-readable, Git-compatible
3. **Categories:** preferences, research library, resource registry, session context
4. **Sync:** opt-in only; user explicitly chooses what syncs to cloud (if ever)
5. **Encryption:** at-rest encryption for sensitive items (API keys, personal context)
6. **Classification:** each memory item carries relevance, confidence, recency, impact, and source type

## Consequences

- Memory works offline — no cloud dependency for recall
- Users can `cat`, `grep`, `git diff` their memory files
- Memory migration is a file copy
- Cloud sync (future) requires explicit user consent per item category
- The Memory/Trust mode surfaces all stored memory for inspection
- Memory items are never silently deleted — expiry is user-controlled
