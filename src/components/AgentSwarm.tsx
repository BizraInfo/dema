/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Agent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Zap, Search, Brain, Database, Activity, Lock, Cpu, Globe, Link2, Settings2, X } from 'lucide-react';

const ICON_MAP = {
  'Dema': User,
  'Ibn Sina': Brain,
  'Al-Jazari': Zap,
  'Al-Khwarizmi': Database,
  'Ibn Khaldun': Activity,
  'Al-Ghazali': Shield,
  'Ibn Battuta': Search,
  'Validator-μ': Lock,
  'Sentinel-μ': Shield,
  'Ledger-μ': Link2,
  'Conductor-μ': Cpu,
  'Ambassador-μ': Globe,
};

export function AgentSwarm({ agents, onAgentStatusChange }: { agents: Agent[], onAgentStatusChange?: (id: string, status: Agent['status']) => void }) {
  const pats = agents.filter(a => a.role === 'PAT');
  const sats = agents.filter(a => a.role === 'SAT');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedId);

  return (
    <div className="space-y-8 relative">
      <div>
        <h3 className="label flex items-center justify-between">
          <span>PAT-7 Personal Swarm</span>
          {onAgentStatusChange && <span className="text-[#555] text-[8px]">CLICK TO RECONFIGURE</span>}
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {pats.map((agent, i) => (
            <AgentIcon 
              key={agent.id} 
              agent={agent} 
              index={i} 
              isSelected={selectedId === agent.id}
              onClick={() => setSelectedId(selectedId === agent.id ? null : agent.id)} 
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="label">SAT-5 System Mesh</h3>
        <div className="grid grid-cols-5 gap-3">
          {sats.map((agent, i) => (
            <AgentIcon 
              key={agent.id} 
              agent={agent} 
              index={i} 
              isSelected={selectedId === agent.id}
              onClick={() => setSelectedId(selectedId === agent.id ? null : agent.id)} 
            />
          ))}
        </div>
      </div>

      {/* Config Panel for Selected Agent */}
      <AnimatePresence>
        {selectedAgent && onAgentStatusChange && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="pt-6 border-t border-bizra-line-light mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings2 size={12} className="text-bizra-gold" />
                <span className="font-serif text-[12px] text-white uppercase tracking-widest">{selectedAgent.name} Configuration</span>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-[#666] hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <div className="text-[10px] text-[#888] font-mono leading-relaxed mb-4">
              {selectedAgent.description}
            </div>

            <div className="flex gap-2">
              <button 
                disabled={selectedAgent.status === 'active'}
                onClick={() => onAgentStatusChange(selectedAgent.id, 'active')}
                className={`flex-1 py-2 text-[9px] uppercase tracking-widest rounded-sm border transition-colors ${
                  selectedAgent.status === 'active' ? 'bg-bizra-gold/10 border-bizra-gold text-bizra-gold cursor-default' : 'bg-transparent border-bizra-line-light text-[#888] hover:border-bizra-gold hover:text-white'
                }`}
              >
                Activate
              </button>
              <button 
                disabled={selectedAgent.status === 'latent'}
                onClick={() => onAgentStatusChange(selectedAgent.id, 'latent')}
                className={`flex-1 py-2 text-[9px] uppercase tracking-widest rounded-sm border transition-colors ${
                  selectedAgent.status === 'latent' ? 'bg-bizra-line border-bizra-line text-white cursor-default' : 'bg-transparent border-bizra-line-light text-[#888] hover:border-white hover:text-white'
                }`}
              >
                Latent
              </button>
              <button 
                disabled={selectedAgent.status === 'dormant'}
                onClick={() => onAgentStatusChange(selectedAgent.id, 'dormant')}
                className={`flex-1 py-2 text-[9px] uppercase tracking-widest rounded-sm border transition-colors ${
                  selectedAgent.status === 'dormant' ? 'bg-[#111] border-[#333] text-[#555] cursor-default' : 'bg-transparent border-bizra-line-light text-[#888] hover:border-[#555] hover:text-[#aaa]'
                }`}
              >
                Deactivate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AgentIconProps {
  agent: Agent;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
  key?: string | number;
}

function AgentIcon({ agent, index, isSelected, onClick }: AgentIconProps) {
  const Icon = (ICON_MAP as any)[agent.name] || User;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 group relative cursor-pointer ${isSelected ? 'opacity-100' : ''}`}
    >
      <div className={`w-10 h-10 border rounded-sm flex items-center justify-center transition-all ${
        agent.status === 'active' 
          ? 'border-bizra-gold text-bizra-gold bg-bizra-gold/5 shadow-[0_0_15px_rgba(201,169,98,0.1)]' 
          : agent.status === 'latent'
            ? 'border-[#555] text-white bg-white/5'
            : 'border-bizra-line-light text-[#333] bg-transparent'
      } ${isSelected ? 'ring-1 ring-bizra-gold ring-offset-2 ring-offset-bizra-void' : ''}`}>
        <Icon size={16} strokeWidth={1} />
      </div>
      <span className={`text-[8px] tracking-[1px] uppercase text-center transition-opacity truncate w-full ${agent.status !== 'dormant' || isSelected ? 'opacity-100 text-[#d4d4d4]' : 'opacity-0 group-hover:opacity-100 text-[#555]'}`}>
        {agent.name.split(' ')[0]}
      </span>
      
      {/* Tooltip (Only show if not selected to avoid cluttering config) */}
      {!isSelected && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-40 p-3 bg-bizra-void border border-bizra-line-light rounded-sm hidden group-hover:block z-50 pointer-events-none shadow-2xl">
          <p className="text-[10px] uppercase tracking-widest text-bizra-gold mb-1">{agent.specialty}</p>
          <p className="text-[10px] font-mono text-[#d4d4d4] leading-relaxed">{agent.status.toUpperCase()} NODE</p>
        </div>
      )}
    </motion.div>
  );
}
