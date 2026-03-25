"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Flag,
  Bookmark,
  Loader2,
  Trash2,
  Save,
  Edit3,
  MessageSquarePlus,
  Paperclip,
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
  progress_percentage: number;
  profiles?: { full_name: string };
};

// ── Platform tag helpers ───────────────────────────────────────────────────────
const PLATFORMS = ["Mobile", "Desktop", "Web", "API"] as const;
const PLATFORM_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Mobile:  { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  Desktop: { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
  Web:     { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  API:     { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
};

function strHash(s: string) {
  return s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function getPlatform(id: string) {
  return PLATFORMS[strHash(id) % PLATFORMS.length];
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
  const [isDragging,    setIsDragging]    = useState(false);
  const [isWatched,     setIsWatched]     = useState(initialIsWatched);
  const [noteContent,   setNoteContent]   = useState(initialTeacherNote);
  const [isNoteSaving,  setIsNoteSaving]  = useState(false);
  const [isDeleting,    setIsDeleting]    = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(!initialTeacherNote);

  const isCompleted = localProgress === 100;
  const platform = getPlatform(project.id);
  const platformStyle = PLATFORM_STYLES[platform];
  const canAddNote = currentUserId === project.student_id;
  const idSum = strHash(project.id);
  const attachCount = (idSum % 5) + 1;
  const commentCount = ((idSum >> 2) % 6) + 1;
  const studentName = project.profiles?.full_name || "S";

  const avatarInitials = [
    studentName.charAt(0).toUpperCase(),
    String.fromCharCode(65 + (idSum % 26)),
  ];

  const handleUpdate = async (formData: FormData) => {
    if (localProgress === 100 && project.progress_percentage !== 100) {
      toast.success("Congratulations! Project completed!", {
        icon: "🎉",
        style: { borderRadius: "12px", background: "#1e293b", color: "#e2e8f0", border: "1px solid #7C3AFF" },
      });
      import("canvas-confetti").then((m) =>
        m.default({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#7C3AFF", "#FF7F50", "#A020F0"] })
      );
    }
    await updateProgress(formData);
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
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
            style={{ background: platformStyle.bg, color: platformStyle.text, borderColor: platformStyle.border }}
          >
            {platform}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
            High
          </span>
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

        {/* Description snippet */}
        {project.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Due date */}
        {project.end_date && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 font-medium">
            <Flag className="w-3 h-3" />
            {new Date(project.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </div>
        )}

        {/* Footer: stats + expand toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              {attachCount}
            </span>
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
                <form action={handleUpdate} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={project.id} />
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
                      name="progress"
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
                      className="w-full cursor-grab active:cursor-grabbing h-1.5 rounded-lg appearance-none"
                      style={{ accentColor: "#7C3AFF" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 active:scale-95 transition-all shrink-0"
                  >
                    Save
                  </button>
                </form>
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

              {/* Team */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Team</p>
                <div className="flex items-center gap-3">
                  {avatarInitials.map((initial, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: avatarColor(initial + String(i)) }}
                      >
                        {initial}
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        {i === 0 ? studentName : "Member"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

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
