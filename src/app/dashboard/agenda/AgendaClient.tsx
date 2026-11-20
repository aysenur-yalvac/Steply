"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Loader2, Plus, Flag, Trash2 } from 'lucide-react';
import { addAgendaTaskAction, toggleAgendaTaskAction, deleteAgendaTaskAction } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Task = {
  id: string;
  title: string;
  task_title?: string;
  due_date: string;
  is_completed: boolean;
};

export default function AgendaClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    initialTasks.map(t => ({
      ...t,
      title: t.title || t.task_title || '',
    }))
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Check for past due tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastDue = tasks.find(t => !t.is_completed && new Date(t.due_date) < today);
    if (pastDue) {
      toast("Still in progress... You can do it! ✨", {
        icon: '💡',
        duration: 5000,
        style: { borderRadius: '12px', background: '#fcfaf6', color: '#1e293b', border: '1px solid #f59e0b', fontWeight: 'bold' }
      });
    }
  }, [tasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDate) return;

    setIsAdding(true);
    try {
      const res = await addAgendaTaskAction(newTaskTitle, newTaskDate);
      if (res.success && res.task) {
        const normalizedTask = {
          ...res.task,
          title: res.task.title || (res.task as any).task_title || newTaskTitle,
        };
        setTasks([...tasks, normalizedTask].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
        setNewTaskTitle('');
        setNewTaskDate('');
        toast.success("Task added to your agenda!");
      } else {
        toast.error(res.error ?? "Task could not be added");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    // Optimistic
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    try {
      await toggleAgendaTaskAction(taskId, !currentStatus);
    } catch (e) {
      // Revert
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: currentStatus } : t));
      toast.error("Could not update task");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm("Bu görevi silmek istediğinize emin misiniz?")) return;
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      await deleteAgendaTaskAction(taskId);
      toast.success("Agenda cleared!", {
        style: { borderRadius: '12px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', fontSize: '13px', fontWeight: 'bold' }
      });
    } catch (e) {
      setTasks(previousTasks);
      toast.error("Could not delete task");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
          <Calendar className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Personal Agenda</h1>
          <p className="text-slate-500 dark:text-slate-400">Track your project goals and deadlines.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-violet-500/5">
        
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          <input 
            type="text" 
            placeholder="What do you need to complete? (e.g. Design Database)" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-[2] px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-inner"
            required
          />
          <input 
            type="date" 
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-inner"
            required
          />
          <button 
            type="submit" 
            disabled={isAdding}
            className="px-6 py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-md shadow-violet-500/25 active:scale-95 flex items-center justify-center shrink-0"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Add Task</>}
          </button>
        </form>

        <div className="space-y-3">
          {tasks.length === 0 ? (
             <div className="text-center text-slate-400 py-10 font-medium bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                You have no tasks in your agenda. Start planning!
             </div>
          ) : (
            <AnimatePresence>
              {tasks.map(task => {
                const isPastDue = !task.is_completed && new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ duration: 0.2 }}
                    key={task.id} 
                    className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                      task.is_completed 
                        ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800/60 opacity-70' 
                        : isPastDue 
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 shadow-sm' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      <button 
                        onClick={() => handleToggle(task.id, task.is_completed)}
                        className={`shrink-0 transition-colors ${task.is_completed ? 'text-violet-600 dark:text-violet-400' : 'text-slate-300 dark:text-slate-600 hover:text-violet-600 dark:hover:text-violet-400'}`}
                      >
                        {task.is_completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                      </button>
                      <div className="flex flex-col truncate pr-4">
                        <span className={`font-bold truncate text-lg ${task.is_completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                          {task.title || task.task_title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit ${
                            task.is_completed
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              : isPastDue
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40'
                                : 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/40'
                          }`}>
                            {isPastDue && !task.is_completed ? <Flag className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {isPastDue && !task.is_completed && (
                            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Past Due</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleDelete(task.id)}
                      whileHover={{ scale: 1.1, rotate: [0, -15, 15, -15, 15, 0] }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors ml-4 shrink-0"
                      title="Delete Task"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}