export default function ProjectsLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-10 lg:p-12 space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-36 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2.5 shrink-0">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-11 w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-xl"
            />
          ))}
        </div>
        <div className="flex-1 h-96 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl" />
      </div>
    </div>
  );
}
