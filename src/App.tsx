/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Shield, Zap, Database, Activity, 
  Send, RefreshCcw, Lock, Info, AlertTriangle,
  Flame, Wind, Droplets, Mountain, Mic, Volume2,
  Code, BookOpen, MonitorPlay, Monitor, BrainCircuit
} from 'lucide-react';
import { GlowCard } from './components/GlowCard';
import { AgentSwarm } from './components/AgentSwarm';
import { ReceiptList } from './components/ReceiptList';
import { LawfulLoop } from './components/LawfulLoop';
import { DemaAvatar } from './components/DemaAvatar';
import { PAT_AGENTS, SAT_AGENTS } from './lib/agents';
import { kernel } from './lib/bizra-kernel';
import { MissionEnvelope, ReceiptArtifact, Agent } from './types';
import { auth, db, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { processIntent, synthesizeTTS } from './lib/gemini';
import { useLiveGemini } from './hooks/useLiveGemini';

type DemaMode = 'ask' | 'code' | 'research' | 'browser' | 'computer' | 'trust';

export default function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'dema', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<ReceiptArtifact[]>([]);
  const [agents, setAgents] = useState<Agent[]>([...PAT_AGENTS, ...SAT_AGENTS]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [systemReady, setSystemReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [principal, setPrincipal] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<DemaMode>('trust');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initializing sequence
    const init = async () => {
      await sleep(1000);
      addDemaMessage("Node Zero: BIZRA Genesis activated. Establishing secure jurisdiction...");
      await sleep(1500);
      setSystemReady(true);
      addDemaMessage("Constitutional invariants L1-L7 validated. I am Dema, your singular interface. How shall we begin? Please state 'Activate Node0' to bind Identity.");
    };
    init();

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
         // load principal
         const ref = doc(db, 'principals', u.uid);
         onSnapshot(ref, (snap) => {
            if(snap.exists()) setPrincipal(snap.data());
         });
         
         const q = query(collection(db, 'receipts'), orderBy('timestamp', 'desc'));
         onSnapshot(q, (snap) => {
            const arr = snap.docs.map(d => ({id: d.id, ...d.data()})) as ReceiptArtifact[];
            setReceipts(arr);
         });
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addDemaMessage = async (content: string) => {
    // setIsSpeaking handled internally for Gemini Voice, but fake for text:
    setMessages(prev => [...prev, { role: 'dema', content }]);
  };

  const handleMessage = useCallback((msg: string) => {
     setMessages(prev => [...prev, { role: 'dema', content: msg }]);
  }, []);

  const { isConnected, connect, disconnect } = useLiveGemini(setIsSpeaking, handleMessage);

  const handleMicToggle = async () => {
    if (isConnected) {
       disconnect();
       setIsListening(false);
       addDemaMessage("Aural Ingestion Stream Disconnected.");
       return;
    }
    if (isProcessing) return;
    
    setIsListening(true);
    await connect();
  };

  const activateNode = async () => {
    try {
       addDemaMessage("Initiating Dema Onboarding Protocol v1 (Genesis Identity)...");
       await sleep(1500);
       
       addDemaMessage("Dema exists to combat false assumptions, extractive mechanisms, and powerlessness. I serve with humility, truth, dignity, and care.");
       await sleep(2500);

       addDemaMessage("كلما ازددت علماً ازددت يقيناً بجهلي، وأن رأيي صواب يحتمل الخطأ، وأن رأي غيري خطأ يحتمل الصواب");
       await sleep(2500);

       addDemaMessage("Awaiting user consent for Identity Minting via URP gate...");
       
       const u = await loginWithGoogle();
       const ref = doc(db, 'principals', u.uid);
       const snap = await getDoc(ref);
       if(!snap.exists()) {
          await setDoc(ref, {
            uid: u.uid,
            displayName: u.displayName || 'Architect',
            seedCirculation: 1000,
            rahdStaked: 350,
            activationTime: Date.now()
          });
       }
       
       addDemaMessage(`Principal [${u.displayName}] verified. Node0 established. URP Mesh locally synchronized. Proceed with lawful operations.`);
       setAgents(prev => prev.map(a => ({ ...a, status: 'active' })));
    } catch(e) {
       addDemaMessage("Auth Rejected: Identity binding aborted. You remain sovereign.");
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    if (!user && input.toLowerCase().includes('activate')) {
       await activateNode();
       setInput('');
       return;
    }

    const command = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: command }]);
    setInput('');
    setIsProcessing(true);

    try {
      setActiveStage('niyyah');
      
      const geminiResponse = await processIntent(command);
      
      setActiveStage('gap');

      const mission: MissionEnvelope = {
        id: `miss-${Date.now()}`,
        intent: command,
        currentState: "Entropy Detected",
        idealState: geminiResponse.substring(0, 50),
        qualityScore: 0.98,
        timestamp: Date.now()
      };

      await sleep(600);

      setActiveStage('admissibility');
      const admissibility = await kernel.evaluateAdmissibility(mission);
      await sleep(1000); // Simulate FATE gates

      setActiveStage('execution');
      
      if (!user) {
         addDemaMessage("WARNING: Node not activated. Cannot emit receipts to URP. Output is isolated.");
         addDemaMessage(geminiResponse);
         synthesizeTTS(geminiResponse);
         setIsSpeaking(true);
         setTimeout(() => setIsSpeaking(false), 2000);
      } else {
         const receipt = await kernel.compile(mission);
         if (receipt) {
           const receiptRef = doc(db, 'receipts', receipt.id);
           await setDoc(receiptRef, receipt);
           setReceipts(kernel.getChain());
           setActiveStage('receipt');
           addDemaMessage(geminiResponse);
           synthesizeTTS(geminiResponse);
           setIsSpeaking(true);
           setTimeout(() => setIsSpeaking(false), 2000);
         } else {
           throw new Error("Admissibility rejected by Kernel Logic.");
         }
      }

      await sleep(600);
      setActiveStage('reflex');
    } catch (err: any) {
      addDemaMessage("Critical System Error: Lawful Loop rupture. Initiating fail-closed rollback. " + err.message);
    } finally {
      setActiveStage(null);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col mx-auto max-w-[1440px]">
      {/* Header Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between py-6 px-10 border-b border-bizra-line-light shrink-0 h-[80px]"
      >
        <div className="flex items-center gap-6">
          <h1 className="font-serif italic font-normal text-[22px] tracking-[4px] text-white uppercase">Node Zero</h1>
          <div className="px-[14px] py-[6px] border border-bizra-gold rounded-[20px] text-[10px] tracking-[2px] text-bizra-gold uppercase">Genesis Active</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-[11px] text-[#666] tracking-[1px] uppercase font-mono">PROTOCOL_VERSION: 1.0.0-GENESIS</div>
        </div>
      </motion.header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-bizra-void">
        
        {/* Left Column: True Trust Strip & Modes Navigation */}
        <aside className="lg:col-span-3 border-r border-bizra-line flex flex-col min-h-0 bg-[#060a10]">
          {/* Trust Strip Content */}
          <div className="p-10 flex flex-col gap-8 flex-1 overflow-y-auto custom-scrollbar">
            <section className="pb-8 border-b border-bizra-line-light relative">
              <div className="absolute top-0 right-0 p-2 border border-bizra-emerald/30 bg-bizra-emerald/5 text-bizra-emerald text-[8px] uppercase tracking-widest font-mono">Verified</div>
              <div className="label">Principal ID</div>
              <div className="accent-value text-xl mt-1 text-white">{user ? (principal?.displayName || 'Active') : 'Alpha'}</div>
              <div className="value mt-1">{user ? 'Node0 / Architect' : 'The Primordial Node'}</div>
            </section>
            
            <section className="pb-8 border-b border-bizra-line-light">
              <div className="label mb-3">Trust State (Ihsān Floor)</div>
              <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-white">
                <span>Current Lawful Index</span>
                <span className="text-bizra-emerald">0.9850</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `98.5%` }} className="h-full bg-bizra-emerald rounded-full" />
              </div>
            </section>
            
            <section className="pb-8 border-b border-bizra-line-light">
               <div className="label mb-3">Thermodynamic State</div>
               <div className="flex flex-col gap-3">
                 <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#888]">Current:</span>
                    <span className="text-white">Entropy Detected</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#888]">Ideal:</span>
                    <span className="text-bizra-gold">Constitutional Order</span>
                 </div>
                 <div className="text-[9px] uppercase tracking-widest text-[#555] mt-2">Next Admissible Action</div>
                 <div className="px-3 py-2 bg-bizra-gold/5 border border-bizra-gold/20 text-bizra-gold text-[10px] font-mono truncate">
                    {user ? "AWAITING_INTENT_INGESTION" : "BIND_PRINCIPAL_IDENTITY"}
                 </div>
               </div>
            </section>
            
            <section>
              <div className="label mb-3">Latest Ledger Receipt</div>
               {receipts.length > 0 ? (
                 <div className="font-mono text-[9px] text-[#888] break-all leading-relaxed">
                   {receipts[0].evidenceHash}
                 </div>
               ) : (
                 <div className="text-[10px] font-mono text-[#555]">AWAITING_GENESIS_RECEIPT</div>
               )}
            </section>
          </div>

          {/* DEMA 6 Modes Selector */}
          <div className="p-4 border-t border-bizra-line shrink-0 bg-[#03060a]">
             <div className="text-[9px] tracking-widest uppercase text-[#666] mb-3 px-2">Jurisdictional Modes</div>
             <div className="grid grid-cols-2 gap-2">
                <ModeButton mode="ask" activeMode={activeMode} setActiveMode={setActiveMode} label="Ask" Icon={Send} />
                <ModeButton mode="code" activeMode={activeMode} setActiveMode={setActiveMode} label="Code" Icon={Code} />
                <ModeButton mode="research" activeMode={activeMode} setActiveMode={setActiveMode} label="Research" Icon={BookOpen} />
                <ModeButton mode="browser" activeMode={activeMode} setActiveMode={setActiveMode} label="Browser" Icon={MonitorPlay} />
                <ModeButton mode="computer" activeMode={activeMode} setActiveMode={setActiveMode} label="Computer" Icon={Monitor} />
                <ModeButton mode="trust" activeMode={activeMode} setActiveMode={setActiveMode} label="Memory" Icon={BrainCircuit} />
             </div>
          </div>
        </aside>

        {/* Center Column: Dema Core */}
        <main className="lg:col-span-6 flex flex-col min-h-0 relative bg-[radial-gradient(circle_at_center,_var(--color-bizra-surface)_0%,_var(--color-bizra-void)_70%)]">
          <div className="p-8 pb-0 shrink-0">
            <DemaAvatar isSpeaking={isSpeaking} isListening={isListening} />
          </div>
          <div className="px-8 pb-4 shrink-0">
            <GlowCard>
              <LawfulLoop activeStage={activeStage} />
            </GlowCard>
          </div>

          <div className="flex-1 flex flex-col px-8 pb-8 min-h-0">
            <GlowCard title="Dema Console" className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col py-4 pr-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`mb-4 ${msg.role === 'dema' ? 'border-l border-bizra-gold pl-3' : 'pl-3 border-l border-[#333]'}`}
                  >
                    <span className="text-[9px] text-[#666] block mb-1 font-mono uppercase tracking-widest">{msg.role === 'user' ? 'PRINCIPAL' : 'DEMA'}</span>
                    <p className={`font-mono text-[13px] leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-[#d4d4d4]'}`}>{msg.content}</p>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <form onSubmit={handleCommand} className="mt-4 pt-4 border-t border-bizra-line flex gap-3 shrink-0 items-center">
                <button
                  disabled={!systemReady || isProcessing || isSpeaking}
                  type="button"
                  onClick={handleMicToggle}
                  className={`p-3 rounded-full border transition-colors shrink-0 ${isListening ? 'bg-bizra-emerald/20 border-bizra-emerald text-bizra-emerald animate-pulse' : 'bg-transparent border-bizra-line text-[#555] hover:text-white hover:border-white/20'}`}
                >
                  <Mic size={14} />
                </button>
                <input
                  disabled={!systemReady || isProcessing || isListening}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "AURAL INGESTION ACTIVE..." : isProcessing ? "POLLING URP VALIDATORS..." : "Submit Intent..."}
                  className="flex-1 bg-transparent border border-bizra-line-light rounded-sm px-4 py-3 text-[13px] font-mono text-white focus:outline-none focus:border-bizra-gold/50 transition-colors disabled:opacity-30"
                />
                <button
                  disabled={!systemReady || isProcessing || isListening}
                  type="submit"
                  className="px-6 bg-transparent text-bizra-gold border border-bizra-gold rounded-sm hover:bg-bizra-gold/10 transition-colors disabled:opacity-30 disabled:border-[#333] disabled:text-[#555] uppercase tracking-widest text-[10px] h-[42px]"
                >
                  <Send size={14} className="mb-1 hidden" />
                  INITIATE
                </button>
              </form>
            </GlowCard>
          </div>
        </main>

        {/* Right Column: Log & Swarms */}
        <aside className="lg:col-span-3 border-l border-bizra-line p-10 flex flex-col gap-10 overflow-y-auto">
          <section className="flex-1">
            <div className="label mb-6">Canonical Receipt Log</div>
            <ReceiptList receipts={receipts} />
          </section>

          <section className="border-t border-bizra-line-light pt-10">
            <AgentSwarm 
              agents={agents} 
              onAgentStatusChange={(id, status) => setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a))} 
            />
          </section>
        </aside>
      </div>

      {/* Footer */}
      <footer className="grid grid-cols-4 items-center px-10 h-[100px] border-t border-bizra-line-light shrink-0 text-left bg-bizra-void">
        <div className="flex flex-col">
          <div className="label mb-1">Uptime</div>
          <div className="value">∞</div>
        </div>
        <div className="flex flex-col">
          <div className="label mb-1">Peers Connected</div>
          <div className="value">{user ? '1 (URP Gateway)' : '0 (AWAITING DEPLOYMENT)'}</div>
        </div>
        <div className="flex flex-col">
          <div className="label mb-1">System Load</div>
          <div className="value">0.0001%</div>
        </div>
        <div className="flex flex-col text-right">
          <div className="label mb-1">Encryption</div>
          <div className="value text-bizra-gold">ECC_521_PRIME</div>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value, color, compact = false }: { label: string, value: string | number, color: 'emerald' | 'gold' | 'red', compact?: boolean }) {
  return (
    <div className={`flex flex-col`}>
      <div className="label mb-1">{label}</div>
      <div className={`font-mono text-[13px] leading-relaxed ${color === 'gold' ? 'text-bizra-gold' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function ResourceBar({ label, value, percent }: { label: string, value: string, percent: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="mono text-[9px] text-gray-400">{label}</span>
        <span className="mono text-[9px] text-white">{value}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-bizra-gold/40 to-bizra-gold rounded-full"
        />
      </div>
    </div>
  );
}

function ModeButton({ mode, activeMode, setActiveMode, label, Icon }: { mode: DemaMode, activeMode: DemaMode, setActiveMode: (m: DemaMode) => void, label: string, Icon: any }) {
  const isActive = activeMode === mode;
  return (
    <button
      onClick={() => setActiveMode(mode)}
      className={`flex items-center gap-2 p-3 border rounded-sm transition-colors text-[10px] uppercase tracking-widest ${
        isActive ? 'border-bizra-gold text-bizra-gold bg-bizra-gold/5' : 'border-bizra-line-light text-[#888] hover:border-[#555] hover:text-white'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
