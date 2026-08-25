const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/auth/OtpInput.tsx');

const content = `"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTeacherEmail } from "@/lib/email-classification";
import { Mail, Loader2, RefreshCw, CheckCircle, Shield } from "lucide-react";

export default function OtpInput({ email, role = "student" }: { email: string; role?: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(8).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("E-postaniz dogrulandi!");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  
  // States for Deck Animation
  const [isFocused, setIsFocused] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // DO NOT auto-focus on mount so the user can see the deck animation!
    handleResend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (code?: string) => {
    const token = code || otp.join("");
    if (token.length !== 8) {
      setError("Lütfen 8 haneli kodu eksiksiz girin.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
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
        setError(data.error || "Geçersiz veya süresi dolmuş kod. Lütfen tekrar deneyin.");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setOtp(Array(8).fill(""));
        // Don't auto-focus so deck animation resets, or let them click again
        return;
      }

      setSuccessMsg("E-postanız doğrulandı! Oturumunuz açılıyor...");
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
      setError("Beklenmeyen bir hata oluştu.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);
    
    // Auto-advance
    if (digit && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify if complete
    if (digit && index === 7 && newOtp.every((d) => d !== "")) {
      // Small timeout to allow state to settle
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
    if (e.key === "ArrowRight" && index < 7) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\\D/g, "").slice(0, 8);
    const newOtp = [...otp];
    paste.split("").forEach((char, i) => { if (i < 8) newOtp[i] = char; });
    setOtp(newOtp);
    
    const nextIndex = Math.min(paste.length, 7);
    inputRefs.current[nextIndex]?.focus();
    
    if (paste.length === 8) {
      setTimeout(() => handleVerify(paste), 50);
    }
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
        throw new Error(data.error || "Kod gönderilemedi.");
      }
      
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(\`E-posta gönderilemedi: \${err.message || "Bilinmeyen hata"}\`);
    } finally {
      setResending(false);
    }
  };

  const isTeacher = isTeacherEmail(email);
  const hasValue = otp.some((d) => d !== "");
  
  // State 1: Idle (Deck is fanned out) -> !isFocused && !hasValue && !loading
  // State 2: Active (Flat) -> (isFocused || hasValue) && !loading
  // State 3: Verifying (Gathered) -> loading
  const isIdle = !isFocused && !hasValue && !loading;

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
    <div className="flex flex-col items-center gap-6 relative w-full">
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
          transform-origin: 50% 300%;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
        }
      `}</style>

      <div className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "rgba(160,32,240,0.12)", border: "1px solid rgba(160,32,240,0.3)" }}>
        <Mail className="w-7 h-7 text-purple-400" />
      </div>

      <div className="text-center h-16">
        {loading ? (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-2">Kontrol ediliyor...</h1>
            <p className="text-slate-400 text-sm max-w-sm">
              Bir saniye, kodunuzu dogruluyoruz.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-2">E-postanızı doğrulayın</h1>
            <p className="text-slate-400 text-sm max-w-sm">
              <span className="text-purple-300 font-semibold">{email}</span> adresine gönderilen 8 haneli kodu girin.
            </p>
          </>
        )}
      </div>

      {role === "teacher" && isTeacher && (
        <p className="text-xs text-amber-400 mb-2 text-center h-4">
          Kurumsal öğretmen e-postası — doğrulama sonrası otomatik yetkilendirileceksiniz.
        </p>
      )}

      {/* OTP DECK CONTAINER */}
      <div 
        className={\`flex gap-2 relative mt-4 mb-4 \${shake ? "otp-shake" : ""}\`}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          // Only unset focus if we aren't focusing another input inside the deck
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
          }
        }}
      >
        {otp.map((digit, i) => {
          let transform = "translateY(0px) rotate(0deg) scale(1)"; // Default active
          
          if (loading) {
            // State 3: Gathered in center
            const translateX = (3.5 - i) * 40;
            transform = \`translateX(\${translateX}px) translateY(-10px) rotate(0deg) scale(0.9)\`;
          } else if (isIdle) {
            // State 1: Fanned out
            const rotateDeg = (i - 3.5) * 4; // Adjusted to 4deg for 8 slots to look nice
            transform = \`translateY(0px) rotate(\${rotateDeg}deg) scale(1)\`;
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
              className="otp-card w-10 h-12 text-center text-xl font-bold text-white rounded-xl outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: digit && !loading ? "0 0 10px rgba(160,32,240,0.2)" : "none",
                borderColor: digit && !loading ? "rgba(160,32,240,0.5)" : "rgba(255,255,255,0.1)",
                transform: transform,
                zIndex: loading ? 8 - Math.abs(3.5 - i) : 1 // Center items on top when gathered
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

      <div className="h-10 w-full max-w-xs flex items-center justify-center">
        {error && (
          <div className="w-full rounded-xl px-4 py-2.5 text-sm text-red-300 text-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            {error}
          </div>
        )}
        
        {resent && !error && (
          <div className="w-full rounded-xl px-4 py-2.5 text-xs text-green-300 text-center"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
            8 haneli kod tekrar gönderildi. Spam/gereksiz klasörünüze de bakınız.
          </div>
        )}
      </div>

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
`;

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced OtpInput.tsx with Deck Animation code.");
