"use client";

import { usePathname } from "next/navigation";

export default function DashboardBackground() {
  const pathname = usePathname();
  const isMainDashboard = pathname === "/dashboard";

  if (isMainDashboard) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 w-[580px] h-[580px] rounded-full opacity-[0.18] blur-3xl blob-spin-slow"
        style={{ background: "radial-gradient(circle at 40% 40%, #7C3AFF 0%, #a855f7 45%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 -left-32 w-[440px] h-[440px] rounded-full opacity-[0.12] blur-3xl blob-spin-slower"
        style={{ background: "radial-gradient(circle at 60% 60%, #6d28d9 0%, #c026d3 50%, transparent 70%)" }}
      />
    </>
  );
}
