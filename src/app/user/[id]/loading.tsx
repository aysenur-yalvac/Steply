export default function UserProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] px-4 sm:px-6 py-8 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-9 w-28 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl" />
        <div className="bg-white dark:bg-[#1a2234] rounded-3xl p-6 sm:p-8 border border-slate-200/70 dark:border-slate-800/70 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-7 w-52 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl" />
            <div className="h-4 w-72 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1a2234] rounded-3xl h-48 border border-slate-200/70 dark:border-slate-800/70" />
          ))}
        </div>
      </div>
    </div>
  );
}
