# ADR-002: No Shadow State

**Status:** Accepted
**Date:** 2026-04-17
**Decision makers:** Mumu (Mohamed Beshr)

## Context

Many AI products maintain invisible internal state that the user cannot inspect, verify, or correct. This creates a trust gap: the tool claims to "remember" or "understand" but the user has no way to audit what it actually holds.

Products that surface "memory" typically show chat history, not structured verifiable state.

## Decision

DEMA must not maintain any state that is invisible to the user:

1. **Every piece of persisted state** has a visible surface (trust strip, receipt chain, manifest card, memory view)
2. **No hidden caches** influence behavior without user visibility
3. **Local memory** is stored in user-accessible files (Git-compatible format)
4. **Research results** always carry citations and confidence scores
5. **Actions** always produce receipts viewable in the receipt chain

## Consequences

- Every new feature must answer: "where does the user see this state?"
- No localStorage/sessionStorage tricks that silently shape behavior
- Local memory uses structured files the user can `cat`, `grep`, and `git diff`
- Performance caches are allowed but must not alter semantic behavior
- The trust strip is the always-on proof that no shadow state exists
