"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: "dark" | "light";
}

export function BackButton({ href = "/", label = "Geri", variant = "dark" }: BackButtonProps) {
  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none ${
        isDark
          ? "text-white/60 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-purple-500"
          : "text-slate-500 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
      }`}
      style={
        isDark
          ? {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              height: "36px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }
          : {
              background: "rgba(255,255,255,0.80)",
              border: "1px solid #e2e8f0",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              height: "36px",
              paddingLeft: "10px",
              paddingRight: "10px",
              boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06)",
            }
      }
    >
      {/* Icon — slides left on hover */}
      <ChevronLeft
        size={16}
        strokeWidth={2}
        className={`shrink-0 transition-all duration-300 group-hover:-translate-x-0.5 ${
          isDark
            ? "text-white/50 group-hover:text-white/90"
            : "text-slate-400 group-hover:text-violet-600"
        }`}
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
