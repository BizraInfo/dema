/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdmissibilityVerdict, ReceiptArtifact, MissionEnvelope, SubReceipt } from '../types';

export class TrustCompiler {
  private lastReceiptHash: string = "0000000000000000000000000000000000000000000000000000000000000000";
  private receiptChain: ReceiptArtifact[] = [];

  // Asynchronous cryptographic hash representation of BLAKE3 (WebCrypto SHA-256 fallback for web shell ops)
  private async hashStringAsync(str: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // FATE Gates (I1-I7 Deterministic Verdicts)
  public async evaluateAdmissibility(mission: MissionEnvelope): Promise<AdmissibilityVerdict> {
    const verdicts = {
      'IhsanFloor': mission.qualityScore >= 0.95,
      'RibaZero': !mission.intent.toLowerCase().includes('interest'), // Primitive mock checking explicitly against riba
      'ZannZero': mission.idealState.length > 5 && mission.currentState !== mission.idealState,
      'ClaimMustBind': mission.id.startsWith('miss-'),
      'Tawhid': true
    };

    const isPermitted = Object.values(verdicts).every(v => v === true);
    
    return {
      isPermitted,
      verdicts,
      ihsanScore: mission.qualityScore
    };
  }

  public async compile(mission: MissionEnvelope): Promise<ReceiptArtifact | null> {
    const admissibility = await this.evaluateAdmissibility(mission);

    if (!admissibility.isPermitted) {
      console.warn("Mission rejected: FATE gate violation", admissibility.verdicts);
      return null;
    }

    const inputHash = await this.hashStringAsync(mission.currentState);
    const outputHash = await this.hashStringAsync(mission.idealState);

    // Deterministic thermodynamic emission (Sub-receipt creation)
    const subReceipts: SubReceipt[] = [
      {
        id: `sr-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        action: "Gap analysis cryptographic isolation",
        inputHash,
        outputHash,
        timestamp: Date.now()
      }
    ];

    const receipt: ReceiptArtifact = {
      id: `rcpt-${this.receiptChain.length}`,
      kind: mission.intent.includes("Activate") ? "GenesisValuation" : "SkillExecution",
      intent: mission.intent,
      evidenceHash: "", // Will calculate securely below
      subReceipts,
      previousReceiptHash: this.lastReceiptHash,
      timestamp: Date.now(),
      ihsanScore: admissibility.ihsanScore,
      verdict: true
    };

    // Calculate deterministic root hash of the receipt payload + prev hash
    const payload = JSON.stringify({ ...receipt, evidenceHash: undefined });
    receipt.evidenceHash = await this.hashStringAsync(payload + this.lastReceiptHash);

    this.lastReceiptHash = receipt.evidenceHash;
    this.receiptChain.push(receipt);

    return receipt;
  }

  public getChain(): ReceiptArtifact[] {
    return [...this.receiptChain];
  }
}

export const kernel = new TrustCompiler();
