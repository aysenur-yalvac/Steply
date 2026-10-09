const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/assignments/CreateAssignmentModal.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export default function CreateAssignmentModal\(\{ onClose \}: \{ onClose: \(\) => void \}\) \{/,
  `export default function CreateAssignmentModal({ onClose, teacherClasses = [] }: { onClose: () => void; teacherClasses?: { id: string; name: string }[] }) {`
);

content = content.replace(
  /const \[courseName, setCourseName\] = useState\("Genel"\);/,
  `const [courseName, setCourseName] = useState("Genel");\n  const [classId, setClassId] = useState("");`
);

content = content.replace(
  /course_name: courseName,/,
  `course_name: courseName,\n      class_id: classId || null,`
);

content = content.replace(
  /<div className="flex gap-4">/,
  `<div className="space-y-2 flex-1 mb-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                Sınıf Seçimi
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
              >
                <option value="">Genel (Tüm Sınıflar)</option>
                {teacherClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>\n<div className="flex gap-4">`
);

fs.writeFileSync(file, content, 'utf8');
