$DemaHome = if ($env:DEMA_HOME) { $env:DEMA_HOME } else { Join-Path $HOME ".dema" }

New-Item -ItemType Directory -Force -Path `
  (Join-Path $DemaHome "receipts"), `
  (Join-Path $DemaHome "memory"), `
  (Join-Path $DemaHome "logs"), `
  (Join-Path $DemaHome "skills") | Out-Null

$ProfilePath = Join-Path $DemaHome "profile.json"
if (-not (Test-Path $ProfilePath)) {
  @{
    schema = "bizra.dema.profile.v0.1"
    preferred_name = $null
    memory_consent = "local"
    hidden_autonomy = $false
  } | ConvertTo-Json | Set-Content -Path $ProfilePath -Encoding UTF8
}

$ConfigPath = Join-Path $DemaHome "config.local.json"
if (-not (Test-Path $ConfigPath)) {
  @{
    schema = "bizra.dema.local_config.v0.1"
    mode = "local"
    noHiddenDaemon = $true
    requireExplicitConsent = $true
    nextArtifact = "ARTIFACT-011"
  } | ConvertTo-Json | Set-Content -Path $ConfigPath -Encoding UTF8
}

Write-Host "Dema local folders created at $DemaHome"
Write-Host "No daemon was started. Next: install the Dema app or run the developer CLI."
