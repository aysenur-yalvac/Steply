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
    <div className={`w-full bg-slate-950/50 rounded-full overflow-hidden shadow-inner border border-slate-800/50 relative ${className}`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
        className={`h-full rounded-full relative overflow-hidden ${isCompleted ? 'bg-gradient-to-r from-vibrant-teal to-emerald-400 shadow-[0_0_12px_rgba(13,148,136,0.5)]' : 'bg-gradient-to-r from-vibrant-violet to-primary-electric shadow-[0_0_12px_rgba(124,58,237,0.5)]'}`} 
      >
        {/* Embedded Active Shimmer Line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-progress-shimmer skew-x-12" />
      </motion.div>
    </div>
  );
}
