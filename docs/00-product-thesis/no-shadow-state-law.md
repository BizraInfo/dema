# No Shadow State Law

## The law

> If the user cannot see it, DEMA must not rely on it.

## Rationale

Shadow state is the root cause of user distrust in AI products. When a tool remembers things the user cannot inspect, makes decisions based on hidden context, or silently changes behavior based on cached data, the user loses the ability to understand and correct the tool.

DEMA's competitive position is trust. Trust requires transparency. Transparency requires that every piece of state the system uses is visible to the user.

## What counts as shadow state

- Hidden chat history that influences responses but isn't shown
- Embedding-based memory the user cannot read or edit
- Cached user profiles that silently shape behavior
- A/B test flags that change the experience without disclosure
- Browser cookies or localStorage that carry behavioral state
- Background model fine-tuning based on user data

## What does not count as shadow state

- **Performance caches** — OK if they don't change semantic behavior
- **UI state** — scroll position, panel sizes, collapsed sections
- **Session tokens** — necessary for auth, visible in settings
- **Pending writes** — buffered data shown with "saving..." indicator

## Enforcement

Every PR that introduces persisted state must answer:

1. Where does the user see this state?
2. Can the user edit or delete it?
3. Does removing this state change DEMA's behavior?
4. Is this state included in the trust strip or memory view?

If the answer to #1 is "nowhere," the PR is rejected.
