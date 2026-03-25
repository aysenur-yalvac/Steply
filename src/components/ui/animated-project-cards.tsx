"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Github, Calendar, CheckCircle, Clock,
  Bookmark, MessageSquarePlus, Loader2, Trash2, Save, Edit3,
} from "lucide-react";
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
  github_link: string;
  start_date: string;
  end_date: string;
  progress_percentage: number;
  profiles?: { full_name: string };
};

type CardProps = {
  project: Project;
  isTeacher?: boolean;
  isWatched?: boolean;
  teacherNote?: string;
  teacherNameForNote?: string;
  currentUserId?: string;
};

// ── Animation variants ─────────────────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 28, mass: 0.8 },
  },
};

const EASE = [0.04, 0.62, 0.23, 0.98] as [number, number, number, number];

const expandVariants = {
  hidden: {
    opacity: 0, height: 0,
    transition: { duration: 0.32, ease: EASE },
  },
  visible: {
    opacity: 1, height: "auto" as const,
    transition: {
      duration: 0.38, ease: EASE,
      staggerChildren: 0.07, delayChildren: 0.08,
    },
  },
};

const childVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
};

// ── Logo initial badge ─────────────────────────────────────────────────────────
const LOGO_COLORS = ["#7C3AFF", "#FF7F50", "#6D28D9", "#A020F0", "#0EA5E9"];
function logoColor(title: string) {
  return LOGO_COLORS[title.charCodeAt(0) % LOGO_COLORS.length];
}

