import React from 'react';
import { Github, Calendar, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { updateProgress } from './actions';

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
  const isCompleted = project.progress_percentage === 100;
  
  return (
    <div className="group bg-charcoal-card backdrop-blur-xl border border-charcoal-border rounded-3xl p-6 sm:p-8 hover:bg-charcoal-card-hover hover:border-charcoal-border-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-soft flex flex-col gap-6 w-full relative overflow-hidden">
      
      {/* Subtle Light Leak Effect */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-vibrant-violet/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex justify-between items-start gap-4 relative z-10">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-indigo-100 transition-colors">
            {project.title}
          </h3>
          {isTeacher && project.profiles?.full_name && (
            <p className="text-indigo-400 text-xs font-semibold mb-3 tracking-wider">
              Student: {project.profiles.full_name}
            </p>
          )}
          <p className="text-slate-400 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3">
            {project.description}
          </p>
        </div>
        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 shrink-0 shadow-sm">
            <CheckCircle className="w-4 h-4" /> <span>Completed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20 shrink-0 shadow-sm">
             <Clock className="w-4 h-4" /> <span>In Progress</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-2">
         {project.end_date && (
          <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">{new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
          </div>
         )}
         {project.github_link && (
          <a href={project.github_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/10">
            <Github className="w-4 h-4" /> <span className="font-medium">Repository</span>
          </a>
         )}
      </div>

      <div className="mt-auto pt-5 border-t border-slate-700/50 relative z-10">
        <div className="flex justify-between items-center mb-3">
           <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Progress</span>
           <span className="text-sm font-bold text-white">{project.progress_percentage}%</span>
        </div>
        
       {/* Progress Bar Display with Framer Motion & Internal Shimmer */}
        <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden mb-6 shadow-inner border border-slate-800/50 relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${project.progress_percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
            className={`h-full rounded-full relative overflow-hidden ${isCompleted ? 'bg-gradient-to-r from-vibrant-teal to-emerald-400 shadow-[0_0_12px_rgba(13,148,136,0.5)]' : 'bg-gradient-to-r from-vibrant-violet to-primary-electric shadow-[0_0_12px_rgba(124,58,237,0.5)]'}`} 
          >
            {/* Embedded Active Shimmer Line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-progress-shimmer skew-x-12" />
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          {/* Update controls (Student only) */}
          {!isTeacher ? (
             <form action={updateProgress} className="flex gap-3 items-center flex-1">
               <input type="hidden" name="id" value={project.id} />
               <input 
                 type="range" 
                 name="progress" 
                 min="0" max="100" step="5"
                 defaultValue={project.progress_percentage}
                 className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
               />
               <button type="submit" className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors border border-slate-700 shrink-0 hover:border-slate-500">
                 Update
               </button>
             </form>
          ) : (
             <div className="flex-1"></div>
          )}

          <a href={`/dashboard/projects/${project.id}`} className="text-sm font-semibold bg-vibrant-teal/10 hover:bg-vibrant-teal/20 text-teal-300 hover:text-teal-200 border border-vibrant-teal/20 px-5 py-2.5 rounded-xl transition-all text-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0 hover:shadow-[0_0_15px_-3px_var(--color-vibrant-teal)] tracking-wide">
            View Details
          </a>
        </div>
      </div>
      
    </div>
  );
}
