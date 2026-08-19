"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Flag,
  Bookmark,
  Loader2,
  Trash2,
  Save,
  Check,
  Edit3,
  MessageSquarePlus,
  MessageCircle,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { deleteProjectAction } from "@/app/dashboard/actions";
import { toggleWatchlistAction, addQuickNoteAction, deleteQuickNoteAction } from "@/lib/actions";

import toast from "react-hot-toast";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TAG_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-sky-100 text-sky-700 border-sky-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 border-emerald-200",
  "bg-amber-100 text-amber-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-indigo-100 text-indigo-700 border-indigo-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-teal-100 text-teal-700 border-teal-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-orange-100 text-orange-700 border-orange-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
];
function tagColor(tag: string): string {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length];
}

type Project = {
  id: string;
  student_id?: string;
  title: string;
  description: string;
  github_link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  priority?: string | null;
  platform?: string | null;
  progress_percentage: number;
  status?: string;
  tags?: string[];
  profiles?: { full_name: string; avatar_url?: string | null } | null;
};

// â”€â”€ Priority badge helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PRIORITY_CLASSES: Record<string, { badge: string; dot: string }> = {
  Low:    { badge: "bg-teal-50 text-teal-700 border-teal-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",     dot: "bg-teal-500"   },
  Medium: { badge: "bg-amber-50 text-amber-700 border-amber-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",  dot: "bg-amber-500"  },
  High:   { badge: "bg-rose-50 text-rose-700 border-rose-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",   dot: "bg-rose-500"   },
};

function getPriorityClasses(priority?: string | null) {
  return PRIORITY_CLASSES[priority ?? ""] ?? PRIORITY_CLASSES["Medium"];
}

// Strip any bracketed metadata tags embedded in description (e.g. [Priority: High])
function cleanDescription(raw: string): string {
  return raw.replace(/\[.*?\]/g, "").trim();
}

// Extract platform: prefer project.platform field, then fall back to [Platform: ...] in description
function getPlatform(project: { platform?: string | null; description?: string | null }): string | null {
  if (project.platform?.trim()) return project.platform.trim();
  const match = (project.description ?? "").match(/\[Platform:\s*([^\]]+)\]/i);
  return match ? match[1].trim() : null;
}

// Extract priority: prefer project.priority field, then fall back to [Priority: ...] in description
function getPriority(project: { priority?: string | null; description?: string | null }): string | null {
  if (project.priority?.trim()) return project.priority.trim();
  const match = (project.description ?? "").match(/\[Priority:\s*([^\]]+)\]/i);
  return match ? match[1].trim() : null;
}

