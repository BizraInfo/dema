/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Plane {
  KERNEL = 'L1',
  GRAPH = 'L2',
  PROOF = 'L3',
  FACE = 'L4'
}

export interface ConstitutionalInvariant {
  id: string;
  name: string;
  description: string;
  value: number | string;
  threshold: number;
  unit: string;
}

export interface AdmissibilityVerdict {
  isPermitted: boolean;
  verdicts: { [key: string]: boolean };
  ihsanScore: number;
}

export interface SubReceipt {
  id: string;
  action: string;
  inputHash: string;
  outputHash: string;
  timestamp: number;
}

export interface ReceiptArtifact {
  id: string;
  kind: string;
  intent: string;
  evidenceHash: string;
  subReceipts: SubReceipt[];
  previousReceiptHash: string;
  timestamp: number;
  ihsanScore: number;
  verdict: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: 'PAT' | 'SAT';
  specialty: string;
  description: string;
  status: 'active' | 'latent' | 'dormant';
}

export interface URPState {
  computePflops: number;
  memoryPb: number;
  dataEb: number;
  satAgents: number;
  seedCirculation: number;
  rahdStaked: number;
}

export interface MissionEnvelope {
  id: string;
  intent: string;
  idealState: string;
  currentState: string;
  qualityScore: number;
  timestamp: number;
}
