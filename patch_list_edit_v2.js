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

// We want to safely insert the edit button next to the Trash2 button for teachers.
// Look for this block:
/*
                    {isTeacher && (
                      <button
                        onClick={(e) => handleDelete(e, assignment.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
*/

const oldTeacherBlock = `{isTeacher && (
                      <button
                        onClick={(e) => handleDelete(e, assignment.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}`;

const newTeacherBlock = `{isTeacher && (
                      <>
                        <button
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
                      </>
                    )}`;

client = client.replace(oldTeacherBlock, newTeacherBlock);

// Render the edit modal at the end
const oldModalRender = `{isModalOpen && <CreateAssignmentModal onClose={() => setIsModalOpen(false)} />}`;
const newModalRender = `{isModalOpen && <CreateAssignmentModal onClose={() => setIsModalOpen(false)} />}
      {editingAssignment && <EditAssignmentModal assignment={editingAssignment} onClose={() => { setEditingAssignment(null); router.refresh(); }} />}`;

client = client.replace(oldModalRender, newModalRender);

fs.writeFileSync("src/components/assignments/AssignmentListClient.tsx", client, "utf8");
console.log("Successfully patched AssignmentListClient.tsx");
