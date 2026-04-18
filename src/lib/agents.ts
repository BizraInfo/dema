/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Agent } from '../types';

export const PAT_AGENTS: Agent[] = [
  { id: 'pat-1', name: 'Dema', role: 'PAT', specialty: 'Coordinator', description: 'Single sovereign interface presence.', status: 'active' },
  { id: 'pat-2', name: 'Ibn Sina', role: 'PAT', specialty: 'Architect', description: 'Systems design and structural analysis.', status: 'latent' },
  { id: 'pat-3', name: 'Al-Jazari', role: 'PAT', specialty: 'Executor', description: 'Tool manipulation and physical automation.', status: 'latent' },
  { id: 'pat-4', name: 'Al-Khwarizmi', role: 'PAT', specialty: 'Archivist', description: 'Memory management and data indexing.', status: 'latent' },
  { id: 'pat-5', name: 'Ibn Khaldun', role: 'PAT', specialty: 'Analyst', description: 'Token economics and social impact mapping.', status: 'latent' },
  { id: 'pat-6', name: 'Al-Ghazali', role: 'PAT', specialty: 'Guardian', description: 'Ethical invariants and Ihsan verification.', status: 'latent' },
  { id: 'pat-7', name: 'Ibn Battuta', role: 'PAT', specialty: 'Scout', description: 'Cross-node exploration and discovery.', status: 'latent' },
];

export const SAT_AGENTS: Agent[] = [
  { id: 'sat-1', name: 'Validator-μ', role: 'SAT', specialty: 'Validation', description: 'Verifies Proof-of-Impact claims.', status: 'dormant' },
  { id: 'sat-2', name: 'Sentinel-μ', role: 'SAT', specialty: 'Monitoring', description: 'Detects Byzantine anomalies.', status: 'dormant' },
  { id: 'sat-3', name: 'Ledger-μ', role: 'SAT', specialty: 'Consistency', description: 'Maintains canonical receipt chain.', status: 'dormant' },
  { id: 'sat-4', name: 'Conductor-μ', role: 'SAT', specialty: 'Orchestration', description: 'Routes URP resource flows.', status: 'dormant' },
  { id: 'sat-5', name: 'Ambassador-μ', role: 'SAT', specialty: 'Coordination', description: 'A2A inter-node bridge.', status: 'dormant' },
];
