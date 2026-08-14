export default function ProjectLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-white/40 rounded-xl" />
          <div className="h-8 w-64 bg-white/40 rounded-xl" />
        </div>
        <div className="flex gap-3">
          {[0,1,2,3].map((i) => (
            <div key={i} className="h-10 w-28 bg-white/40 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/50 backdrop-blur-sm rounded-3xl h-80 border border-white/30" />
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl h-80 border border-white/30" />
        </div>
      </div>
    </div>
  );
}