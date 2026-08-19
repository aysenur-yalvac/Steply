'use client';

import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { createClient } from '@/utils/supabase/client';
import { Loader2, PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';

export default function ProjectAnalytics({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const supabase = createClient();
      
      const [tasksRes, membersRes, ownerRes] = await Promise.all([
        supabase.from('project_tasks').select('*').eq('project_id', projectId),
        supabase.from('project_members').select('user_id, profiles(full_name)').eq('project_id', projectId),
        supabase.from('projects').select('student_id, profiles(full_name)').eq('id', projectId).single()
      ]);

      const fetchedTasks = tasksRes.data || [];
      const fetchedMembers = membersRes.data || [];
      
      // Build a map of user_id to name
      const memberMap = new Map();
      if (ownerRes.data) {
        memberMap.set(ownerRes.data.student_id, (ownerRes.data.profiles as any)?.full_name || 'Owner');
      }
      fetchedMembers.forEach(m => {
        memberMap.set(m.user_id, (m.profiles as any)?.full_name || 'Unknown');
      });

      // Add names to tasks
      const enrichedTasks = fetchedTasks.map(t => ({
        ...t,
        assignee_name: t.assignee_id ? (memberMap.get(t.assignee_id) || 'Unknown') : 'Unassigned'
      }));

      setTasks(enrichedTasks);
      setMembers(Array.from(memberMap.entries()).map(([id, name]) => ({ id, name })));
      setLoading(false);
    };

    fetchAnalyticsData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // 1. Task Status Distribution (Pie Chart)
  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'To Do', value: statusCounts['To Do'] || 0, color: '#f59e0b' },
    { name: 'In Progress', value: statusCounts['In Progress'] || 0, color: '#3b82f6' },
    { name: 'Completed', value: statusCounts['Completed'] || 0, color: '#10b981' }
  ].filter(d => d.value > 0);

  // 2. Team Contribution (Bar Chart)
  const memberCounts = tasks.reduce((acc, t) => {
    if (t.status === 'Completed') {
      acc[t.assignee_name] = (acc[t.assignee_name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(memberCounts)
    .map(([name, count]) => ({ name, tasks: count }))
    .sort((a: any, b: any) => b.tasks - a.tasks);

  // 3. Completion Trend (Line Chart)
  // Group completed tasks by date
  const completedByDate = tasks
    .filter(t => t.status === 'Completed' && t.completed_at)
    .reduce((acc, t) => {
      const date = new Date(t.completed_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const lineData = Object.entries(completedByDate)
    .map(([date, count]) => ({ date, count: count as number }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Accumulate over time
  let cumulative = 0;
  lineData.forEach(d => {
    cumulative += d.count as number;
    d.count = cumulative;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2234] border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-200 font-bold mb-1">{label || payload[0].name}</p>
          <p className="text-indigo-400 text-sm">
            {payload[0].value} {payload[0].value === 1 ? 'task' : 'tasks'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-500" /> 
        Proje Analizleri
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-[#1a2234] p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-400" />
            Görev Durum Dağılımı
          </h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Görev bulunamadı.</div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(entry => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Team Contribution */}
        <div className="bg-white dark:bg-[#1a2234] p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Ekip Katkı Performansı (Tamamlanan)
          </h3>
          <div className="h-64">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="tasks" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Tamamlanan görev yok.</div>
            )}
          </div>
        </div>

        {/* Completion Trend */}
        <div className="bg-white dark:bg-[#1a2234] p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-[0_12px_30px_rgba(0,0,0,0.7)] lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Zaman İçinde Tamamlanma (Kümülatif)
          </h3>
          <div className="h-72">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#1a2234' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Tamamlanan görev yok.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
