export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full">
      <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl w-full"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
             <div className="flex justify-between items-start">
               <div className="h-6 bg-slate-800 rounded w-1/2"></div>
               <div className="h-6 bg-slate-800 rounded-full w-24"></div>
             </div>
             <div className="h-4 bg-slate-800 rounded w-3/4"></div>
             <div className="flex gap-4 mb-2 mt-4">
               <div className="h-4 bg-slate-800 rounded w-24"></div>
               <div className="h-4 bg-slate-800 rounded w-20"></div>
             </div>
             <div className="mt-auto pt-4 border-t border-slate-800">
               <div className="h-4 bg-slate-800 rounded w-full mt-4"></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
