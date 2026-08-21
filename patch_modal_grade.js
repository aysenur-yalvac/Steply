const fs = require("fs");
let modal = fs.readFileSync("src/components/assignments/CreateAssignmentModal.tsx", "utf8");

modal = modal.replace(
  'const [courseName, setCourseName] = useState("Genel");',
  'const [courseName, setCourseName] = useState("Genel");\n  const [grade, setGrade] = useState("Tumu");'
);

modal = modal.replace(
  'due_date: isoDate,\n    });',
  'due_date: isoDate,\n      grade: grade,\n    });'
);

const courseField = `          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Ders Adi
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Orn: Yazilim Mimarisi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
            
            <div className="space-y-2 flex-1">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                Sinif / Duzey
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="Tumu">Tumu</option>
                <option value="9. Sinif">9. Sinif</option>
                <option value="10. Sinif">10. Sinif</option>
                <option value="11. Sinif">11. Sinif</option>
                <option value="12. Sinif">12. Sinif</option>
              </select>
            </div>
          </div>`;

modal = modal.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-slate-300 flex items-center gap-2">\s*<BookOpen className="w-4 h-4 text-indigo-400" \/>\s*Ders Adi\s*<\/label>\s*<input\s*type="text"\s*value=\{courseName\}\s*onChange=\{\(e\) => setCourseName\(e\.target\.value\)\}\s*placeholder="Orn: Yazilim Mimarisi"\s*className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"\s*required\s*\/>\s*<\/div>/g,
  courseField
);

fs.writeFileSync("src/components/assignments/CreateAssignmentModal.tsx", modal, "utf8");
console.log("Updated CreateAssignmentModal.tsx");
