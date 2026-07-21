"use client";

import { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface PhotoLightboxProps {
  src: string;
  name: string | null;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

function distanceBetween(touches: TouchList) {
  const [a, b] = [touches[0], touches[1]];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export default function PhotoLightbox({ src, name, onClose }: PhotoLightboxProps) {
  const [scale, setScaleRaw] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const pinchDistRef = useRef<number | null>(null);

  function setScale(updater: number | ((s: number) => number)) {
    setScaleRaw((prev) => {
      const raw = typeof updater === "function" ? (updater as (s: number) => number)(prev) : updater;
      const next = clampScale(raw);
      if (next <= MIN_SCALE) setPosition({ x: 0, y: 0 });
      return next;
    });
  }

  function resetZoom() {
    setScaleRaw(1);
    setPosition({ x: 0, y: 0 });
  }

  function handleClose() {
    resetZoom();
    onClose();
  }

  // Reset zoom/pan whenever a different photo is opened.
  useEffect(() => {
    resetZoom();
  }, [src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wheel / touchpad pinch → zoom only, never scrolls/zooms the page behind it.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();
      setScale((s) => s - e.deltaY * 0.0015 * s);
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // Touch: two fingers = pinch-to-zoom, one finger = pan (only while zoomed in).
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        pinchDistRef.current = distanceBetween(e.touches);
      } else if (e.touches.length === 1 && scale > 1) {
        setIsDragging(true);
        dragOffsetRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = distanceBetween(e.touches);
        if (pinchDistRef.current != null) {
          setScale((s) => s * (dist / pinchDistRef.current!));
        }
        pinchDistRef.current = dist;
      } else if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        const t = e.touches[0];
        setPosition({
          x: t.clientX - dragOffsetRef.current.x,
          y: t.clientY - dragOffsetRef.current.y,
        });
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) pinchDistRef.current = null;
      if (e.touches.length === 0) setIsDragging(false);
    }

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [scale, position, isDragging]);

  // Mouse drag-to-pan (only while zoomed in).
  function handleMouseDown(e: React.MouseEvent) {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragOffsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }

  useEffect(() => {
    if (!isDragging) return;
    function handleMouseMove(e: MouseEvent) {
      setPosition({ x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y });
    }
    function handleMouseUp() { setIsDragging(false); }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const controlBtnCls =
    "p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors disabled:opacity-30 disabled:pointer-events-none";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
      onClick={handleClose}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-10"
        aria-label="Kapat"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative w-full max-w-[min(90vw,36rem)] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={frameRef}
          className="overflow-hidden rounded-2xl shadow-2xl bg-black/20"
          style={{ touchAction: "none" }}
        >
          <img
            src={src}
            alt={name ?? ""}
            draggable={false}
            onMouseDown={handleMouseDown}
            className="w-full max-h-[80vh] object-contain select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.15s ease-out",
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
          />
        </div>

        {/* Zoom controls */}
        <div
          className="mt-3 flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setScale((s) => s - 0.5)}
            disabled={scale <= MIN_SCALE}
            className={controlBtnCls}
            aria-label="Uzaklaştır"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white/80 text-xs font-semibold w-11 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => s + 0.5)}
            disabled={scale >= MAX_SCALE}
            className={controlBtnCls}
            aria-label="Yakınlaştır"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            disabled={scale === MIN_SCALE && position.x === 0 && position.y === 0}
            className={controlBtnCls}
            aria-label="Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {name && (
          <p className="mt-3 text-center text-white text-lg font-semibold drop-shadow">
            {name}
          </p>
        )}
      </div>
    </div>
  );
}
