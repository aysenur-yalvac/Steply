'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedProgressBar({
  progress,
  isCompleted,
  className = "h-2 mb-6",
  variant = "default",
}: {
  progress: number;
  isCompleted: boolean;
  className?: string;
  variant?: "default" | "indigo";
}) {
  const trackClass = variant === "indigo"
    ? "bg-slate-200"
    : "bg-slate-200/50 shadow-inner border border-slate-300/30";

  const fillClass = variant === "indigo"
    ? "bg-indigo-600 transition-all duration-500"
    : isCompleted
      ? "bg-gradient-to-r from-sage-green to-emerald-400 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.3)]"
      : "bg-gradient-to-r from-dusty-rose to-rose-400 shadow-[0_2px_8px_-2px_rgba(244,63,94,0.3)]";

  return (
    <div className={`w-full rounded-full overflow-hidden relative ${trackClass} ${className}`}>
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
        className={`h-full rounded-full relative overflow-hidden ${fillClass}`}
      >
        {/* Embedded Active Shimmer Line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-progress-shimmer skew-x-12" />
      </motion.div>
    </div>
  );
}
