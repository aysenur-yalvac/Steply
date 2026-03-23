"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, X, CheckCircle, Shield } from "lucide-react";
import { PROJECTS_DATA } from "@/data/projects";
import type { ProjectStatus } from "@/data/projects";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  approved:  { label: "Approved",          color: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.28)"  },
  review:    { label: "Under Review",      color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.28)" },
  changes:   { label: "Changes Requested", color: "#EF4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.28)"  },
  submitted: { label: "New Submission",    color: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.28)" },
} as const;

type FilterKey = "all" | ProjectStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "All Projects"       },
  { key: "approved",  label: "Approved"            },
  { key: "review",    label: "Under Review"        },
  { key: "changes",   label: "Changes Requested"  },
  { key: "submitted", label: "New Submission"      },
];

const AURA_COLORS = ["#A020F0", "#FF7F50", "#7C3AFF", "#FF4F8B", "#00C2CB"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AllProjectsPage() {
  const [query, setQuery]         = useState("");
  const [filter, setFilter]       = useState<FilterKey>("all");

  const counts = useMemo(() => ({
    all:       PROJECTS_DATA.length,
    approved:  PROJECTS_DATA.filter((p) => p.status === "approved").length,
    review:    PROJECTS_DATA.filter((p) => p.status === "review").length,
    changes:   PROJECTS_DATA.filter((p) => p.status === "changes").length,
    submitted: PROJECTS_DATA.filter((p) => p.status === "submitted").length,
  }), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return PROJECTS_DATA.filter((p) => {
      const matchesFilter = filter === "all" || p.status === filter;
      const matchesQuery  = !q ||
        p.title.toLowerCase().includes(q) ||
        p.studentName.toLowerCase().includes(q) ||
        p.technicalDetails.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  return (
    <div className="min-h-screen" style={{ background: "#0B0E14" }}>

      {/* ── Ambient glows ─────────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[700px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(160,32,240,0.14) 0%, transparent 60%)" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(124,58,255,0.10) 0%, transparent 60%)" }} />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-20">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Shield className="w-5 h-5" style={{ color: "#A020F0" }} />
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                OOP C# Müfredatı
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              {PROJECTS_DATA.length} proje · Akademik Denetim Paneli · C# Windows Forms
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ color: "#22C55E", background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.22)" }}>
              {counts.approved} Onaylı
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ color: "#F59E0B", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.22)" }}>
              {counts.review} İncelemede
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ color: "#EF4444", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)" }}>
              {counts.changes} Revize
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ color: "#3B82F6", background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.22)" }}>
              {counts.submitted} Yeni
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Proje adı, öğrenci adı veya teknoloji ara..."
            className="w-full pl-10 pr-10 py-3 text-sm text-slate-300 placeholder:text-slate-600 rounded-xl outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(160,32,240,0.40)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>

        {/* Filter tabs + result count */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {FILTERS.map(({ key, label }) => {
            const count = key === "all" ? PROJECTS_DATA.length : counts[key as ProjectStatus];
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  color:      filter === key ? "#fff"                        : "rgba(255,255,255,0.35)",
                  background: filter === key ? "rgba(160,32,240,0.22)"      : "rgba(255,255,255,0.04)",
                  border:     filter === key ? "1px solid rgba(160,32,240,0.45)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {label} <span style={{ opacity: 0.65 }}>({count})</span>
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-600">
            {filtered.length} / {PROJECTS_DATA.length} proje
          </span>
        </div>

        {/* Project table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Table header */}
          <div
            className="hidden sm:grid px-5 py-3"
            style={{
              gridTemplateColumns: "2.5rem 1fr 8rem 5.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">#</span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">Proje / Öğrenci</span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">Durum</span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">Not</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-slate-600 text-sm">
              Aramanızla eşleşen proje bulunamadı.
            </div>
          ) : (
            filtered.map((proj, idx) => {
              const accentColor = AURA_COLORS[(proj.id - 1) % AURA_COLORS.length];
              const s = STATUS_CONFIG[proj.status];
              const isApproved = proj.status === "approved";
              return (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.015, 0.3) }}
                  className="grid px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  style={{
                    gridTemplateColumns: "2.5rem 1fr auto auto",
                    borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                    gap: "1rem",
                  }}
                >
                  {/* # */}
                  <span
                    className="text-[11px] font-bold self-center"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    {String(proj.id).padStart(2, "0")}
                  </span>

                  {/* Title + student + tech details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: accentColor, boxShadow: `0 0 4px ${accentColor}88` }}
                      />
                      <span className="text-[13px] font-bold text-white truncate">{proj.title}</span>
                      {isApproved && (
                        <CheckCircle
                          className="w-3 h-3 shrink-0"
                          style={{ color: "#22C55E", filter: "drop-shadow(0 0 3px rgba(34,197,94,0.6))" }}
                        />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block mb-1">
                      Öğrenci: {proj.studentName}
                    </span>
                    <span className="text-[10px] text-slate-600 block leading-relaxed line-clamp-1">
                      {proj.technicalDetails}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center">
                    <span
                      className="text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap"
                      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Grade */}
                  <div className="flex items-center justify-end">
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: proj.grade === "Pending" ? "rgba(255,255,255,0.20)" : accentColor }}
                    >
                      {proj.grade}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center text-[11px] text-slate-700">
          C# Windows Forms · OOP Principles · Academic Supervision Platform
          <span className="mx-2">·</span>
          <a href="https://must-b.com" target="_blank" rel="noopener noreferrer"
            className="hover:text-slate-500 transition-colors"
            style={{ color: "#A020F0" }}>
            ✦ must-b
          </a>
        </div>
      </div>
    </div>
  );
}
