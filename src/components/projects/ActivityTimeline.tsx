import { CheckCircle2, Circle, Plus, Trash2, Activity, Paperclip } from "lucide-react";
import type { ProjectActivity } from "@/lib/actions";

interface Props {
  activities: ProjectActivity[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dakika önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; ring: string }> = {
  task_added: {
    icon: <Plus className="w-4 h-4" />,
    color: "text-indigo-500 bg-indigo-50",
    ring: "ring-indigo-200",
  },
  task_completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-emerald-500 bg-emerald-50",
    ring: "ring-emerald-200",
  },
  task_uncompleted: {
    icon: <Circle className="w-4 h-4" />,
    color: "text-amber-500 bg-amber-50",
    ring: "ring-amber-200",
  },
  task_deleted: {
    icon: <Trash2 className="w-4 h-4" />,
    color: "text-red-400 bg-red-50",
    ring: "ring-red-200",
  },
  file_upload: {
    icon: <Paperclip className="w-4 h-4" />,
    color: "text-sky-500 bg-sky-50",
    ring: "ring-sky-200",
  },
};

function ActivityIcon({ actionType }: { actionType: string }) {
  const cfg = ACTION_CONFIG[actionType] ?? {
    icon: <Activity className="w-4 h-4" />,
    color: "text-slate-400 bg-slate-50",
    ring: "ring-slate-200",
  };
  return (
    <span
      className={`flex items-center justify-center w-8 h-8 rounded-full ring-2 shrink-0 p-1.5 ${cfg.color} ${cfg.ring}`}
    >
      {cfg.icon}
    </span>
  );
}

export default function ActivityTimeline({ activities }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-5">
        <Activity className="w-4 h-4 text-indigo-500" />
        Aktivite Geçmişi
      </h3>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          Henüz aktivite yok.
        </p>
      ) : (
        <div className="overflow-y-auto max-h-[560px] pr-2 [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
          <div className="relative flex flex-col">
            {/* Vertical connector line — starts below first icon center, ends above last */}
            <div className="absolute left-[15px] top-8 bottom-8 w-px bg-slate-100" />

            {activities.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 ${idx !== activities.length - 1 ? "pb-5" : ""}`}
              >
                <ActivityIcon actionType={item.action_type} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug break-words">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {item.actor_name && (
                      <span className="text-xs font-semibold text-indigo-500">
                        {item.actor_name}
                      </span>
                    )}
                    {item.actor_name && (
                      <span className="text-xs text-slate-300">·</span>
                    )}
                    <span className="text-xs text-slate-400">{timeAgo(item.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
