import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

// Deterministic star field — server-safe (no Math.random)
const STARS = Array.from({ length: 48 }, (_, i) => ({
  w:   1 + (i % 3),
  top: (i * 37 + 11) % 90,
  left:(i * 53 +  7) % 95,
  color:
    i % 7 === 0 ? "rgba(160,32,240,0.75)"
    : i % 7 === 1 ? "rgba(255,127,80,0.65)"
    : i % 7 === 2 ? "rgba(124,58,255,0.55)"
    : i % 5 === 0 ? "rgba(255,79,139,0.45)"
    : "rgba(255,255,255,0.22)",
  blur:   i % 4 === 0 ? "blur(0.8px)" : "none",
  pulse:  i % 6 === 0,   // will use animate-pulse via Tailwind
}));

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center p-16 rounded-3xl w-full overflow-hidden"
      style={{
        background: "rgba(11,14,20,0.72)",
        border: "1px solid rgba(160,32,240,0.16)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* ── Ambient gradient layers ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(160,32,240,0.20) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(255,127,80,0.10) 0%, transparent 55%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 10% 50%, rgba(124,58,255,0.09) 0%, transparent 55%)" }} />

      {/* ── Blueprint grid (faint) ──────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035]" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#A020F0" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-grid)" />
      </svg>

      {/* ── Horizon arc ─────────────────────────────────────────────────── */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none opacity-20"
        viewBox="0 0 800 80" preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#A020F0" stopOpacity="0" />
            <stop offset="50%"  stopColor="#A020F0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF7F50" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M 0 80 Q 400 0 800 80" fill="none" stroke="url(#arc-grad)" strokeWidth="1.2" />
        <path d="M 0 80 Q 400 20 800 80" fill="none" stroke="url(#arc-grad)" strokeWidth="0.6" opacity="0.4" />
      </svg>

      {/* ── Star field ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {STARS.map((s, i) => (
          <div
            key={i}
            className={`absolute rounded-full${s.pulse ? " animate-pulse" : ""}`}
            style={{
              width:      `${s.w}px`,
              height:     `${s.w}px`,
              top:        `${s.top}%`,
              left:       `${s.left}%`,
              background: s.color,
              filter:     s.blur,
            }}
          />
        ))}
      </div>

      {/* ── Orbit rings + icon ──────────────────────────────────────────── */}
      <div className="relative w-28 h-28 mb-7 z-10 flex items-center justify-center">
        {/* Outer orbit ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "-18px",
            border: "1px dashed rgba(160,32,240,0.20)",
          }}
        />
        {/* Mid orbit ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "-8px",
            border: "1px solid rgba(160,32,240,0.14)",
          }}
        />
        {/* Orbital dot — top */}
        <div
          className="absolute w-2 h-2 rounded-full"
          style={{
            top: "-26px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#A020F0",
            boxShadow: "0 0 8px rgba(160,32,240,0.8)",
          }}
        />
        {/* Orbital dot — right */}
        <div
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            right: "-22px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#FF7F50",
            boxShadow: "0 0 6px rgba(255,127,80,0.8)",
          }}
        />

        {/* Glow behind icon */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{ background: "rgba(160,32,240,0.25)", filter: "blur(20px)" }}
        />

        {/* Icon container */}
        <div
          className="relative w-full h-full rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(160,32,240,0.20) 0%, rgba(124,58,255,0.12) 100%)",
            border: "1px solid rgba(160,32,240,0.32)",
            transform: "rotate(-3deg)",
            boxShadow: "0 0 32px rgba(160,32,240,0.22), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <Icon className="w-10 h-10" style={{ color: "#C97EFF" }} strokeWidth={1.5} />
        </div>
      </div>

      {/* ── Headline ────────────────────────────────────────────────────── */}
      <h3 className="relative z-10 text-2xl font-extrabold text-white mb-2 text-center tracking-tight">
        The Empty State{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #A020F0 0%, #7C3AFF 50%, #FF7F50 100%)" }}
        >
          Canvas
        </span>
      </h3>

      {/* Underline glow */}
      <div
        className="w-20 h-px mb-5 rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(160,32,240,0.6), transparent)" }}
      />

      <p className="relative z-10 text-slate-200 font-semibold text-center text-sm mb-2">
        {title}
      </p>
      <p className="relative z-10 text-slate-500 text-center max-w-sm mb-8 leading-relaxed text-sm">
        {description}
      </p>

      {action && (
        <div className="relative z-10 mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
