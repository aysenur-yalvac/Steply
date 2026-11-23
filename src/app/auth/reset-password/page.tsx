"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlCode = searchParams.get("code");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    urlError === "invalid_link"
      ? "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama bağlantısı isteyin."
      : null
  );
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) {
        setHasSession(true);
        setErrorMsg(null);
        setCheckingSession(false);
      }
    });

    async function init() {
      try {
        if (urlCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(urlCode);
          if (error && active) {
            setErrorMsg(
              "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama bağlantısı isteyin."
            );
            setCheckingSession(false);
            return;
          }
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (session) {
          setHasSession(true);
          setErrorMsg(null);
        } else if (!urlError) {
          setErrorMsg(
            "Oturum doğrulanamadı. Lütfen e-postanızdaki şifre sıfırlama bağlantısına tekrar tıklayın veya yeni bir bağlantı isteyin."
          );
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    init();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [urlCode, urlError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      const msg = "Yeni şifre en az 6 karakter olmalıdır.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = "Yeni şifreler eşleşmiyor.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        const msg = error.message || "Şifre güncellenemedi. Lütfen tekrar deneyin.";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      setSuccess(true);
      toast.success("Şifreniz başarıyla güncellendi.");
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0e14] transition-colors">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-800 shadow-xl p-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Panele Dön
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/60 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Yeni Şifre Belirle
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hesabınız için yeni bir şifre oluşturun.
            </p>
          </div>
        </div>

        {checkingSession ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-violet-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bağlantı doğrulanıyor...
            </p>
          </div>
        ) : success ? (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-5 text-center space-y-2">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              Şifreniz başarıyla güncellendi!
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Panele yönlendiriliyorsunuz...
            </p>
          </div>
        ) : !hasSession ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-4 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                {errorMsg || "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors"
              >
                Giriş Sayfasına Git
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Ayarlara Dön
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="resetNewPassword"
                className="text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  id="resetNewPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 pr-11 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                  aria-label={showNew ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="resetConfirmPassword"
                className="text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Yeni Şifreyi Onayla
              </label>
              <div className="relative">
                <input
                  id="resetConfirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar girin"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 pr-11 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                  aria-label={showConfirm ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7C3AFF 0%, #9333ea 100%)" }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0e14]">
          <Loader2 className="w-7 h-7 animate-spin text-violet-600" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
