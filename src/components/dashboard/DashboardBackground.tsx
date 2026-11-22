"use client";

import { usePathname } from "next/navigation";

export default function DashboardBackground() {
  const pathname = usePathname();

  return (
    <div className="absolute inset-0 pointer-events-none z-[-10] overflow-hidden">
      <div className="relative min-h-screen w-full bg-slate-50 dark:bg-[#131927] transition-colors duration-300">
        
        {/* LIGHT MODE BLOBS */}
        <div className="absolute inset-0 opacity-100 dark:hidden pointer-events-none">
          <div
            aria-hidden="true"
            className="absolute -top-40 -right-40 w-[580px] h-[580px] rounded-full opacity-[0.18] blur-3xl blob-spin-slow"
            style={{ background: 'radial-gradient(circle at 40% 40%, #7C3AFF 0%, #a855f7 45%, transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.12] blur-3xl blob-spin-slower"
            style={{ background: 'radial-gradient(circle at 60% 60%, #6d28d9 0%, #c026d3 50%, transparent 70%)' }}
          />
        </div>

        {/* DARK MODE BLOBS */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none">
          <div
            aria-hidden="true"
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-70 blur-3xl blob-spin-slow dark:bg-violet-600/20"
            style={{ background: 'radial-gradient(circle at 40% 40%, rgba(124, 58, 255, 0.25) 0%, rgba(168, 85, 247, 0.15) 45%, transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full opacity-60 blur-3xl blob-spin-slower dark:bg-purple-500/15"
            style={{ background: 'radial-gradient(circle at 60% 60%, rgba(109, 40, 217, 0.22) 0%, rgba(79, 70, 229, 0.15) 50%, transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-40 blur-3xl dark:bg-indigo-500/15"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.18) 0%, transparent 65%)' }}
          />
        </div>

      </div>
    </div>
  );
}
