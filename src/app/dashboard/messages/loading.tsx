export default function MessagesLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/70 dark:bg-slate-900/70 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-4 space-y-3">
          <div className="h-10 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded-xl" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
        <div className="hidden md:block md:col-span-2 bg-white/70 dark:bg-slate-900/70 rounded-3xl border border-slate-200/60 dark:border-slate-800/60" />
      </div>
    </div>
  );
}
