"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, GraduationCap, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export type StudentRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
  role: string | null;
  grade: string | null;
  projectCount: number;
};

const GRADE_ORDER = ['Hazırlık', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', 'Mezun'];

function PersonCard({ s }: { s: StudentRow }) {
  return (
    <Link
      href={`/user/${s.id}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all flex items-center gap-4 p-4"
    >
      <Avatar src={s.avatar_url} name={s.full_name ?? '?'} size="md" className="w-11 h-11 text-base shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-violet-700 transition-colors">
          {s.full_name ?? 'Steply Üyesi'}
        </p>
        {s.grade && (
          <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
            {s.grade}
          </span>
        )}
        <p className="text-[11px] text-slate-400 mt-0.5">{s.projectCount} public proje</p>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-violet-500 shrink-0 transition-colors" />
    </Link>
  );
}

export default function SchoolStudentPanel({ students }: { students: StudentRow[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('Hepsi');

  const gradeFilters = ['Hepsi', ...GRADE_ORDER.filter((g) =>
    students.some((s) => s.grade === g)
  )];

  const filtered = activeFilter === 'Hepsi'
    ? students
    : students.filter((s) => s.grade === activeFilter);

  // Group by grade in GRADE_ORDER order; ungrouped last
  const grouped: Array<{ grade: string; items: StudentRow[] }> = [];

  if (activeFilter === 'Hepsi') {
    GRADE_ORDER.forEach((g) => {
      const items = students.filter((s) => s.grade === g);
      if (items.length > 0) grouped.push({ grade: g, items });
    });
    const noGrade = students.filter((s) => !s.grade || !GRADE_ORDER.includes(s.grade));
    if (noGrade.length > 0) grouped.push({ grade: 'Diğer', items: noGrade });
  } else {
    grouped.push({ grade: activeFilter, items: filtered });
  }

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg border bg-violet-50 border-violet-200">
            <GraduationCap className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="text-base font-bold text-slate-700">Okul Arkadaşları</h2>
          <span
            className="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: '#EDE9FE', color: '#7C3AED' }}
          >
            {students.length}
          </span>
        </div>

        {/* Grade filter */}
        {gradeFilters.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {gradeFilters.map((g) => (
              <button
                key={g}
                onClick={() => setActiveFilter(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  activeFilter === g
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 min-h-[160px] flex flex-col items-center justify-center gap-2 p-8">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Henüz okulundan başka kayıtlı öğrenci yok.</p>
          <p className="text-xs text-slate-400 text-center max-w-xs">Arkadaşlarını Steply&apos;ye davet et!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ grade, items }) => (
            <div key={grade}>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{grade}</span>
                <span className="text-[10px] text-slate-400 font-medium">({items.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map((s) => <PersonCard key={s.id} s={s} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
