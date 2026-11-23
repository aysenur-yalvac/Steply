export default function AgendaLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-44 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 rounded-3xl h-96 border border-slate-200/60 dark:border-slate-800/60" />
          <div className="bg-white/70 dark:bg-slate-900/70 rounded-3xl h-96 border border-slate-200/60 dark:border-slate-800/60" />
        </div>
      </div>
    </div>
  );
}
