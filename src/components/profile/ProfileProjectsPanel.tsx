"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, FolderOpen, ExternalLink } from "lucide-react";
import AnimatedProgressBar from "@/components/ui/AnimatedProgressBar";

// ── Types ──────────────────────────────────────────────────────────────────────
type Project = {
  id: string;
  title: string;
  description: string | null;
  progress_percentage: number;
};

type FilterState = "all" | "completed" | "inprogress";

const FILTERS: { key: FilterState; label: string }[] = [
  { key: "all",        label: "All"         },
  { key: "completed",  label: "Completed"   },
  { key: "inprogress", label: "In Progress" },
];

function cleanDesc(raw: string) {
  return raw.replace(/\[.*?\]/g, "").trim();
}

// ── Individual project card ────────────────────────────────────────────────────
function ProfileProjectCard({ project }: { project: Project }) {
  const isCompleted = project.progress_percentage === 100;
  const desc = cleanDesc(project.description ?? "");

  return (
    <motion.div
      layout
      whileHover={{ y: -2, boxShadow: "0 8px 24px -4px rgba(124,58,255,0.10), 0 0 0 1px rgba(124,58,255,0.09)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[160px]"
    >
      {/* ── Card body ───────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-3.5">
          {isCompleted ? (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-teal-50 text-teal-700 border-teal-200">
              <CheckCircle className="w-3.5 h-3.5" /> Completed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
              <Clock className="w-3.5 h-3.5" /> In Progress
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-base mb-2 leading-snug line-clamp-2">
          {project.title}
        </h3>

        {/* Description */}
        {desc && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 flex-1">
            {desc}
          </p>
        )}
      </div>

      {/* ── Progress + action ────────────────────────────────────────────── */}
      <div className="px-5 pb-5 border-t border-slate-100 pt-4 flex flex-col gap-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Progress
            </span>
            <span className="text-xs font-extrabold text-violet-600">
              {project.progress_percentage}%
            </span>
          </div>
          <AnimatedProgressBar
            progress={project.progress_percentage}
            isCompleted={isCompleted}
            className="h-2"
          />
        </div>
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors w-fit"
        >
          <ExternalLink className="w-3 h-3" /> View Details
        </Link>
      </div>
    </motion.div>
  );
}

// ── Empty state for a column / section ────────────────────────────────────────
function EmptySlot({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 min-h-[160px] flex flex-col items-center justify-center gap-3 p-6">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
        <FolderOpen className="w-6 h-6 text-slate-300" />
      </div>
      <p className="text-sm text-slate-400 font-medium">No {label} projects</p>
    </div>
  );
}

// ── Column header (mirrors KanbanColumn header style) ─────────────────────────
function ColumnHeader({
  label,
  count,
  dotColor,
  countBg,
  countColor,
}: {
  label: string;
  count: number;
  dotColor: string;
  countBg: string;
  countColor: string;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2.5 px-1">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dotColor }} />
        <h3 className="text-base font-bold text-slate-700">{label}</h3>
        <span
          className="text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: countBg, color: countColor }}
        >
          {count}
        </span>
      </div>
      <div className="h-px w-full rounded-full" style={{ background: dotColor, opacity: 0.20 }} />
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function ProfileProjectsPanel({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<FilterState>("all");

  const completed  = projects.filter((p) => p.progress_percentage === 100);
  const inProgress = projects.filter((p) => p.progress_percentage < 100);

  const filteredSingle =
    filter === "completed"  ? completed  :
    filter === "inprogress" ? inProgress :
    projects;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                filter === key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Summary counts */}
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
            {completed.length} completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            {inProgress.length} in progress
          </span>
        </div>
      </div>

      {/* ── View ────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {filter === "all" ? (
          /* Two-column layout mirroring Kanban board */
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Completed column */}
            <div className="flex flex-col gap-4">
              <ColumnHeader
                label="Completed"
                count={completed.length}
                dotColor="#14b8a6"
                countBg="#CCFBF1"
                countColor="#0d9488"
              />
              <motion.div
                className="flex flex-col gap-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
              >
                {completed.length > 0
                  ? completed.map((p) => (
                      <motion.div
                        key={p.id}
                        variants={{
                          hidden:   { opacity: 0, y: 18, scale: 0.97 },
                          visible:  { opacity: 1, y: 0,  scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
                        }}
                      >
                        <ProfileProjectCard project={p} />
                      </motion.div>
                    ))
                  : <EmptySlot label="completed" />
                }
              </motion.div>
            </div>

            {/* In Progress column */}
            <div className="flex flex-col gap-4">
              <ColumnHeader
                label="In Progress"
                count={inProgress.length}
                dotColor="#3b82f6"
                countBg="#DBEAFE"
                countColor="#2563EB"
              />
              <motion.div
                className="flex flex-col gap-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
              >
                {inProgress.length > 0
                  ? inProgress.map((p) => (
                      <motion.div
                        key={p.id}
                        variants={{
                          hidden:   { opacity: 0, y: 18, scale: 0.97 },
                          visible:  { opacity: 1, y: 0,  scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
                        }}
                      >
                        <ProfileProjectCard project={p} />
                      </motion.div>
                    ))
                  : <EmptySlot label="in-progress" />
                }
              </motion.div>
            </div>
          </motion.div>

        ) : (
          /* Single filtered grid */
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {filteredSingle.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredSingle.map((p) => (
                  <ProfileProjectCard key={p.id} project={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 min-h-[200px] flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <FolderOpen className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  No {filter === "completed" ? "completed" : "in-progress"} projects found.
                </p>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
