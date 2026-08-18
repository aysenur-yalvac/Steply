'use client';

import React, { useState } from 'react';
import {
  Github, Calendar, CheckCircle, Clock, Bookmark,
  MessageSquarePlus, Loader2, Trash2, Save, Edit3, Users, Flag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { deleteProjectAction } from './actions';
import { toggleWatchlistAction, addQuickNoteAction, deleteQuickNoteAction } from '@/lib/actions';
import FavoriteHeart from '@/components/ui/FavoriteHeart';

import toast from 'react-hot-toast';

const TAG_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-orange-100 text-orange-700 border-orange-200",
];
function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

type Project = {
  id: string;
  student_id?: string;
  title: string;
  description: string;
  github_link: string;
  start_date: string;
  end_date: string;
  progress_percentage: number;
  status?: string;
  tags?: string[];
  profiles?: { full_name: string; avatar_url?: string | null };
};

export default function ProjectCard({
  project,
  isTeacher,
  isWatched: initialIsWatched = false,
  isFavorited: initialIsFavorited = false,
  teacherNote: initialTeacherNote = '',
  teacherNameForNote,
  currentUserId,
  isCollaborator = false,
}: {
  project: Project;
  isTeacher?: boolean;
  isWatched?: boolean;
  isFavorited?: boolean;
  teacherNote?: string;
  teacherNameForNote?: string;
  currentUserId?: string;
  isCollaborator?: boolean;
}) {
  const [isWatched,     setIsWatched]     = useState(initialIsWatched);
  const showFavoriteHeart = currentUserId !== project.student_id;
  const [noteContent,   setNoteContent]   = useState(initialTeacherNote);
  const [isNoteSaving,  setIsNoteSaving]  = useState(false);
  const [isDeleting,    setIsDeleting]    = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(!initialTeacherNote);

  const isCompleted = project.status === 'completed';
  const canAddNote  = currentUserId === project.student_id;

  const cleanDesc = (project.description ?? '').replace(/\[.*?\]/g, '').trim();


  const handleToggleWatch = async () => {
    const prev = isWatched;
    setIsWatched(!prev);
    try {
      await toggleWatchlistAction(project.id);
      toast.success(!prev ? 'Added to Watchlist' : 'Removed from Watchlist', {
        style: { borderRadius: '10px', background: '#1e293b', color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold' },
      });
    } catch {
      setIsWatched(prev);
      toast.error('An error occurred');
    }
  };

  const saveNote = async () => {
    setIsNoteSaving(true);
    try {
      await addQuickNoteAction(project.id, noteContent);
      setIsEditingNote(false);
      toast.success('Note saved!');
    } catch { toast.error('An error occurred'); }
    finally { setIsNoteSaving(false); }
  };

  const deleteNote = async () => {
    setIsNoteSaving(true);
    try {
      await deleteQuickNoteAction(project.id);
      setNoteContent('');
      setIsEditingNote(true);
      toast.success('Note cleared!');
    } catch { toast.error('An error occurred'); }
    finally { setIsNoteSaving(false); }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setIsDeleting(true);
    try {
      await deleteProjectAction(project.id);
      toast.success('Project deleted.');
    } catch {
      toast.error('Failed to delete project');
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[160px]"
      whileHover={{ y: -2, boxShadow: '0 8px 24px -4px rgba(124,58,255,0.10), 0 0 0 1px rgba(124,58,255,0.09)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* ── Card body ─────────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Tags row */}
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          {isCollaborator && (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
              <Users className="w-3.5 h-3.5" /> Ortak
            </span>
          )}
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
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-2 leading-snug line-clamp-2">
          {project.title}
        </h3>

        {/* Owner label for collaborator / teacher */}
        {(isTeacher || isCollaborator) && project.profiles?.full_name && (
          <p className="text-sm text-slate-400 font-medium mb-2">
            {isCollaborator ? 'Owner' : 'Student'}:{' '}
            <span className="text-slate-600 dark:text-slate-300 font-semibold">{project.profiles.full_name}</span>
          </p>
        )}

        {/* Description */}
        {cleanDesc && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-3 flex-1">
            {cleanDesc}
          </p>
        )}

        {/* Dates */}
        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3 font-medium">
            <Flag className="w-3.5 h-3.5 shrink-0 text-slate-300" />
            {project.start_date && (
              <span>
                {new Date(project.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            )}
            {project.start_date && project.end_date && <span className="text-slate-300">→</span>}
            {project.end_date && (
              <span>
                {new Date(project.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            )}
          </div>
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
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 dark:text-slate-400 border border-slate-200">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: watch + github + delete */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {showFavoriteHeart && (
              <FavoriteHeart projectId={project.id} initialFavorited={initialIsFavorited} size="sm" />
            )}
            <button
              onClick={handleToggleWatch}
              className="p-1 rounded-full transition-colors text-slate-400 hover:text-violet-600"
              style={{ color: isWatched ? '#7C3AFF' : undefined }}
              title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isWatched ? 'currentColor' : 'none'} />
            </button>

            {project.github_link && (
              <a
                href={project.github_link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                <Github className="w-3 h-3" /> Repo
              </a>
            )}
          </div>

          {currentUserId === project.student_id && (
            <button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="p-1 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-50"
              title="Delete project"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Progress + actions panel ───────────────────────────────────────── */}
      <div className="px-5 pb-5 border-t border-slate-100 pt-4 flex flex-col gap-4">

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
          >
            View Details
          </Link>
        </div>

        {/* Quick private note */}
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
                    <p className="text-xs text-slate-700 leading-relaxed">{noteContent}</p>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setIsEditingNote(true)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('Delete this note?')) deleteNote(); }}
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
      </div>
    </motion.div>
  );
}
