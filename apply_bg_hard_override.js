const fs = require('fs');

// 1. Modify globals.css
let css = fs.readFileSync('src/app/globals.css', 'utf8');
const appendCss = `
/* Arka Plan Animasyon Değişkenlerini Koyu Moda Zorla */
.dark .aurora,
.dark [class*="aurora"],
.dark [class*="blob-spin"],
.dark [class*="bg-gradient"],
.dark [data-bg="animated"] {
  background-color: #0b0f17 !important;
  --white-gradient: repeating-linear-gradient(100deg, #0b0f17 0%, #0f172a 7%, transparent 10%, transparent 12%, #0b0f17 16%) !important;
  --dark-gradient: repeating-linear-gradient(100deg, #0b0f17 0%, #0f172a 7%, transparent 10%, transparent 12%, #0b0f17 16%) !important;
  --aurora: repeating-linear-gradient(100deg, #1e1b4b 10%, #0f172a 15%, #020617 20%, #1e1b4b 25%, #0b0f17 30%) !important;
  filter: blur(10px) invert(0.9) hue-rotate(180deg) !important;
}
`;
if (!css.includes('/* Arka Plan Animasyon Değişkenlerini Koyu Moda Zorla */')) {
    fs.writeFileSync('src/app/globals.css', css + '\n' + appendCss, 'utf8');
}

// 2. Modify DashboardBackground.tsx
const dashboardBg = `"use client";

import { usePathname } from "next/navigation";

export default function DashboardBackground() {
  const pathname = usePathname();
  const isMainDashboard = pathname === "/dashboard";

  if (isMainDashboard) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[-10] overflow-hidden">
      <div className="relative min-h-screen w-full bg-slate-50 dark:!bg-[#0b0f17] text-slate-950 dark:text-slate-50 transition-colors duration-300">
        <div className="absolute inset-0 opacity-100 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
          <div
            aria-hidden="true"
            className="absolute -top-40 -right-40 w-[580px] h-[580px] rounded-full opacity-[0.18] blur-3xl blob-spin-slow dark:opacity-[0.10]"
            style={{ background: 'radial-gradient(circle at 40% 40%, #7C3AFF 0%, #a855f7 45%, transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.12] blur-3xl blob-spin-slower dark:opacity-[0.08]"
            style={{ background: 'radial-gradient(circle at 60% 60%, #6d28d9 0%, #c026d3 50%, transparent 70%)' }}
          />
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/dashboard/DashboardBackground.tsx', dashboardBg, 'utf8');
console.log("Updated both files");

