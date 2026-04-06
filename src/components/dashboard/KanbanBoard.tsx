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
} from "lucide-react";
import Link from "next/link";
import { updateProgress, deleteProjectAction } from "@/app/dashboard/actions";
import { toggleWatchlistAction, addQuickNoteAction, deleteQuickNoteAction } from "@/lib/actions";
import AnimatedProgressBar from "@/components/ui/AnimatedProgressBar";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────────
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
  profiles?: { full_name: string };
};

// ── Priority badge helpers ─────────────────────────────────────────────────────
const PRIORITY_CLASSES: Record<string, { badge: string; dot: string }> = {
  Low:    { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Medium: { badge: "bg-orange-100  text-orange-700  border-orange-200",  dot: "bg-orange-500"  },
  High:   { badge: "bg-red-100     text-red-700     border-red-200",     dot: "bg-red-500"     },
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
// Never silently default to "Medium" — return null if genuinely unknown
function getPriority(project: { priority?: string | null; description?: string | null }): string | null {
  if (project.priority?.trim()) return project.priority.trim();
  const match = (project.description ?? "").match(/\[Priority:\s*([^\]]+)\]/i);
  return match ? match[1].trim() : null;
}

function strHash(s: string) {
  return s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

// ── Avatar group helpers ───────────────────────────────────────────────────────
const AVATAR_COLORS = ["#7C3AFF", "#FF7F50", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"];
function avatarColor(seed: string) {
  return AVATAR_COLORS[strHash(seed) % AVATAR_COLORS.length];
}

// ── KanbanCard ────────────────────────────────────────────────────────────────
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
  // savedProgress = last value confirmed in DB; compared against localProgress
  // to detect unsaved changes without being affected by Next.js revalidations.
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

  // Warn before navigating away with unsaved progress changes.
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const rawPriority       = getPriority(project);
  const priorityLabel     = rawPriority ?? "Medium";
  const priorityClasses   = getPriorityClasses(rawPriority);
  const displayDescription = cleanDescription(project.description ?? "");
  const canAddNote  = currentUserId === project.student_id;
  const idSum       = strHash(project.id);
  const attachCount = (idSum % 5) + 1;
  const commentCount = ((idSum >> 2) % 6) + 1;
  const studentName = project.profiles?.full_name || "?";

  const handleSave = async () => {
    if (!hasUnsavedChanges || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      if (localProgress === 100 && savedProgress !== 100) {
        toast.success("Congratulations! Project completed!", {
          icon: "🎉",
          style: { borderRadius: "12px", background: "#1e293b", color: "#e2e8f0", border: "1px solid #7C3AFF" },
        });
        import("canvas-confetti").then((m) =>
          m.default({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#7C3AFF", "#FF7F50", "#A020F0"] })
        );
      }
      const formData = new FormData();
      formData.set("id", project.id);
      formData.set("progress", String(localProgress));
      await updateProgress(formData);
      setSavedProgress(localProgress);
      setSaveStatus("done");
      setTimeout(() => setSaveStatus("idle"), 1000);
      if (localProgress !== 100) {
        toast.success("Saved!", {
          style: { borderRadius: "10px", background: "#1e293b", color: "#e2e8f0", fontSize: "13px", fontWeight: "bold" },
        });
      }
    } catch {
      toast.error("Failed to save progress");
      setLocalProgress(savedProgress);
      setSaveStatus("idle");
    }
  };

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
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer"
      whileHover={{ y: -2, boxShadow: "0 8px 24px -4px rgba(124,58,255,0.12), 0 0 0 1px rgba(124,58,255,0.10)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => setIsExpanded((v) => !v)}
    >
      <div className="p-4">
        {/* Tags row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Priority badge — dynamic color */}
          <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${priorityClasses.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${priorityClasses.dot}`} />
            {priorityLabel}
          </span>
          {/* Platform badge — extracted from field or description metadata */}
          {getPlatform(project) && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-indigo-100 text-indigo-700 border-indigo-200 truncate max-w-[110px]">
              {getPlatform(project)}
            </span>
          )}
          {isTeacher && project.profiles?.full_name && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 truncate max-w-[100px]">
              {project.profiles.full_name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-sm mb-1.5 leading-snug line-clamp-2">
          {project.title}
        </h3>

        {/* Description snippet — cleaned of embedded metadata tags */}
        {displayDescription && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
            {displayDescription}
          </p>
        )}

        {/* Dates — only rendered when at least one date exists */}
        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-medium">
            <Flag className="w-3 h-3 shrink-0" />
            {project.start_date && (
              <span>{new Date(project.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            )}
            {project.start_date && project.end_date && (
              <span className="text-slate-300">→</span>
            )}
            {project.end_date && (
              <span>{new Date(project.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            )}
          </div>
        )}

        {/* Footer: stats + expand toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {commentCount}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleWatch(); }}
              className="p-1 rounded-full transition-colors hover:text-violet-600"
              style={{ color: isWatched ? "#7C3AFF" : undefined }}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isWatched ? "currentColor" : "none"} />
            </button>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-slate-300"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Expanded detail panel ─────────────────────────────────────────── */}
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
              className="px-4 pb-4 border-t border-slate-100 pt-3 flex flex-col gap-3"
            >
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                  <span className="text-xs font-extrabold text-violet-600">{localProgress}%</span>
                </div>
                <AnimatedProgressBar progress={localProgress} isCompleted={isCompleted} className="h-1.5" />
              </div>

              {/* Progress slider for students */}
              {!isTeacher && (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <AnimatePresence>
                      {isDragging && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.9 }}
                          className="absolute -top-7 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none z-20 text-white bg-violet-600"
                          style={{ left: `${localProgress}%`, transform: "translateX(-50%)" }}
                        >
                          {localProgress}%
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={localProgress}
                      onChange={(e) => setLocalProgress(parseInt(e.target.value))}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      onTouchStart={() => setIsDragging(true)}
                      onTouchEnd={() => setIsDragging(false)}
                      className="
                        w-full cursor-grab active:cursor-grabbing appearance-none
                        [&::-webkit-slider-runnable-track]:h-1.5
                        [&::-webkit-slider-runnable-track]:rounded-full
                        [&::-webkit-slider-runnable-track]:bg-slate-200
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:-mt-[5px]
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-violet-600
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:cursor-grab
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-track]:h-1.5
                        [&::-moz-range-track]:rounded-full
                        [&::-moz-range-track]:bg-slate-200
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-violet-600
                        [&::-moz-range-thumb]:border-none
                        [&::-moz-range-thumb]:shadow-md
                        [&::-moz-range-progress]:bg-violet-600
                        [&::-moz-range-progress]:rounded-full
                        [&::-moz-range-progress]:h-1.5
                      "
                      style={{
                        background: `linear-gradient(to right, #7C3AFF 0%, #7C3AFF ${localProgress}%, #e2e8f0 ${localProgress}%, #e2e8f0 100%)`,
                      }}
                    />
                  </div>

                  {/* Save button — only triggered on click, never on slider events */}
                  <motion.button
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || saveStatus === "saving"}
                    animate={hasUnsavedChanges && saveStatus === "idle"
                      ? { boxShadow: ["0 0 0px rgba(124,58,255,0)", "0 0 10px rgba(124,58,255,0.55)", "0 0 0px rgba(124,58,255,0)"] }
                      : { boxShadow: "0 0 0px rgba(124,58,255,0)" }
                    }
                    transition={{ duration: 1.4, repeat: hasUnsavedChanges && saveStatus === "idle" ? Infinity : 0, ease: "easeInOut" }}
                    whileTap={{ scale: 0.93 }}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                      saveStatus === "saving"
                        ? "bg-violet-400 text-white cursor-wait"
                        : saveStatus === "done"
                          ? "bg-emerald-500 text-white"
                          : hasUnsavedChanges
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : "bg-slate-100 text-slate-400 cursor-default"
                    }`}
                  >
                    {saveStatus === "saving" && <Loader2 className="w-3 h-3 animate-spin" />}
                    {saveStatus === "done"   && <Check   className="w-3 h-3" />}
                    {saveStatus === "idle"   && <Save    className="w-3 h-3" />}
                    {saveStatus === "saving" ? "Saving…" : saveStatus === "done" ? "Saved" : "Save"}
                  </motion.button>
                </div>
              )}

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

              {/* Team — only rendered when a real student name is available */}
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
                    <span className="text-xs text-slate-600 font-medium">{studentName}</span>
                  </div>
                </div>
              )}

              {/* Quick private note (student only) */}
              {canAddNote && (
                <div className="rounded-xl p-3 bg-slate-50 border border-slate-200">
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
                            className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 border-none outline-none resize-none"
                          />
                          <div className="flex justify-end gap-2 mt-1">
                            {initialTeacherNote && (
                              <button
                                onClick={() => setIsEditingNote(false)}
                                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
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
                          <p className="text-xs text-slate-700 leading-relaxed">{noteContent}</p>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setIsEditingNote(true)}
                              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
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

// ── Column config ──────────────────────────────────────────────────────────────
const COLUMN_CONFIG = {
  todo: {
    label: "To Do",
    countBg: "#EDE9FE",
    countColor: "#7C3AED",
    borderTop: "#7C3AED",
  },
  inreview: {
    label: "In Review",
    countBg: "#DBEAFE",
    countColor: "#2563EB",
    borderTop: "#2563EB",
  },
  completed: {
    label: "Completed",
    countBg: "#D1FAE5",
    countColor: "#059669",
    borderTop: "#059669",
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
    <div className="flex-1 min-w-[280px] max-w-sm flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 pb-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: cfg.borderTop }}
        />
        <h3 className="text-sm font-bold text-slate-700">{cfg.label}</h3>
        <span
          className="text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ background: cfg.countBg, color: cfg.countColor }}
        >
          {projects.length}
        </span>
      </div>

      {/* Column divider */}
      <div className="h-px w-full rounded-full" style={{ background: cfg.borderTop, opacity: 0.25 }} />

      {/* Cards */}
      <motion.div
        className="flex flex-col gap-3"
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
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
            <p className="text-xs text-slate-400 font-medium">No projects here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
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
  const todo      = projects.filter((p) => p.progress_percentage === 0);
  const inReview  = projects.filter((p) => p.progress_percentage > 0 && p.progress_percentage < 100);
  const completed = projects.filter((p) => p.progress_percentage === 100);

  const common = { isTeacher, watchedIds, projectNotes, currentUserId };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 pt-1 min-h-[400px] items-start">
      <KanbanColumn columnKey="todo"      projects={todo}      {...common} />
      <KanbanColumn columnKey="inreview"  projects={inReview}  {...common} />
      <KanbanColumn columnKey="completed" projects={completed} {...common} />
    </div>
  );
}
