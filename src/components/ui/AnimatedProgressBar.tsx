'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedProgressBar({ 
  progress, 
  isCompleted,
  className = "h-2 mb-6"
}: { 
  progress: number; 
  isCompleted: boolean;
  className?: string;
}) {
  return (
    <div className={`w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner border border-slate-300/30 relative ${className}`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1,
          delay: 0.1 
        }}
        className={`h-full rounded-full relative overflow-hidden ${isCompleted ? 'bg-gradient-to-r from-sage-green to-emerald-400 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-dusty-rose to-rose-400 shadow-[0_2px_8px_-2px_rgba(244,63,94,0.3)]'}`} 
      >
        {/* Embedded Active Shimmer Line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-progress-shimmer skew-x-12" />
      </motion.div>
    </div>
  );
}
