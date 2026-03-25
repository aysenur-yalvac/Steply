"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackButton({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center overflow-hidden rounded-lg text-sm font-semibold text-white/70 hover:text-white transition-colors duration-300"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        height: "38px",
        paddingLeft: "44px",
        paddingRight: "14px",
      }}
    >
      {/* Expanding arrow panel */}
      <span
        className="absolute left-0 top-0 bottom-0 flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{
          width: "36px",
          background: "rgba(124,58,255,0.22)",
          borderRight: "1px solid rgba(124,58,255,0.20)",
        }}
        aria-hidden="true"
      >
        <ArrowLeft size={15} strokeWidth={2.2} className="text-white/80" />
      </span>

      {/* "Geri" label — fades out on hover */}
      <span className="relative z-10 transition-opacity duration-400 group-hover:opacity-0 whitespace-nowrap">
        Geri
      </span>

      {/* Full-width purple overlay that slides in on hover */}
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "rgba(124,58,255,0.18)" }}
        aria-hidden="true"
      >
        <ArrowLeft size={15} strokeWidth={2.2} className="text-white" />
      </span>
    </Link>
  );
}
