"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Loader2, Plus, Flag } from 'lucide-react';
import { addAgendaTaskAction, toggleAgendaTaskAction } from '@/lib/actions';
import toast from 'react-hot-toast';

type Task = {
  id: string;
  task_title: string;
  due_date: string;
  is_completed: boolean;
};

export default function AgendaClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Check for past due tasks
    const today = new Date();
    today.setHours(0,0,0,0);
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
        setTasks([...tasks, res.task].sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
        setNewTaskTitle('');
        setNewTaskDate('');
        toast.success("Task added to your agenda!");
      }
    } catch(e) {
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
      if (!currentStatus) confettiTrigger();
    } catch(e) {
      // Revert
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: currentStatus } : t));
      toast.error("Could not update task");
    }
  };

  const confettiTrigger = () => {
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 80,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#10b981', '#fcd34d', '#f43f5e']
      });
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-sage-green/10 text-sage-green border border-sage-green/20">
          <Calendar className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Personal Agenda</h1>
          <p className="text-slate-500">Track your project goals and deadlines.</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-sage-green/5">
        
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4 mb-8 pb-8 border-b border-slate-100">
          <input 
            type="text" 
            placeholder="What do you need to complete? (e.g. Design Database)" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-[2] px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sage-green/10 focus:border-sage-green/30 transition-all shadow-inner"
            required
          />
          <input 
            type="date" 
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 focus:outline-none focus:ring-4 focus:ring-sage-green/10 focus:border-sage-green/30 transition-all shadow-inner"
            required
          />
          <button 
            type="submit" 
            disabled={isAdding}
            className="px-6 py-4 bg-sage-green hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Add Task</>}
          </button>
        </form>

        <div className="space-y-3">
          {tasks.length === 0 ? (
             <div className="text-center text-slate-400 py-10 font-medium bg-slate-50 rounded-2xl border border-slate-100">
                You have no tasks in your agenda. Start planning!
             </div>
          ) : (
            tasks.map(task => {
              const isPastDue = !task.is_completed && new Date(task.due_date) < new Date(new Date().setHours(0,0,0,0));
              return (
                <div 
                  key={task.id} 
                  className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                    task.is_completed 
                      ? 'bg-slate-50 border-slate-100 opacity-70' 
                      : isPastDue 
                        ? 'bg-amber-50/50 border-amber-200 shadow-sm' 
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <button 
                      onClick={() => handleToggle(task.id, task.is_completed)}
                      className={`shrink-0 transition-colors ${task.is_completed ? 'text-sage-green' : 'text-slate-300 hover:text-sage-green'}`}
                    >
                      {task.is_completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                    </button>
                    <div className="flex flex-col truncate pr-4">
                      <span className={`font-bold truncate text-lg ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                        {task.task_title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit ${
                          task.is_completed ? 'bg-slate-200 text-slate-600' : isPastDue ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600'
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
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
