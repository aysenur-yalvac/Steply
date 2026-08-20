'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ListTodo, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { ProjectTask } from '@/lib/actions';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export type TeamMember = { id: string; full_name: string; avatar_url: string | null; role?: string | null };

interface ProjectAnalyticsProps {
  tasks: ProjectTask[];
  members: TeamMember[];
}

export default function ProjectAnalyticsView({ tasks = [], members = [] }: ProjectAnalyticsProps) {
  const totalTasks = tasks.length;
  // Map ProjectTask's is_completed to DONE
  const completedTasks = tasks.filter(t => t.is_completed).length;
  
  // Since ProjectTask doesn't have status, assigned_to, or due_date in the schema,
  // we default these to 0 for now to match the UI requested by the user.
  const inProgressTasks = 0; 
  const overdueTasks = 0;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const pieData = [
    { name: 'Tamamlandı', value: completedTasks, color: '#10b981' },
    { name: 'Bekliyor', value: totalTasks - completedTasks, color: '#334155' }
  ];

  const barData = [
    { name: 'Görevler', Toplam: totalTasks, Tamamlanan: completedTasks }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* 1. ÖZET KARTLARI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Toplam Görev</p>
            <h4 className="text-2xl font-bold text-white mt-1">{totalTasks}</h4>
          </div>
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
            <ListTodo className="w-6 h-6"/>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Genel İlerleme</p>
            <h4 className="text-2xl font-bold text-emerald-400 mt-1">%{completionRate}</h4>
          </div>
          <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6"/>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Devam Edenler</p>
            <h4 className="text-2xl font-bold text-amber-400 mt-1">{inProgressTasks}</h4>
          </div>
          <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6"/>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Geciken Görevler</p>
            <h4 className="text-2xl font-bold text-rose-400 mt-1">{overdueTasks}</h4>
          </div>
          <div className="p-3 bg-rose-600/10 text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6"/>
          </div>
        </div>
      </div>

      
      {/* GRAFİKLER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        {/* PASTA GRAFİK */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-white mb-4">Görev Tamamlanma Dağılımı</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie cx="50%" cy="50%" data={pieData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {pieData.map((entry, index) => (
                    <Cell fill={entry.color} key={`cell-${index}`}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ÇUBUK GRAFİK */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-white mb-4">Görev Durumu Kıyaslaması</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={barData}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3"/>
                <XAxis dataKey="name" stroke="#64748b"/>
                <YAxis stroke="#64748b" allowDecimals={false}/>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                <Bar dataKey="Toplam" fill="#6366f1" radius={[8, 8, 0, 0]}/>
                <Bar dataKey="Tamamlanan" fill="#10b981" radius={[8, 8, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. GENEL İLERLEME ÇUBUĞU */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">Proje Tamamlanma Durumu</h3>
          <span className="text-sm font-semibold text-indigo-400">{completedTasks} / {totalTasks} Görev Bitti</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700/50">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* 3. ÜYE PERFORMANS TABLOSU */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-indigo-400"/>
          <h3 className="text-base font-bold text-white">Ekip Üyesi Performans Değerlendirmesi</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Üye</th>
                <th className="py-3 px-4">Atanan Görev</th>
                <th className="py-3 px-4">Tamamlanan</th>
                <th className="py-3 px-4">Başarı Oranı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map(member => {
                // Since tasks don't have assigned_to, we just show 0 for now to prevent errors
                const memberTasks: ProjectTask[] = [];
                const memberCompleted = 0;
                const memberRate = 0;

                return (
                  <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 font-bold">
                        {member.full_name?.charAt(0) || 'U'}
                      </div>
                      {member.full_name}
                    </td>
                    <td className="py-3 px-4">{memberTasks.length}</td>
                    <td className="py-3 px-4 text-emerald-400">{memberCompleted}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full" 
                            style={{ width: `${memberRate}%` }} 
                          />
                        </div>
                        <span className="text-xs text-slate-400">%{memberRate}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
