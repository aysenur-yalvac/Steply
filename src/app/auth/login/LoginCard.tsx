"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff, ArrowLeft } from "lucide-react";
import SocialAuthRow from "@/components/auth/SocialAuthRow";

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
      style={INPUT_BASE}
      onFocus={(e) => Object.assign(e.currentTarget.style, INPUT_FOCUS)}
      onBlur={(e)  => Object.assign(e.currentTarget.style, INPUT_BLUR)}
    />
  );
}

export default function LoginCard({ message }: { message?: string }) {
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
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Tekrar Hoş Geldin</h1>
        <p className="text-slate-500 text-sm text-center leading-relaxed">
          Projelerine devam etmek için hesabına giriş yap.
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
        <form action="/api/auth/login" method="post" className="flex flex-col gap-4">

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
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
                Şifre
              </label>
              <Link
                href="#"
                className="text-[11px] font-semibold transition-colors hover:text-purple-300"
                style={{ color: "#A78BFA" }}
              >
                Şifremi Unuttum
              </Link>
            </div>
            <div className="relative">
              <AuraInput
                name="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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

          {/* Submit */}
          <button
            type="submit"
            className="btn-aura group relative w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm overflow-hidden mt-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
            <span className="relative z-10">Giriş Yap</span>
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

        {/* Register link */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Hesabın yok mu?{" "}
          <Link
            href="/auth/register"
            className="font-bold transition-colors hover:text-purple-300"
            style={{ color: "#C97EFF" }}
          >
            Kayıt Ol
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
