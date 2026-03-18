'use client';

import React, { useState } from 'react';
import { Github, Calendar, CheckCircle, Clock, Bookmark, MessageSquarePlus, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProgress } from './actions';
import { toggleWatchlistAction, addQuickNoteAction, deleteQuickNoteAction } from '@/lib/actions';
import AnimatedProgressBar from '@/components/ui/AnimatedProgressBar';
import toast from 'react-hot-toast';

type Project = {
  id: string;
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
  currentUserId
}: { 
  project: Project & { user_id?: string }; 
  isTeacher?: boolean;
  isWatched?: boolean;
  teacherNote?: string;
  currentUserId?: string;
}) {
  const [localProgress, setLocalProgress] = useState(project.progress_percentage);
  const [isDragging, setIsDragging] = useState(false);
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState(initialTeacherNote);
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  
  const isCompleted = localProgress === 100;

  const canAddNote = isTeacher || project.user_id === currentUserId;
  const canWatchlist = isTeacher || project.user_id !== currentUserId;

  const handleUpdate = async (formData: FormData) => {
    // If progress hit 100 for the first time
    if (localProgress === 100 && project.progress_percentage !== 100) {
      toast.success("Congratulations! Flawless execution!", {
        icon: '🎉',
        style: {
          borderRadius: '16px',
          background: '#fcfaf6',
          color: '#1e293b',
          border: '1px solid #10b981'
        },
      });
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#10b981', '#a78bfa', '#fde047']
        });
      });
    }
    await updateProgress(formData);
  };

  const handleToggleWatch = async () => {
    const previous = isWatched;
    setIsWatched(!previous);
    try {
      await toggleWatchlistAction(project.id);
      toast.success(!previous ? "Added to Watchlist" : "Removed from Watchlist", {
        style: { borderRadius: '12px', background: '#fcfaf6', color: '#1e293b', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 'bold' }
      });
    } catch(e) {
      setIsWatched(previous);
      toast.error("An error occurred");
    }
  };

  const saveNote = async () => {
    setIsNoteSaving(true);
    try {
      await addQuickNoteAction(project.id, noteContent);
      setIsNoteModalOpen(false);
      toast.success("Quick note saved successfully!", {
        style: { borderRadius: '12px', background: '#f8fafc', color: '#64748b', border: '1px solid #a78bfa', fontSize: '13px', fontWeight: 'bold' }
      });
    } catch(e) {
      toast.error("An error occurred");
    } finally {
      setIsNoteSaving(false);
    }
  };

  const deleteNote = async () => {
    setIsNoteSaving(true);
    try {
      await deleteQuickNoteAction(project.id);
      setNoteContent('');
      setIsNoteModalOpen(false);
      toast.success("Note cleared!", {
        style: { borderRadius: '12px', background: '#f8fafc', color: '#64748b', border: '1px solid #f87171', fontSize: '13px', fontWeight: 'bold' }
      });
    } catch(e) {
      toast.error("An error occurred");
    } finally {
      setIsNoteSaving(false);
    }
  };
  
  return (
    <div className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 hover:bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-6 w-full relative overflow-hidden">
      
      {/* Subtle Light Leak Effect - Spring Breeze Style */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-dusty-rose/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex justify-between items-start gap-4 relative z-10">
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 tracking-tight group-hover:text-slate-900 transition-colors pr-2">
            {project.title}
          </h3>
          {isTeacher && project.profiles?.full_name && (
            <p className="text-dusty-rose text-xs font-semibold mb-3 tracking-wider">
              Student: {project.profiles.full_name}
            </p>
          )}
          <p className="text-slate-500 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3">
            {project.description}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Status Badge */}
          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-green/10 text-sage-green text-xs font-semibold border border-sage-green/20 shadow-sm">
              <CheckCircle className="w-4 h-4" /> <span>Completed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20 shadow-sm">
               <Clock className="w-4 h-4" /> <span>In Progress</span>
            </div>
          )}

          {/* Action Group */}
          <div className="flex items-center gap-2">
            {canAddNote && (
              <button 
                onClick={(e) => { e.preventDefault(); setIsNoteModalOpen(true); }}
                className="opacity-0 group-hover:opacity-100 transition-all p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-soft-lavender hover:border-violet-200 hover:bg-violet-50 rounded-full shadow-sm"
                title="Quick Note"
              >
                <MessageSquarePlus className="w-4 h-4" />
              </button>
            )}
            
            {canWatchlist && (
              <button 
                onClick={(e) => { e.preventDefault(); handleToggleWatch(); }}
                className={`transition-all p-2 rounded-full border shadow-sm ${
                  isWatched 
                    ? 'bg-dusty-rose text-white border-dusty-rose opacity-100 shadow-rose-200' 
                    : 'bg-white text-slate-300 border-slate-200 hover:text-dusty-rose hover:border-rose-200 hover:bg-rose-50 opacity-0 group-hover:opacity-100'
                }`}
                title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <Bookmark className="w-5 h-5" fill={isWatched ? "currentColor" : "none"} strokeWidth={isWatched ? 2.5 : 2} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
         {project.end_date && (
          <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-600">{new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
          </div>
         )}
         {project.github_link && (
          <a href={project.github_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-dusty-rose hover:text-rose-600 transition-colors bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-100">
            <Github className="w-4 h-4" /> <span className="font-medium">Repository</span>
          </a>
         )}
      </div>

      <div className="mt-auto pt-5 border-t border-slate-100 relative z-10">
        <div className="flex justify-between items-center mb-3">
           <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Progress</span>
           <span className="text-sm font-bold text-slate-700">{localProgress}%</span>
        </div>
        
       {/* Progress Bar Display with interactive Tooltip */}
        <AnimatedProgressBar progress={localProgress} isCompleted={isCompleted} className="h-2 mb-6" />

        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          {/* Update controls (Student only) */}
          {!isTeacher ? (
             <form action={handleUpdate} className="flex gap-4 items-center flex-1 relative">
               <input type="hidden" name="id" value={project.id} />
               
               <div className="flex-1 relative group/slider">
                 <AnimatePresence>
                   {isDragging && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute -top-10 left-0 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none z-20"
                        style={{ left: `${localProgress}%`, transform: 'translateX(-50%)' }}
                     >
                       {localProgress}%
                       <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-slate-800" />
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <motion.input 
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
                   whileHover={{ scaleY: 1.25 }}
                   className="w-full accent-dusty-rose cursor-grab active:cursor-grabbing h-1.5 bg-slate-200 rounded-lg appearance-none transition-all"
                 />
               </div>

               <button type="submit" className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0">
                 Update
               </button>
             </form>
          ) : (
             <div className="flex-1"></div>
          )}

          <a href={`/dashboard/projects/${project.id}`} className="text-sm font-semibold bg-sage-green/10 hover:bg-sage-green/20 text-emerald-600 hover:text-emerald-700 border border-sage-green/20 px-6 py-2.5 rounded-xl transition-all text-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0 hover:shadow-sm tracking-wide">
            View Details
          </a>
        </div>
      </div>
      
      {/* Quick Note Modal */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-soft-lavender" /> Quick Private Note
                </h4>
                <button onClick={() => setIsNoteModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Your private note about this project (Student cannot see)..."
                  rows={4}
                  className="w-full text-sm resize-y rounded-2xl bg-white border border-slate-200 p-4 focus:outline-none focus:ring-4 focus:ring-violet-50 focus:border-violet-300 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                />
                <div className="flex gap-3">
                  {initialTeacherNote && (
                    <button 
                      onClick={deleteNote}
                      disabled={isNoteSaving}
                      className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    onClick={saveNote}
                    disabled={isNoteSaving}
                    className="flex-1 flex justify-center items-center py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isNoteSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Hover Note Pane */}
      {noteContent && !isNoteModalOpen && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/95 backdrop-blur-md text-slate-100 p-4 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 flex items-start gap-3 border-t border-slate-800 shadow-2xl">
          <MessageSquarePlus className="w-5 h-5 text-soft-lavender shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{noteContent}</p>
        </div>
      )}
      
    </div>
  );
}
