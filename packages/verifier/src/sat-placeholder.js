// SAT (System Agentic Team) verifier — PLACEHOLDER for v0.3.0.
//
// This is NOT the real SAT verifier. SAT-5 lives upstream in bizra-omega
// per docs/02-architecture/pat-builder-sat-validator.md. This placeholder
// exists so the active kernel can emit a verification report shape that
// future SAT-5 will fill, without making any false claim about
// certification today.
//
// What this DOES (the shallow check):
//   - Reads the receipt
//   - Verifies the receipt declares scope: "read-only"
//   - Verifies rollback_required is false
//   - Verifies a payload digest exists
//
// What this does NOT do:
//   - Re-derive the digest from the underlying observation (would require
//     re-running the task, which has its own observation cost)
//   - Run the 4-gate admissibility chain (Ihsān/Adl/Guardian/Confidence)
//   - Issue a binding PERMIT verdict
//
// Verdict shape mirrors the upstream GateVerdict enum (PERMIT/REJECT/
// REVIEW/SCORE_ONLY) for forward-compat. v0.3.0 only ever returns
// PARTIAL_PLACEHOLDER — never PERMIT — to make the boundary explicit.

export const SAT_PLACEHOLDER_SCHEMA = "bizra.dema.sat_verdict.v0.1";

export function verifyReceiptPlaceholder(receipt) {
  const checks = [];

  // Shallow check 1: scope must be declared read-only for a v0.3.0 task receipt.
  const scopeOk = receipt?.scope === "read-only";
  checks.push({
    check: "scope_declared_read_only",
    pass: scopeOk,
    detail: scopeOk
      ? `scope: read-only`
      : `expected scope: read-only, got: ${receipt?.scope ?? "(missing)"}`
  });

  // Shallow check 2: rollback_required must be false (no mutation to undo).
  const rollbackOk = receipt?.rollback_required === false;
  checks.push({
    check: "rollback_not_required",
    pass: rollbackOk,
    detail: rollbackOk
      ? `rollback_required: false`
      : `expected rollback_required: false, got: ${receipt?.rollback_required}`
  });

  // Shallow check 3: payload digest present (binds the receipt to its own contents).
  const digestOk =
    typeof receipt?.payload_digest === "string" && /^[0-9a-f]{64}$/.test(receipt.payload_digest);
  checks.push({
    check: "payload_digest_present",
    pass: digestOk,
    detail: digestOk
      ? `payload_digest: ${receipt.payload_digest.slice(0, 16)}…`
      : `payload_digest missing or malformed`
  });

  // Shallow check 4: receipt declares the placeholder verdict honestly.
  const honestyOk = receipt?.sat_verdict === "PARTIAL_PLACEHOLDER";
  checks.push({
    check: "verdict_honestly_declared_as_placeholder",
    pass: honestyOk,
    detail: honestyOk
      ? `receipt declares sat_verdict: PARTIAL_PLACEHOLDER (honest)`
      : `receipt claims sat_verdict: ${receipt?.sat_verdict} — placeholder MUST decline to over-claim`
  });

  const allPassed = checks.every((c) => c.pass);
  const verdict = allPassed ? "PARTIAL_PLACEHOLDER" : "REJECT";

  return {
    schema: SAT_PLACEHOLDER_SCHEMA,
    verdict,
    truth_label: "DECLARED",
    checked_at: new Date().toISOString(),
    receipt_id: receipt?.receipt_id ?? null,
    checks,
    note:
      "SAT verifier is a placeholder in v0.3.0. The shallow checks above only confirm the receipt declares the right shape — they do NOT certify admissibility. Real SAT verification arrives with v0.3.2 (verifier sibling) and the SAT-5 Rust roster (PLANNED upstream in bizra-data-lake). Per the autonomy envelope: an L4 receipt absent a real SAT verdict MUST be rejected by the chain reader."
  };
}

export function formatVerdict(verdict) {
  if (!verdict) return "(no verdict)";
  const lines = [
    `SAT verdict:    ${verdict.verdict}`,
    `Truth label:    ${verdict.truth_label}`,
    `Checked:        ${verdict.checked_at}`,
    ``,
    `Shallow checks:`
  ];
  for (const c of verdict.checks) {
    const mark = c.pass ? "✓" : "✗";
    lines.push(`  ${mark} ${c.check} — ${c.detail}`);
  }
  lines.push("");
  lines.push("Note:");
  lines.push(`  ${verdict.note}`);
  return lines.join("\n");
}
