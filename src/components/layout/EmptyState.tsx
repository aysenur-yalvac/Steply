import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-3xl shadow-soft transition-all w-full">
      <div className="relative w-24 h-24 mb-6">
        {/* Soft background glow for the icon */}
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
          <Icon className="w-10 h-10 text-indigo-400 drop-shadow-md" strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-3 text-center tracking-tight">
        {title}
      </h3>
      
      <p className="text-slate-400 text-center max-w-sm mb-8 leading-relaxed text-sm">
        {description}
      </p>
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
