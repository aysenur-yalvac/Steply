"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Github, Calendar, CheckCircle, Clock, Star, MessageSquare, TrendingUp, Users, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CanvasParticles from "@/components/ui/CanvasParticles";

// ── Aura palette ──────────────────────────────────────────────────────────────
const AURA = [
  { bar: "#A020F0", glow: "rgba(160,32,240,0.55)", track: "rgba(160,32,240,0.10)", label: "#C97EFF" },
  { bar: "#FF7F50", glow: "rgba(255,127,80,0.55)",  track: "rgba(255,127,80,0.10)",  label: "#FFA880" },
  { bar: "#7C3AFF", glow: "rgba(124,58,255,0.55)",  track: "rgba(124,58,255,0.10)",  label: "#A78BFA" },
  { bar: "#FF4F8B", glow: "rgba(255,79,139,0.55)",  track: "rgba(255,79,139,0.10)",  label: "#FF8FB3" },
  { bar: "#00C2CB", glow: "rgba(0,194,203,0.55)",   track: "rgba(0,194,203,0.10)",   label: "#5EE7EC" },
];

// ── Demo data (static, relative to "today") ──────────────────────────────────
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const DEMO_PROJECTS = [
  {
    id: 1, title: "E-Commerce Platform",   student: "Alex K.",   role: "Full-Stack",
    start: daysFromNow(-62), end: daysFromNow(28),  progress: 75,  github: true,
    desc: "Next.js storefront with Stripe payments and real-time inventory sync.",
  },
  {
    id: 2, title: "AI Chatbot Integration", student: "Sarah M.",  role: "ML Engineer",
    start: daysFromNow(-32), end: daysFromNow(58),  progress: 42,  github: true,
    desc: "LLM-powered support agent with RAG pipeline and custom embeddings.",
  },
  {
    id: 3, title: "Mobile Dashboard UI",   student: "James R.",  role: "UI/UX",
    start: daysFromNow(-47), end: daysFromNow(-4),  progress: 100, github: false,
    desc: "React Native analytics dashboard. Delivered ahead of schedule.",
  },
  {
    id: 4, title: "Data Pipeline — ETL",   student: "Lena P.",   role: "Data Eng.",
    start: daysFromNow(-18), end: daysFromNow(42),  progress: 22,  github: true,
    desc: "Apache Airflow DAGs for multi-source ingestion into data warehouse.",
  },
  {
    id: 5, title: "Portfolio Website",     student: "Omar T.",   role: "Frontend",
    start: daysFromNow(-72), end: daysFromNow(-22), progress: 100, github: false,
    desc: "Blazing-fast Astro site with MDX blog and Lighthouse score 100/100.",
  },
];

const DEMO_ACTIVITY = [
  {
    id: 1, reviewer: "Prof. Chen", avatar: "PC", project: "E-Commerce Platform",
    rating: 5, comment: "Excellent architecture! The payment flow is seamless and well-tested.",
    time: "2h ago", color: AURA[0],
  },
  {
    id: 2, reviewer: "Dr. Martinez", avatar: "DM", project: "AI Chatbot Integration",
    rating: 4, comment: "Great NLP layer progress. Consider adding retry logic for API timeouts.",
    time: "5h ago", color: AURA[1],
  },
  {
    id: 3, reviewer: "Prof. Chen", avatar: "PC", project: "Mobile Dashboard UI",
    rating: 5, comment: "Stunning visual design. Marking as Completed — flawless delivery!",
    time: "1d ago", color: AURA[4],
  },
  {
    id: 4, reviewer: "Dr. Lee", avatar: "DL", project: "Data Pipeline — ETL",
    rating: 3, comment: "Batch sizes need optimisation for large dataset loads. Promising start.",
    time: "2d ago", color: AURA[2],
  },
];

// ── Date math ─────────────────────────────────────────────────────────────────
function getRange(projects: typeof DEMO_PROJECTS) {
  const starts = projects.map(p => p.start.getTime());
  const ends   = projects.map(p => p.end.getTime());
  const mn = new Date(Math.min(...starts));
  const mx = new Date(Math.max(...ends));
  mn.setDate(mn.getDate() - 8);
  mx.setDate(mx.getDate() + 16);
  return { min: mn, max: mx };
}

