export default function AnalyticsLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-64 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg" />
          </div>
          <div className="h-12 w-40 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl h-56 border border-slate-200/70 dark:border-slate-800 p-6" />
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-6 space-y-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-slate-100 dark:bg-slate-800/70 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
