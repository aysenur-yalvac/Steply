"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Bot, LayoutDashboard, Database, Globe,
  Star, MessageSquare, GitFork, TrendingUp, CheckCircle,
} from "lucide-react";

// ── Palette ───────────────────────────────────────────────────────────────────
const AURA = [
  { bar: "#A020F0", label: "#C97EFF" },
  { bar: "#FF7F50", label: "#FFA880" },
  { bar: "#7C3AFF", label: "#A78BFA" },
  { bar: "#FF4F8B", label: "#FF8FB3" },
  { bar: "#00C2CB", label: "#5EE7EC" },
];

// ── Demo data ─────────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 1, title: "E-Commerce Platform", Icon: ShoppingCart, progress: 75,  stars: 5,   comments: 12, extra: "38 commits/forks", color: AURA[0] },
  { id: 2, title: "AI Chatbot",          Icon: Bot,           progress: 42,  stars: 4.5, comments: 29, extra: "Interaction: High", color: AURA[1] },
  { id: 3, title: "Mobile Dashboard",   Icon: LayoutDashboard,progress: 100, stars: 4.5, comments: 12, extra: "38 commits/forks", color: AURA[2] },
  { id: 4, title: "ETL Pipeline",        Icon: Database,      progress: 22,  stars: 5,   comments: 21, extra: "Interaction: High", color: AURA[3] },
  { id: 5, title: "Portfolio Website",   Icon: Globe,         progress: 100, stars: 5,   comments: 12, extra: "Interaction: High", color: AURA[4] },
];

const COMMENTS = [
  { id: 1, avatar: "PC", reviewer: "Prof. Chen",    rating: 5,   comment: "Excellent architecture! Payment flow seamless & well-tested.",         color: AURA[0] },
  { id: 2, avatar: "DM", reviewer: "Dr. Martinez",  rating: 4.5, comment: "Great NLP progress. Consider retry logic for timeouts.",                color: AURA[1] },
  { id: 3, avatar: "PC", reviewer: "Prof. Chen",    rating: 5,   comment: "Stunning visual design. Marking as Complete.",                          color: AURA[2] },
  { id: 4, avatar: "DL", reviewer: "Dr. Lee",       rating: 3.5, comment: "Optimisation needed for batch sizes. Promising start.",                 color: AURA[3] },
];

