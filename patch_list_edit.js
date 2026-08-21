const fs = require("fs");
let client = fs.readFileSync("src/components/assignments/AssignmentListClient.tsx", "utf8");

// Import EditAssignmentModal and Pencil
client = client.replace(
  'import { FolderPlus, Clock, ChevronRight, FileText, Trash2 } from "lucide-react";',
  'import { FolderPlus, Clock, ChevronRight, FileText, Trash2, Pencil } from "lucide-react";\nimport EditAssignmentModal from "./EditAssignmentModal";'
);

// Add state for edit modal
client = client.replace(
  'const [isModalOpen, setIsModalOpen] = useState(false);',
  'const [isModalOpen, setIsModalOpen] = useState(false);\n  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);'
);

// Add edit button next to trash button
client = client.replace(
  '<Trash2 className="w-4 h-4" />\n                      </button>\n                    )}',
  `<button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingAssignment(assignment);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 transition-colors"
                        title="Duzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, assignment.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}`
);

// Add modal render at bottom
client = client.replace(
  '{isModalOpen && <CreateAssignmentModal onClose={() => setIsModalOpen(false)} />}',
  '{isModalOpen && <CreateAssignmentModal onClose={() => setIsModalOpen(false)} />}\n      {editingAssignment && <EditAssignmentModal assignment={editingAssignment} onClose={() => { setEditingAssignment(null); router.refresh(); }} />}'
);

fs.writeFileSync("src/components/assignments/AssignmentListClient.tsx", client, "utf8");
console.log("Updated AssignmentListClient.tsx with edit modal");
