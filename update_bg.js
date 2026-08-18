const fs = require('fs');

const content = `"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DashboardBackground() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isMainDashboard = pathname === "/dashboard";
  if (isMainDashboard) return null;

  // Wait until mounted to prevent hydration mismatch
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  // Light mode uses vibrant purple (#7C3AFF, #a855f7)
  // Dark mode uses deep night palettes
  const color1 = isDark ? "#1e1b4b" : "#7C3AFF";
  const color2 = isDark ? "#2e1065" : "#a855f7";
  
  const color3 = isDark ? "#0f172a" : "#6d28d9";
  const color4 = isDark ? "#0b0f17" : "#c026d3";

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 w-[580px] h-[580px] rounded-full opacity-[0.18] blur-3xl blob-spin-slow dark:opacity-[0.10]"
        style={{ background: `radial-gradient(circle at 40% 40%, ${color1} 0%, ${color2} 45%, transparent 70%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.12] blur-3xl blob-spin-slower dark:opacity-[0.08]"
        style={{ background: `radial-gradient(circle at 60% 60%, ${color3} 0%, ${color4} 50%, transparent 70%)` }}
      />
    </>
  );
}
`;

fs.writeFileSync('src/components/dashboard/DashboardBackground.tsx', content, 'utf8');
console.log("Updated DashboardBackground.tsx");
