'use client';

import React, { useState } from 'react';
import { Github, Calendar, CheckCircle, Clock, Bookmark, MessageSquarePlus, Loader2, Trash2, Save, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProgress, deleteProjectAction } from './actions';
import { toggleWatchlistAction, addQuickNoteAction, deleteQuickNoteAction } from '@/lib/actions';
import AnimatedProgressBar from '@/components/ui/AnimatedProgressBar';
import toast from 'react-hot-toast';

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

export default function ProjectCard({
  project,
  isTeacher,
  isWatched: initialIsWatched = false,
  teacherNote: initialTeacherNote = '',
  teacherNameForNote,
  currentUserId,
}: {
  project: Project;
  isTeacher?: boolean;
  isWatched?: boolean;
  teacherNote?: string;
  teacherNameForNote?: string;
  currentUserId?: string;
}) {
  const [localProgress, setLocalProgress] = useState(project.progress_percentage);
  const [isDragging,    setIsDragging]    = useState(false);
  const [isWatched,     setIsWatched]     = useState(initialIsWatched);
  const [noteContent,   setNoteContent]   = useState(initialTeacherNote);
  const [isNoteSaving,  setIsNoteSaving]  = useState(false);
  const [isDeleting,    setIsDeleting]    = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(!initialTeacherNote);

  const isCompleted = localProgress === 100;
  const canAddNote  = currentUserId === project.student_id;

  const handleUpdate = async (formData: FormData) => {
    if (localProgress === 100 && project.progress_percentage !== 100) {
      toast.success("Congratulations! Flawless execution!", {
        icon: '🎉',
        style: { borderRadius: '16px', background: '#1a0a2e', color: '#e2e8f0', border: '1px solid #A020F0' },
      });
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A020F0', '#FF7F50', '#7C3AFF', '#C97EFF'],
        });
      });
    }
    await updateProgress(formData);
  };

  const handleToggleWatch = async () => {
    const prev = isWatched;
    setIsWatched(!prev);
    try {
      await toggleWatchlistAction(project.id);
      toast.success(!prev ? "Added to Watchlist" : "Removed from Watchlist", {
        style: { borderRadius: '12px', background: '#0f1428', color: '#e2e8f0', border: '1px solid rgba(160,32,240,0.3)', fontSize: '13px', fontWeight: 'bold' },
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
      toast.success("Quick note saved!", {
        style: { borderRadius: '12px', background: '#0f1428', color: '#e2e8f0', border: '1px solid rgba(160,32,240,0.3)', fontSize: '13px', fontWeight: 'bold' },
      });
    } catch { toast.error("An error occurred"); }
    finally { setIsNoteSaving(false); }
  };

  const deleteNote = async () => {
    setIsNoteSaving(true);
    try {
      await deleteQuickNoteAction(project.id);
      setNoteContent('');
      setIsEditingNote(true);
      toast.success("Note cleared!", {
        style: { borderRadius: '12px', background: '#0f1428', color: '#e2e8f0', border: '1px solid rgba(255,127,80,0.3)', fontSize: '13px', fontWeight: 'bold' },
      });
    } catch { toast.error("An error occurred"); }
    finally { setIsNoteSaving(false); }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await deleteProjectAction(project.id);
        toast.success("Project deleted.");
      } catch {
        toast.error("Failed to delete project");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      className="group relative flex flex-col gap-3 w-full rounded-2xl py-4 px-5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "rgba(15,20,40,0.72)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(160,32,240,0.28)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
    >
      {/* Hover glow */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(160,32,240,0.10) 0%, transparent 70%)" }}
      />

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white tracking-tight truncate mb-0.5">
            {project.title}
          </h3>
          {isTeacher && project.profiles?.full_name && (
            <p className="text-xs font-bold tracking-wider" style={{ color: "#FF7F50" }}>
              Student: {project.profiles.full_name}
            </p>
          )}
          <p className="text-slate-400 text-sm truncate">{project.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCompleted ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
              style={{ background: "rgba(0,194,203,0.12)", border: "1px solid rgba(0,194,203,0.25)", color: "#00C2CB" }}
            >
              <CheckCircle className="w-3.5 h-3.5" /> Completed
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
              style={{ background: "rgba(255,127,80,0.10)", border: "1px solid rgba(255,127,80,0.22)", color: "#FF9A6C" }}
            >
              <Clock className="w-3.5 h-3.5" /> In Progress
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); handleToggleWatch(); }}
            className="transition-all p-1.5 rounded-full"
            style={{
              background: isWatched ? "rgba(160,32,240,0.85)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isWatched ? "rgba(160,32,240,0.9)" : "rgba(255,255,255,0.10)"}`,
              color: isWatched ? "#fff" : "rgba(255,255,255,0.3)",
              opacity: isWatched ? 1 : undefined,
            }}
            title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            <Bookmark className="w-4 h-4" fill={isWatched ? "currentColor" : "none"} strokeWidth={2} />
          </button>

          {currentUserId === project.student_id && (
            <motion.button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="transition-all p-1.5 rounded-full disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              title="Delete Project"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </motion.button>
          )}
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs relative z-10">
        {project.end_date && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-400">
              {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
        {project.github_link && (
          <a
            href={project.github_link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: "rgba(255,127,80,0.08)", border: "1px solid rgba(255,127,80,0.18)", color: "#FFA880" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,127,80,0.14)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,127,80,0.08)")}
          >
            <Github className="w-3.5 h-3.5" /> Repository
          </a>
        )}
      </div>

      {/* Progress */}
      <div
        className="pt-3 relative z-10 w-full"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Progress</span>
          <span className="text-xs font-extrabold" style={{ color: "#C97EFF" }}>{localProgress}%</span>
        </div>

        <AnimatedProgressBar progress={localProgress} isCompleted={isCompleted} className="h-1.5 mb-4" />

        <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          {!isTeacher ? (
            <form action={handleUpdate} className="flex gap-4 items-center flex-1 relative">
              <input type="hidden" name="id" value={project.id} />
              <div className="flex-1 relative">
                <AnimatePresence>
                  {isDragging && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute -top-9 text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none z-20 text-white"
                      style={{
                        left: `${localProgress}%`,
                        transform: 'translateX(-50%)',
                        background: "rgba(160,32,240,0.9)",
                      }}
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
                  style={{ accentColor: "#A020F0" }}
                />
              </div>
              <button
                type="submit"
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 text-white"
                style={{ background: "rgba(160,32,240,0.20)", border: "1px solid rgba(160,32,240,0.30)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160,32,240,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(160,32,240,0.20)")}
              >
                Update
              </button>
            </form>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex gap-2 items-center justify-end">
            <a
              href={`/dashboard/projects/${project.id}`}
              className="text-[13px] font-bold px-4 py-2 rounded-xl transition-all text-center tracking-wide"
              style={{ background: "rgba(160,32,240,0.10)", border: "1px solid rgba(160,32,240,0.22)", color: "#C97EFF" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160,32,240,0.20)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(160,32,240,0.10)")}
            >
              View Details
            </a>
          </div>
        </div>
      </div>

      {/* Quick private note */}
      {canAddNote && (
        <div
          className="pt-2 relative z-10 w-full"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="flex items-start gap-3 rounded-xl p-2.5 transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${isEditingNote ? "rgba(160,32,240,0.25)" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            <MessageSquarePlus className="w-4 h-4 shrink-0 mt-1.5" style={{ color: "#A020F0" }} />
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
                  <div className="flex justify-end gap-2 items-center mt-1">
                    {initialTeacherNote && (
                      <button
                        onClick={() => setIsEditingNote(false)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-300 mr-2 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={saveNote}
                      disabled={isNoteSaving || !noteContent.trim() || noteContent === initialTeacherNote}
                      className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-all w-fit"
                      style={{ background: "rgba(160,32,240,0.80)" }}
                    >
                      {isNoteSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-start gap-4 p-1">
                  <p className="text-sm font-medium text-slate-300 whitespace-pre-wrap">{noteContent}</p>
                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setIsEditingNote(true)}
                      className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-white"
                      title="Edit Note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (window.confirm("Delete this note?")) deleteNote(); }}
                      disabled={isNoteSaving}
                      className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-red-400"
                      title="Delete Note"
                    >
                      {isNoteSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