function strHash(s: string) {
  return s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

// â”€â”€ Avatar group helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AVATAR_COLORS = ["#7C3AFF", "#FF7F50", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];
function avatarColor(seed: string) {
  return AVATAR_COLORS[strHash(seed) % AVATAR_COLORS.length];
}

// â”€â”€ KanbanCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function KanbanCard({
  project,
  isTeacher,
  isWatched: initialIsWatched = false,
  teacherNote: initialTeacherNote = "",
  currentUserId,
}: {
  project: Project;
  isTeacher?: boolean;
  isWatched?: boolean;
  teacherNote?: string;
  teacherNameForNote?: string;
  currentUserId?: string;
}) {
  const [isExpanded,    setIsExpanded]    = useState(false);
  const [localProgress, setLocalProgress] = useState(project.progress_percentage);
  const [savedProgress, setSavedProgress] = useState(project.progress_percentage);
  const [isDragging,    setIsDragging]    = useState(false);
  const [saveStatus,    setSaveStatus]    = useState<"idle" | "saving" | "done">("idle");
  const [isWatched,     setIsWatched]     = useState(initialIsWatched);
  const [noteContent,   setNoteContent]   = useState(initialTeacherNote);
  const [isNoteSaving,  setIsNoteSaving]  = useState(false);
  const [isDeleting,    setIsDeleting]    = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(!initialTeacherNote);

  const isCompleted       = localProgress === 100;
  const hasUnsavedChanges = localProgress !== savedProgress;

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const rawPriority        = getPriority(project);
  const priorityLabel      = rawPriority ?? "Medium";
  const priorityClasses    = getPriorityClasses(rawPriority);
  const displayDescription = cleanDescription(project.description ?? "");
  const canAddNote         = currentUserId === project.student_id;
  const idSum              = strHash(project.id);
  const commentCount       = ((idSum >> 2) % 6) + 1;
  const studentName        = project.profiles?.full_name || "?";

  const handleToggleWatch = async () => {
    const prev = isWatched;
    setIsWatched(!prev);
    try {
      await toggleWatchlistAction(project.id);
      toast.success(!prev ? "Added to Watchlist" : "Removed from Watchlist", {
        style: { borderRadius: "10px", background: "#1e293b", color: "#e2e8f0", fontSize: "13px", fontWeight: "bold" },
      });
    } catch {
      setIsWatched(prev);
      toast.error("An error occurred");
    }
  };

  const saveNote = async () => {
    setIsNoteSaving(true);
    try {
      await addQuickNoteAction(project.id, noteContent);
      setIsEditingNote(false);
      toast.success("Note saved!");
    } catch { toast.error("An error occurred"); }
    finally { setIsNoteSaving(false); }
  };

  const deleteNote = async () => {
    setIsNoteSaving(true);
    try {
      await deleteQuickNoteAction(project.id);
      setNoteContent("");
      setIsEditingNote(true);
      toast.success("Note cleared!");
    } catch { toast.error("An error occurred"); }
    finally { setIsNoteSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteProjectAction(project.id);
      toast.success("Project deleted.");
    } catch {
      toast.error("Failed to delete project");
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer min-h-[160px] flex flex-col"
      whileHover={{ y: -2, boxShadow: "0 8px 24px -4px rgba(124,58,255,0.10), 0 0 0 1px rgba(124,58,255,0.09)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => setIsExpanded((v) => !v)}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Tags row */}
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${priorityClasses.badge}`}>
            <span className={`w-2 h-2 rounded-full inline-block ${priorityClasses.dot}`} />
            {priorityLabel}
          </span>
          {getPlatform(project) && (
            <span className="text-xs font-bold px-3 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80">
              {getPlatform(project)}
            </span>
          )}
          {isTeacher && project.profiles?.full_name && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 truncate max-w-[120px]">
              {project.profiles.full_name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-2 leading-snug line-clamp-2">
          {project.title}
        </h3>

        {/* Description */}
        {displayDescription && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-3 flex-1">
            {displayDescription}
          </p>
        )}

        {/* User tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tagColor(tag)}`}>
                #{tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Dates */}
        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3 font-medium">
            <Flag className="w-3.5 h-3.5 shrink-0 text-slate-300" />
            {project.start_date && (
              <span>{new Date(project.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            )}
            {project.start_date && project.end_date && (
              <span className="text-slate-300">â†’</span>
            )}
            {project.end_date && (
              <span>{new Date(project.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            )}
          </div>
        )}

        {/* Footer: stats + expand toggle */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              {commentCount}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleWatch(); }}
              className="p-1 rounded-full transition-colors hover:text-violet-600"
              style={{ color: isWatched ? "#7C3AFF" : undefined }}
            >
              <Bookmark className="w-4 h-4" fill={isWatched ? "currentColor" : "none"} />
            </button>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-slate-300"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Expanded detail panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: 8 }}
              animate={{ y: 0 }}
              exit={{ y: 8 }}
              transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="px-5 pb-5 border-t border-slate-100 pt-4 flex flex-col gap-4"
            >
              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {project.github_link && (
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" /> Repository
                  </a>
                )}
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
                >
                  View Details
                </Link>
                {currentUserId === project.student_id && (
                  <motion.button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
                  >
                    {isDeleting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </motion.button>
                )}
              </div>

              {/* Team */}
              {project.profiles?.full_name && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Team</p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: avatarColor(studentName.charAt(0)) }}
                    >
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{studentName}</span>
                  </div>
                </div>
              )}

              {/* Quick private note (student only) */}
              {canAddNote && (
                <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200">
                  <div className="flex items-start gap-2">
                    <MessageSquarePlus className="w-4 h-4 shrink-0 mt-0.5 text-violet-500" />
                    <div className="flex-1">
                      {isEditingNote ? (
                        <>
                          <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Quick private note..."
                            rows={2}
                            className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-100 placeholder:text-slate-400 border-none outline-none resize-none"
                          />
                          <div className="flex justify-end gap-2 mt-1">
                            {initialTeacherNote && (
                              <button
                                onClick={() => setIsEditingNote(false)}
                                className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={saveNote}
                              disabled={isNoteSaving || !noteContent.trim()}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg bg-violet-600 text-white disabled:opacity-50 hover:bg-violet-700 transition-colors"
                            >
                              {isNoteSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                              Save
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-start gap-3">
                          <p className="text-xs text-slate-700 dark:text-slate-100 leading-relaxed">{noteContent}</p>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setIsEditingNote(true)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-100 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { if (window.confirm("Delete this note?")) deleteNote(); }}
                              disabled={isNoteSaving}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              {isNoteSaving
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// â”€â”€ Column config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLUMN_CONFIG = {
  todo: {
    label: "To Do",
    countBg: "#EDE9FE",
    countColor: "#7C3AED",
    accentColor: "#7C3AED",
  },
  inreview: {
    label: "In Review",
    countBg: "#DBEAFE",
    countColor: "#2563EB",
    accentColor: "#2563EB",
  },
  completed: {
    label: "Completed",
    countBg: "#D1FAE5",
    countColor: "#059669",
    accentColor: "#059669",
  },
} as const;

type ColumnKey = keyof typeof COLUMN_CONFIG;

function KanbanColumn({
  columnKey,
  projects,
  isTeacher,
  watchedIds,
  projectNotes,
  currentUserId,
}: {
  columnKey: ColumnKey;
  projects: Project[];
  isTeacher: boolean;
  watchedIds: Set<string>;
  projectNotes: Record<string, { content: string; teacherName?: string }>;
  currentUserId?: string;
}) {
  const cfg = COLUMN_CONFIG[columnKey];

  return (
    <div className="min-w-0 flex flex-col gap-4">
      {/* Column header */}
      <div className="flex items-center gap-2.5 px-1 pb-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: cfg.accentColor }}
        />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-100">{cfg.label}</h3>
        <span
          className="text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-0.5 dark:!bg-slate-800 dark:!border dark:!border-slate-700 dark:!text-slate-100"
          style={{ background: cfg.countBg, color: cfg.countColor }}
        >
          {projects.length}
        </span>
      </div>

      {/* Column divider */}
      <div className="h-px w-full rounded-full" style={{ background: cfg.accentColor, opacity: 0.20 }} />

      {/* Cards */}
      <motion.div
        className="flex flex-col gap-3.5"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
        }}
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            variants={{
              hidden: { opacity: 0, y: 18, scale: 0.97 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", stiffness: 280, damping: 26 },
              },
            }}
          >
            <KanbanCard
              project={project}
              isTeacher={isTeacher}
              isWatched={watchedIds.has(project.id)}
              teacherNote={projectNotes[project.id]?.content}
              teacherNameForNote={projectNotes[project.id]?.teacherName}
              currentUserId={currentUserId}
            />
          </motion.div>
        ))}

        {projects.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:bg-slate-950/60 min-h-[160px] flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 flex items-center justify-center shadow-sm">
              <FolderOpen className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium">No projects here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// â”€â”€ Main export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function KanbanBoard({
  projects,
  isTeacher,
  watchedIds,
  projectNotes,
  currentUserId,
}: {
  projects: Project[];
  isTeacher: boolean;
  watchedIds: Set<string>;
  projectNotes: Record<string, { content: string; teacherName?: string }>;
  currentUserId?: string;
}) {
  const todo      = projects.filter((p) => (p.status ?? 'todo') === 'todo');
  const inReview  = projects.filter((p) => { const s = p.status ?? 'todo'; return s === 'in_progress' || s === 'in_review'; });
  const completed = projects.filter((p) => p.status === 'completed');

  const common = { isTeacher, watchedIds, projectNotes, currentUserId };

  return (
    <div className="grid grid-cols-3 gap-6 pb-4 pt-1">
      <KanbanColumn columnKey="todo"      projects={todo}      {...common} />
      <KanbanColumn columnKey="inreview"  projects={inReview}  {...common} />
      <KanbanColumn columnKey="completed" projects={completed} {...common} />
    </div>
  );
}
