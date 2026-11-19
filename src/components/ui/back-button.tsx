"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: "dark" | "light";
  className?: string;
}

export function BackButton({ href = "/", label = "Geri", variant = "light", className = "" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center h-9 px-2.5 rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none
        bg-white/85 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700/90
        border border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600
        text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white
        shadow-sm backdrop-blur-md focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${className}`}
    >
      {/* Icon — slides left on hover */}
      <ChevronLeft
        size={16}
        strokeWidth={2}
        className="shrink-0 text-slate-400 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-all duration-300 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />

      {/* Label — slides open on hover via max-width */}
      <span
        className="overflow-hidden whitespace-nowrap max-w-0 opacity-0 ml-0
                   group-hover:max-w-[80px] group-hover:opacity-100 group-hover:ml-1.5
                   transition-[max-width,opacity,margin] duration-500 ease-in-out"
      >
        {label}
      </span>
    </Link>
  );
}
