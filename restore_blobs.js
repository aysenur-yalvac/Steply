const fs = require('fs');

// 1. Rewrite DashboardBackground.tsx
const dashboardBg = `"use client";

import { usePathname } from "next/navigation";

export default function DashboardBackground() {
  const pathname = usePathname();

  return (
    <div className="absolute inset-0 pointer-events-none z-[-10] overflow-hidden">
      <div className="relative min-h-screen w-full bg-slate-50 dark:bg-[#0b0f17] transition-colors duration-300">
        
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
        <div className="absolute inset-0 hidden dark:block opacity-40 mix-blend-screen pointer-events-none">
          <div
            aria-hidden="true"
            className="absolute -top-40 -right-40 w-[580px] h-[580px] rounded-full blur-3xl blob-spin-slow"
            style={{ background: 'radial-gradient(circle at 40% 40%, #1e1b4b 0%, #2e1065 45%, transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 -left-32 w-[440px] h-[440px] rounded-full blur-3xl blob-spin-slower"
            style={{ background: 'radial-gradient(circle at 60% 60%, #0f172a 0%, #0b0f17 50%, transparent 70%)' }}
          />
        </div>

      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/dashboard/DashboardBackground.tsx', dashboardBg, 'utf8');

// 2. Clean dashboard/page.tsx
let pageContent = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
pageContent = pageContent.replace(/bg-white([^A-Za-z0-9_-])/g, 'bg-transparent$1');
pageContent = pageContent.replace(/bg-purple-50([^A-Za-z0-9_-])/g, 'bg-transparent$1');
pageContent = pageContent.replace(/bg-slate-50([^A-Za-z0-9_-])/g, 'bg-transparent$1');
pageContent = pageContent.replace(/dark:bg-[#0b0f17]/g, 'dark:bg-transparent');
pageContent = pageContent.replace(/dark:bg-slate-900/g, 'dark:bg-transparent');
fs.writeFileSync('src/app/dashboard/page.tsx', pageContent, 'utf8');

console.log("Restored animation blobs and cleaned dashboard page");
