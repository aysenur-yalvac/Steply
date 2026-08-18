export default function TrashLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-white dark:bg-slate-900/40 rounded-xl" />
          <div className="h-8 w-40 bg-white dark:bg-slate-900/40 rounded-xl" />
        </div>
        <div className="h-12 bg-white dark:bg-slate-900/40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl h-20 border border-white/30" />
          ))}
        </div>
      </div>
    </div>
  );
}