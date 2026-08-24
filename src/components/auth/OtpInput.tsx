"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { classifyEmail } from "@/lib/email-classification";
import { Loader2, Mail, CheckCircle, RefreshCw, Shield } from "lucide-react";

export default function OtpInput({ email }: { email: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("E-postaniz dogrulandi!");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const applyDomainProfile = async (userId: string) => {
    const classification = classifyEmail(email);
    if (!classification.role) return; // Kisisel mail — profil deger degistirmiyoruz

    const supabase = createClient();
    const updates: Record<string, string> = {};

    if (classification.role === "teacher") {
      updates.role = "teacher";
      updates.teacher_status = "verified"; // Kurumsal ogretmen → anında verified
    } else if (classification.role === "student") {
      updates.role = "student";
    }

    await supabase.from("profiles").update(updates).eq("id", userId);
    return classification;
  };

  const handleVerify = async (code?: string) => {
    const token = code ?? otp.join("");
    if (token.length < 6) { setError("Lutfen 6 haneli kodu girin."); return; }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (verifyError) {
        setError("Gecersiz veya suresi dolmus kod. Lutfen tekrar deneyin.");
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      // Domain bazli profil otomasyonu
      const userId = data.user?.id;
      if (userId) {
        const classification = await applyDomainProfile(userId);

        if (classification?.role === "teacher" && classification.teacherStatus === "verified") {
          setSuccessMsg("Kurumsal e-postaniz dogrulandi! Ogretmen panelinize yonlendiriliyorsunuz...");
          setSuccess(true);
          setTimeout(() => router.replace("/dashboard"), 1800);
          return;
        } else if (classification?.role === "student") {
          setSuccessMsg("E-postaniz dogrulandi! Ogrenci panelinize yonlendiriliyorsunuz...");
        }
      }

      setSuccess(true);
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch {
      setError("Beklenmeyen bir hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (digit && index === 5 && newOtp.every((d) => d !== "")) handleVerify(newOtp.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    paste.split("").forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
    if (paste.length === 6) handleVerify(paste);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const supabase = createClient();
      await supabase.auth.resend({ type: "signup", email });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } finally {
      setResending(false);
    }
  };

  // Domain siniflandirmasini UI'da goster
  const classification = classifyEmail(email);
  const isInstitutional = classification.role !== null;

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-white font-bold text-lg">{successMsg}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "rgba(160,32,240,0.12)", border: "1px solid rgba(160,32,240,0.3)" }}>
        <Mail className="w-7 h-7 text-purple-400" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-white mb-2">E-postanizi dogrulayın</h1>
        <p className="text-slate-400 text-sm max-w-sm">
          <span className="text-purple-300 font-semibold">{email}</span>{" "}
          adresine gonderilen 6 haneli kodu girin.
        </p>
      </div>

      {/* Kurumsal domain bilgi badge */}
      {isInstitutional && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: classification.role === "teacher"
              ? "rgba(160,32,240,0.12)"
              : "rgba(34,197,94,0.10)",
            border: classification.role === "teacher"
              ? "1px solid rgba(160,32,240,0.3)"
              : "1px solid rgba(34,197,94,0.25)",
            color: classification.role === "teacher" ? "#C97EFF" : "#6EE7B7",
          }}>
          <Shield className="w-3 h-3" />
          {classification.role === "teacher"
            ? "Kurumsal ogretmen e-postasi — dogrulama sonrasi otomatik yetkilendirileceksiniz"
            : "Kurumsal ogrenci e-postasi"}
        </div>
      )}

      {/* OTP Inputs */}
      <div className="flex gap-3">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-2xl font-bold rounded-xl transition-all duration-200 outline-none"
            style={{
              background: digit ? "rgba(160,32,240,0.15)" : "rgba(255,255,255,0.05)",
              border: error
                ? "2px solid rgba(239,68,68,0.6)"
                : digit
                  ? "2px solid rgba(160,32,240,0.6)"
                  : "2px solid rgba(255,255,255,0.12)",
              color: "white",
              caretColor: "#A020F0",
            }}
          />
        ))}
      </div>

      {error && (
        <div className="w-full max-w-xs rounded-xl px-4 py-3 text-sm text-red-300 text-center"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => handleVerify()}
        disabled={loading || otp.some((d) => d === "")}
        className="w-full max-w-xs py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #A020F0 0%, #7C3AFF 100%)",
          opacity: loading || otp.some((d) => d === "") ? 0.6 : 1,
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Dogrulanıyor..." : "Dogrula"}
      </button>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Kodu almadınız mı?</span>
        <button type="button" onClick={handleResend}
          disabled={resending || resent}
          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-medium">
          {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {resent ? "Gonderildi!" : "Yeniden gonder"}
        </button>
      </div>
    </div>
  );
}
