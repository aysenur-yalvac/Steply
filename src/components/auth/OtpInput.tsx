"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { classifyEmail } from "@/lib/email-classification";
import { Loader2, Mail, CheckCircle, RefreshCw, Shield } from "lucide-react";

export default function OtpInput({ email }: { email: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(8).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("E-postaniz dogrulandi!");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    // Sayfa yuklendiginde otomatik olarak kodu gonder
    handleResend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (code?: string) => {
    const token = code || otp.join("");
    if (token.length !== 8) {
      setError("Lutfen 8 haneli kodu eksiksiz girin.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp-8", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gecersiz veya suresi dolmus kod. Lutfen tekrar deneyin.");
        setOtp(Array(8).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccessMsg("E-postaniz dogrulandi! Oturumunuz aciliyor...");
      setSuccess(true);
      
      // Magic link ile otomatik login ve yonlendirme
      setTimeout(() => {
        if (data.magicLink) {
          window.location.href = data.magicLink;
        } else {
          router.replace("/dashboard");
        }
      }, 1500);

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
    if (digit && index < 7) inputRefs.current[index + 1]?.focus();
    if (digit && index === 7 && newOtp.every((d) => d !== "")) handleVerify(newOtp.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 7) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    const newOtp = [...otp];
    paste.split("").forEach((char, i) => { if (i < 8) newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(paste.length, 7)]?.focus();
    if (paste.length === 8) handleVerify(paste);
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-otp-8", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Kod gonderilemedi.");
      }
      
      // Development Fallback & Resend Success Toast
      // Biz burada hata degil ama kullaniciya guven verici toast (yada metin) gosteriyoruz
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(`E-posta gonderilemedi: ${err.message || "Bilinmeyen hata"}`);
    } finally {
      setResending(false);
    }
  };

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
        <h1 className="text-2xl font-extrabold text-white mb-2">E-postanizi dogrulayin</h1>
        <p className="text-slate-400 text-sm max-w-sm">
          <span className="text-purple-300 font-semibold">{email}</span>{" "}
          adresine gonderilen 8 haneli kodu girin.
        </p>
      </div>

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

      {/* 8 OTP Inputs */}
      <div className="flex gap-2">
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
            className="w-10 h-12 text-center text-xl font-bold text-white rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: digit ? "0 0 10px rgba(160,32,240,0.2)" : "none",
              borderColor: digit ? "rgba(160,32,240,0.5)" : "rgba(255,255,255,0.1)",
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

      {resent && !error && (
        <div className="w-full max-w-xs rounded-xl px-4 py-3 text-xs text-green-300 text-center"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
          8 haneli kod e-postaniza tekrar gonderildi. Lutfen spam/gereksiz klasorunu de kontrol ediniz.
        </div>
      )}

      <button
        type="button"
        onClick={() => handleVerify()}
        disabled={loading || otp.some((d) => d === "")}
        className="w-full max-w-xs py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, #A020F0 0%, #7C3AFF 100%)",
          opacity: loading || otp.some((d) => d === "") ? 0.5 : 1,
        }}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Dogrulaniyor..." : "Dogrula"}
      </button>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Kodu almadiniz mi?</span>
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
