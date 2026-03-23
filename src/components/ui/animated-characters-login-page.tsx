"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Eye, EyeOff, GraduationCap, Shield, ArrowLeft, CheckCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type CharStage = "idle" | "watching" | "hiding";
type Mode      = "login" | "register";

// ── Character configs ─────────────────────────────────────────────────────────
const CHARS = [
  { id: "dark",   head: "#1E2340", body: "#0D1020", cheek: "#A020F0", delay: 0.15, size: 62 },
  { id: "purple", head: "#C050FF", body: "#7C3AFF", cheek: "#FF9060", delay: 0.0,  size: 78 },
  { id: "coral",  head: "#FF7050", body: "#FF4070", cheek: "#FFD060", delay: 0.30, size: 70 },
  { id: "yellow", head: "#FFD060", body: "#FFA030", cheek: "#FF7050", delay: 0.20, size: 58 },
] as const;

// ── Single Character SVG ──────────────────────────────────────────────────────
function CharSVG({
  head, body, cheek, delay, size, stage,
}: {
  head: string; body: string; cheek: string;
  delay: number; size: number; stage: CharStage;
}) {
  const hiding   = stage === "hiding";
  const watching = stage === "watching";

  return (
    <motion.div
      animate={{ y: hiding ? [0, -3, 0] : [0, -8, 0] }}
      transition={{
        y: { duration: hiding ? 1.4 : 2.6, repeat: Infinity, delay, ease: "easeInOut" },
      }}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <svg viewBox="0 0 100 120" width={size} height={size}>
        {/* Body */}
        <ellipse cx="50" cy="108" rx="28" ry="16" fill={body} />
        {/* Neck */}
        <rect x="42" y="72" width="16" height="12" rx="6" fill={head} />
        {/* Head */}
        <circle cx="50" cy="50" r="36" fill={head} />
        {/* Ear bumps */}
        <circle cx="17" cy="46" r="10" fill={head} />
        <circle cx="83" cy="46" r="10" fill={head} />
        {/* Cheeks */}
        <circle cx="26" cy="63" r="9" fill={cheek} opacity="0.35" />
        <circle cx="74" cy="63" r="9" fill={cheek} opacity="0.35" />

        {/* ── HIDING STATE ── */}
        <motion.g
          animate={{ opacity: hiding ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ pointerEvents: "none" }}
        >
          {/* Left arm */}
          <path d="M10 56 Q22 30 38 44" stroke={body} strokeWidth="13" strokeLinecap="round" fill="none" />
          {/* Right arm */}
          <path d="M62 44 Q78 30 90 56" stroke={body} strokeWidth="13" strokeLinecap="round" fill="none" />
          {/* Closed eye lines */}
          <path d="M30 46 Q38 42 46 46" stroke="rgba(255,255,255,0.70)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M54 46 Q62 42 70 46" stroke="rgba(255,255,255,0.70)" strokeWidth="3" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* ── OPEN STATE ── */}
        <motion.g
          animate={{ opacity: hiding ? 0 : 1 }}
          transition={{ duration: 0.22 }}
          style={{ pointerEvents: "none" }}
        >
          {/* Eye whites */}
          <circle cx="35" cy="48" r="10" fill="white" />
          <circle cx="65" cy="48" r="10" fill="white" />
          {/* Pupils */}
          <circle cx={watching ? 36 : 35} cy={watching ? 50 : 48} r="6" fill="#0A0D1A" />
          <circle cx={watching ? 64 : 65} cy={watching ? 50 : 48} r="6" fill="#0A0D1A" />
          {/* Eye shine */}
          <circle cx={watching ? 37 : 36} cy={watching ? 47 : 46} r="2.2" fill="white" />
          <circle cx={watching ? 65 : 66} cy={watching ? 47 : 46} r="2.2" fill="white" />
          {/* Mouth */}
          <path
            d={watching ? "M36 66 Q50 75 64 66" : "M36 64 Q50 70 64 64"}
            stroke="#0A0D1A" strokeWidth="3" strokeLinecap="round" fill="none"
          />
          {/* Eyebrows when watching */}
          {watching && (
            <>
              <path d="M29 37 Q35 33 41 37" stroke="#0A0D1A" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d="M59 37 Q65 33 71 37" stroke="#0A0D1A" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
            </>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
}

// ── Character Stage ───────────────────────────────────────────────────────────
function CharacterStage({ stage }: { stage: CharStage }) {
  return (
    <div
      className="flex items-end justify-center gap-3 px-6 pt-6 pb-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.22)" }}
    >
      {CHARS.map((c) => (
        <CharSVG key={c.id} {...c} stage={stage} />
      ))}
    </div>
  );
}

