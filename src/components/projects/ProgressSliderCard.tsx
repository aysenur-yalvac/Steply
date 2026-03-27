"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateProgress } from "@/app/dashboard/actions";
import AnimatedProgressBar from "@/components/ui/AnimatedProgressBar";
import toast from "react-hot-toast";

export default function ProgressSliderCard({
  projectId,
  initialProgress,
  isOwner,
}: {
  projectId: string;
  initialProgress: number;
  isOwner: boolean;
}) {
  const [localProgress, setLocalProgress] = useState(initialProgress);
  const [isSaving, setIsSaving] = useState(false);
  const isCompleted = localProgress === 100;
  const isDirty = localProgress !== initialProgress;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.set("id", projectId);
      fd.set("progress", String(localProgress));
      await updateProgress(fd);
      if (localProgress === 100) {
        const { default: confetti } = await import("canvas-confetti");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#4f46e5", "#818cf8", "#c7d2fe"] });
        toast.success("Project completed! 🎉");
      } else {
        toast.success("Progress updated!");
      }
    } catch {
      toast.error("Failed to update progress");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Progress Status</h3>

      <div className="flex justify-between items-end mb-3">
        <span className="text-3xl font-black text-slate-800">%{localProgress}</span>
        {isCompleted && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Completed
          </span>
        )}
      </div>

      <AnimatedProgressBar progress={localProgress} isCompleted={isCompleted} className="h-3 mb-5" />

      {isOwner && (
        <>
          {/* Interactive range slider */}
          <div className="mb-5 px-1">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localProgress}
              onChange={(e) => setLocalProgress(parseInt(e.target.value))}
              className="
                w-full h-2 rounded-full appearance-none cursor-grab active:cursor-grabbing
                [&::-webkit-slider-runnable-track]:bg-indigo-100
                [&::-webkit-slider-runnable-track]:rounded-full
                [&::-webkit-slider-runnable-track]:h-2
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-indigo-600
                [&::-webkit-slider-thumb]:shadow-xl
                [&::-webkit-slider-thumb]:ring-2
                [&::-webkit-slider-thumb]:ring-indigo-500
                [&::-webkit-slider-thumb]:ring-offset-2
                [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-track]:bg-indigo-100
                [&::-moz-range-track]:rounded-full
                [&::-moz-range-track]:h-2
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-indigo-600
                [&::-moz-range-thumb]:border-none
                [&::-moz-range-thumb]:shadow-xl
                [&::-moz-range-progress]:bg-indigo-600
                [&::-moz-range-progress]:rounded-full
                [&::-moz-range-progress]:h-2
              "
              style={{
                background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${localProgress}%, #e0e7ff ${localProgress}%, #e0e7ff 100%)`,
              }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-[.98] ${
              isDirty
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_24px_-6px_rgba(79,70,229,0.45)]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isDirty ? "Save Progress" : "No changes"}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
