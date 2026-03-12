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
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors flex flex-col gap-4">
      
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
          {isTeacher && project.profiles?.full_name && (
            <p className="text-indigo-400 text-xs font-semibold mb-2 uppercase tracking-wide">
              Student: {project.profiles.full_name}
            </p>
          )}
          <p className="text-slate-400 text-sm line-clamp-2">{project.description}</p>
        </div>
        {isCompleted ? (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </div>
        ) : (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20 shrink-0">
             <Clock className="w-3.5 h-3.5" /> In Progress
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
         {project.end_date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            End Date: {new Date(project.end_date).toLocaleDateString('en-US')}
          </div>
         )}
         {project.github_link && (
          <a href={project.github_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors">
            <Github className="w-4 h-4" /> Repo
          </a>
         )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="flex justify-between items-center mb-2">
           <span className="text-sm font-medium text-slate-300">Progress: %{project.progress_percentage}</span>
        </div>
        
       {/* Progress Bar Display */}
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden mb-4">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
            style={{ width: `${project.progress_percentage}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          {/* Update controls (Student only) */}
          {!isTeacher ? (
             <form action={updateProgress} className="flex gap-2 items-center flex-1">
               <input type="hidden" name="id" value={project.id} />
               <input 
                 type="range" 
                 name="progress" 
                 min="0" max="100" step="5"
                 defaultValue={project.progress_percentage}
                 className="flex-1 accent-indigo-500 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none"
               />
               <button type="submit" className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md transition-colors border border-slate-700 shrink-0">
                 Update
               </button>
             </form>
          ) : (
             <div className="flex-1"></div>
          )}

          <a href={`/dashboard/projects/${project.id}`} className="text-xs font-medium bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-lg transition-colors text-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            Details & Reviews
          </a>
        </div>
      </div>
      
    </div>
  );
}