// ── StarRow helper ────────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-3 h-3"
          fill={i < Math.floor(rating) ? "#FF7F50" : "none"}
          style={{ color: i < Math.ceil(rating) ? "#FF7F50" : "rgba(255,255,255,0.15)" }}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1 text-[11px] font-bold" style={{ color: "#FFA880" }}>{rating}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LiveDemo() {
  const [activeTab, setActiveTab] = useState<"comments" | "milestones">("comments");

  return (
    <div
      className="flex rounded-2xl overflow-hidden"
      style={{
        background: "rgba(13,17,23,0.80)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >

      {/* ════════════════════════════════════════════════════════════════════
          LEFT — Project Timeline list
      ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Window chrome */}
        <div
          className="px-5 py-3.5 flex items-center gap-2 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,79,139,0.55)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,127,80,0.55)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(0,194,203,0.55)" }} />
          </div>
          <TrendingUp className="w-4 h-4" style={{ color: "#A020F0" }} />
          <span className="text-sm font-bold text-white tracking-wide">Project Timeline</span>
          <div className="ml-auto">
            <span
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white/70"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              Upload Project
            </span>
          </div>
        </div>

        {/* Project rows */}
        <div className="flex flex-col px-4 py-3 gap-2 flex-1">
          {PROJECTS.map((proj, idx) => {
            const { Icon } = proj;
            return (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + idx * 0.07 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${proj.color.bar}55`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${proj.color.bar}18`,
                    border: `1px solid ${proj.color.bar}33`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: proj.color.label }} />
                </div>

                {/* Title + thin progress bar */}
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-bold text-white truncate block leading-tight mb-1.5">
                    {proj.title}
                  </span>
                  <div
                    className="relative h-1 rounded-full overflow-hidden"
                    style={{ background: `${proj.color.bar}18` }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{
                        width: `${proj.progress}%`,
                        background: `linear-gradient(90deg, ${proj.color.bar} 0%, ${proj.color.bar}88 100%)`,
                        boxShadow: `0 0 8px ${proj.color.bar}66`,
                      }}
                    />
                  </div>
                </div>

                {/* Right: stars · comments · extra */}
                <div className="hidden sm:flex items-center gap-4 shrink-0 ml-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" style={{ color: "#FF7F50" }} />
                    <span className="text-[11px] font-bold text-slate-300">{proj.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-600" />
                    <span className="text-[11px] text-slate-500">{proj.comments} comments</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-3 h-3 text-slate-600" />
                    <span className="text-[11px] text-slate-500">{proj.extra}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          className="px-5 py-3 flex items-center gap-5 flex-wrap shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span className="text-[9px] text-slate-600 font-medium uppercase tracking-widest">LEGEND:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1 rounded-full" style={{ background: "rgba(160,32,240,0.55)" }} />
            <span className="text-[9px] text-slate-500">Span</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1 rounded-full" style={{ background: "#A020F0" }} />
            <span className="text-[9px] text-slate-500">Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-px h-3 rounded-full animate-pulse" style={{ background: "rgba(255,127,80,0.7)" }} />
            <span className="text-[9px] text-slate-500">Today</span>
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px self-stretch" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT — Discussion & Milestone Updates
      ════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-72 shrink-0 flex-col">

        {/* Header */}
        <div
          className="px-4 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="text-sm font-bold text-white">Discussion &amp; Milestone Updates</span>
        </div>

        {/* Tabs */}
        <div
          className="flex px-4 gap-1 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          {(["comments", "milestones"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-2.5 pt-2 px-1 text-[11px] font-bold transition-colors relative"
              style={{ color: activeTab === tab ? "#C97EFF" : "rgba(255,255,255,0.32)" }}
            >
              {tab === "comments" ? "Latest Comments" : "Milestones"}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #A020F0, #7C3AFF)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">

            {/* ── Latest Comments ── */}
            {activeTab === "comments" && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex-1 flex flex-col"
              >
                {COMMENTS.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    className="px-4 py-3 flex flex-col gap-1.5 hover:bg-white/[0.015] transition-colors"
                    style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {/* Reviewer row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${item.color.bar}CC 0%, ${item.color.bar}55 100%)`,
                          }}
                        >
                          {item.avatar}
                        </div>
                        <span className="text-xs font-bold text-white">{item.reviewer}</span>
                      </div>
                      <StarRow rating={item.rating} />
                    </div>

                    {/* Comment */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 pl-9">
                      {item.comment}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── Milestones ── */}
            {activeTab === "milestones" && (
              <motion.div
                key="milestones"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex-1 px-4 py-4 flex flex-col gap-3"
              >
                {PROJECTS.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: p.progress === 100 ? `${p.color.bar}22` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${p.progress === 100 ? `${p.color.bar}44` : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      {p.progress === 100
                        ? <CheckCircle className="w-3.5 h-3.5" style={{ color: p.color.bar }} />
                        : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${p.progress === 100 ? "text-white" : "text-white/60"}`}>
                        {p.title}
                      </p>
                      <p className="text-[10px]" style={{ color: p.progress === 100 ? p.color.label : "rgba(255,255,255,0.25)" }}>
                        {p.progress === 100 ? "Completed · 100%" : `In progress · ${p.progress}%`}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Comment input */}
        <div
          className="px-4 py-3 flex items-center gap-2 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(160,32,240,0.5) 0%, rgba(124,58,255,0.3) 100%)" }}
          >
            U
          </div>
          <input
            type="text"
            placeholder="Write your comment..."
            className="flex-1 bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none"
          />
          <button
            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90 shrink-0"
            style={{ background: "rgba(160,32,240,0.28)", border: "1px solid rgba(160,32,240,0.38)" }}
          >
            Post
          </button>
        </div>

        {/* Must-b logo — bottom right */}
        <div className="px-4 pb-3 flex justify-end shrink-0">
          <a
            href="https://must-b.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold transition-opacity hover:opacity-80"
            style={{ color: "#A020F0" }}
          >
            <span style={{ textShadow: "0 0 10px rgba(160,32,240,0.9), 0 0 20px rgba(160,32,240,0.5)" }}>✦</span>
            must-b
          </a>
        </div>

      </div>
    </div>
  );
}
