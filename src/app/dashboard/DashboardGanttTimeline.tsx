'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Calendar, CheckCircle, Clock, Github } from 'lucide-react';

// ── Aura palette (matches landing page) ──────────────────────────────────────
const AURA = [
  { bar: "#A020F0", glow: "rgba(160,32,240,0.55)", label: "#C97EFF" },
  { bar: "#FF7F50", glow: "rgba(255,127,80,0.55)",  label: "#FFA880" },
  { bar: "#7C3AFF", glow: "rgba(124,58,255,0.55)",  label: "#A78BFA" },
  { bar: "#FF4F8B", glow: "rgba(255,79,139,0.55)",  label: "#FF8FB3" },
  { bar: "#00C2CB", glow: "rgba(0,194,203,0.55)",   label: "#5EE7EC" },
];

function pct(date: Date, min: Date, max: Date) {
  const total = max.getTime() - min.getTime();
  if (total === 0) return 50;
  return Math.max(0, Math.min(100, ((date.getTime() - min.getTime()) / total) * 100));
}

function getMonths(min: Date, max: Date): Date[] {
  const months: Date[] = [];
  const cur = new Date(min.getFullYear(), min.getMonth(), 1);
  while (cur <= max) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

type Project = {
  id: string;
  title: string;
  description?: string | null;
  github_link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  progress_percentage: number;
  profiles?: { full_name: string } | null;
};

export default function DashboardGanttTimeline({
  projects,
  isTeacher = false,
}: {
  projects: Project[];
  isTeacher?: boolean;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);

  const { min, max } = useMemo(() => {
    const fallbackEnd = new Date(now);
    fallbackEnd.setDate(fallbackEnd.getDate() + 30);

    const starts = projects.map(p => p.start_date ? new Date(p.start_date) : now);
    const ends   = projects.map(p => p.end_date   ? new Date(p.end_date)   : fallbackEnd);

    const mn = new Date(Math.min(...starts.map(d => d.getTime())));
    const mx = new Date(Math.max(...ends.map(d => d.getTime())));
    mn.setDate(mn.getDate() - 10);
    mx.setDate(mx.getDate() + 18);
    return { min: mn, max: mx };
  }, [projects, now]);

  const months   = useMemo(() => getMonths(min, max), [min, max]);
  const todayPct = useMemo(() => pct(now, min, max), [now, min, max]);

  return (
    <div
      className="rounded-2xl overflow-visible w-full"
      style={{
        background: "rgba(13,17,30,0.82)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      {/* ── Window chrome ──────────────────────────────────────────────────── */}
      <div
        className="px-5 py-3.5 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,79,139,0.55)" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,127,80,0.55)" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(0,194,203,0.55)" }} />
        </div>
        <TrendingUp className="w-4 h-4" style={{ color: "#A020F0" }} />
        <span className="text-xs font-bold text-slate-300 tracking-wide">
          {isTeacher ? "Portfolio Overview — Timeline" : "Your Projects — Timeline"}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#FF7F50", boxShadow: "0 0 6px #FF7F50" }}
          />
          <span className="text-[10px] text-slate-500 font-medium">Today</span>
        </div>
      </div>

      {/* ── Month ruler ────────────────────────────────────────────────────── */}
      <div className="relative pt-3 pb-1 pr-5" style={{ paddingLeft: "176px" }}>
        <div className="relative w-full h-5">
          {months.map((m, i) => {
            const x = pct(m, min, max);
            return (
              <span
                key={i}
                className="absolute text-[10px] font-semibold text-slate-600 -translate-x-1/2"
                style={{ left: `${x}%` }}
              >
                {m.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
              </span>
            );
          })}
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${todayPct}%`, background: "rgba(255,127,80,0.55)" }}
          />
        </div>
      </div>

      {/* ── Gantt rows ─────────────────────────────────────────────────────── */}
      <div className="pb-4 flex flex-col pr-5" style={{ paddingLeft: "176px" }}>
        {projects.map((proj, idx) => {
          const color    = AURA[idx % AURA.length];
          const fallbackEnd = new Date(now);
          fallbackEnd.setDate(fallbackEnd.getDate() + 30);
          const start    = proj.start_date ? new Date(proj.start_date) : now;
          const end      = proj.end_date   ? new Date(proj.end_date)   : fallbackEnd;
          const lPct     = pct(start, min, max);
          const rPct     = pct(end,   min, max);
          const wPct     = Math.max(3, rPct - lPct);
          const isHov    = hoveredId === proj.id;
          const isDone   = proj.progress_percentage === 100;

          return (
            <div
              key={proj.id}
              className="relative flex items-center h-14"
              style={{
                borderBottom: idx < projects.length - 1
                  ? "1px solid rgba(255,255,255,0.03)"
                  : "none",
              }}
            >
              {/* Left label */}
              <div
                className="absolute flex flex-col items-end"
                style={{ right: "calc(100% + 14px)", width: "154px" }}
              >
                <span className="text-[11px] font-bold text-white/90 truncate max-w-full text-right leading-none">
                  {proj.title}
                </span>
                <span className="text-[9px] font-medium mt-0.5 truncate" style={{ color: color.label }}>
                  {isTeacher && proj.profiles?.full_name
                    ? proj.profiles.full_name
                    : `${proj.progress_percentage}% complete`}
                </span>
              </div>

              {/* Track */}
              <div
                className="relative w-full h-3 rounded-full"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {/* Today line */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-px h-10 -mt-3.5 z-20"
                  style={{ left: `${todayPct}%`, background: "rgba(255,127,80,0.50)" }}
                />

                {/* Bar — clickable */}
                <Link href={`/dashboard/projects/${proj.id}`} className="block absolute inset-y-0 z-10"
                  style={{ left: `${lPct}%`, width: `${wPct}%` }}>
                  <motion.div
                    className="absolute top-0 w-full h-full rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${color.bar}EE 0%, ${color.bar}99 100%)`,
                      boxShadow: isHov
                        ? `0 0 28px ${color.glow}, 0 0 52px ${color.glow}`
                        : `0 0 10px ${color.glow}`,
                    }}
                    animate={{ scaleY: isHov ? 1.55 : 1 }}
                    transition={{ duration: 0.18 }}
                    onMouseEnter={() => setHoveredId(proj.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                </Link>

                {/* Progress fill */}
                <div
                  className="absolute top-0 h-full rounded-full opacity-50 pointer-events-none z-10"
                  style={{
                    left:  `${lPct}%`,
                    width: `${wPct * proj.progress_percentage / 100}%`,
                    background: color.bar,
                  }}
                />

                {/* % label */}
                {wPct > 14 && (
                  <div
                    className="absolute top-1/2 z-20 pointer-events-none"
                    style={{
                      left: `${lPct + wPct / 2}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span className="text-[8px] font-bold text-white/65">
                      {isDone ? "✓" : `${proj.progress_percentage}%`}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover tooltip */}
              <AnimatePresence>
                {isHov && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.16 }}
                    className="absolute top-full mt-2 z-50 rounded-xl p-3.5 pointer-events-none min-w-[230px]"
                    style={{
                      left: `${Math.min(lPct, 60)}%`,
                      background: "rgba(11,14,20,0.98)",
                      border: `1px solid ${color.bar}66`,
                      boxShadow: `0 14px 44px rgba(0,0,0,0.65), 0 0 26px ${color.glow}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-bold text-white leading-tight">{proj.title}</span>
                      {isDone
                        ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0"
                            style={{ background: "rgba(0,194,203,0.15)", color: "#00C2CB", border: "1px solid rgba(0,194,203,0.25)" }}>
                            <CheckCircle className="w-2.5 h-2.5" /> Done
                          </span>
                        : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0"
                            style={{ background: "rgba(255,127,80,0.12)", color: "#FF9A6C", border: "1px solid rgba(255,127,80,0.22)" }}>
                            <Clock className="w-2.5 h-2.5" /> {proj.progress_percentage}%
                          </span>
                      }
                    </div>
                    {proj.description && (
                      <p className="text-[10px] text-slate-400 leading-relaxed mb-2 line-clamp-2">
                        {proj.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-[9px] text-slate-600 mb-2">
                      {proj.start_date && proj.end_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(proj.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" → "}
                          {new Date(proj.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                      {proj.github_link && (
                        <span className="flex items-center gap-1" style={{ color: "#FFA880" }}>
                          <Github className="w-2.5 h-2.5" /> GitHub
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] font-bold tracking-wide" style={{ color: color.label }}>
                      Click to open project →
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div
        className="pb-4 pr-5 flex items-center gap-5 flex-wrap"
        style={{
          paddingLeft: "176px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: "12px",
        }}
      >
        <span className="text-[9px] text-slate-600 font-medium uppercase tracking-widest">Legend:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-2 rounded-full" style={{ background: "rgba(160,32,240,0.55)" }} />
          <span className="text-[9px] text-slate-500">Span</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-2 rounded-full opacity-60" style={{ background: "#A020F0" }} />
          <span className="text-[9px] text-slate-500">Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-px h-3.5 animate-pulse" style={{ background: "rgba(255,127,80,0.6)" }} />
          <span className="text-[9px] text-slate-500">Today</span>
        </div>
      </div>
    </div>
  );
}
