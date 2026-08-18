const fs = require('fs');

// 1. Rewrite DashboardBackground.tsx
const dashboardBg = `"use client";

import { usePathname } from "next/navigation";

export default function DashboardBackground() {
  const pathname = usePathname();
  const isMainDashboard = pathname === "/dashboard";

  if (isMainDashboard) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[-10] overflow-hidden">
      <div className="relative min-h-screen w-full bg-slate-50 dark:bg-[#0b0f17] transition-colors duration-300">
        <div 
          className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200 via-slate-50 to-white dark:from-[#1e1b4b] dark:via-[#0f172a] dark:to-[#0b0f17]" 
        />
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/dashboard/DashboardBackground.tsx', dashboardBg, 'utf8');

// 2. Clean globals.css of the hard override I added previously
let css = fs.readFileSync('src/app/globals.css', 'utf8');
const searchString = '/* Arka Plan Animasyon Değişkenlerini Koyu Moda Zorla */';
const index = css.indexOf(searchString);
if (index !== -1) {
    css = css.slice(0, index);
    fs.writeFileSync('src/app/globals.css', css, 'utf8');
}

console.log("Replaced DashboardBackground.tsx and cleaned globals.css");