function pct(date: Date, min: Date, max: Date) {
  const total = max.getTime() - min.getTime();
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { min, max } = useMemo(() => getRange(DEMO_PROJECTS), []);
  const months        = useMemo(() => getMonths(min, max), [min, max]);
  const todayPct      = useMemo(() => pct(new Date(), min, max), [min, max]);

  return (
    <div
      className="flex flex-col w-full min-h-screen relative overflow-hidden"
      style={{ background: "#0B0E14" }}
    >
      <CanvasParticles />

      {/* ── Ambient mesh glows ─────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[700px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(160,32,240,0.16) 0%, transparent 60%)" }} />
        <div className="absolute top-0 right-0 w-[600px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(124,58,255,0.12) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(255,127,80,0.09) 0%, transparent 60%)" }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full pt-20 pb-12 flex flex-col items-center text-center px-6 relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-7"
          style={{
            background: "rgba(160,32,240,0.10)",
            border: "1px solid rgba(160,32,240,0.28)",
            color: "#C97EFF",
          }}
        >
          <BookOpen className="w-4 h-4" />
          Portfolio &amp; Mentorship Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-5 leading-tight"
        >
          Track every step.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #A020F0 0%, #FF7F50 100%)" }}
          >
            Grow every project.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="text-base md:text-lg text-slate-400 max-w-xl mb-9 leading-relaxed"
        >
          Steply is the interactive project &amp; mentorship hub where students track milestones on a live timeline and mentors deliver feedback in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link href="/auth/register"
            className="btn-aura flex items-center justify-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl text-sm">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/auth/login"
            className="flex items-center justify-center gap-2 text-slate-300 font-semibold px-8 py-3.5 rounded-xl text-sm transition-all hover:bg-white/5 active:scale-95"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
            Log In
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          LIVE DEMO — Timeline + Activity Feed
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-16 relative z-10">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(160,32,240,0.35))" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#C97EFF" }}>
            Live Platform Demo
          </span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(160,32,240,0.35), transparent)" }} />
        </div>

        <div className="flex gap-4 items-start">

          {/* ── Gantt Timeline (left, 65%) ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 min-w-0 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(13,17,30,0.75)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Panel header */}
            <div className="px-5 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#A020F0" }} />
              <span className="text-xs font-bold text-slate-300 tracking-wide">Project Timeline</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#A020F0", boxShadow: "0 0 6px #A020F0" }} />
                <span className="text-[10px] text-slate-500 font-medium">Today</span>
              </div>
            </div>

            {/* Month ruler */}
            <div className="px-5 pt-3 pb-1 relative" style={{ paddingLeft: "148px" }}>
              <div className="relative w-full h-5">
                {months.map((m, i) => {
                  const x = pct(m, min, max);
                  return (
                    <span key={i}
                      className="absolute text-[10px] font-semibold text-slate-600 -translate-x-1/2"
                      style={{ left: `${x}%` }}>
                      {m.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  );
                })}
                {/* Today line in ruler */}
                <div className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${todayPct}%`, background: "rgba(255,127,80,0.5)" }} />
              </div>
            </div>

            {/* Rows */}
            <div className="px-5 pb-5 flex flex-col gap-2" style={{ paddingLeft: "148px" }}>
              {DEMO_PROJECTS.map((proj, idx) => {
                const color  = AURA[idx % AURA.length];
                const lPct   = pct(proj.start, min, max);
                const rPct   = pct(proj.end,   min, max);
                const wPct   = Math.max(2, rPct - lPct);
                const isHov  = hoveredId === proj.id;
                const isDone = proj.progress === 100;

                return (
                  <div key={proj.id} className="relative flex items-center h-10">
                    {/* Left label */}
                    <div className="absolute right-[calc(100%+8px)] flex flex-col items-end"
                      style={{ width: "136px" }}>
                      <span className="text-[11px] font-bold text-white truncate max-w-full text-right leading-none">
                        {proj.title}
                      </span>
                      <span className="text-[9px] font-medium mt-0.5 truncate" style={{ color: color.label }}>
                        {proj.student} · {proj.role}
                      </span>
                    </div>

                    {/* Track */}
                    <div className="relative w-full h-2 rounded-full"
                      style={{ background: "rgba(255,255,255,0.04)" }}>

                      {/* Today indicator */}
                      <div className="absolute top-1/2 -translate-y-1/2 w-px h-8 -mt-3 z-20"
                        style={{
                          left: `${todayPct}%`,
                          background: "rgba(255,127,80,0.45)",
                        }} />

                      {/* Bar */}
                      <motion.div
                        className="absolute top-0 h-full rounded-full cursor-pointer z-10"
                        style={{
                          left:  `${lPct}%`,
                          width: `${wPct}%`,
                          background: `linear-gradient(90deg, ${color.bar}DD 0%, ${color.bar}88 100%)`,
                          boxShadow: isHov
                            ? `0 0 22px ${color.glow}, 0 0 44px ${color.glow}`
                            : `0 0 8px ${color.glow}`,
                        }}
                        animate={{ scaleY: isHov ? 1.7 : 1 }}
                        transition={{ duration: 0.18 }}
                        onMouseEnter={() => setHoveredId(proj.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      />

                      {/* Progress fill */}
                      <div
                        className="absolute top-0 h-full rounded-full opacity-40 pointer-events-none z-10"
                        style={{
                          left:  `${lPct}%`,
                          width: `${wPct * proj.progress / 100}%`,
                          background: color.bar,
                        }}
                      />
                    </div>

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {isHov && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.16 }}
                          className="absolute top-full mt-2 z-50 rounded-xl p-3 pointer-events-none min-w-[220px]"
                          style={{
                            left: `${Math.min(lPct, 70)}%`,
                            background: "rgba(13,17,30,0.97)",
                            border: `1px solid ${color.bar}55`,
                            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color.glow}`,
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
                                  <Clock className="w-2.5 h-2.5" /> {proj.progress}%
                                </span>
                            }
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{proj.desc}</p>
                          <div className="flex items-center gap-3 text-[9px] text-slate-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {proj.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              {" → "}
                              {proj.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            {proj.github && (
                              <span className="flex items-center gap-1" style={{ color: "#FFA880" }}>
                                <Github className="w-2.5 h-2.5" /> GitHub
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-5 pb-4 flex items-center gap-4 flex-wrap"
              style={{ paddingLeft: "148px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px" }}>
              <span className="text-[9px] text-slate-600 font-medium uppercase tracking-widest">Legend:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-1.5 rounded-full" style={{ background: "rgba(160,32,240,0.55)" }} />
                <span className="text-[9px] text-slate-500">Timeline span</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-1.5 rounded-full opacity-50" style={{ background: "#A020F0" }} />
                <span className="text-[9px] text-slate-500">Progress fill</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-px h-3" style={{ background: "rgba(255,127,80,0.5)" }} />
                <span className="text-[9px] text-slate-500">Today</span>
              </div>
            </div>
          </motion.div>

          {/* ── Activity Feed (right, 35%) ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="w-72 shrink-0 rounded-2xl overflow-hidden hidden lg:flex flex-col"
            style={{
              background: "rgba(13,17,30,0.75)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Panel header */}
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <MessageSquare className="w-4 h-4" style={{ color: "#FF7F50" }} />
              <span className="text-xs font-bold text-slate-300 tracking-wide">Activity Feed</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,127,80,0.12)", color: "#FFA880", border: "1px solid rgba(255,127,80,0.22)" }}>
                Live
              </span>
            </div>

            {/* Feed items */}
            <div className="flex-1 flex flex-col" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {DEMO_ACTIVITY.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.09 }}
                  className="px-4 py-3 flex flex-col gap-1.5 group hover:bg-white/[0.02] transition-colors"
                  style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${item.color.bar}CC 0%, ${item.color.bar}55 100%)` }}>
                        {item.avatar}
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">{item.reviewer}</span>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si}
                          className="w-2.5 h-2.5"
                          fill={si < item.rating ? "#FF7F50" : "none"}
                          style={{ color: si < item.rating ? "#FF7F50" : "rgba(255,255,255,0.15)" }}
                          strokeWidth={1.5} />
                      ))}
                    </div>
                  </div>

                  {/* Project name */}
                  <span className="text-[9px] font-semibold tracking-wider uppercase"
                    style={{ color: item.color.label }}>
                    {item.project}
                  </span>

                  {/* Comment */}
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{item.comment}</p>

                  {/* Time */}
                  <span className="text-[9px] text-slate-600">{item.time}</span>
                </motion.div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 text-[10px] text-slate-600 text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              Real-time mentor feedback · Powered by{" "}
              <a href="https://must-b.com" target="_blank" rel="noopener noreferrer"
                className="font-bold" style={{ color: "#A020F0" }}>Must-b</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Users className="w-5 h-5" />,     label: "Role-Based Access",       desc: "Student & Teacher dashboards — different views, one platform.", color: AURA[0] },
            { icon: <TrendingUp className="w-5 h-5" />, label: "Live Progress Tracking",  desc: "Update project % natively. Mentors see milestones as they land.", color: AURA[1] },
            { icon: <Zap className="w-5 h-5" />,        label: "GitHub Integration",      desc: "Link your repo with one click. Source and progress in one place.",  color: AURA[2] },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:-translate-y-1 duration-300"
              style={{
                background: `${item.color.track}`,
                border: `1px solid ${item.color.bar}22`,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${item.color.bar}22`, color: item.color.label }}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white mb-1">{item.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.6 }}
          className="relative rounded-3xl overflow-hidden p-10 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: "rgba(160,32,240,0.07)",
            border: "1px solid rgba(160,32,240,0.20)",
          }}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(160,32,240,0.12) 0%, transparent 65%)" }} />

          {/* Diagonal SVG accent */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none">
            <defs>
              <linearGradient id="diagCta" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A020F0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF7F50" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <line x1="0" y1="100%" x2="100%" y2="0" stroke="url(#diagCta)" strokeWidth="1" strokeDasharray="6 12" />
          </svg>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
              Ready to launch your{" "}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #A020F0 0%, #FF7F50 100%)" }}>
                first project?
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md">
              Join students and mentors already tracking milestones, exchanging feedback, and building portfolios on Steply.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/auth/register"
              className="btn-aura flex items-center justify-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl text-sm">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login"
              className="flex items-center justify-center gap-2 text-slate-300 font-semibold px-7 py-3.5 rounded-xl text-sm transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
