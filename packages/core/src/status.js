export function defaultStatus() {
  return {
    schema: "bizra.dema.status.v0.1",
    node: "Node0",
    human: null,
    ready: false,
    consoleReady: false,
    activationGate: "BLOCKED",
    daemonStatus: "unknown",
    missionExecuted: false,
    runtimePulse: { fired: false },
    findings: ["Node0 adapter not connected"],
    model: { connected: false, loadedModelIds: [], tokenPresent: false },
    rustBus: { ready: false },
    proof: { nextArtifact: "ARTIFACT-011" },
    nextAdmissibleAction: "complete_setup"
  };
}

export function isReadyForBoundedDiagnostic(status) {
  return Boolean(
    status?.ready &&
      status?.consoleReady &&
      status?.activationGate === "EXPLICIT_GO_REQUIRED" &&
      status?.daemonStatus !== "running" &&
      status?.missionExecuted !== true &&
      status?.runtimePulse?.fired !== true
  );
}

export function formatStatus(status) {
  const runtimePulseFired = Boolean(status.runtimePulse?.fired);
  const lines = [
    "DEMA — Sovereign AI Node Companion",
    "",
    `Node: ${status.node ?? "unknown"}`,
    `Human: ${status.human ?? "unknown"}`,
    `Ready: ${Boolean(status.ready)}`,
    `Console ready: ${Boolean(status.consoleReady)}`,
    `Activation gate: ${status.activationGate ?? "unknown"}`,
    `Daemon: ${status.daemonStatus ?? "unknown"}`,
    `Mission executed: ${Boolean(status.missionExecuted)}`,
    `Runtime pulse fired: ${runtimePulseFired}`,
    `Model connected: ${Boolean(status.model?.connected)}`,
    `Loaded models: ${(status.model?.loadedModelIds ?? []).join(", ") || "none"}`,
    `Model token visible: ${Boolean(status.model?.tokenPresent)}`,
    `Rust Bus: ${status.rustBus?.ready ? "READY" : "not ready"}`,
    `Next artifact: ${status.proof?.nextArtifact ?? "unknown"}`,
    `Next action: ${status.nextAdmissibleAction ?? "none"}`,
    ""
  ];

  if (status.findings?.length) {
    lines.push("Findings:");
    for (const finding of status.findings) lines.push(`- ${finding}`);
  } else {
    lines.push("Findings: none");
  }

  lines.push("");
  lines.push("Boundary: no action without explicit consent.");
  return lines.join("\n");
}
