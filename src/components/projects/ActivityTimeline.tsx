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

type ActionCfg = { icon: React.ReactNode; iconColor: string; ringColor: string };

const ACTION_CONFIG: Record<string, ActionCfg> = {
  task_added:     { icon: <Plus className="w-4 h-4" />,        iconColor: "text-indigo-500", ringColor: "border-indigo-200" },
  task_completed: { icon: <CheckCircle2 className="w-4 h-4" />, iconColor: "text-emerald-500", ringColor: "border-emerald-200" },
  task_uncompleted:{ icon: <Circle className="w-4 h-4" />,      iconColor: "text-amber-500",  ringColor: "border-amber-200"  },
  task_deleted:   { icon: <Trash2 className="w-4 h-4" />,      iconColor: "text-red-400",    ringColor: "border-red-200"   },
  file_upload:    { icon: <Paperclip className="w-4 h-4" />,   iconColor: "text-sky-500",    ringColor: "border-sky-200"   },
};

const DEFAULT_CFG: ActionCfg = {
  icon: <Activity className="w-4 h-4" />,
  iconColor: "text-slate-400",
  ringColor: "border-slate-200",
};

export default function ActivityTimeline({ activities }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-5">
        <Activity className="w-4 h-4 text-indigo-500" />
        Aktivite Geçmişi
      </h3>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Henüz aktivite yok.</p>
      ) : (
        <div className="overflow-y-auto max-h-[560px] pr-1 [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
          <ul>
            {activities.map((item, idx) => {
              const cfg = ACTION_CONFIG[item.action_type] ?? DEFAULT_CFG;
              const isLast = idx === activities.length - 1;

              return (
                <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Vertical connector — hidden on last item */}
                  {!isLast && (
                    <div className="absolute top-8 bottom-0 left-4 w-[2px] bg-gray-100 -translate-x-1/2" />
                  )}

                  {/* Icon circle */}
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border ${cfg.ringColor} ${cfg.iconColor}`}
                  >
                    {cfg.icon}
                  </div>

                  {/* Text content */}
                  <div className="flex flex-col flex-1 pt-[2px]">
                    <p className="text-sm text-slate-700 leading-snug break-words">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {item.actor_name && (
                        <>
                          <span className="text-xs font-semibold text-indigo-500">
                            {item.actor_name}
                          </span>
                          <span className="text-xs text-slate-300">·</span>
                        </>
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(item.created_at)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
