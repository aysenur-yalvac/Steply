"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Phone, FolderOpen } from "lucide-react";
import PhotoLightbox from "@/components/ui/PhotoLightbox";

export type TeacherRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  projectCount: number;
};

const PALETTES = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
];

function PhotoPlaceholder({ name, colorIndex }: { name: string | null; colorIndex: number }) {
  const initials = (name ?? "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={`w-full h-full bg-gradient-to-br ${PALETTES[colorIndex % PALETTES.length]} flex items-center justify-center`}>
      <span className="text-white font-extrabold text-xl select-none">{initials}</span>
    </div>
  );
}

function TeacherCard({
  t,
  colorIndex,
  onPhotoClick,
}: {
  t: TeacherRow;
  colorIndex: number;
  onPhotoClick: (src: string, name: string | null) => void;
}) {
  const isReal = t.avatar_url && !t.avatar_url.includes("dicebear") && !t.avatar_url.includes("api.");

  return (
    <Link
      href={`/user/${t.id}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-36 flex flex-row overflow-hidden"
    >
      <div
        className={`w-32 shrink-0 overflow-hidden rounded-l-2xl ${isReal ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
        onClick={(e) => {
          if (!isReal) return;
          e.preventDefault();
          onPhotoClick(t.avatar_url!, t.full_name);
        }}
      >
        {isReal ? (
          <img
            src={t.avatar_url!}
            alt={t.full_name ?? ""}
            className="w-full h-full object-cover object-center"
            style={{ imageRendering: "auto" } as React.CSSProperties}
          />
        ) : (
          <PhotoPlaceholder name={t.full_name} colorIndex={colorIndex} />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight truncate group-hover:text-blue-700 transition-colors">
              {t.full_name ?? "Steply Üyesi"}
            </p>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
          </div>
          <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            Öğretmen
          </span>
        </div>

        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={`text-sm font-medium truncate ${t.phone_number ? "text-slate-700" : "text-slate-400 italic"}`}>
              {t.phone_number ?? "Telefon belirtilmemiş"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.projectCount} proje</span>
        </div>
      </div>
    </Link>
  );
}

export default function TeacherGrid({ teachers }: { teachers: TeacherRow[] }) {
  const [lightbox, setLightbox] = useState<{ src: string; name: string | null } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((t, i) => (
          <TeacherCard
            key={t.id}
            t={t}
            colorIndex={i}
            onPhotoClick={(src, name) => setLightbox({ src, name })}
          />
        ))}
      </div>

      {lightbox && (
        <PhotoLightbox
          src={lightbox.src}
          name={lightbox.name}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
