export default function ProjectSkeleton() {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-soft relative overflow-hidden">
      {/* Shimmer Line Overlay */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none animate-shimmer"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3 w-2/3">
          <div className="h-6 bg-slate-800 rounded-lg w-3/4"></div>
          <div className="h-4 bg-slate-800/60 rounded-lg w-full"></div>
          <div className="h-4 bg-slate-800/60 rounded-lg w-5/6"></div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-800"></div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800"></div>
        <div className="h-4 bg-slate-800 rounded-lg w-1/4"></div>
      </div>
    </div>
  );
}
