/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Target, ShieldAlert, Cpu, ScrollText, Binary } from 'lucide-react';

const STAGES = [
  { id: 'niyyah', name: 'Niyyah', icon: Sparkles, desc: 'Human Intent' },
  { id: 'gap', name: 'Δ Gap', icon: Target, desc: 'Ideal vs Current' },
  { id: 'admissibility', name: 'FATE', icon: ShieldAlert, desc: 'Admissibility' },
  { id: 'execution', name: 'Amal', icon: Cpu, desc: 'Constitutional Execution' },
  { id: 'receipt', name: 'Shahada', icon: ScrollText, desc: 'Canonical Receipt' },
  { id: 'reflex', name: 'Myelin', icon: Binary, desc: 'Thermodynamic Reflex' },
];

export function LawfulLoop({ activeStage }: { activeStage: string | null }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2">
        {STAGES.map((stage, i) => (
          <div key={stage.id} className="flex-1 flex items-center gap-2 group">
            <div className={`flex-1 flex flex-col items-center gap-2 p-3 border-t-2 transition-all duration-500 ${
              activeStage === stage.id 
                ? 'border-bizra-gold bg-bizra-gold/5' 
                : 'border-bizra-line-light opacity-50'
            }`}>
              <stage.icon size={14} strokeWidth={1.5} className={activeStage === stage.id ? 'text-bizra-gold' : 'text-[#555]'} />
              <div className="text-center">
                <p className={`text-[9px] uppercase tracking-widest truncate ${activeStage === stage.id ? 'text-white' : 'text-[#888]'}`}>
                  {stage.name}
                </p>
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <ArrowRight size={10} className="text-[#333] hidden sm:block shrink-0" />
            )}
          </div>
        ))}
      </div>
      
      {/* Active Stage Tooltip/Description */}
      {activeStage && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <span className="text-[11px] font-mono text-[#d4d4d4] uppercase tracking-widest">{STAGES.find(s => s.id === activeStage)?.desc}</span>
        </motion.div>
      )}
    </div>
  );
}