// ── Single card ────────────────────────────────────────────────────────────────
function AnimatedProjectCard({
  project,
  isTeacher,
  isWatched: initialIsWatched = false,
  teacherNote: initialTeacherNote = "",
  currentUserId,
}: CardProps) {
  const [isExpanded,    setIsExpanded]    = useState(false);
  const [localProgress, setLocalProgress] = useState(project.progress_percentage);
  const [isDragging,    setIsDragging]    = useState(false);
  const [isWatched,     setIsWatched]     = useState(initialIsWatched);
  const [noteContent,   setNoteContent]   = useState(initialTeacherNote);
  const [isNoteSaving,  setIsNoteSaving]  = useState(false);
  const [isDeleting,    setIsDeleting]    = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(!initialTeacherNote);

  const isCompleted = localProgress === 100;
  const canAddNote  = currentUserId === project.student_id;
  const bg          = logoColor(project.title);

  const handleUpdate = async (formData: FormData) => {
    if (localProgress === 100 && project.progress_percentage !== 100) {
      toast.success("Congratulations! Flawless execution!", {
        icon: "🎉",
        style: { borderRadius: "16px", background: "#1a0a2e", color: "#e2e8f0", border: "1px solid #A020F0" },
      });
      import("canvas-confetti").then((m) =>
        m.default({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#A020F0", "#FF7F50", "#7C3AFF", "#C97EFF"] })
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
        style: { borderRadius: "12px", background: "#0f1428", color: "#e2e8f0", border: "1px solid rgba(160,32,240,0.3)", fontSize: "13px", fontWeight: "bold" },
      });
    } catch { setIsWatched(prev); toast.error("An error occurred"); }
  };

  const saveNote = async () => {
    setIsNoteSaving(true);
    try {
      await addQuickNoteAction(project.id, noteContent);
      setIsEditingNote(false);
      toast.success("Quick note saved!", {
        style: { borderRadius: "12px", background: "#0f1428", color: "#e2e8f0", border: "1px solid rgba(160,32,240,0.3)", fontSize: "13px", fontWeight: "bold" },
      });
    } catch { toast.error("An error occurred"); }
    finally { setIsNoteSaving(false); }
  };

  const deleteNote = async () => {
    setIsNoteSaving(true);
    try {
      await deleteQuickNoteAction(project.id);
      setNoteContent(""); setIsEditingNote(true);
      toast.success("Note cleared!", {
        style: { borderRadius: "12px", background: "#0f1428", color: "#e2e8f0", border: "1px solid rgba(255,127,80,0.3)", fontSize: "13px", fontWeight: "bold" },
      });
    } catch { toast.error("An error occurred"); }
    finally { setIsNoteSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    setIsDeleting(true);
    try { await deleteProjectAction(project.id); toast.success("Project deleted."); }
    catch { toast.error("Failed to delete project"); setIsDeleting(false); }
  };

  return (
    <div
      className="group relative w-full rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "rgba(15,20,40,0.72)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,255,0.28)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
    >
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,255,0.10) 0%, transparent 70%)" }}
      />

      {/* ── Collapsed header row ──────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none relative z-10"
        onClick={() => setIsExpanded((v) => !v)}
      >
        {/* Logo badge */}
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-extrabold shadow-sm"
          style={{ background: bg }}
        >
          {project.title.charAt(0).toUpperCase()}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="text-sm font-bold text-white tracking-tight truncate">{project.title}</h3>
            {isTeacher && project.profiles?.full_name && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,127,80,0.12)", color: "#FFA880", border: "1px solid rgba(255,127,80,0.20)" }}>
                {project.profiles.full_name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold" style={{ color: "#C97EFF" }}>{localProgress}%</span>
            {isCompleted ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(0,194,203,0.12)", border: "1px solid rgba(0,194,203,0.22)", color: "#00C2CB" }}>
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(255,127,80,0.10)", border: "1px solid rgba(255,127,80,0.20)", color: "#FF9A6C" }}>
                <Clock className="w-3 h-3" /> In Progress
              </span>
            )}
          </div>
        </div>

        {/* Action icons + chevron */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleToggleWatch}
            className="p-1.5 rounded-full transition-all"
            style={{
              background: isWatched ? "rgba(160,32,240,0.85)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isWatched ? "rgba(160,32,240,0.9)" : "rgba(255,255,255,0.10)"}`,
              color: isWatched ? "#fff" : "rgba(255,255,255,0.30)",
            }}
            title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isWatched ? "currentColor" : "none"} strokeWidth={2} />
          </button>

          {currentUserId === project.student_id && (
            <motion.button
              onClick={handleDelete}
              disabled={isDeleting}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-full transition-all disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.30)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.30)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              title="Delete Project"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </motion.button>
          )}
        </div>

        {/* Chevron */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(124,58,255,0.20)" }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); setIsExpanded((v) => !v); }}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.50)" }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Expanded content ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-4 relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

              {/* Description */}
              {project.description && (
                <motion.p variants={childVariants} className="text-slate-400 text-sm leading-relaxed pt-3">
                  {project.description}
                </motion.p>
              )}

              {/* Meta chips */}
              <motion.div variants={childVariants} className="flex flex-wrap gap-2 text-xs">
                {project.end_date && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-medium text-slate-400">
                      {new Date(project.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}
                {project.github_link && (
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all"
                    style={{ background: "rgba(255,127,80,0.08)", border: "1px solid rgba(255,127,80,0.18)", color: "#FFA880" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,127,80,0.14)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,127,80,0.08)")}
                  >
                    <Github className="w-3.5 h-3.5" /> Repository
                  </a>
                )}
              </motion.div>

              {/* Progress bar + slider */}
              <motion.div variants={childVariants} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Progress</span>
                  <span className="text-xs font-extrabold" style={{ color: "#C97EFF" }}>{localProgress}%</span>
                </div>

                <AnimatedProgressBar progress={localProgress} isCompleted={isCompleted} className="h-1.5" />

                <div className="flex gap-3 items-center mt-1">
                  {!isTeacher ? (
                    <form action={handleUpdate} className="flex gap-3 items-center flex-1">
                      <input type="hidden" name="id" value={project.id} />
                      <div className="relative flex-1">
                        <AnimatePresence>
                          {isDragging && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              className="absolute -top-9 text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none z-20 text-white"
                              style={{ left: `${localProgress}%`, transform: "translateX(-50%)", background: "rgba(124,58,255,0.9)" }}
                            >
                              {localProgress}%
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <input
                          type="range"
                          name="progress"
                          min="0" max="100" step="5"
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
                        className="text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 text-white"
                        style={{ background: "rgba(124,58,255,0.22)", border: "1px solid rgba(124,58,255,0.32)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,255,0.38)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124,58,255,0.22)")}
                      >
                        Update
                      </button>
                    </form>
                  ) : <div className="flex-1" />}

                  <a
                    href={`/dashboard/projects/${project.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[13px] font-bold px-4 py-2 rounded-xl transition-all text-center tracking-wide shrink-0"
                    style={{ background: "rgba(124,58,255,0.12)", border: "1px solid rgba(124,58,255,0.24)", color: "#C97EFF" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,255,0.22)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124,58,255,0.12)")}
                  >
                    View Details
                  </a>
                </div>
              </motion.div>

              {/* Quick private note (student only) */}
              {canAddNote && (
                <motion.div
                  variants={childVariants}
                  className="rounded-xl p-2.5 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${isEditingNote ? "rgba(124,58,255,0.25)" : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquarePlus className="w-4 h-4 shrink-0 mt-1.5" style={{ color: "#7C3AFF" }} />
                    <div className="flex-1 flex flex-col gap-2">
                      {isEditingNote ? (
                        <>
                          <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Quick private note..."
                            rows={1}
                            className="w-full bg-transparent border-none p-1.5 focus:ring-0 resize-y text-xs text-slate-300 font-medium placeholder:text-slate-600 min-h-[36px] outline-none"
                          />
                          <div className="flex justify-end gap-2 items-center">
                            {initialTeacherNote && (
                              <button onClick={() => setIsEditingNote(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors">
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={saveNote}
                              disabled={isNoteSaving || !noteContent.trim() || noteContent === initialTeacherNote}
                              className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-all"
                              style={{ background: "rgba(124,58,255,0.80)" }}
                            >
                              {isNoteSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-start gap-4 p-1">
                          <p className="text-sm font-medium text-slate-300 whitespace-pre-wrap">{noteContent}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => setIsEditingNote(true)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors" title="Edit Note">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { if (window.confirm("Delete this note?")) deleteNote(); }}
                              disabled={isNoteSaving}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors" title="Delete Note"
                            >
                              {isNoteSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── List wrapper with stagger ──────────────────────────────────────────────────
export function AnimatedProjectCards({
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
  return (
    <motion.div
      className="flex flex-col gap-4 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.08 + 0.15 }}
        >
          <AnimatedProjectCard
            project={project}
            isTeacher={isTeacher}
            isWatched={watchedIds.has(project.id)}
            teacherNote={projectNotes[project.id]?.content}
            teacherNameForNote={projectNotes[project.id]?.teacherName}
            currentUserId={currentUserId}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
