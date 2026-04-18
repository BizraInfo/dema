/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface DemaAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export function DemaAvatar({ isSpeaking, isListening }: DemaAvatarProps) {
  // Animation variants representing thermodynamic state
  const coreVariants = {
    idle: { scale: 1, opacity: 0.8, rotate: 0 },
    listening: { scale: 1.05, opacity: 1, rotate: 45, transition: { repeat: Infinity, duration: 4, ease: "linear" } },
    speaking: { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } }
  };

  const innerVariants = {
    idle: { scale: 1, opacity: 0.5 },
    listening: { scale: 1.1, opacity: 0.8, transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
    speaking: { scale: [1, 1.1, 0.95, 1.05, 1], opacity: 1, transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" } }
  };

  const state = isSpeaking ? "speaking" : isListening ? "listening" : "idle";

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full relative">
      <div className="relative flex items-center justify-center w-[180px] h-[180px]">
        {/* Outer Ring / Core Node */}
        <motion.div
          variants={coreVariants}
          animate={state}
          className="absolute inset-0 rounded-full border border-bizra-line flex items-center justify-center shadow-[0_0_80px_rgba(201,169,98,0.04)]"
        >
          {/* Inner Circle */}
          <motion.div
            variants={innerVariants}
            animate={state}
            className="w-[140px] h-[140px] rounded-full border border-bizra-line flex items-center justify-center relative overflow-hidden bg-[radial-gradient(circle,rgba(201,169,98,0.1),transparent)]"
          >
            {/* The "Face" - Abstract representation */}
            <div className={`text-5xl text-white opacity-90 font-light z-10 transition-all duration-500 ${isListening ? 'font-arabic' : 'font-serif'}`}>
              {isListening ? "؟" : isSpeaking ? "!" : "D"}
            </div>

            {/* Speaking Waveform Visualization */}
            {isSpeaking && (
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-30">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["20%", "80%", "20%"] }}
                    transition={{ repeat: Infinity, duration: 0.4 + i * 0.1, ease: "easeInOut" }}
                    className="w-0.5 bg-bizra-gold rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Decoration Lines (from the sophisticated dark theme) */}
        <div className="absolute w-[1px] h-[80px] bg-gradient-to-b from-transparent via-bizra-gold to-transparent -top-[50px] opacity-30"></div>
        <div className="absolute w-[1px] h-[80px] bg-gradient-to-b from-transparent via-bizra-gold to-transparent -bottom-[50px] opacity-30"></div>
      </div>
      
      {/* State Label */}
      <div className="mt-8 text-[9px] font-mono tracking-[4px] uppercase text-bizra-gold flex items-center gap-2">
        {isSpeaking ? (
          <><span className="w-1.5 h-1.5 rounded-full bg-bizra-gold animate-pulse shadow-[0_0_10px_rgba(201,169,98,0.8)]" /> GAMMA-4 SYNTHESIS : ACTIVE</>
        ) : isListening ? (
          <><span className="w-1.5 h-1.5 rounded-full bg-transparent border-t border-bizra-gold animate-spin" /> AURAL INGESTION : LISTENING</>
        ) : (
          <span className="opacity-50 text-[#666]">DEMA JURISDICTION : IDLE</span>
        )}
      </div>
    </div>
  );
}
