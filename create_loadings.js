const fs = require('fs');
const path = require('path');

const projectLoading = `export default function ProjectLoading() {
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
}`;

fs.writeFileSync('src/app/dashboard/projects/[id]/loading.tsx', projectLoading, 'utf8');
console.log('Created project loading.tsx');

const trashLoading = `export default function TrashLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-white/40 rounded-xl" />
          <div className="h-8 w-40 bg-white/40 rounded-xl" />
        </div>
        <div className="h-12 bg-white/40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="bg-white/50 backdrop-blur-sm rounded-xl h-20 border border-white/30" />
          ))}
        </div>
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/app/dashboard/trash/loading.tsx', trashLoading, 'utf8');
console.log('Created trash loading.tsx');

const dashLoading = `export default function DashboardLoading() {
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
}`;

fs.writeFileSync('src/app/dashboard/loading.tsx', dashLoading, 'utf8');
console.log('Created dashboard loading.tsx');
