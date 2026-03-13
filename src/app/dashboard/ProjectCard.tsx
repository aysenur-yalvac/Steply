import React from 'react';
import { Github, Calendar, CheckCircle, Clock } from 'lucide-react';
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
    <div className="group relative bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-floating hover:bg-white/[0.04] flex flex-col gap-6 w-full overflow-hidden">
      
      {/* Decorative top glass shine */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tighter group-hover:text-indigo-200 transition-colors drop-shadow-sm">
            {project.title}
          </h3>
          {isTeacher && project.profiles?.full_name && (
            <p className="text-indigo-400 text-xs font-bold mb-3 uppercase tracking-[0.2em] opacity-80">
              Student: {project.profiles.full_name}
            </p>
          )}
          <p className="text-slate-400 font-light text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
            {project.description}
          </p>
        </div>
        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shrink-0 shadow-sm backdrop-blur-md">
            <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> <span className="uppercase tracking-widest">Done</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 shrink-0 shadow-sm backdrop-blur-md">
             <Clock className="w-4 h-4" strokeWidth={1.5} /> <span className="uppercase tracking-widest">Active</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-2">
         {project.end_date && (
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 shadow-inner">
            <Calendar className="w-4 h-4 text-slate-400" strokeWidth={1.25} />
            <span className="font-light tracking-wide">{new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
          </div>
         )}
         {project.github_link && (
          <a href={project.github_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-2 rounded-xl border border-indigo-500/20 backdrop-blur-md">
            <Github className="w-4 h-4" strokeWidth={1.25} /> <span className="font-medium tracking-wide">Repository</span>
          </a>
         )}
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 z-10 relative">
        <div className="flex justify-between items-center mb-4">
           <span className="text-xs font-bold text-slate-400 tracking-[0.15em] uppercase">Development</span>
           <span className="text-sm font-black text-white">{project.progress_percentage}%</span>
        </div>
        
       {/* Progress Bar Display */}
        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden mb-6 shadow-inner border border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`} 
            style={{ width: `${project.progress_percentage}%` }}
          />
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
                 className="flex-1 accent-indigo-400 cursor-pointer h-1.5 bg-black/40 rounded-lg appearance-none"
               />
               <button type="submit" className="text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl transition-colors border border-white/10 shrink-0 hover:border-white/20 tracking-wider uppercase">
                 Sync
               </button>
             </form>
          ) : (
             <div className="flex-1"></div>
          )}

          <a href={`/dashboard/projects/${project.id}`} className="text-sm font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 px-6 py-3 rounded-xl transition-all text-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0 hover:shadow-[0_0_20px_-3px_var(--color-indigo-500)] tracking-wide">
            Inspect Architecture
          </a>
        </div>
      </div>
      
    </div>
  );
}
