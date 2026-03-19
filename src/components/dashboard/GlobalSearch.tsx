"use client";

import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [term, setTerm] = useState(searchParams?.get("q") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only trigger if we are on dashboard
      if (!pathname.includes('/dashboard')) return;

      const params = new URLSearchParams(searchParams?.toString() || "");
      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }
      router.push(pathname + "?" + params.toString());
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [term, router, pathname, searchParams]);

  return (
    <div className="relative flex items-center group w-full sm:w-64 transition-all">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder="Search projects..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full pl-10 pr-8 py-2.5 bg-slate-100/50 hover:bg-white backdrop-blur-md border border-slate-200/80 rounded-2xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-medium"
      />
      {term && (
        <button 
          onClick={() => setTerm("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors z-10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
