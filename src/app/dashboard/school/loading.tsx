export default function SchoolLoading() {
  return (
    <div className="flex-1 animate-pulse">
      <div className="px-6 lg:px-10 pt-6 pb-8 border-b border-slate-200/70 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 space-y-4">
        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-4 w-40 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg" />
      </div>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
