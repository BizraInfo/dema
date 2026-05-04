#!/usr/bin/env sh
set -eu

DEMA_HOME="${DEMA_HOME:-$HOME/.dema}"
mkdir -p "$DEMA_HOME/receipts" "$DEMA_HOME/memory" "$DEMA_HOME/logs" "$DEMA_HOME/skills"

if [ ! -f "$DEMA_HOME/profile.json" ]; then
  cat > "$DEMA_HOME/profile.json" <<'JSON'
{
  "schema": "bizra.dema.profile.v0.1",
  "preferred_name": null,
  "memory_consent": "local",
  "hidden_autonomy": false
}
JSON
fi

if [ ! -f "$DEMA_HOME/config.local.json" ]; then
  cat > "$DEMA_HOME/config.local.json" <<'JSON'
{
  "schema": "bizra.dema.local_config.v0.1",
  "mode": "local",
  "noHiddenDaemon": true,
  "requireExplicitConsent": true,
  "nextArtifact": "ARTIFACT-011"
}
JSON
fi

echo "Dema local folders created at $DEMA_HOME"
echo "No daemon was started. Next: install the Dema app or run the developer CLI."
