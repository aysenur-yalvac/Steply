export default function SettingsLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-64 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-11 w-full bg-slate-100 dark:bg-slate-800/70 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
