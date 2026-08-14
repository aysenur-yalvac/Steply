export default function DashboardLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-white/40 rounded-xl" />
          <div className="h-10 w-32 bg-white/40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[0,1,2,3,4,5,6,7].map((i) => (
            <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl h-52 border border-white/30" />
          ))}
        </div>
      </div>
    </div>
  );
}