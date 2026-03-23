"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Eye, EyeOff, GraduationCap, Shield, ArrowLeft, CheckCircle } from "lucide-react";
import SocialAuthRow from "@/components/auth/SocialAuthRow";

// ── Shared input focus helpers ────────────────────────────────────────────────
const INPUT_BASE = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  caretColor: "#C97EFF",
} as const;

const INPUT_FOCUS = {
  borderColor: "rgba(160,32,240,0.50)",
  background: "rgba(255,255,255,0.08)",
  boxShadow: "0 0 0 3px rgba(160,32,240,0.12)",
} as const;

const INPUT_BLUR = {
  borderColor: "rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  boxShadow: "none",
} as const;

function AuraInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
      style={{ ...INPUT_BASE, ...props.style }}
      onFocus={(e) => Object.assign(e.currentTarget.style, INPUT_FOCUS)}
      onBlur={(e)  => Object.assign(e.currentTarget.style, INPUT_BLUR)}
    />
  );
}

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES = [
  {
    value: "student" as const,
    label: "Öğrenci",
    sublabel: "Student",
    desc: "Proje yükle, kilometre taşlarını takip et ve akademik portfolyo oluştur.",
    Icon: GraduationCap,
    bar: "#A020F0",
    label_color: "#C97EFF",
  },
  {
    value: "teacher" as const,
    label: "Öğretmen",
    sublabel: "Teacher",
    desc: "Öğrenci projelerini denetle, geri bildirim ver ve puan belirle.",
    Icon: Shield,
    bar: "#FF7F50",
    label_color: "#FFA880",
  },
];

export default function RegisterCard({ message }: { message?: string }) {
  const [role, setRole]       = useState<"student" | "teacher">("student");
  const [showPwd, setShowPwd] = useState(false);

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

      {/* Logo + heading */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center gap-2.5 mb-5 hover:opacity-80 transition-opacity">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(160,32,240,0.18)", border: "1px solid rgba(160,32,240,0.38)" }}
          >
            <BookOpen className="w-5 h-5" style={{ color: "#C97EFF" }} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Steply</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Topluluğa Katıl</h1>
        <p className="text-slate-500 text-sm text-center leading-relaxed">
          Hemen kayıt ol ve akademik yolculuğunu başlat.
        </p>
      </div>

      {/* Glassmorphism card */}
      <div
        className="w-full p-7 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >

        {/* ── Role selector ── */}
        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-3">
            Rolünüzü Seçin
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, desc, Icon, bar, label_color }) => {
              const isActive = role === value;
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex flex-col items-center gap-2.5 p-4 rounded-xl cursor-pointer text-center transition-all duration-200 overflow-hidden"
                  style={{
                    background: isActive ? `${bar}14` : "rgba(255,255,255,0.03)",
                    border: isActive ? `1px solid ${bar}55` : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isActive ? `0 0 18px ${bar}20` : "none",
                  }}
                >
                  {/* Active check */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-2 right-2"
                      >
                        <CheckCircle
                          className="w-3.5 h-3.5"
                          style={{ color: bar, filter: `drop-shadow(0 0 4px ${bar}88)` }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Icon circle */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: isActive ? `${bar}22` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isActive ? `${bar}44` : "rgba(255,255,255,0.08)"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    <Icon
                      className="w-5 h-5 transition-all duration-200"
                      style={{ color: isActive ? label_color : "rgba(255,255,255,0.28)" }}
                    />
                  </div>

                  <span
                    className="text-sm font-extrabold transition-colors duration-200"
                    style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.38)" }}
                  >
                    {label}
                  </span>

                  <p
                    className="text-[10px] leading-snug transition-colors duration-200"
                    style={{ color: isActive ? label_color : "rgba(255,255,255,0.18)" }}
                  >
                    {desc}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Form ── */}
        <form action="/api/auth/register" method="post" className="flex flex-col gap-4">
          {/* Hidden role field — updated by toggle above */}
          <input type="hidden" name="role" value={role} />

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
              Ad Soyad
            </label>
            <AuraInput
              name="fullName"
              placeholder="Ali Yılmaz"
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
              E-posta Adresi
            </label>
            <AuraInput
              name="email"
              type="email"
              placeholder="ornek@ogrenci.edu.tr"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
              Şifre
            </label>
            <div className="relative">
              <AuraInput
                name="password"
                type={showPwd ? "text" : "password"}
                placeholder="En az 6 karakter"
                required
                minLength={6}
                autoComplete="new-password"
                style={{ paddingRight: "2.75rem", ...INPUT_BASE }}
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

          {/* Institution (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
              Kurum <span className="text-slate-700 font-normal normal-case tracking-normal">(opsiyonel)</span>
            </label>
            <AuraInput
              name="institution"
              placeholder="İstanbul Teknik Üniversitesi"
              autoComplete="organization"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-aura group relative w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm overflow-hidden mt-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
            <span className="relative z-10">Hesap Oluştur</span>
          </button>

          {/* Error / info message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl text-center leading-relaxed"
            >
              {message}
            </motion.div>
          )}
        </form>

        {/* Social auth */}
        <SocialAuthRow />

        {/* Login link */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Zaten hesabın var mı?{" "}
          <Link
            href="/auth/login"
            className="font-bold transition-colors hover:text-purple-300"
            style={{ color: "#C97EFF" }}
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
