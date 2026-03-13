import ProjectSkeleton from '@/components/projects/ProjectSkeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-pulse">
        <div className="space-y-3 w-full sm:w-1/2">
          <div className="h-10 bg-slate-800/60 rounded-xl w-3/4 max-w-sm"></div>
          <div className="h-5 bg-slate-800/40 rounded-lg w-full max-w-md"></div>
        </div>
        <div className="h-12 w-40 bg-slate-800/60 rounded-2xl shrink-0"></div>
      </div>
      
      {/* Projects Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => (
          <ProjectSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
