const fs = require('fs');
let path = 'src/components/projects/ProjectAnalyticsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add imports
content = content.replace(
  /import \{ ProjectTask \} from '@\/lib\/actions';/,
  `import { ProjectTask } from '@/lib/actions';\nimport {\n  ResponsiveContainer,\n  PieChart,\n  Pie,\n  Cell,\n  Tooltip,\n  BarChart,\n  Bar,\n  XAxis,\n  YAxis,\n  CartesianGrid\n} from 'recharts';`
);

// Add data definitions
content = content.replace(
  /const completionRate = (.*?);/,
  `const completionRate = $1;\n\n  const pieData = [\n    { name: 'Tamamlandı', value: completedTasks, color: '#10b981' },\n    { name: 'Bekliyor', value: totalTasks - completedTasks, color: '#334155' }\n  ];\n\n  const barData = [\n    { name: 'Görevler', Toplam: totalTasks, Tamamlanan: completedTasks }\n  ];`
);

// Add charts JSX
const chartsJSX = `
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
                    <Cell fill={entry.color} key={\`cell-\${index}\`}/>
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
`;

content = content.replace(
  /\{\/\* 2\. GENEL İLERLEME ÇUBUĞU \*\/\}/,
  chartsJSX + '\n      {/* 2. GENEL İLERLEME ÇUBUĞU */}'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Added recharts to ProjectAnalyticsView');
