'use client';

import React, { useState } from 'react';
import { Github, Calendar, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProgress } from './actions';
import AnimatedProgressBar from '@/components/ui/AnimatedProgressBar';

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

export default function ProjectCard({ project, isTeacher }: { project: Project; isTeacher?: boolean }) {
  const [localProgress, setLocalProgress] = useState(project.progress_percentage);
  const [isDragging, setIsDragging] = useState(false);
  const isCompleted = project.progress_percentage === 100;
  
  return (
    <div className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 hover:bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-6 w-full relative overflow-hidden">
      
      {/* Subtle Light Leak Effect - Spring Breeze Style */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-dusty-rose/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex justify-between items-start gap-4 relative z-10">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 tracking-tight group-hover:text-slate-900 transition-colors">
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
        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-green/10 text-sage-green text-xs font-semibold border border-sage-green/20 shrink-0 shadow-sm">
            <CheckCircle className="w-4 h-4" /> <span>Completed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold border border-amber-500/20 shrink-0 shadow-sm">
             <Clock className="w-4 h-4" /> <span>In Progress</span>
          </div>
        )}
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
             <form action={updateProgress} className="flex gap-4 items-center flex-1 relative">
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
      
    </div>
  );
}
