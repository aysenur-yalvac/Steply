"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

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
  }
];

export default function SocialAuthRow() {
  const [hovered, setHovered] = useState<string | null>(null);

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (e: React.MouseEvent, providerId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const provider = providerId.toLowerCase();
    console.log("OAuth Login baslatiliyor, provider:", provider);

    if (provider !== 'google' && provider !== 'github') {
      alert(`${providerId} ile giris henuz aktif degil.`);
      return;
    }

    try {
      setLoadingProvider(provider);
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Supabase OAuth Hatasi:", error);
        alert(`Giris Hatasi: ${error.message}`);
      } else {
        console.log("OAuth yonlendirmesi basarili:", data);
      }
    } catch (err: any) {
      console.error("Beklenmeyen Hata:", err);
      alert(`Bir hata olustu: ${err?.message || err}`);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
          Veya ÅŸununla devam et
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        {SOCIAL.map((s) => {
          const isHov = hovered === s.id;
          return (
            <button
              key={s.id}
              type="button"
              title={s.name}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => handleOAuthLogin(e, s.id)}
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

