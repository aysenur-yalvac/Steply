'use client';

import React, { useState } from 'react';
import { Github, Calendar, CheckCircle, Clock, Bookmark, MessageSquarePlus, X, Loader2, Trash2, Save, Edit3 } from 'lucide-react';
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
  currentUserId
}: { 
  project: Project; 
  isTeacher?: boolean;
  isWatched?: boolean;
  teacherNote?: string;
  currentUserId?: string;
}) {
  const [localProgress, setLocalProgress] = useState(project.progress_percentage);
  const [isDragging, setIsDragging] = useState(false);
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [noteContent, setNoteContent] = useState(initialTeacherNote);
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(!initialTeacherNote);
  
  const isCompleted = localProgress === 100;

  const canAddNote = true;
  const canWatchlist = true;

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
      setIsEditingNote(false);
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
      setIsEditingNote(true);
      toast.success("Note cleared!", {
        style: { borderRadius: '12px', background: '#f8fafc', color: '#64748b', border: '1px solid #f87171', fontSize: '13px', fontWeight: 'bold' }
      });
    } catch(e) {
      toast.error("An error occurred");
    } finally {
      setIsNoteSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      setIsDeleting(true);
      try {
        await deleteProjectAction(project.id);
        toast.success("Project deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete project");
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl py-3 px-4 sm:px-5 hover:bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col gap-2 w-full relative overflow-hidden">
      
      {/* Subtle Light Leak Effect - Spring Breeze Style */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-dusty-rose/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex flex-col gap-1 relative z-10 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors flex-1 truncate">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-green/10 text-sage-green text-[10px] sm:text-[11px] font-bold border border-sage-green/20 shadow-sm whitespace-nowrap">
                <CheckCircle className="w-3.5 h-3.5" /> <span>Completed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] sm:text-[11px] font-bold border border-amber-500/20 shadow-sm whitespace-nowrap">
                 <Clock className="w-3.5 h-3.5" /> <span>In Progress</span>
              </div>
            )}
            
            {canWatchlist && (
              <button 
                onClick={(e) => { e.preventDefault(); handleToggleWatch(); }}
                className={`transition-all p-1.5 rounded-full border shadow-sm ${
                  isWatched 
                    ? 'bg-amber-400 text-white border-amber-400 opacity-100 shadow-amber-200' 
                    : 'bg-white text-slate-300 border-slate-200 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50 opacity-0 group-hover:opacity-100'
                }`}
                title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <Bookmark className="w-4 h-4" fill={isWatched ? "currentColor" : "none"} strokeWidth={isWatched ? 2.5 : 2} />
              </button>
            )}

            {currentUserId === project.student_id && (
              <motion.button 
                onClick={handleDeleteProject}
                disabled={isDeleting}
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
                whileTap={{ scale: 0.95 }}
                className="transition-all p-1.5 rounded-full border shadow-sm bg-white text-slate-300 border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                title="Delete Project"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </motion.button>
            )}
          </div>
        </div>

        {isTeacher && project.profiles?.full_name && (
          <p className="text-dusty-rose text-xs font-bold tracking-wider">
            Student: {project.profiles.full_name}
          </p>
        )}
        <p className="text-slate-500 text-sm truncate w-full">
          {project.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
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

      <div className="mt-1 pt-3 border-t border-slate-100 relative z-10 w-full">
        <div className="flex justify-between items-center mb-2">
           <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Progress</span>
           <span className="text-xs font-extrabold text-slate-700">{localProgress}%</span>
        </div>
        
       {/* Progress Bar Display with interactive Tooltip */}
        <AnimatedProgressBar progress={localProgress} isCompleted={isCompleted} className="h-1.5 mb-4" />

        <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
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

               <button type="submit" className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 shrink-0">
                 Update
               </button>
             </form>
          ) : (
             <div className="flex-1"></div>
          )}

           <div className="flex gap-2 items-center justify-end">
            <a href={`/dashboard/projects/${project.id}`} className="flex-1 text-[13px] font-bold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 px-4 py-2 rounded-xl transition-all text-center shrink-0 hover:shadow-sm tracking-wide">
              View Details
            </a>
          </div>
        </div>
      </div>
      
      {/* Quick Private Note */}
      {canAddNote && (
        <div className="mt-1 pt-2 border-t border-slate-100 relative z-10 w-full">
           <div className={`flex items-start gap-3 bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 focus-within:ring-2 focus-within:ring-violet-200 focus-within:bg-white transition-all ${isEditingNote ? 'shadow-inner' : 'shadow-sm'}`}>
             <MessageSquarePlus className="w-4 h-4 text-soft-lavender shrink-0 mt-1.5" />
             <div className="flex-1 flex flex-col gap-2">
               
               {isEditingNote ? (
                 <>
                   <textarea 
                     value={noteContent}
                     onChange={(e) => setNoteContent(e.target.value)}
                     placeholder="Quick private note... (auto-saves)"
                     rows={1}
                     className="w-full bg-transparent border-none p-1.5 focus:ring-0 resize-y text-xs text-slate-700 font-medium placeholder:text-slate-400 min-h-[36px]"
                   />
                   <div className="flex justify-end gap-2 items-center mt-1">
                     {initialTeacherNote && (
                        <button onClick={() => setIsEditingNote(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 mr-2 transition-colors">Cancel</button>
                     )}
                     <button onClick={saveNote} disabled={isNoteSaving || !noteContent.trim() || noteContent === initialTeacherNote} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-all w-fit">
                       {isNoteSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="flex justify-between items-start gap-4 p-1">
                   <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{noteContent}</p>
                   <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => setIsEditingNote(true)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Note">
                       <Edit3 className="w-4 h-4" />
                     </button>
                     <button onClick={() => { if(window.confirm("Bu notu silmek istediğinize emin misiniz?")) deleteNote(); }} disabled={isNoteSaving} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Note">
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
