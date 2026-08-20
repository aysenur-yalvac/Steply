"use client";

import React, { useState } from "react";
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
  onUpdate: (task: ProjectTask) => void;
}

export default function TaskDetailModal({ task, projectId, teamMembers, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [dueDate, setDueDate] = useState<string>(task.due_date || "");
  const [assignedTo, setAssignedTo] = useState<string>(task.assigned_to || "");
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");
  const router = useRouter();

  if (!isOpen || !task) return null;

  const handleUpdate = async (updates: Partial<ProjectTask>) => {
    setIsUpdating(true);
    try {
      const result = await updateTaskAction(task.id, projectId, updates);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        onUpdate(result.task);
        toast.success("Görev güncellendi");
        router.refresh();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveFields = () => {
    handleUpdate({ due_date: dueDate || null, assigned_to: assignedTo || null, subtasks });
    onClose();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const newSub: SubTask = { id: crypto.randomUUID(), title: newSubtask.trim(), is_completed: false };
    const nextSubtasks = [...subtasks, newSub];
    setSubtasks(nextSubtasks);
    setNewSubtask("");
    // Automatically save
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

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 my-auto flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{task.title}</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Son Teslim Tarihi
              </label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {/* Assigned To */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <User className="w-4 h-4" /> Atanan Üye
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Atanmadı</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="button" 
              onClick={handleSaveFields}
              disabled={isUpdating}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
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
                placeholder="Yeni alt görev..." 
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
                <div key={sub.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => handleToggleSubtask(sub.id)}
                    className="text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {sub.is_completed ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
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
                <p className="text-xs text-center text-slate-400 py-4">Henüz alt görev yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
