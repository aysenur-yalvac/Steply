"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function GetStartedButton({ href = "/auth/register" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="btn-aura group relative inline-flex items-center overflow-hidden rounded-xl text-sm font-bold text-white active:scale-95 transition-transform duration-150"
      style={{ height: "52px", paddingLeft: "36px", paddingRight: "8px" }}
    >
      {/* Shimmer sweep on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />

      {/* Label — fades out on hover */}
      <span className="relative z-10 mr-8 transition-opacity duration-500 group-hover:opacity-0 whitespace-nowrap">
        Get Started
      </span>

      {/* Expanding chevron panel */}
      <i
        className="absolute right-1 top-1 bottom-1 z-10 grid place-items-center rounded-lg
                   transition-all duration-500 ease-in-out
                   w-[28%] group-hover:w-[calc(100%-0.5rem)]
                   group-active:scale-95"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <ChevronRight size={17} strokeWidth={2.2} aria-hidden="true" />
      </i>
    </Link>
  );
}
