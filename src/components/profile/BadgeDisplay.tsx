"use client";

import { useState } from "react";

export const BADGE_CONFIG: Record<string, {
  emoji: string;
  label: string;
  desc: string;
  color: string;
}> = {
  first_project:     { emoji: "🚀", label: "First Project",    desc: "Created your first project",          color: "bg-violet-100 text-violet-700 border-violet-300" },
  prolific:          { emoji: "📚", label: "Prolific",          desc: "10+ projects created",                color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  streak_7:          { emoji: "🔥", label: "7-Day Streak",      desc: "Active 7 consecutive days",           color: "bg-orange-100 text-orange-700 border-orange-300" },
  streak_30:         { emoji: "⚡", label: "30-Day Streak",     desc: "Active 30 consecutive days",          color: "bg-amber-100 text-amber-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 border-amber-300"   },
  active_week:       { emoji: "💪", label: "Active Week",       desc: "Completed tasks every day this week", color: "bg-teal-100 text-teal-700 border-teal-300"      },
  top_50_global:     { emoji: "🌍", label: "Global Top 50",    desc: "Ranked in the Global Top 50",         color: "bg-sky-100 text-sky-700 border-sky-300"         },
  top_10_university: { emoji: "🎓", label: "Top 10 Uni",       desc: "Top 10 in your university",           color: "bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 border-emerald-300" },
  turkey_champion:   { emoji: "🏆", label: "TR Champion",      desc: "#1 in Türkiye",                       color: "bg-red-100 text-red-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 border-red-300"         },
};

export function BadgeIcon({ badge, size = "md" }: { badge: string; size?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);
  const cfg = BADGE_CONFIG[badge];
  if (!cfg) return null;

  const dim = size === "sm" ? "w-5 h-5 text-xs" : "w-7 h-7 text-sm";

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={`inline-flex items-center justify-center rounded-full border cursor-default ${dim} ${cfg.color}`}>
        {cfg.emoji}
      </span>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-slate-800 text-white rounded-xl shadow-xl px-3 py-2 pointer-events-none min-w-[130px] text-center animate-tooltip">
          <div className="text-xs font-bold leading-snug">{cfg.label}</div>
          <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">{cfg.desc}</div>
        </div>
      )}
    </div>
  );
}

export default function BadgeDisplay({ badges, size = "md" }: { badges: string[]; size?: "sm" | "md" }) {
  if (!badges?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {badges.map(b => <BadgeIcon key={b} badge={b} size={size} />)}
    </div>
  );
}
