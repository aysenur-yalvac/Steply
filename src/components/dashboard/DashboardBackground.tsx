"use client";

import { usePathname } from "next/navigation";

export default function DashboardBackground() {
  const pathname = usePathname();

  return (
    <div className="absolute inset-0 pointer-events-none z-[-10] overflow-hidden">
      <div className="relative min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
        
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

        {/* DARK MODE BLOBS (REMOVED to ensure exact solid #0f172a match with sidebar) */}

      </div>
    </div>
  );
}
