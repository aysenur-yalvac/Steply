"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackButton({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center rounded-lg text-sm font-semibold text-white/60 hover:text-white/90 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        height: "36px",
        paddingLeft: "10px",
        paddingRight: "10px",
      }}
    >
      {/* Icon — always visible */}
      <ArrowLeft
        size={15}
        strokeWidth={2.2}
        className="shrink-0 text-white/50 group-hover:text-white/90 transition-colors duration-300"
        aria-hidden="true"
      />

      {/* "Geri" label — slides open on hover via max-width */}
      <span
        className="overflow-hidden whitespace-nowrap max-w-0 opacity-0 ml-0
                   group-hover:max-w-[80px] group-hover:opacity-100 group-hover:ml-1.5
                   transition-[max-width,opacity,margin] duration-500 ease-in-out"
      >
        Geri
      </span>
    </Link>
  );
}
