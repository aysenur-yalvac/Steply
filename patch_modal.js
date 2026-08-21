const fs = require("fs");
let modal = fs.readFileSync("src/components/assignments/CreateAssignmentModal.tsx", "utf8");

modal = modal.replace(
  'import { X, Calendar, Type, AlignLeft } from "lucide-react";',
  'import { X, Calendar, Type, AlignLeft, BookOpen } from "lucide-react";'
);

modal = modal.replace(
  'const [title, setTitle] = useState("");',
  'const [title, setTitle] = useState("");\n  const [courseName, setCourseName] = useState("Genel");'
);

modal = modal.replace(
  'const res = await createAssignmentAction(title, description, isoDate);',
  'const res = await createAssignmentAction(title, description, isoDate, courseName);'
);

const courseField = `          <div className="space-y-2">
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-400" />`;

modal = modal.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-slate-300 flex items-center gap-2">\s*<Type className="w-4 h-4 text-indigo-400" \/>/gs,
  courseField
);

fs.writeFileSync("src/components/assignments/CreateAssignmentModal.tsx", modal, "utf8");
console.log("Updated CreateAssignmentModal.tsx");
