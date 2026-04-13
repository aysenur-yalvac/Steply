"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, SlidersHorizontal, CheckCircle, Clock, Minus, ExternalLink, X } from "lucide-react";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { GooeySearchBar } from "@/components/ui/animated-search-bar";

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

type Filters = {
  status: string[];
  priority: string[];
};

// ── Filter constants ───────────────────────────────────────────────────────────
const STATUS_OPTIONS  = ["To Do", "In Review", "Completed"] as const;
const PRIORITY_OPTIONS = ["Low", "Medium", "High"]          as const;

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

// ── Helpers ────────────────────────────────────────────────────────────────────
function projectStatus(p: Project): string {
  if (p.progress_percentage === 100) return "Completed";
  if (p.progress_percentage > 0)     return "In Review";
  return "To Do";
}

// Mirror KanbanBoard's getPriority: column first, then [Priority: X] in description,
// then "Medium" as display default — so filter always matches the visible badge.
function getEffectivePriority(p: Project): string {
  if (p.priority?.trim()) return p.priority.trim();
  const match = (p.description ?? "").match(/\[Priority:\s*([^\]]+)\]/i);
  if (match) return match[1].trim();
  return "Medium";
}

function applyFilters(projects: Project[], filters: Filters): Project[] {
  return projects.filter((p) => {
    if (filters.status.length > 0 && !filters.status.includes(projectStatus(p))) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(getEffectivePriority(p))) return false;
    return true;
  });
}

function cleanDescription(raw: string): string {
  return raw.replace(/\[.*?\]/g, "").trim();
}

// ── Status badge ───────────────────────────────────────────────────────────────
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

