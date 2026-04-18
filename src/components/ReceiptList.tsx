/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReceiptArtifact } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, Clock, Layers } from 'lucide-react';

export function ReceiptList({ receipts }: { receipts: ReceiptArtifact[] }) {
  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      <AnimatePresence initial={false}>
        {receipts.length === 0 ? (
          <div className="h-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg text-gray-500 font-mono text-[10px]">
            <Clock size={16} className="mb-2 opacity-50" />
            NO RECEIPTS COMMITTED
          </div>
        ) : (
          receipts.map((receipt, i) => (
            <motion.div
              key={receipt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              layout
              className="mb-4 pl-[10px] border-l border-bizra-gold group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#666] text-[9px] uppercase tracking-[1px]">{new Date(receipt.timestamp).toLocaleTimeString()} — #{receipt.id.split('-')[1]}</span>
                <span className="text-bizra-gold text-[9px] mono">IHSĀN {receipt.ihsanScore.toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] text-white uppercase tracking-wider">{receipt.kind}</span>
              </div>
              <p className="text-[13px] font-mono text-[#d4d4d4] mb-2 truncate group-hover:whitespace-normal transition-all">
                {receipt.intent}
              </p>
              <div className="text-[10px] font-mono text-[#555] truncate">
                HEAD: {receipt.previousReceiptHash.substring(0, 32)}...
              </div>
            </motion.div>
          )).reverse()
        )}
      </AnimatePresence>
    </div>
  );
}
