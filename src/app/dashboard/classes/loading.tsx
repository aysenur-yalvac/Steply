export default function ClassesLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white/70 dark:bg-slate-900/70 rounded-3xl h-44 border border-slate-200/60 dark:border-slate-800/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
