import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center p-16 rounded-3xl w-full overflow-hidden"
      style={{
        background: "rgba(15,20,40,0.60)",
        border: "1px solid rgba(160,32,240,0.14)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Ambient glow layers */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%,   rgba(160,32,240,0.13) 0%, transparent 60%)",
        }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(255,127,80,0.07) 0%, transparent 60%)",
        }} />

      {/* Cosmic star dots — pure CSS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {[...Array(28)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              top:    `${(i * 37 + 11) % 90}%`,
              left:   `${(i * 53 + 7)  % 95}%`,
              background: i % 5 === 0
                ? "rgba(160,32,240,0.6)"
                : i % 5 === 1
                ? "rgba(255,127,80,0.5)"
                : "rgba(255,255,255,0.25)",
              filter: i % 4 === 0 ? "blur(0.5px)" : "none",
            }}
          />
        ))}
      </div>

      {/* Icon */}
      <div className="relative w-24 h-24 mb-6 z-10">
        <div className="absolute inset-0 rounded-full animate-pulse"
          style={{ background: "rgba(160,32,240,0.22)", filter: "blur(18px)" }} />
        <div
          className="relative w-full h-full rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(160,32,240,0.18) 0%, rgba(124,58,255,0.10) 100%)",
            border: "1px solid rgba(160,32,240,0.28)",
            transform: "rotate(-3deg)",
          }}
        >
          <Icon className="w-10 h-10" style={{ color: "#C97EFF" }} strokeWidth={1.5} />
        </div>
      </div>

      {/* Text */}
      <h3 className="relative z-10 text-2xl font-extrabold text-white mb-2 text-center tracking-tight">
        The Empty State{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #A020F0 0%, #FF7F50 100%)" }}
        >
          Canvas
        </span>
      </h3>

      <p className="relative z-10 text-slate-300 font-semibold text-center text-sm mb-1">
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
