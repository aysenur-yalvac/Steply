"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TrashTabsClient() {
  const pathname = usePathname();

  const tabs = [
    { name: "Projeler", href: "/dashboard/trash/projects" },
    { name: "Dosyalar", href: "/dashboard/trash/files" },
    { name: "Odevler", href: "/dashboard/trash/assignments" },
  ];

  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8">
      {tabs.map((tab) => {
        // Match exact or startsWith (if under that route)
        // Also handling '/dashboard/trash' redirecting to '/dashboard/trash/projects'
        let isActive = false;
        if (pathname === tab.href) {
          isActive = true;
        } else if (tab.href === "/dashboard/trash/projects" && pathname === "/dashboard/trash") {
          isActive = true;
        }

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`pb-3 text-sm font-semibold transition-all ${
              isActive
                ? "border-b-2 border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