// ── Social Auth ───────────────────────────────────────────────────────────────
const SOCIAL = [
  {
    id: "google", name: "Google",
    hoverBg: "rgba(66,133,244,0.12)", hoverBorder: "rgba(66,133,244,0.50)", hoverShadow: "rgba(66,133,244,0.20)",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: "github", name: "GitHub",
    hoverBg: "rgba(255,255,255,0.08)", hoverBorder: "rgba(255,255,255,0.30)", hoverShadow: "rgba(255,255,255,0.08)",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="white">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
  {
    id: "linkedin", name: "LinkedIn",
    hoverBg: "rgba(10,102,194,0.15)", hoverBorder: "rgba(10,102,194,0.55)", hoverShadow: "rgba(10,102,194,0.22)",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    id: "apple", name: "Apple",
    hoverBg: "rgba(255,255,255,0.07)", hoverBorder: "rgba(255,255,255,0.28)", hoverShadow: "rgba(255,255,255,0.07)",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="white">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
] as const;

// ── Role cards (register only) ────────────────────────────────────────────────
const ROLES = [
  {
    value: "student" as const,
    label: "Öğrenci",
    desc: "Proje yükle, takip et, portfolyo oluştur.",
    Icon: GraduationCap,
    bar: "#A020F0",
    labelColor: "#C97EFF",
  },
  {
    value: "teacher" as const,
    label: "Öğretmen",
    desc: "Projeleri denetle ve puan ver.",
    Icon: Shield,
    bar: "#FF7F50",
    labelColor: "#FFA880",
  },
];

// ── Input focus helpers ───────────────────────────────────────────────────────
const FOCUS_STYLE  = { borderColor: "rgba(160,32,240,0.55)", background: "rgba(255,255,255,0.08)", boxShadow: "0 0 0 3px rgba(160,32,240,0.13)" };
const BLUR_STYLE   = { borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.05)", boxShadow: "none" };
const INPUT_BASE   = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", caretColor: "#C97EFF" };

// ── Main exported component ───────────────────────────────────────────────────
export default function AnimatedCharactersLoginPage({
  mode,
  message,
}: {
  mode: Mode;
  message?: string;
}) {
  const [activeField, setActiveField] = useState<string>("none");
  const [role,        setRole]        = useState<"student" | "teacher">("student");
  const [showPwd,     setShowPwd]     = useState(false);
  const [hovSocial,   setHovSocial]   = useState<string | null>(null);

  const stage: CharStage =
    activeField === "password" ? "hiding"
    : activeField !== "none"   ? "watching"
    : "idle";

  const focus = (field: string) => () => setActiveField(field);
  const blur  = ()               => setActiveField("none");

  const isLogin = mode === "login";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
        Ana Sayfaya Dön
      </Link>

      {/* Glassmorphism card */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* ── Character stage ── */}
        <CharacterStage stage={stage} />

        {/* ── Logo + heading ── */}
        <div className="flex flex-col items-center pt-6 pb-2 px-7">
          <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <Sparkles className="w-5 h-5" style={{ color: "#C97EFF" }} />
            <span className="font-extrabold text-xl tracking-tight text-white">Steply</span>
          </Link>
          <h1 className="text-xl font-extrabold text-white tracking-tight mb-1">
            {isLogin ? "Tekrar Hoş Geldin" : "Topluluğa Katıl"}
          </h1>
          <p className="text-slate-500 text-xs text-center leading-relaxed mb-1">
            {isLogin
              ? "Projelerine devam etmek için hesabına giriş yap."
              : "Hemen kayıt ol ve akademik yolculuğunu başlat."}
          </p>
        </div>

        {/* ── Card body ── */}
        <div className="px-7 pb-7 flex flex-col gap-0">

          {/* Register: role selector */}
          {!isLogin && (
            <div className="mb-5 mt-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-2.5">
                Rolünüzü Seçin
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map(({ value, label, desc, Icon, bar, labelColor }) => {
                  const active = role === value;
                  return (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      whileTap={{ scale: 0.97 }}
                      className="relative flex flex-col items-center gap-2 p-3.5 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden text-center"
                      style={{
                        background: active ? `${bar}14` : "rgba(255,255,255,0.03)",
                        border: active ? `1px solid ${bar}55` : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: active ? `0 0 18px ${bar}1A` : "none",
                      }}
                    >
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            key="check"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-2 right-2"
                          >
                            <CheckCircle
                              className="w-3.5 h-3.5"
                              style={{ color: bar, filter: `drop-shadow(0 0 4px ${bar}99)` }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: active ? `${bar}22` : "rgba(255,255,255,0.05)",
                          border: `1px solid ${active ? `${bar}44` : "rgba(255,255,255,0.08)"}`,
                          transition: "all 0.2s",
                        }}
                      >
                        <Icon
                          className="w-5 h-5 transition-all duration-200"
                          style={{ color: active ? labelColor : "rgba(255,255,255,0.28)" }}
                        />
                      </div>
                      <span
                        className="text-xs font-extrabold transition-colors duration-200"
                        style={{ color: active ? "#fff" : "rgba(255,255,255,0.38)" }}
                      >
                        {label}
                      </span>
                      <p
                        className="text-[9px] leading-snug transition-colors duration-200"
                        style={{ color: active ? labelColor : "rgba(255,255,255,0.18)" }}
                      >
                        {desc}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Form ── */}
          <form
            action={isLogin ? "/api/auth/login" : "/api/auth/register"}
            method="post"
            className="flex flex-col gap-3.5"
          >
            {!isLogin && <input type="hidden" name="role" value={role} />}

            {/* Full name (register only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-600">Ad Soyad</label>
                <input
                  name="fullName"
                  placeholder="Ali Yılmaz"
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  style={INPUT_BASE}
                  onFocus={(e) => { setActiveField("name"); Object.assign(e.currentTarget.style, FOCUS_STYLE); }}
                  onBlur={(e)  => { blur(); Object.assign(e.currentTarget.style, BLUR_STYLE); }}
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-slate-600">E-posta</label>
              <input
                name="email"
                type="email"
                placeholder="ornek@ogrenci.edu.tr"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                style={INPUT_BASE}
                onFocus={(e) => { focus("email")(); Object.assign(e.currentTarget.style, FOCUS_STYLE); }}
                onBlur={(e)  => { blur(); Object.assign(e.currentTarget.style, BLUR_STYLE); }}
              />
            </div>

            {/* Institution (register only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-600">
                  Kurum <span className="text-slate-700 font-normal normal-case tracking-normal">(opsiyonel)</span>
                </label>
                <input
                  name="institution"
                  placeholder="İstanbul Teknik Üniversitesi"
                  autoComplete="organization"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  style={INPUT_BASE}
                  onFocus={(e) => { focus("institution")(); Object.assign(e.currentTarget.style, FOCUS_STYLE); }}
                  onBlur={(e)  => { blur(); Object.assign(e.currentTarget.style, BLUR_STYLE); }}
                />
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-600">Şifre</label>
                {isLogin && (
                  <Link href="#" className="text-[10px] font-semibold transition-colors hover:text-purple-300" style={{ color: "#A78BFA" }}>
                    Şifremi Unuttum
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={isLogin ? undefined : 6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  style={INPUT_BASE}
                  onFocus={(e) => { focus("password")(); Object.assign(e.currentTarget.style, FOCUS_STYLE); }}
                  onBlur={(e)  => { blur(); Object.assign(e.currentTarget.style, BLUR_STYLE); }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-aura group relative w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm overflow-hidden mt-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
              <span className="relative z-10">
                {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
              </span>
            </button>

            {/* Error message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl text-center leading-relaxed"
              >
                {message}
              </motion.div>
            )}
          </form>

          {/* ── Social auth ── */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-[10px] font-medium text-slate-600 whitespace-nowrap">Veya şununla devam et</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {SOCIAL.map((s) => {
              const isHov = hovSocial === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  title={s.name}
                  onMouseEnter={() => setHovSocial(s.id)}
                  onMouseLeave={() => setHovSocial(null)}
                  className="flex items-center justify-center py-2.5 rounded-xl transition-all duration-200"
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

          {/* Switch link */}
          <p className="mt-5 text-center text-xs text-slate-500">
            {isLogin ? (
              <>
                Hesabın yok mu?{" "}
                <Link href="/auth/register" className="font-bold transition-colors hover:text-purple-300" style={{ color: "#C97EFF" }}>
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <>
                Zaten hesabın var mı?{" "}
                <Link href="/auth/login" className="font-bold transition-colors hover:text-purple-300" style={{ color: "#C97EFF" }}>
                  Giriş Yap
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
