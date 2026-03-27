"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, SlidersHorizontal, CheckCircle, Clock, Minus, ExternalLink } from "lucide-react";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import GlobalSearch from "@/components/dashboard/GlobalSearch";

// ── Types ──────────────────────────────────────────────────────────────────────
type Project = {
  id: string;
  student_id?: string;
  title: string;
  description: string;
  github_link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  priority?: string | null;
  platform?: string | null;
  progress_percentage: number;
  profiles?: { full_name: string };
};

type ViewMode = "kanban" | "list";

// ── Priority badge helpers ──────────────────────────────────────────────────────
const PRIORITY_CLASSES: Record<string, string> = {
  Low:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-orange-100  text-orange-700  border-orange-200",
  High:   "bg-red-100     text-red-700     border-red-200",
};
const PRIORITY_DOT: Record<string, string> = {
  Low:    "bg-emerald-500",
  Medium: "bg-orange-500",
  High:   "bg-red-500",
};

function cleanDescription(raw: string): string {
  return raw
    .replace(/\[Priority:[^\]]*\]/g, "")
    .replace(/\[Platform:[^\]]*\]/g, "")
    .trim();
}

// ── Status helpers ─────────────────────────────────────────────────────────────
function StatusBadge({ progress }: { progress: number }) {
  if (progress === 100) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3 h-3" /> Completed
      </span>
    );
  }
  if (progress > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3" /> In Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
      <Minus className="w-3 h-3" /> To Do
    </span>
  );
}

// ── List view ──────────────────────────────────────────────────────────────────
function ListView({
  projects,
  isTeacher,
}: {
  projects: Project[];
  isTeacher: boolean;
}) {
  // Debug: log completed projects so we can verify end_date is populated
  if (typeof window !== "undefined") {
    const completed = projects.filter((p) => p.progress_percentage === 100);
    if (completed.length > 0) {
      console.log("[ListView] Completed projects:", completed.map((p) => ({ id: p.id, title: p.title, end_date: p.end_date })));
    }
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_140px_100px_120px_40px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project Name</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Priority</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bitiş Tarihi</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 28 }}
            className="grid grid-cols-[1fr_140px_100px_120px_40px] gap-4 px-5 py-3.5 items-center hover:bg-slate-50/80 transition-colors group"
          >
            {/* Name */}
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                {project.title}
              </p>
              {isTeacher && project.profiles?.full_name && (
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                  {project.profiles.full_name}
                </p>
              )}
              {project.description && cleanDescription(project.description) && (
                <p className="text-[11px] text-slate-400 mt-0.5 truncate hidden sm:block">
                  {cleanDescription(project.description)}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <StatusBadge progress={project.progress_percentage} />
            </div>

            {/* Priority — dynamic color */}
            <div>
              {(() => {
                const p = project.priority ?? "Medium";
                const cls = PRIORITY_CLASSES[p] ?? PRIORITY_CLASSES["Medium"];
                const dot = PRIORITY_DOT[p]    ?? PRIORITY_DOT["Medium"];
                return (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${dot}`} />
                    {p}
                  </span>
                );
              })()}
            </div>

            {/* Completion date — with fallback chain: end_date → updated_at → created_at */}
            <div>
              {project.progress_percentage === 100 ? (
                (() => {
                  const dateStr = project.end_date || project.updated_at || project.created_at;
                  return dateStr ? (
                    <span className="text-xs font-medium text-emerald-600">
                      {new Date(dateStr).toLocaleDateString("tr-TR")}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  );
                })()
              ) : (
                <span className="text-xs text-slate-300">—</span>
              )}
            </div>

            {/* Link */}
            <div>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="p-1.5 rounded-lg text-slate-300 hover:text-violet-600 hover:bg-violet-50 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            {projects.filter((p) => p.progress_percentage === 100).length} completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            {projects.filter((p) => p.progress_percentage > 0 && p.progress_percentage < 100).length} in review
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            {projects.filter((p) => p.progress_percentage === 0).length} to do
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  projects: Project[];
  isTeacher: boolean;
  isStudent: boolean;
  watchedIds: Set<string>;
  projectNotes: Record<string, { content: string; teacherName?: string }>;
  currentUserId?: string;
}

export default function DashboardViewSwitcher({
  projects,
  isTeacher,
  isStudent,
  watchedIds,
  projectNotes,
  currentUserId,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  return (
    <>
      {/* ── Controls row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              viewMode === "kanban"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" />
            </svg>
            Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              viewMode === "list"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </svg>
            List
          </button>
        </div>

        {/* Search + Filter + New */}
        <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
          <Suspense fallback={<div className="w-56 h-9 bg-slate-100 animate-pulse rounded-2xl" />}>
            <GlobalSearch />
          </Suspense>

          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>

          {isStudent && (
            <Link
              href="/dashboard/projects/new"
              className="btn-aura flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl shrink-0 active:scale-95 overflow-hidden"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              New
            </Link>
          )}
        </div>
      </div>

      {/* ── View content with AnimatePresence transition ───────────────────── */}
      <div className="relative mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {viewMode === "kanban" ? (
              <KanbanBoard
                projects={projects}
                isTeacher={isTeacher}
                watchedIds={watchedIds}
                projectNotes={projectNotes}
                currentUserId={currentUserId}
              />
            ) : (
              <ListView projects={projects} isTeacher={isTeacher} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
