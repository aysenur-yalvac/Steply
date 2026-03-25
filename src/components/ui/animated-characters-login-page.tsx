"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Eye, EyeOff, GraduationCap, Shield, CheckCircle } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

// ── Pupil (tracks mouse, no white eyeball) ────────────────────────────────────
interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const rect = pupilRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const pos = calculatePosition();
  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

// ── EyeBall (full eyeball with blinking) ──────────────────────────────────────
interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const pos = calculatePosition();
  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
};

// ── Social auth ───────────────────────────────────────────────────────────────
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

// ── Role cards ────────────────────────────────────────────────────────────────
const ROLES = [
  { value: "student" as const, label: "Öğrenci", desc: "Proje yükle, takip et, portfolyo oluştur.", Icon: GraduationCap, bar: "#7C3AFF", labelColor: "#C97EFF" },
  { value: "teacher" as const, label: "Öğretmen", desc: "Projeleri denetle ve puan ver.", Icon: Shield, bar: "#FF7F50", labelColor: "#FFA880" },
];

// ── Input style helpers ───────────────────────────────────────────────────────
const INPUT_BASE: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "white", caretColor: "#C97EFF" };
const FOCUS_STYLE: React.CSSProperties = { borderColor: "rgba(124,58,255,0.55)", background: "rgba(255,255,255,0.08)", boxShadow: "0 0 0 3px rgba(124,58,255,0.13)" };
const BLUR_STYLE: React.CSSProperties  = { borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.05)", boxShadow: "none" };

// ── Main component ────────────────────────────────────────────────────────────
type Mode = "login" | "register";

