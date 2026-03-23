"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ShoppingCart, LayoutDashboard, Users, Database,
  Shield, CheckCircle, Star, Bell, Send, ArrowRight,
} from "lucide-react";
import { PROJECTS_DATA } from "@/data/projects";
import type { ProjectStatus } from "@/data/projects";

// ── Palette ───────────────────────────────────────────────────────────────────
const AURA = [
  { bar: "#A020F0", label: "#C97EFF" },
  { bar: "#FF7F50", label: "#FFA880" },
  { bar: "#7C3AFF", label: "#A78BFA" },
  { bar: "#FF4F8B", label: "#FF8FB3" },
  { bar: "#00C2CB", label: "#5EE7EC" },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  approved:  { label: "Approved",          color: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.28)"  },
  review:    { label: "Under Review",      color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.28)" },
  changes:   { label: "Changes Requested", color: "#EF4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.28)"  },
  submitted: { label: "New Submission",    color: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.28)" },
} as const;

// ── Approval stages ───────────────────────────────────────────────────────────
const STAGES = ["Submitted", "Review", "Grade", "Finalized"];

function stageFromStatus(status: ProjectStatus): number {
  switch (status) {
    case "submitted": return 1;
    case "review":    return 2;
    case "changes":   return 1;
    case "approved":  return 4;
  }
}

const LAST_ACTIONS = [
  "Teacher graded 1d ago",
  "Teacher graded 2d ago",
  "Submitted 3h ago",
  "Finalized 4d ago",
  "Changes requested 1d ago",
];

// Icons for the 5 demo projects
const DEMO_ICONS = [BookOpen, ShoppingCart, LayoutDashboard, Users, Database];

// First 5 projects for the demo panel
const DEMO_PROJECTS = PROJECTS_DATA.slice(0, 5);

// ── Teacher feedback (static demo) ───────────────────────────────────────────
const FEEDBACK = [
  { id: 1, avatar: "PC", teacher: "Prof. Chen",   tag: "Mentor Review",  project: "OOP Not Hesaplayıcı",   rating: 5,    comment: "Encapsulation mükemmel uygulanmış. CRUD işlemleri temiz ve test edilmiş. Onaylıyorum.", color: AURA[0] },
  { id: 2, avatar: "DL", teacher: "Dr. Lee",      tag: "Teacher Note",   project: "Kütüphane Otomasyonu",  rating: null, comment: "Enum kullanımı doğru ama tarih farkı hesabında edge case hatası var. Lütfen düzeltin.", color: AURA[3] },
  { id: 3, avatar: "PC", teacher: "Prof. Chen",   tag: "Mentor Review",  project: "Personel Takip Sistemi",rating: 5,    comment: "Interface kullanımı çok başarılı. Loglama yapısı da kurumsal standartlarda. Final.", color: AURA[2] },
  { id: 4, avatar: "DM", teacher: "Dr. Martinez", tag: "Teacher Note",   project: "Geometrik Form Aracı",  rating: null, comment: "Polymorphism doğru kurulmuş. Virtual method override'ları gözden geçirilmeli.", color: AURA[1] },
];

