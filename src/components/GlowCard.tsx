/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlowCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  delay?: number;
}

export function GlowCard({ children, title, className = "", delay = 0 }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative h-full ${className}`}
    >
      <div className="relative bg-transparent h-full flex flex-col">
        {title && (
          <div className="label pb-2 border-b border-bizra-line-light mt-0 mb-4 flex justify-between">
            <span>{title}</span>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}
