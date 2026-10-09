const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/assignments/CreateAssignmentModal.tsx');
let content = fs.readFileSync(file, 'utf8');

// Update function signature
content = content.replace(
  `export default function CreateAssignmentModal({ onClose }: { onClose: () => void }) {`,
  `export default function CreateAssignmentModal({ onClose, teacherClasses = [] }: { onClose: () => void; teacherClasses?: { id: string; name: string }[] }) {`
);

// Add classId state
content = content.replace(
  `const [grade, setGrade] = useState("Tumu");`,
  `const [grade, setGrade] = useState("Tumu");\n  const [classId, setClassId] = useState("");`
);

// Add class_id to submit
content = content.replace(
  `course_name: courseName,
      due_date: isoDate,
      grade: grade,`,
  `course_name: courseName,
      due_date: isoDate,
      grade: grade,
      class_id: classId || null,`
);

// Add Select input in the form
content = content.replace(
  `<div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ders (Kategori)</label>`,
  `<div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sınıf Seçimi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none"
                >
                  <option value="">Genel (Tüm Sınıflar)</option>
                  {teacherClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ders (Kategori)</label>`
);

fs.writeFileSync(file, content, 'utf8');
