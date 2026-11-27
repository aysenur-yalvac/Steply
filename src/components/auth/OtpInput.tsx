"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTeacherEmail } from "@/lib/email-classification";
import { Mail, Loader2, RefreshCw, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function OtpInput({ email, role = "student" }: { email: string; role?: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("E-postanız doğrulandı!");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  
  const [shake, setShake] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Önceki yarım kalmış oturum/token kalıntılarını temizle ve ilk kutuya odaklan
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.signOut().catch(() => {});
    } catch {}
    inputRefs.current[0]?.focus();
  }, []);

  const formatOtpError = (raw: string): string => {
    return raw;
  };

  const handleVerify = async (code?: string) => {
    const rawToken = code !== undefined ? code : otp.join("");
    const token = String(rawToken).replace(/\D/g, "").trim();
    if (token.length !== 6) {
      setError("Lütfen 6 haneli doğrulama kodunu eksiksiz girin.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const supabase = createClient();
      let verified = false;
      let redirectDestination = "/dashboard";

      // 1. Doğrudan Supabase client verifyOtp (type: 'signup')
      try {
        const { data: suData, error: suErr } = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token,
          type: "signup",
        });

        if (!suErr && suData?.session) {
          verified = true;
        } else {
          // 2. Fallback type: 'email'
          const { data: emData, error: emErr } = await supabase.auth.verifyOtp({
            email: normalizedEmail,
            token,
            type: "email",
          });
          if (!emErr && emData?.session) {
            verified = true;
          }
        }
      } catch (clientErr) {
        console.warn("[OtpInput] Client verifyOtp exception:", clientErr);
      }

      // 3. İstemci verifyOtp başarılı olmadıysa sunucu API'miz üzerinden doğrula (Resend / DB OTP desteği)
      if (!verified) {
        const res = await fetch("/api/auth/verify-otp-8", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, code: token, token }),
        });
        const data = await res.json();

        if (res.ok && (data.success || data.verified)) {
          verified = true;
          if (data.redirectUrl) {
            redirectDestination = data.redirectUrl;
          } else if (data.magicLink) {
            redirectDestination = data.magicLink;
          }
        } else {
          const rawErr = data.error || "Geçersiz veya süresi dolmuş kod. Lütfen tekrar deneyin.";
          setError(formatOtpError(rawErr));
          setShake(true);
          setTimeout(() => setShake(false), 400);
          setOtp(Array(6).fill(""));
          return;
        }
      }

      setSuccessMsg("E-postanız başarıyla doğrulandı! Oturumunuz açılıyor...");
      setSuccess(true);

      setTimeout(() => {
        window.location.href = redirectDestination;
      }, 1000);
    } catch {
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
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
    
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (digit && index === 5 && newOtp.every((d) => d !== "")) {
      setTimeout(() => handleVerify(newOtp.join("")), 50);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
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
    
    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
    
    if (paste.length === 6) {
      setTimeout(() => handleVerify(paste), 50);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/send-otp-8", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, role }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Kod gönderilemedi.");
      }
      
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      const rawMsg = err.message || "Bilinmeyen hata";
      setError(formatOtpError(rawMsg));
    } finally {
      setResending(false);
    }
  };

  const isTeacher = isTeacherEmail(email);

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
    <div className="flex flex-col items-center gap-4 relative w-full">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .otp-shake {
          animation: shake 0.4s ease-in-out;
        }
        .otp-card {
          transform-origin: 50% 320%;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, background-color 0.2s, box-shadow 0.2s, color 0.2s;
        }
      `}</style>

      <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(160,32,240,0.12)", border: "1px solid rgba(160,32,240,0.3)" }}>
        <Mail className="w-7 h-7 text-purple-400" />
      </div>

      <div className="text-center">
        {loading ? (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-2">Kontrol ediliyor...</h1>
            <p className="text-slate-400 text-sm max-w-sm">
              Bir saniye, 6 haneli kodunuzu doğruluyoruz.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-2">E-postanızı doğrulayın</h1>
            <p className="text-slate-400 text-sm max-w-sm">
              <span className="text-purple-300 font-semibold break-all">{email}</span> adresine gönderilen 6 haneli kodu girin.
            </p>
          </>
        )}
      </div>

      {role === "teacher" && isTeacher && (
        <p className="text-xs text-amber-400 text-center max-w-sm">
          Kurumsal öğretmen e-postası — doğrulama sonrası otomatik yetkilendirileceksiniz.
        </p>
      )}

      {/* OTP DECK CONTAINER - 6 HANELİ KUTULAR */}
      <div 
        className={`flex items-center justify-center gap-1.5 sm:gap-2.5 relative my-2 w-full max-w-full ${shake ? "otp-shake" : ""}`}
      >
        {otp.map((digit, i) => {
          let transform = "";
          
          if (loading) {
            const translateX = (2.5 - i) * 36;
            transform = `translateX(${translateX}px) translateY(-10px) rotate(0deg) scale(0.9)`;
          } else {
            const rotateDeg = (i - 2.5) * 4;
            transform = `translateY(0px) rotate(${rotateDeg}deg) scale(1)`;
          }

          return (
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
              readOnly={loading}
              className="otp-card w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-extrabold rounded-xl outline-none shrink-0"
              style={{
                color: loading ? "transparent" : "white",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: digit && !loading ? "0 0 10px rgba(160,32,240,0.2)" : "none",
                borderColor: digit && !loading ? "rgba(160,32,240,0.5)" : "rgba(255,255,255,0.1)",
                transform: transform,
                zIndex: loading ? 6 - Math.abs(2.5 - i) : 1
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(160,32,240,0.8)";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(160,32,240,0.4)";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = digit ? "rgba(160,32,240,0.5)" : "rgba(255,255,255,0.1)";
                e.currentTarget.style.boxShadow = digit ? "0 0 10px rgba(160,32,240,0.2)" : "none";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            />
          );
        })}
      </div>

      {/* Hata veya Bilgi Bildirimi */}
      {error && (
        <div
          role="alert"
          className="w-full max-w-sm rounded-xl px-4 py-3 text-xs leading-relaxed text-rose-200 text-center border border-rose-500/40 bg-rose-950/50 shadow-sm transition-all"
        >
          {error}
        </div>
      )}

      {resent && !error && (
        <div
          className="w-full max-w-sm rounded-xl px-4 py-2.5 text-xs text-emerald-300 text-center border border-emerald-500/30 bg-emerald-950/50 shadow-sm"
        >
          6 haneli kod tekrar gönderildi. Spam/gereksiz klasörünüze de bakınız.
        </div>
      )}

      <button
        type="button"
        onClick={() => handleVerify()}
        disabled={loading || otp.some((d) => d === "")}
        className="w-full max-w-sm py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:cursor-not-allowed shadow-md"
        style={{
          background: "linear-gradient(135deg, #A020F0 0%, #7C3AFF 100%)",
          opacity: loading || otp.some((d) => d === "") ? 0.5 : 1,
        }}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Doğrulanıyor..." : "Doğrula"}
      </button>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Kodu almadınız mı?</span>
        <button type="button" onClick={handleResend}
          disabled={resending || resent}
          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-medium">
          {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {resent ? "Gönderildi!" : "Yeniden gönder"}
        </button>
      </div>
    </div>
  );
}