// ── Filter Dropdown ────────────────────────────────────────────────────────────
function FilterDropdown({
  filters,
  onToggle,
  onClear,
}: {
  filters: Filters;
  onToggle: (group: keyof Filters, value: string) => void;
  onClear: () => void;
}) {
  const total = filters.status.length + filters.priority.length;

  const statusMeta: Record<string, { icon: React.ReactNode; color: string }> = {
    "To Do":     { icon: <Minus className="w-3 h-3" />,       color: "text-slate-500"  },
    "In Review": { icon: <Clock className="w-3 h-3" />,       color: "text-blue-600"   },
    "Completed": { icon: <CheckCircle className="w-3 h-3" />, color: "text-emerald-600" },
  };

  return (
    <div className="w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filters</span>
        {total > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Status */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
        <div className="flex flex-col gap-1.5">
          {STATUS_OPTIONS.map((opt) => {
            const checked = filters.status.includes(opt);
            const meta = statusMeta[opt];
            return (
              <label
                key={opt}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <div
                  onClick={() => onToggle("status", opt)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    checked
                      ? "bg-violet-600 border-violet-600"
                      : "border-slate-300 bg-white group-hover:border-violet-400"
                  }`}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`${meta.color} flex items-center gap-1.5 text-sm font-medium`}>
                  {meta.icon} {opt}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mx-4 my-1 border-t border-slate-100" />

      {/* Priority */}
      <div className="px-4 pt-2 pb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Priority</p>
        <div className="flex flex-col gap-1.5">
          {PRIORITY_OPTIONS.map((opt) => {
            const checked = filters.priority.includes(opt);
            const dot = PRIORITY_DOT[opt];
            return (
              <label
                key={opt}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <div
                  onClick={() => onToggle("priority", opt)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    checked
                      ? "bg-violet-600 border-violet-600"
                      : "border-slate-300 bg-white group-hover:border-violet-400"
                  }`}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <span className={`w-2 h-2 rounded-full inline-block ${dot}`} />
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer: active count */}
      {total > 0 && (
        <div className="px-4 py-2.5 bg-violet-50 border-t border-violet-100 text-[11px] text-violet-600 font-semibold text-center">
          {total} filter{total !== 1 ? "s" : ""} active
        </div>
      )}
    </div>
  );
}

// ── List view ──────────────────────────────────────────────────────────────────
function ListView({ projects, isTeacher }: { projects: Project[]; isTeacher: boolean }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-[1fr_140px_100px_120px_40px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project Name</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Priority</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bitiş Tarihi</span>
        <span />
      </div>

      <AnimatePresence initial={false}>
        <div className="divide-y divide-slate-50">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
              layout
              transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 28 }}
              className="grid grid-cols-[1fr_140px_100px_120px_40px] gap-4 px-5 py-3.5 items-center hover:bg-slate-50/80 transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate leading-tight">{project.title}</p>
                {isTeacher && project.profiles?.full_name && (
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{project.profiles.full_name}</p>
                )}
                {project.description && cleanDescription(project.description) && (
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate hidden sm:block">
                    {cleanDescription(project.description)}
                  </p>
                )}
              </div>
              <div><StatusBadge progress={project.progress_percentage} /></div>
              <div>
                {(() => {
                  const p   = getEffectivePriority(project);
                  const cls = PRIORITY_CLASSES[p] ?? PRIORITY_CLASSES["Medium"];
                  const dot = PRIORITY_DOT[p]    ?? PRIORITY_DOT["Medium"];
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dot}`} /> {p}
                    </span>
                  );
                })()}
              </div>
              <div>
                {project.progress_percentage === 100 ? (() => {
                  const dateStr = project.end_date || project.updated_at || project.created_at;
                  return dateStr ? (
                    <span className="text-xs font-medium text-emerald-600">
                      {new Date(dateStr).toLocaleDateString("tr-TR")}
                    </span>
                  ) : <span className="text-xs text-slate-300">—</span>;
                })() : <span className="text-xs text-slate-300">—</span>}
              </div>
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
      </AnimatePresence>

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
  const [viewMode,    setViewMode]    = useState<ViewMode>("kanban");
  const [filters,     setFilters]     = useState<Filters>({ status: [], priority: [] });
  const [filterOpen,  setFilterOpen]  = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handle = (e: MouseEvent) => {
      if (!filterRef.current?.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [filterOpen]);

  const toggleFilter = (group: keyof Filters, value: string) => {
    setFilters((prev) => {
      const arr = prev[group];
      return {
        ...prev,
        [group]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const clearFilters = () => setFilters({ status: [], priority: [] });

  const activeCount     = filters.status.length + filters.priority.length;
  const filteredProjects = applyFilters(projects, filters);

  return (
    <>
      {/* ── Controls row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* View tabs */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              viewMode === "kanban" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
            className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              viewMode === "list" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
          <GooeySearchBar />

          {/* Filter button + dropdown */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all shrink-0 ${
                activeCount > 0
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200"
                  : "text-slate-600 border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {activeCount > 0 && (
                <span className="ml-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white text-violet-700 text-[10px] font-black leading-none">
                  {activeCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 9999 }}
                >
                  <FilterDropdown
                    filters={filters}
                    onToggle={toggleFilter}
                    onClear={clearFilters}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isStudent && (
            <Link
              href="/dashboard/projects/new"
              className="btn-aura flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl shrink-0 active:scale-95 overflow-hidden"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              New
            </Link>
          )}
        </div>
      </div>

      {/* ── Active filter chips ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 flex-wrap overflow-hidden"
          >
            {[...filters.status, ...filters.priority].map((chip) => (
              <motion.span
                key={chip}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200"
              >
                {chip}
                <button
                  onClick={() => {
                    if ((STATUS_OPTIONS as readonly string[]).includes(chip)) toggleFilter("status", chip);
                    else toggleFilter("priority", chip);
                  }}
                  className="hover:text-violet-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state when filters match nothing ─────────────────────────── */}
      <AnimatePresence>
        {filteredProjects.length === 0 && activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-col items-center gap-3 py-16 text-slate-400"
          >
            <SlidersHorizontal className="w-8 h-8 opacity-30" />
            <p className="text-sm font-medium">No projects match the active filters.</p>
            <button onClick={clearFilters} className="text-xs font-semibold text-violet-600 hover:underline">
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View content ───────────────────────────────────────────────────── */}
      {filteredProjects.length > 0 && (
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
                  projects={filteredProjects}
                  isTeacher={isTeacher}
                  watchedIds={watchedIds}
                  projectNotes={projectNotes}
                  currentUserId={currentUserId}
                />
              ) : (
                <ListView projects={filteredProjects} isTeacher={isTeacher} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
