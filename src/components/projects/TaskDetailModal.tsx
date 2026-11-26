"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, User, ListTodo, Plus, Trash2, CheckSquare, Square, Loader2 } from "lucide-react";
import { ProjectTask, updateTaskAction, SubTask } from "@/lib/actions";
import { TeamMember } from "./ProjectAnalyticsView";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface TaskDetailModalProps {
  task: ProjectTask;
  projectId: string;
  teamMembers: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: ProjectTask, originalId?: string) => void;
  resolveTaskId?: (taskId: string) => Promise<string | null>;
  currentUserId?: string;
  projectOwnerId?: string;
  projectOwnerName?: string | null;
}

export default function TaskDetailModal({
  task,
  projectId,
  teamMembers,
  isOpen,
  onClose,
  onUpdate,
  resolveTaskId,
  currentUserId,
  projectOwnerId,
  projectOwnerName,
}: TaskDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [dueDate, setDueDate] = useState<string>(task.due_date || "");
  const [assignedTo, setAssignedTo] = useState<string>(task.assigned_to || "");
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !task) return null;

  // Permission: only project owner or teachers can assign tasks
  const isOwner = !!currentUserId && currentUserId === projectOwnerId;
  const isTeacher =
    !!currentUserId &&
    !!teamMembers.find(
      (m) => m.id === currentUserId && (m.role === "teacher" || m.role === "ogretmen")
    );
  const canAssignTask = isOwner || isTeacher;

  const handleUpdate = async (updates: Partial<ProjectTask>, shouldCloseModal = false) => {
    const originalTaskId = task.id;
    const previousTask = { ...task };
    const optimisticTask: ProjectTask = { ...task, ...updates };
    onUpdate(optimisticTask, originalTaskId);
    setIsUpdating(true);
    try {
      let targetTaskId: string | null = originalTaskId;
      if (targetTaskId.startsWith("temp-")) {
        if (resolveTaskId) {
          targetTaskId = await resolveTaskId(originalTaskId);
        }
        if (!targetTaskId || targetTaskId.startsWith("temp-")) {
          onUpdate(previousTask, originalTaskId);
          toast.error("Görev henüz oluşturuluyor, lütfen 1 saniye sonra tekrar kaydedin.");
          return;
        }
      }

      const result = await updateTaskAction(targetTaskId, projectId, updates);
      if ("error" in result) {
        onUpdate(previousTask, originalTaskId);
        toast.error(result.error);
      } else {
        onUpdate(result.task, originalTaskId);
        toast.success("Görev güncellendi");
        if (shouldCloseModal) {
          onClose();
        }
      }
    } catch {
      onUpdate(previousTask, originalTaskId);
      toast.error("Görev güncellenemedi");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveFields = () => {
    void handleUpdate({ due_date: dueDate || null, assigned_to: assignedTo || null, subtasks }, true);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const newSub: SubTask = { id: crypto.randomUUID(), title: newSubtask.trim(), is_completed: false };
    const nextSubtasks = [...subtasks, newSub];
    setSubtasks(nextSubtasks);
    setNewSubtask("");
    handleUpdate({ subtasks: nextSubtasks });
  };

  const handleToggleSubtask = (subId: string) => {
    const nextSubtasks = subtasks.map(s => s.id === subId ? { ...s, is_completed: !s.is_completed } : s);
    setSubtasks(nextSubtasks);
    handleUpdate({ subtasks: nextSubtasks });
  };

  const handleDeleteSubtask = (subId: string) => {
    const nextSubtasks = subtasks.filter(s => s.id !== subId);
    setSubtasks(nextSubtasks);
    handleUpdate({ subtasks: nextSubtasks });
  };

  const completedCount = subtasks.filter(s => s.is_completed).length;

  // Exclude teachers and pending (unaccepted) members from assignable list — only accepted students and project owner can be assigned
  let assignableMembers = teamMembers.filter(
    (m) => m.status !== "pending" && m.role !== "teacher" && m.role !== "ogretmen"
  );

  // Guarantee the project owner is always in the list even if not in teamMembers
  if (projectOwnerId) {
    const isOwnerInList = assignableMembers.some((m) => m.id === projectOwnerId);
    if (!isOwnerInList) {
      const existingOwner = teamMembers.find((m) => m.id === projectOwnerId);
      const ownerMember: TeamMember = existingOwner ?? {
        id: projectOwnerId,
        full_name: projectOwnerName || (existingOwner as any)?.full_name || "Proje Sahibi",
        avatar_url: null,
        role: "owner",
      };
      assignableMembers = [ownerMember, ...assignableMembers];
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm px-3 pt-16 pb-6 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-[95vw] max-w-lg p-4 sm:p-6 shadow-2xl relative z-10 my-0 sm:my-auto flex flex-col max-h-[88dvh] overflow-x-hidden overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5 shrink-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-tight pr-4 break-words min-w-0">
            {task.title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden space-y-6 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
            {/* Due Date */}
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4 shrink-0" /> Son Teslim Tarihi
              </label>
              <div className="relative w-full max-w-full min-w-0 overflow-hidden">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ WebkitAppearance: "none" }}
                  className="appearance-none -webkit-appearance-none w-full max-w-full min-w-0 box-border block bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:!opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:!absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:!inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:!w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:!h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </span>
              </div>
            </div>

            {/* Assigned To */}
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <User className="w-4 h-4 shrink-0" /> Sorumlu Kişi
              </label>
              <select
                value={assignedTo}
                disabled={!canAssignTask}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full max-w-full min-w-0 box-border bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Atanmamış</option>
                {assignableMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || (member as any).email}
                  </option>
                ))}
              </select>
              {!canAssignTask && (
                <p className="text-[11px] text-amber-500 font-medium leading-snug">
                  Görev atama yetkisi yalnızca Proje Sahibi ve Danışman Öğretmenlere aittir.
                </p>
              )}
            </div>
          </div>

          {/* Save button */}
          <div>
            <button
              type="button"
              onClick={handleSaveFields}
              disabled={isUpdating}
              className="w-full min-h-[44px] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Değişiklikleri Kaydet"}
            </button>
          </div>

          {/* Subtasks */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-indigo-500" /> Alt Görevler
              </label>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {completedCount}/{subtasks.length} Tamamlandı
              </span>
            </div>

            <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Yeni alt görev ekle..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newSubtask.trim() || isUpdating}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                Ekle
              </button>
            </form>

            <div className="space-y-2">
              {subtasks.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id)}
                    className="text-slate-400 hover:text-indigo-500 transition-colors shrink-0"
                  >
                    {sub.is_completed
                      ? <CheckSquare className="w-4 h-4 text-emerald-500" />
                      : <Square className="w-4 h-4" />
                    }
                  </button>
                  <span className={`flex-1 text-sm ${sub.is_completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {subtasks.length === 0 && (
                <p className="text-xs text-center text-slate-400 py-4">Henüz alt görev eklenmedi.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
