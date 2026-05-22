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
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        aria-label="Kapat"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={name ?? ""}
          className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
        />
        {name && (
          <p className="mt-3 text-center text-white text-sm font-semibold drop-shadow">
            {name}
          </p>
        )}
      </div>
    </div>
  );
}
