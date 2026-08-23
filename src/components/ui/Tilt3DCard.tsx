"use client";

import { useRef, useState } from "react";

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number; // degrees, default 8
}

export default function Tilt3DCard({
  children,
  className = "",
  style = {},
  intensity = 8,
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = -dy * intensity;
    const rotY = dx * intensity;
    setTransform(`rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`);
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform("rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setGlowPos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        transform,
        transformStyle: "preserve-3d",
        transition: "transform 0.15s ease-out",
        willChange: "transform",
      }}
    >
      {/* Specular glow that follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.08) 0%, transparent 55%)`,
          transition: "background 0.1s ease-out",
        }}
      />
      {children}
    </div>
  );
}
