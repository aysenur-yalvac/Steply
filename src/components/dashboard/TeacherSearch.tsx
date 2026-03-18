"use client";

import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export default function TeacherSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [term, setTerm] = useState(searchParams.get("q") || "");

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
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
    <div className="relative w-full max-w-2xl mx-auto mb-10 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-dusty-rose transition-colors">
        <Search className="h-5 w-5" />
      </div>
      <input
        type="text"
        placeholder="Anlık Arama: Öğrenci adı veya Proje başlığı..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="block w-full pl-12 pr-10 py-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-dusty-rose/10 focus:border-dusty-rose/30 transition-all shadow-sm font-medium text-lg"
      />
      {term && (
        <button 
          onClick={() => setTerm("")}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-dusty-rose transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
