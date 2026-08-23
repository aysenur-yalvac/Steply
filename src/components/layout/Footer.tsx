"use client";

import { useState } from "react";
import { Shield, FileText, Lock, Cookie, Phone } from "lucide-react";
import LegalModal from "./LegalModal";

type LegalSlug = "privacy" | "terms" | "kvkk" | "cookies" | "contact";

const LINKS: { slug: LegalSlug; label: string; icon: React.ReactNode }[] = [
  { slug: "privacy",  label: "Gizlilik Politikasi",   icon: <Shield className="w-3 h-3" /> },
  { slug: "terms",    label: "Kullanim Kosullari",     icon: <FileText className="w-3 h-3" /> },
  { slug: "kvkk",     label: "KVKK",                  icon: <Lock className="w-3 h-3" /> },
  { slug: "cookies",  label: "Cerez Politikasi",       icon: <Cookie className="w-3 h-3" /> },
  { slug: "contact",  label: "Iletisim",               icon: <Phone className="w-3 h-3" /> },
];

export default function Footer() {
  const [openModal, setOpenModal] = useState<LegalSlug | null>(null);

  return (
    <>
      {openModal && (
        <LegalModal slug={openModal} onClose={() => setOpenModal(null)} />
      )}

      <footer
        className="w-full mt-auto relative overflow-hidden"
        style={{
          background: "rgba(11,14,20,0.95)",
          borderTop: "1px solid rgba(160,32,240,0.14)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Subtle glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(160,32,240,0.06) 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Powered by</span>
            <a
              href="https://must-b.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-extrabold tracking-tight transition-opacity hover:opacity-80"
              style={{
                background: "linear-gradient(135deg, #A020F0 0%, #FF7F50 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              MUST-B
            </a>
            <span className="text-slate-600 text-xs hidden sm:inline">•</span>
            <span className="text-slate-500 text-xs hidden sm:inline">Steply Platform &copy; {new Date().getFullYear()}</span>
          </div>

          {/* Legal links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {LINKS.map(({ slug, label, icon }) => (
              <button
                key={slug}
                type="button"
                onClick={() => setOpenModal(slug)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-400 transition-colors duration-200"
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
