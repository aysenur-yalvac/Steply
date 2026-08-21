const fs = require("fs");
let list = fs.readFileSync("src/components/assignments/AssignmentListClient.tsx", "utf8");

list = list.replace(
  'const isTeacher = userRole === "teacher" || userRole === "ogretmen";',
  'const isTeacher = userRole?.toLowerCase() === "teacher" || userRole?.toLowerCase() === "ogretmen";\n  const [selectedCourse, setSelectedCourse] = useState<string>("Tumu");'
);

// Get unique courses
list = list.replace(
  'return (',
  `
  const courses = ["Tumu", ...Array.from(new Set(assignments.map(a => a.course_name || "Genel")))];
  const filteredAssignments = selectedCourse === "Tumu" 
    ? assignments 
    : assignments.filter(a => (a.course_name || "Genel") === selectedCourse);

  return (`
);

// Render filter dropdown
const filterUI = `
      {/* Filters */}
      {assignments.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400 font-medium">Ders Filtresi:</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            {courses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* List */}
`;

list = list.replace('{/* List */}', filterUI);

// Map filteredAssignments instead of assignments
list = list.replace(
  'assignments.map((assignment)',
  'filteredAssignments.map((assignment)'
);

// Show course_name in the card
const cardContent = `
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {assignment.title}
                </h3>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 mb-3 w-fit">
                  {assignment.course_name || "Genel"}
                </span>
                
                <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow">
`;

list = list.replace(
  /<h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">\s*\{assignment\.title\}\s*<\/h3>\s*<p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow">/gs,
  cardContent
);

fs.writeFileSync("src/components/assignments/AssignmentListClient.tsx", list, "utf8");
console.log("Updated AssignmentListClient.tsx");
