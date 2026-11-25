"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  createReviewAction,
  deleteTeacherReviewAction,
  type TeacherReviewItem,
} from "@/app/dashboard/actions";
import { renderMessageWithLinks } from "@/lib/linkify";
import toast from "react-hot-toast";

interface TeacherReviewsSectionProps {
  projectId: string;
  initialReviews: TeacherReviewItem[];
  currentUserId: string;
  isTeacher: boolean;
}

export default function TeacherReviewsSection({
  projectId,
  initialReviews,
  currentUserId,
  isTeacher,
}: TeacherReviewsSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<TeacherReviewItem[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comment.trim();
    if (!trimmed) {
      setErrorMsg("Lütfen proje hakkındaki değerlendirmenizi yazın.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await createReviewAction(projectId, rating, trimmed);
      if ("error" in res) {
        setErrorMsg(res.error);
        toast.error(res.error);
      } else {
        setReviews((prev) => [res.review, ...prev]);
        setComment("");
        setRating(5);
        toast.success("Değerlendirmeniz başarıyla kaydedildi!");
        router.refresh();
      }
    } catch (err: any) {
      const msg = err?.message || "Değerlendirme gönderilirken bir hata oluştu.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (deletingId) return;
    setDeletingId(reviewId);
    const prevReviews = reviews;
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));

    try {
      const res = await deleteTeacherReviewAction(reviewId, projectId);
      if ("error" in res) {
        setReviews(prevReviews);
        toast.error(res.error);
      } else {
        toast.success("Değerlendirme silindi.");
        router.refresh();
      }
    } catch (err: any) {
      setReviews(prevReviews);
      toast.error(err?.message || "Değerlendirme silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {reviews.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
            Öğretmen Değerlendirmeleri
          </h3>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl p-6 shadow-sm bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={review.reviewer_avatar}
                    name={review.reviewer_name}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-700 dark:text-slate-100">
                        {review.reviewer_name}
                      </span>
                      {review.reviewer_role === "teacher" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#7C3AFF]/10 text-[#7C3AFF] border border-[#7C3AFF]/20 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80 tracking-wide uppercase">
                          Öğretmen
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {new Date(review.created_at).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-current"
                            : "text-slate-200 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  {currentUserId === review.reviewer_id && (
                    <button
                      type="button"
                      disabled={deletingId === review.id}
                      onClick={() => handleDelete(review.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer disabled:opacity-40"
                      title="Değerlendirmeyi Sil"
                    >
                      {deletingId === review.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pl-[52px]">
                {renderMessageWithLinks(review.comment)}
              </p>
            </div>
          ))}
        </div>
      )}

      {isTeacher && (
        <div className="bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Projeyi Değerlendir
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Puan (1-5)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="rating"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) =>
                    setRating(Math.min(5, Math.max(1, Number(e.target.value) || 5)))
                  }
                  className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all w-24 font-bold"
                  required
                />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      title={`${starVal} Yıldız`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          starVal <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Yorum ve Geri Bildirim
              </label>
              <textarea
                name="comment"
                rows={4}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Proje hakkındaki değerlendirmenizi yazın..."
                className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all resize-y placeholder:text-slate-400"
                required
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="w-full mt-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <span>Değerlendirmeyi Gönder</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
