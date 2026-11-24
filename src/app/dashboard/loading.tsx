export default function DashboardLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-5">
          <div className="h-3.5 w-32 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg" />
          <div className="h-8 w-52 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-72 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-44 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl" />
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-36 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl" />
            <div className="h-10 w-28 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl h-48 border border-slate-200/70 dark:border-slate-800 p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-5 w-20 bg-slate-200/80 dark:bg-slate-800 rounded-full" />
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
              </div>
              <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