const REQUESTS = [
  { id: 1, student: "Cem D.",   project: "Kütüphane Otomasyonu",  milestone: "Enum & Date Logic",   time: "1d ago",  color: AURA[4] },
  { id: 2, student: "Kerem A.", project: "Geometrik Form Aracı",  milestone: "Polymorphism Module", time: "3h ago",  color: AURA[1] },
  { id: 3, student: "Sara M.",  project: "Sipariş Yönetimi",      milestone: "Inheritance Layer",   time: "5h ago",  color: AURA[3] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status];
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function ApprovalProgress({ stage, color }: { stage: number; color: (typeof AURA)[number] }) {
  const capped = Math.min(stage, STAGES.length);
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {STAGES.map((_, i) => (
        <div key={i} className="flex items-center gap-0.5">
          <div
            className="h-1 rounded-full"
            style={{
              width: 20,
              background: i < capped
                ? `linear-gradient(90deg, ${color.bar} 0%, ${color.bar}88 100%)`
                : "rgba(255,255,255,0.08)",
              boxShadow: i < capped ? `0 0 5px ${color.bar}55` : "none",
            }}
          />
          {i < STAGES.length - 1 && (
            <div className="w-0.5 h-0.5 rounded-full"
              style={{ background: i < capped - 1 ? color.bar : "rgba(255,255,255,0.12)" }} />
          )}
        </div>
      ))}
      <span className="ml-1.5 text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
        {STAGES[Math.min(capped, STAGES.length - 1)]}
      </span>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-3 h-3"
          fill={i < Math.floor(rating) ? "#FF7F50" : "none"}
          style={{ color: i < Math.ceil(rating) ? "#FF7F50" : "rgba(255,255,255,0.15)" }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LiveDemo() {
  const [activeTab, setActiveTab] = useState<"feedback" | "requests">("feedback");

  return (
    <div
      className="flex items-stretch rounded-2xl overflow-hidden"
      style={{
        background: "rgba(13,17,23,0.85)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
    >

      {/* ════════════════════════════════════════════════════════════════════
          LEFT — Academic Review Board (first 5 of 50)
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
          <Shield className="w-4 h-4" style={{ color: "#A020F0" }} />
          <span className="text-sm font-bold text-white tracking-wide">Academic Review Board</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-1 rounded-md"
              style={{ color: "#22C55E", background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.22)" }}>
              18 Approved
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md"
              style={{ color: "#F59E0B", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.22)" }}>
              32 Pending
            </span>
          </div>
        </div>

        {/* Column headers */}
        <div
          className="px-5 py-2 grid shrink-0"
          style={{ gridTemplateColumns: "1fr auto auto", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">Project / Student</span>
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600 hidden sm:block">Status · Grade</span>
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600 hidden md:block">Last Action</span>
        </div>

        {/* Project rows — first 5 only */}
        <div className="flex flex-col px-3 py-2 gap-1.5 flex-1">
          {DEMO_PROJECTS.map((proj, idx) => {
            const Icon = DEMO_ICONS[idx];
            const color = AURA[idx % AURA.length];
            const isApproved = proj.status === "approved";
            const stage = stageFromStatus(proj.status);
            return (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + idx * 0.07 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color.bar}55`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color.bar}18`, border: `1px solid ${color.bar}33` }}
                >
                  <Icon className="w-4 h-4" style={{ color: color.label }} />
                </div>

                {/* Title + student + approval progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[12px] font-bold text-white truncate leading-tight">
                      {proj.title}
                    </span>
                    {isApproved && (
                      <CheckCircle
                        className="w-3 h-3 shrink-0"
                        style={{ color: "#22C55E", filter: "drop-shadow(0 0 4px rgba(34,197,94,0.7))" }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight mb-1">
                    Student: {proj.studentName}
                  </span>
                  <ApprovalProgress stage={stage} color={color} />
                </div>

                {/* Status + grade */}
                <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 ml-2">
                  <StatusBadge status={proj.status} />
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: proj.grade === "Pending" ? "rgba(255,255,255,0.22)" : color.label }}
                  >
                    {proj.grade}
                  </span>
                  <span className="text-[9px] text-slate-600 hidden md:block">{LAST_ACTIONS[idx]}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── View All button ─────────────────────────────────────────────── */}
        <div className="px-3 pb-3 shrink-0">
          <Link
            href="/all-projects"
            className="group flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "rgba(160,32,240,0.10)",
              border: "1px solid rgba(160,32,240,0.30)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="text-slate-300">Tüm Projeleri Göster</span>
            <span
              className="text-[11px] font-black px-2 py-0.5 rounded-full"
              style={{ background: "rgba(160,32,240,0.30)", color: "#C97EFF", border: "1px solid rgba(160,32,240,0.45)" }}
            >
              50
            </span>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* Stage legend */}
        <div
          className="px-5 py-2.5 flex items-center gap-4 flex-wrap shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span className="text-[9px] text-slate-600 font-medium uppercase tracking-widest">STAGES:</span>
          {STAGES.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-4 h-1 rounded-full"
                style={{ background: i < 2 ? "rgba(160,32,240,0.55)" : "rgba(255,255,255,0.10)" }} />
              <span className="text-[9px] text-slate-500">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px self-stretch" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT — Teacher Feedback & Review Requests
      ════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-72 shrink-0 flex-col">

        {/* Header */}
        <div
          className="px-4 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="text-sm font-bold text-white">Teacher Feedback &amp; Requests</span>
        </div>

        {/* Tabs */}
        <div
          className="flex px-4 gap-1 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          {(["feedback", "requests"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-2.5 pt-2 px-1 text-[11px] font-bold transition-colors relative"
              style={{ color: activeTab === tab ? "#C97EFF" : "rgba(255,255,255,0.32)" }}
            >
              {tab === "feedback" ? "Mentor Reviews" : (
                <span className="flex items-center gap-1.5">
                  Review Requests
                  <span
                    className="w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center text-white"
                    style={{ background: "#A020F0" }}
                  >3</span>
                </span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #A020F0, #7C3AFF)" }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">

            {/* ── Mentor Reviews ── */}
            {activeTab === "feedback" && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex-1 flex flex-col"
              >
                {FEEDBACK.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    className="px-4 py-3.5 flex flex-col gap-1.5 hover:bg-white/[0.015] transition-colors"
                    style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ background: `linear-gradient(135deg, ${item.color.bar}CC 0%, ${item.color.bar}55 100%)` }}
                        >
                          {item.avatar}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-white block leading-tight">{item.teacher}</span>
                          <span
                            className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                            style={{ color: item.color.label, background: `${item.color.bar}18`, border: `1px solid ${item.color.bar}33` }}
                          >
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      {item.rating != null && <StarRow rating={item.rating} />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 pl-9">
                      <span className="font-bold" style={{ color: item.color.label }}>{item.project}: </span>
                      {item.comment}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── Review Requests ── */}
            {activeTab === "requests" && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex-1 px-3 py-3 flex flex-col gap-2"
              >
                {REQUESTS.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: `${req.color.bar}10`, border: `1px solid ${req.color.bar}28` }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${req.color.bar}22`, border: `1px solid ${req.color.bar}44` }}
                    >
                      <Bell className="w-3.5 h-3.5" style={{ color: req.color.label }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold text-white truncate">{req.student}</span>
                        <span className="text-[9px] text-slate-600 shrink-0">{req.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Requests review for{" "}
                        <span className="font-bold" style={{ color: req.color.label }}>{req.milestone}</span>
                      </p>
                      <p className="text-[9px] text-slate-600 mt-0.5">{req.project}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Teacher note input */}
        <div
          className="px-4 py-3 flex items-center gap-2 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(160,32,240,0.5) 0%, rgba(124,58,255,0.3) 100%)" }}
          >
            T
          </div>
          <input
            type="text"
            placeholder="Leave teacher note..."
            className="flex-1 bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none"
          />
          <button
            className="flex items-center justify-center w-8 h-7 rounded-lg text-white transition-all hover:opacity-90 shrink-0"
            style={{ background: "rgba(160,32,240,0.28)", border: "1px solid rgba(160,32,240,0.38)" }}
          >
            <Send className="w-3 h-3" />
          </button>
        </div>

        {/* Must-b logo */}
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