export default function AnimatedCharactersLoginPage({
  mode,
  message,
}: {
  mode: Mode;
  message?: string;
}) {
  const isLogin = mode === "login";

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [role,         setRole]         = useState<"student" | "teacher">("student");
  const [hovSocial,    setHovSocial]    = useState<string | null>(null);

  // Mouse position
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Character animation states
  const [isPurpleBlinking,    setIsPurpleBlinking]    = useState(false);
  const [isBlackBlinking,     setIsBlackBlinking]     = useState(false);
  const [isTyping,             setIsTyping]            = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking,      setIsPurplePeeking]     = useState(false);

  // Character refs
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef  = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  // Mouse tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Purple blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => { setIsPurpleBlinking(false); scheduleBlink(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  // Black blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => { setIsBlackBlinking(false); scheduleBlink(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  // Look at each other when typing email
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const t = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(t);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // Purple peeking when password is visible
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const t = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => setIsPurplePeeking(false), 800);
        }, Math.random() * 3000 + 2000);
        return t;
      };
      const t = schedulePeek();
      return () => clearTimeout(t);
    } else {
      setIsPurplePeeking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 3;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const faceX   = Math.max(-15, Math.min(15, dx / 20));
    const faceY   = Math.max(-10, Math.min(10, dy / 30));
    const bodySkew = Math.max(-6,  Math.min(6, -dx / 120));
    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos  = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const passwordActive = password.length > 0;
  const passwordHidden = passwordActive && !showPassword;
  const passwordVisible = passwordActive && showPassword;

  return (
    <div className="flex-1 grid lg:grid-cols-2" style={{ minHeight: "calc(100vh - 4rem)" }}>

      {/* ── Left panel: Characters ────────────────────────────────────────── */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A0A3A 0%, #0D0B2A 50%, #0B0E14 100%)" }}
      >
        {/* Logo */}
        <div className="relative z-20">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,255,0.20)", border: "1px solid rgba(124,58,255,0.35)" }}>
              <Sparkles className="size-4" style={{ color: "#C97EFF" }} />
            </div>
            <span>Steply</span>
          </Link>
        </div>

        {/* Characters stage */}
        <div className="relative z-20 flex items-end justify-center" style={{ height: "440px" }}>
          <div className="relative" style={{ width: "550px", height: "400px" }}>

            {/* Purple tall rectangle — back layer */}
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "70px",
                width: "180px",
                height: (isTyping || passwordHidden) ? "440px" : "400px",
                backgroundColor: "#7C3AFF",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
                transform: passwordVisible
                  ? "skewX(0deg)"
                  : (isTyping || passwordHidden)
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left:   passwordVisible ? "20px" : isLookingAtEachOther ? "55px" : `${45 + purplePos.faceX}px`,
                  top:    passwordVisible ? "35px" : isLookingAtEachOther ? "65px" : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#0B0E14"
                  isBlinking={isPurpleBlinking}
                  forceLookX={passwordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={passwordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#0B0E14"
                  isBlinking={isPurpleBlinking}
                  forceLookX={passwordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={passwordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            {/* Dark rectangle — middle layer */}
            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "240px",
                width: "120px",
                height: "310px",
                backgroundColor: "#161929",
                borderRadius: "8px 8px 0 0",
                zIndex: 2,
                border: "1px solid rgba(124,58,255,0.15)",
                transform: passwordVisible
                  ? "skewX(0deg)"
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : passwordHidden
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: passwordVisible ? "10px" : isLookingAtEachOther ? "32px" : `${26 + blackPos.faceX}px`,
                  top:  passwordVisible ? "28px" : isLookingAtEachOther ? "12px" : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#0B0E14"
                  isBlinking={isBlackBlinking}
                  forceLookX={passwordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={passwordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#0B0E14"
                  isBlinking={isBlackBlinking}
                  forceLookX={passwordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={passwordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            {/* Coral semi-circle — front left */}
            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "0px",
                width: "240px",
                height: "200px",
                backgroundColor: "#FF7F50",
                borderRadius: "120px 120px 0 0",
                zIndex: 3,
                transform: passwordVisible ? "skewX(0deg)" : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: passwordVisible ? "50px" : `${82 + (orangePos.faceX || 0)}px`,
                  top:  passwordVisible ? "85px" : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#0B0E14"
                  forceLookX={passwordVisible ? -5 : undefined}
                  forceLookY={passwordVisible ? -4 : undefined}
                />
                <Pupil size={12} maxDistance={5} pupilColor="#0B0E14"
                  forceLookX={passwordVisible ? -5 : undefined}
                  forceLookY={passwordVisible ? -4 : undefined}
                />
              </div>
            </div>

            {/* Yellow rounded rectangle — front right */}
            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "310px",
                width: "140px",
                height: "230px",
                backgroundColor: "#FFD060",
                borderRadius: "70px 70px 0 0",
                zIndex: 4,
                transform: passwordVisible ? "skewX(0deg)" : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: passwordVisible ? "20px" : `${52 + (yellowPos.faceX || 0)}px`,
                  top:  passwordVisible ? "35px" : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#0B0E14"
                  forceLookX={passwordVisible ? -5 : undefined}
                  forceLookY={passwordVisible ? -4 : undefined}
                />
                <Pupil size={12} maxDistance={5} pupilColor="#0B0E14"
                  forceLookX={passwordVisible ? -5 : undefined}
                  forceLookY={passwordVisible ? -4 : undefined}
                />
              </div>
              <div
                className="absolute rounded-full transition-all duration-200 ease-out"
                style={{
                  width: "80px",
                  height: "4px",
                  backgroundColor: "#0B0E14",
                  left: passwordVisible ? "10px" : `${40 + (yellowPos.faceX || 0)}px`,
                  top:  passwordVisible ? "88px" : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="relative z-20 flex items-center gap-8 text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
          <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
          <a href="#" className="hover:text-white transition-colors">Kullanım Koşulları</a>
          <a href="#" className="hover:text-white transition-colors">İletişim</a>
        </div>

        {/* Decorative glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 right-1/4 size-64 rounded-full blur-3xl" style={{ background: "rgba(124,58,255,0.12)" }} />
          <div className="absolute bottom-1/4 left-1/4 size-96 rounded-full blur-3xl" style={{ background: "rgba(124,58,255,0.06)" }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,255,0.4), transparent)" }} />
        </div>
      </div>

      {/* ── Right panel: Form ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col overflow-y-auto"
        style={{ background: "#0B0E14" }}
      >
        {/* Back button — top of form panel */}
        <div className="px-8 pt-10 pb-0">
          <BackButton href="/" />
        </div>

        <div className="flex flex-1 items-center justify-center px-8 py-8">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,255,0.20)", border: "1px solid rgba(124,58,255,0.35)" }}>
              <Sparkles className="size-3.5" style={{ color: "#C97EFF" }} />
            </div>
            <span className="font-extrabold text-lg text-white">Steply</span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
              {isLogin ? "Tekrar Hoş Geldin" : "Topluluğa Katıl"}
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
              {isLogin
                ? "Projelerine devam etmek için hesabına giriş yap."
                : "Hemen kayıt ol ve akademik yolculuğunu başlat."}
            </p>
          </div>

          {/* Register: role selector */}
          {!isLogin && (
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: "rgba(255,255,255,0.30)" }}>
                Rolünüzü Seçin
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map(({ value, label, desc, Icon, bar, labelColor }) => {
                  const active = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className="relative flex flex-col items-center gap-2 p-3.5 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden text-center"
                      style={{
                        background:  active ? `${bar}14` : "rgba(255,255,255,0.03)",
                        border:      active ? `1px solid ${bar}55` : "1px solid rgba(255,255,255,0.08)",
                        boxShadow:   active ? `0 0 18px ${bar}1A` : "none",
                      }}
                    >
                      {active && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-3.5 h-3.5" style={{ color: bar, filter: `drop-shadow(0 0 4px ${bar}99)` }} />
                        </div>
                      )}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: active ? `${bar}22` : "rgba(255,255,255,0.05)",
                          border: `1px solid ${active ? `${bar}44` : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: active ? labelColor : "rgba(255,255,255,0.28)" }} />
                      </div>
                      <span className="text-xs font-extrabold" style={{ color: active ? "#fff" : "rgba(255,255,255,0.38)" }}>
                        {label}
                      </span>
                      <p className="text-[9px] leading-snug" style={{ color: active ? labelColor : "rgba(255,255,255,0.18)" }}>
                        {desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form */}
          <form
            action={isLogin ? "/api/auth/login" : "/api/auth/register"}
            method="post"
            className="flex flex-col gap-4"
          >
            {!isLogin && <input type="hidden" name="role" value={role} />}

            {/* Full name (register) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>Ad Soyad</label>
                <input
                  name="fullName"
                  placeholder="Ali Yılmaz"
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-600 outline-none transition-all"
                  style={INPUT_BASE}
                  onFocus={(e) => Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...FOCUS_STYLE })}
                  onBlur={(e)  => Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...BLUR_STYLE })}
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>E-posta</label>
              <input
                name="email"
                type="email"
                placeholder="ornek@ogrenci.edu.tr"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => { setIsTyping(true); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...FOCUS_STYLE }); }}
                onBlur={(e)  => { setIsTyping(false); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...BLUR_STYLE }); }}
                className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-600 outline-none transition-all"
                style={INPUT_BASE}
              />
            </div>

            {/* Institution (register) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Kurum <span className="font-normal normal-case tracking-normal text-[9px]" style={{ color: "rgba(255,255,255,0.20)" }}>(opsiyonel)</span>
                </label>
                <input
                  name="institution"
                  placeholder="İstanbul Teknik Üniversitesi"
                  autoComplete="organization"
                  className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-600 outline-none transition-all"
                  style={INPUT_BASE}
                  onFocus={(e) => Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...FOCUS_STYLE })}
                  onBlur={(e)  => Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...BLUR_STYLE })}
                />
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>Şifre</label>
                {isLogin && (
                  <a href="#" className="text-[10px] font-semibold transition-colors hover:text-purple-300" style={{ color: "#A78BFA" }}>
                    Şifremi Unuttum
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={isLogin ? undefined : 6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm placeholder:text-slate-600 outline-none transition-all"
                  style={INPUT_BASE}
                  onFocus={(e) => Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...FOCUS_STYLE })}
                  onBlur={(e)  => Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...BLUR_STYLE })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {message && (
              <div className="p-3 text-red-400 text-xs rounded-xl text-center leading-relaxed" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)" }}>
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-aura group relative w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm overflow-hidden mt-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
              <span className="relative z-10">{isLogin ? "Giriş Yap" : "Hesap Oluştur"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: "rgba(255,255,255,0.25)" }}>Veya şununla devam et</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Social auth */}
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
                    background:  isHov ? s.hoverBg  : "rgba(255,255,255,0.04)",
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
          <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {isLogin ? (
              <>Hesabın yok mu?{" "}
                <Link href="/auth/register" className="font-bold transition-colors hover:text-purple-300" style={{ color: "#C97EFF" }}>Kayıt Ol</Link>
              </>
            ) : (
              <>Zaten hesabın var mı?{" "}
                <Link href="/auth/login" className="font-bold transition-colors hover:text-purple-300" style={{ color: "#C97EFF" }}>Giriş Yap</Link>
              </>
            )}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
