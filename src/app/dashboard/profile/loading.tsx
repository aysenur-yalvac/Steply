export default function ProfileLoading() {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6 md:p-10 flex flex-col items-center animate-pulse">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] overflow-hidden">
          <div className="h-24 bg-slate-100 dark:bg-slate-800/80" />
          <div className="px-6 sm:px-8 pb-8 space-y-4">
            <div className="-mt-12 w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900" />
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/70 rounded-lg" />
            <div className="h-44 w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
