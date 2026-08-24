"use client";

import { useRef, useState, useCallback } from "react";

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number;
}

export default function Tilt3DCard({
  children,
  className = "",
  style = {},
  intensity = 15,
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      setTilt({ x: -dy * intensity, y: dx * intensity });
      setGlow({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTilt({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
    setIsHovered(false);
  }, []);

  const transform = isHovered
    ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.05, 1.05, 1.05) translateZ(10px)`
    : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1) translateZ(0px)";

  const shadow = isHovered
    ? `0 25px 60px rgba(0,0,0,0.55), 0 0 40px rgba(160,32,240,0.15), 0 0 0 1px rgba(255,255,255,0.08) inset`
    : "0 4px 15px rgba(0,0,0,0.2)";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        transform,
        transformStyle: "preserve-3d",
        transition: isHovered
          ? "transform 0.08s ease-out, box-shadow 0.2s ease"
          : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease",
        boxShadow: shadow,
        willChange: "transform",
        cursor: "default",
      }}
    >
      {/* Specular spotlight that follows the mouse */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 35%, transparent 65%)`
            : "none",
          transition: "background 0.08s ease-out",
        }}
      />
      {/* Edge highlight rim */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        style={{
          background: isHovered
            ? `radial-gradient(ellipse at ${glow.x}% ${glow.y}%, rgba(160,32,240,0.12) 0%, transparent 60%)`
            : "none",
          transition: "background 0.12s ease-out",
        }}
      />
      {/* Content with inner 3D layer */}
      <div
        style={{
          transform: isHovered ? "translateZ(20px)" : "translateZ(0px)",
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.4s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
