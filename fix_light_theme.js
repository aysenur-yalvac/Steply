const fs = require("fs");

const content = `"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, CheckSquare, Square, ListChecks } from "lucide-react";
import { addProjectTask, toggleTaskCompletion, deleteProjectTask } from "@/lib/actions";
import type { ProjectTask } from "@/lib/actions";
import toast from "react-hot-toast";
import TaskDetailModal from "./TaskDetailModal";
import { TeamMember } from "./ProjectAnalyticsView";

interface Props {
  projectId: string;
  initialTasks: ProjectTask[];
  canEdit: boolean;
  teamMembers: TeamMember[];
  currentUserId?: string;
}

export default function ProjectTaskList({ projectId, initialTasks, canEdit, teamMembers, currentUserId }: Props) {
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const router = useRouter();

  const completed = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleUpdateTask = (updatedTask: ProjectTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleTaskClick = (task: ProjectTask) => {
    setSelectedTask(task);
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setIsAdding(true);
    try {
      const result = await addProjectTask(projectId, title);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setTasks((prev) => [...prev, result.task]);
        setNewTitle("");
        inputRef.current?.focus();
        router.refresh();
      }
    } finally {
      setIsAdding(false);
    }
  }

  async function handleToggle(taskId: string, is_completed: boolean) {
    if (pendingIds.has(taskId)) return;
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, is_completed } : t));
    setPendingIds((s) => new Set(s).add(taskId));
    try {
      const result = await toggleTaskCompletion(taskId, projectId, is_completed);
      if ("error" in result) {
        setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, is_completed: !is_completed } : t));
        toast.error(result.error);
      } else {
        router.refresh();
      }
    } finally {
      setPendingIds((s) => { const n = new Set(s); n.delete(taskId); return n; });
    }
  }

  async function handleDelete(task: ProjectTask) {
    if (pendingIds.has(task.id)) return;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setPendingIds((s) => new Set(s).add(task.id));
    try {
      const result = await deleteProjectTask(task.id, projectId);
      if ("error" in result) {
        setTasks((prev) => [...prev, task].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        toast.error(result.error);
      } else {
        router.refresh();
      }
    } finally {
      setPendingIds((s) => { const n = new Set(s); n.delete(task.id); return n; });
    }
  }

  // Today as YYYY-MM-DD (no time component, no timezone drift)
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-indigo-500" />
          Proje Gorevleri
        </h3>
        {total > 0 && (
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80 px-2.5 py-1 rounded-full">
            {completed}/{total} Tamamlandi - {progress}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-5">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: \`\${progress}%\`,
                background: progress === 100
                  ? "linear-gradient(90deg, #10b981, #059669)"
                  : "linear-gradient(90deg, #6366f1, #7C3AFF)",
              }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex flex-col gap-2 mb-6">
        {tasks.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">
            Henuz gorev yok.{canEdit ? " Asagidan yeni gorev ekle." : ""}
          </p>
        )}
        {tasks.map((task) => {
          const isAssignedToMe = !!currentUserId && task.assigned_to === currentUserId;
          const assignedUser = teamMembers.find((m) => m.id === task.assigned_to);
          const completedSubtasks = task.subtasks?.filter(st => st.is_completed).length ?? 0;
          const totalSubtasks = task.subtasks?.length ?? 0;
          // String-based comparison — avoids all timezone/time-of-day drift issues
          const isOverdue = !task.is_completed && !!task.due_date && task.due_date < todayStr;

          return (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className={[
                "flex items-start justify-between p-3.5 rounded-xl cursor-pointer transition-all border",
                isAssignedToMe
                  ? "bg-indigo-50/80 border-indigo-200/90 shadow-sm dark:bg-indigo-950/40 dark:border-indigo-500/60"
                  : "bg-white border-slate-200/80 hover:bg-slate-50/80 dark:bg-slate-800/80 dark:border-slate-700/80 dark:hover:bg-slate-700/50",
              ].join(" ")}
            >
              {/* Left: Checkbox + Content */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  disabled={!canEdit || pendingIds.has(task.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(task.id, !task.is_completed);
                  }}
                  className="shrink-0 mt-0.5 text-slate-400 hover:text-indigo-500 disabled:opacity-40 transition-colors"
                >
                  {pendingIds.has(task.id) ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  ) : task.is_completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  )}
                </button>

                <div className="flex flex-col gap-1.5 min-w-0">
                  {/* Title + Sana Atandi badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={[
                      "text-sm font-medium",
                      task.is_completed
                        ? "line-through text-slate-400 dark:text-slate-500"
                        : "text-slate-800 dark:text-slate-200",
                    ].join(" ")}>
                      {task.title}
                    </span>
                    {isAssignedToMe && (
                      <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 whitespace-nowrap">
                        Sana Atandi
                      </span>
                    )}
                  </div>

                  {/* Meta badges */}
                  {(assignedUser || task.due_date || totalSubtasks > 0) && (
                    <div className="flex items-center flex-wrap gap-1.5">
                      {/* Assignee */}
                      {assignedUser && (
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md dark:bg-slate-900/70 dark:border-slate-700/50 dark:text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                            {(assignedUser.full_name ?? "U")[0].toUpperCase()}
                          </span>
                          <span className="text-[11px] font-medium truncate max-w-[90px]">
                            {assignedUser.full_name ?? "Atanan Uye"}
                          </span>
                        </div>
                      )}

                      {/* Due date */}
                      {task.due_date && (
                        <span className={[
                          "flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px]",
                          isOverdue
                            ? "bg-red-50 border-red-200 text-red-600 font-medium dark:bg-red-950/40 dark:border-red-700/50 dark:text-red-400"
                            : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-900/70 dark:border-slate-700/50 dark:text-slate-400",
                        ].join(" ")}>
                          {new Date(task.due_date + "T12:00:00").toLocaleDateString("tr-TR")}
                          {isOverdue && <span className="font-semibold ml-0.5">(Gecikti)</span>}
                        </span>
                      )}

                      {/* Subtask counter */}
                      {totalSubtasks > 0 && (
                        <span className={[
                          "flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px]",
                          completedSubtasks === totalSubtasks
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-700/40 dark:text-emerald-400"
                            : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-900/70 dark:border-slate-700/50 dark:text-slate-400",
                        ].join(" ")}>
                          {completedSubtasks}/{totalSubtasks} alt gorev
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Detay + Delete */}
              <div className="flex items-center gap-2 shrink-0 ml-3 mt-0.5">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hidden sm:block whitespace-nowrap">
                  Detay &rarr;
                </span>
                {canEdit && (
                  <button
                    type="button"
                    disabled={pendingIds.has(task.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(task);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="Gorevi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add task form */}
      {canEdit && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Yeni gorev ekle..."
            maxLength={200}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isAdding || !newTitle.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Ekle
          </button>
        </form>
      )}

      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={projectId}
          teamMembers={teamMembers}
          onUpdate={(updatedTask) => {
            handleUpdateTask(updatedTask);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync("src/components/projects/ProjectTaskList.tsx", content, "utf8");
console.log("Fixed light theme and overdue date comparison");
