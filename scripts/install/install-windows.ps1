$DemaHome = if ($env:DEMA_HOME) { $env:DEMA_HOME } else { Join-Path $HOME ".dema" }
$CreatedProfile = $false
$CreatedConfig = $false

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
  $CreatedProfile = $true
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
  $CreatedConfig = $true
}

Write-Host "Dema local setup complete at $DemaHome"
Write-Host "Created or confirmed:"
Write-Host "  $(Join-Path $DemaHome "receipts")"
Write-Host "  $(Join-Path $DemaHome "memory")"
Write-Host "  $(Join-Path $DemaHome "logs")"
Write-Host "  $(Join-Path $DemaHome "skills")"
if ($CreatedProfile) { Write-Host "  $ProfilePath" } else { Write-Host "Preserved: $ProfilePath" }
if ($CreatedConfig) { Write-Host "  $ConfigPath" } else { Write-Host "Preserved: $ConfigPath" }
Write-Host "Not touched: daemon state, mission runtime, runtime pulse, receipt history, external provider settings."
Write-Host "No daemon was started. No mission was executed. ARTIFACT-011 was not issued."
Write-Host "Next: run 'dema status'."
