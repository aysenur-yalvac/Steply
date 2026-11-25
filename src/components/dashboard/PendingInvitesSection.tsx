"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Check, X, Loader2, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  acceptProjectInviteAction,
  declineProjectInviteAction,
} from "@/app/dashboard/actions";
import toast from "react-hot-toast";

export type PendingProjectInvite = {
  projectId: string;
  projectTitle: string;
  projectDescription?: string | null;
  inviterName: string;
  inviterAvatar?: string | null;
};

export default function PendingInvitesSection({
  initialInvites,
}: {
  initialInvites: PendingProjectInvite[];
}) {
  const router = useRouter();
  const [invites, setInvites] = useState<PendingProjectInvite[]>(initialInvites);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingType, setProcessingType] = useState<"accept" | "decline" | null>(null);

  useEffect(() => {
    setInvites(initialInvites);
  }, [initialInvites]);

  useEffect(() => {
    function onInviteSynced(e: Event) {
      const custom = e as CustomEvent<{ projectId?: string }>;
      const pid = custom.detail?.projectId;
      if (pid) {
        setInvites((prev) => prev.filter((i) => i.projectId !== pid));
      }
    }
    window.addEventListener("project_invite_handled", onInviteSynced);
    return () => window.removeEventListener("project_invite_handled", onInviteSynced);
  }, []);

  if (invites.length === 0) return null;

  const handleAccept = async (invite: PendingProjectInvite) => {
    if (processingId) return;
    const prevInvites = invites;
    // Optimistically remove from pending banner and notify NotificationBell immediately
    setInvites((prev) => prev.filter((i) => i.projectId !== invite.projectId));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("project_invite_handled", {
          detail: { projectId: invite.projectId, decision: "accept", projectTitle: invite.projectTitle },
        })
      );
      window.dispatchEvent(new Event("notifications_updated"));
    }
    setProcessingId(invite.projectId);
    setProcessingType("accept");
    try {
      const res = await acceptProjectInviteAction(invite.projectId);
      if ("error" in res) {
        setInvites(prevInvites);
        toast.error(res.error || "Davet kabul edilemedi.");
      } else {
        toast.success(`"${invite.projectTitle}" proje daveti kabul edildi!`);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("notifications_updated"));
        }
        router.refresh();
      }
    } catch {
      setInvites(prevInvites);
      toast.error("Davet kabul edilemedi.");
    } finally {
      setProcessingId(null);
      setProcessingType(null);
    }
  };

  const handleDecline = async (invite: PendingProjectInvite) => {
    if (processingId) return;
    const prevInvites = invites;
    // Optimistically remove from pending banner and notify NotificationBell immediately
    setInvites((prev) => prev.filter((i) => i.projectId !== invite.projectId));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("project_invite_handled", {
          detail: { projectId: invite.projectId, decision: "decline", projectTitle: invite.projectTitle },
        })
      );
      window.dispatchEvent(new Event("notifications_updated"));
    }
    setProcessingId(invite.projectId);
    setProcessingType("decline");
    try {
      const res = await declineProjectInviteAction(invite.projectId);
      if ("error" in res) {
        setInvites(prevInvites);
        toast.error(res.error || "Davet reddedilemedi.");
      } else {
        toast.success("Proje daveti reddedildi.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("notifications_updated"));
        }
        router.refresh();
      }
    } catch {
      setInvites(prevInvites);
      toast.error("Davet reddedilemedi.");
    } finally {
      setProcessingId(null);
      setProcessingType(null);
    }
  };

  return (
    <section
      id="project-invites"
      className="rounded-2xl border border-violet-200/80 dark:border-violet-800/50 bg-violet-50/60 dark:bg-violet-950/25 p-4 sm:p-5 space-y-4 scroll-mt-20"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/50 border border-violet-200 dark:border-violet-700/50 shrink-0">
          <Mail className="w-4 h-4 text-violet-600 dark:text-violet-300" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Davet Edildiğiniz Projeler
            </h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold rounded-full bg-violet-600 text-white">
              {invites.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ekip üyesi olarak davet edildiğiniz projeleri onaylayabilir veya reddedebilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {invites.map((invite) => {
          const isBusy = processingId === invite.projectId;
          const cleanDesc = (invite.projectDescription || "")
            .replace(/\[.*?\]/g, "")
            .trim();

          return (
            <div
              key={invite.projectId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Avatar
                  src={invite.inviterAvatar}
                  name={invite.inviterName}
                  size="sm"
                  className="shrink-0 mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/projects/${invite.projectId}`}
                    prefetch={true}
                    className="group/title inline-flex items-center gap-1.5 max-w-full text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    title="Projeyi incelemek için tıklayın"
                  >
                    <span className="truncate">{invite.projectTitle}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover/title:opacity-100 transition-opacity" />
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Davet eden:{" "}
                    <span className="font-semibold text-violet-600 dark:text-violet-400">
                      {invite.inviterName}
                    </span>
                  </p>
                  {cleanDesc && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                      {cleanDesc}
                    </p>
                  )}
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/projects/${invite.projectId}`}
                      prefetch={true}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline"
                    >
                      Projeyi İncele →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleAccept(invite)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {isBusy && processingType === "accept" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Kabul Et
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleDecline(invite)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-200 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                >
                  {isBusy && processingType === "decline" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Reddet
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
