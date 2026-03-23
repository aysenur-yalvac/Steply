"use client";

import { useState } from "react";

const SOCIAL = [
  {
    id: "google",
    name: "Google",
    hoverBg: "rgba(66,133,244,0.12)",
    hoverBorder: "rgba(66,133,244,0.50)",
    hoverShadow: "rgba(66,133,244,0.20)",
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: "github",
    name: "GitHub",
    hoverBg: "rgba(255,255,255,0.08)",
    hoverBorder: "rgba(255,255,255,0.32)",
    hoverShadow: "rgba(255,255,255,0.08)",
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, color: "#fff" }} fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    hoverBg: "rgba(10,102,194,0.15)",
    hoverBorder: "rgba(10,102,194,0.55)",
    hoverShadow: "rgba(10,102,194,0.22)",
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }} fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    id: "apple",
    name: "Apple",
    hoverBg: "rgba(255,255,255,0.07)",
    hoverBorder: "rgba(255,255,255,0.28)",
    hoverShadow: "rgba(255,255,255,0.07)",
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, color: "#fff" }} fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
];

export default function SocialAuthRow() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-[11px] font-medium text-slate-600 whitespace-nowrap">
          Veya şununla devam et
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-4 gap-2.5">
        {SOCIAL.map((s) => {
          const isHov = hovered === s.id;
          return (
            <button
              key={s.id}
              type="button"
              title={s.name}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center justify-center py-3 rounded-xl transition-all duration-200"
              style={{
                background:  isHov ? s.hoverBg     : "rgba(255,255,255,0.04)",
                border:      isHov ? `1px solid ${s.hoverBorder}` : "1px solid rgba(255,255,255,0.09)",
                boxShadow:   isHov ? `0 0 14px ${s.hoverShadow}` : "none",
              }}
            >
              {s.icon}
            </button>
          );
        })}
      </div>
    </>
  );
}
