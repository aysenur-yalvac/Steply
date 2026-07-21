"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface PhotoLightboxProps {
  src: string;
  name: string | null;
  onClose: () => void;
}

export default function PhotoLightbox({ src, name, onClose }: PhotoLightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-10"
        aria-label="Kapat"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative w-full max-w-[min(90vw,36rem)] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={name ?? ""}
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />
        {name && (
          <p className="mt-4 text-center text-white text-lg font-semibold drop-shadow">
            {name}
          </p>
        )}
      </div>
    </div>
  );
}
