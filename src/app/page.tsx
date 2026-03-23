"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle, TrendingUp, Users, Zap, Upload, Award } from "lucide-react";
import { motion } from "framer-motion";
import CanvasParticles from "@/components/ui/CanvasParticles";
import LiveDemo from "@/components/demo/LiveDemo";

// ── Aura palette ──────────────────────────────────────────────────────────────
const AURA = [
  { bar: "#A020F0", glow: "rgba(160,32,240,0.55)", track: "rgba(160,32,240,0.10)", label: "#C97EFF" },
  { bar: "#FF7F50", glow: "rgba(255,127,80,0.55)",  track: "rgba(255,127,80,0.10)",  label: "#FFA880" },
  { bar: "#7C3AFF", glow: "rgba(124,58,255,0.55)",  track: "rgba(124,58,255,0.10)",  label: "#A78BFA" },
  { bar: "#FF4F8B", glow: "rgba(255,79,139,0.55)",  track: "rgba(255,79,139,0.10)",  label: "#FF8FB3" },
  { bar: "#00C2CB", glow: "rgba(0,194,203,0.55)",   track: "rgba(0,194,203,0.10)",   label: "#5EE7EC" },
];

// ── Process steps ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    icon: Upload,   step: "01", title: "Upload Your Project",
    desc: "Create a project, link your GitHub repo, and set your milestone dates.",
    color: AURA[0],
  },
  {
    icon: TrendingUp, step: "02", title: "Track Every Step",
    desc: "Update your progress daily. Watch your timeline build in real time.",
    color: AURA[1],
  },
  {
    icon: Award, step: "03", title: "Grow With Feedback",
    desc: "Mentors review each milestone and build your portfolio with you.",
    color: AURA[2],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {

  return (
    <div
      className="flex flex-col w-full min-h-screen relative overflow-hidden"
      style={{ background: "#0B0E14" }}
    >
      <CanvasParticles />

      {/* ── Ambient mesh glows (stronger) ──────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[900px] h-[700px]"
          style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(160,32,240,0.22) 0%, transparent 58%)" }} />
        <div className="absolute top-0 right-0 w-[750px] h-[600px]"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(124,58,255,0.16) 0%, transparent 58%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[550px]"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,127,80,0.13) 0%, transparent 58%)" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[800px]"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(160,32,240,0.05) 0%, transparent 70%)" }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full pt-24 pb-14 flex flex-col items-center text-center px-6 relative z-10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
          style={{
            background: "rgba(160,32,240,0.10)",
            border: "1px solid rgba(160,32,240,0.32)",
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
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-6 leading-[1.06]"
        >
          Bring your projects to deploy{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #A020F0 0%, #7C3AFF 50%, #FF7F50 100%)" }}
          >
            with Steply.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="text-base md:text-lg text-slate-400 max-w-lg mb-10 leading-relaxed"
        >
          Enjoy unparalleled project presentation. Track every milestone on a live Gantt timeline — mentors deliver real-time feedback that builds careers.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <Link
            href="/auth/register"
            className="btn-aura group relative flex items-center justify-center gap-2 text-white font-bold px-9 py-4 rounded-xl text-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
            <span className="relative z-10">Start Tracking Free</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 text-slate-300 font-semibold px-9 py-4 rounded-xl text-sm transition-all hover:bg-white/5 active:scale-95"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
          >
            Sign In
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="flex flex-wrap justify-center items-center gap-5 text-xs text-slate-600"
        >
          {["GitHub integration", "Real-time feedback", "Student & Teacher roles"].map((txt, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500/70" />
              {txt}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PROCESS STEPS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-4xl mx-auto px-4 md:px-8 pb-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {STEPS.map(({ icon: Icon, step, title, desc, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.12 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl"
              style={{
                background: "rgba(15,20,40,0.72)",
                border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: `${color.bar}18`, border: `1px solid ${color.bar}44` }}
              >
                <Icon className="w-5 h-5" style={{ color: color.label }} />
              </div>
              <span className="text-[10px] font-bold tracking-widest mb-1.5" style={{ color: color.label }}>
                STEP {step}
              </span>
              <h3 className="text-sm font-extrabold text-white mb-2">{title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Section divider ───────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(160,32,240,0.38))" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#C97EFF" }}>
            Live Platform Demo
          </span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(160,32,240,0.38), transparent)" }} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LIVE DEMO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <LiveDemo />
        </motion.div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          FEATURE CARDS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Users className="w-5 h-5" />,      label: "Role-Based Access",       desc: "Student & Teacher dashboards — different views, one platform.", color: AURA[0] },
            { icon: <TrendingUp className="w-5 h-5" />,  label: "Live Progress Tracking",  desc: "Update project % natively. Mentors see milestones as they land.", color: AURA[1] },
            { icon: <Zap className="w-5 h-5" />,         label: "GitHub Integration",      desc: "Link your repo with one click. Source and progress in one place.", color: AURA[2] },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:-translate-y-1 duration-300"
              style={{
                background: item.color.track,
                border: `1px solid ${item.color.bar}22`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${item.color.bar}22`, color: item.color.label }}
              >
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
          className="relative rounded-3xl overflow-hidden p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: "rgba(160,32,240,0.07)",
            border: "1px solid rgba(160,32,240,0.22)",
          }}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(160,32,240,0.14) 0%, transparent 65%)" }} />

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
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
              Ready to map your{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #A020F0 0%, #FF7F50 100%)" }}
              >
                journey?
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Join students and mentors already tracking milestones, exchanging feedback, and building portfolios on Steply.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/auth/register"
              className="btn-aura group relative flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
              <span className="relative z-10">Create Free Account</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-slate-300 font-semibold px-8 py-4 rounded-xl text-sm transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
