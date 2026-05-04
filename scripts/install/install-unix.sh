#!/usr/bin/env sh
set -eu

DEMA_HOME="${DEMA_HOME:-$HOME/.dema}"
mkdir -p "$DEMA_HOME/receipts" "$DEMA_HOME/memory" "$DEMA_HOME/logs" "$DEMA_HOME/skills"
created_profile=false
created_config=false

if [ ! -f "$DEMA_HOME/profile.json" ]; then
  cat > "$DEMA_HOME/profile.json" <<'JSON'
{
  "schema": "bizra.dema.profile.v0.1",
  "preferred_name": null,
  "memory_consent": "local",
  "hidden_autonomy": false
}
JSON
  created_profile=true
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
  created_config=true
fi

echo "Dema local setup complete at $DEMA_HOME"
echo "Created or confirmed:"
echo "  $DEMA_HOME/receipts"
echo "  $DEMA_HOME/memory"
echo "  $DEMA_HOME/logs"
echo "  $DEMA_HOME/skills"
if [ "$created_profile" = true ]; then echo "  $DEMA_HOME/profile.json"; else echo "Preserved: $DEMA_HOME/profile.json"; fi
if [ "$created_config" = true ]; then echo "  $DEMA_HOME/config.local.json"; else echo "Preserved: $DEMA_HOME/config.local.json"; fi
echo "Not touched: daemon state, mission runtime, runtime pulse, receipt history, external provider settings."
echo "No daemon was started. No mission was executed. ARTIFACT-011 was not issued."
echo "Next: run 'dema status'."
