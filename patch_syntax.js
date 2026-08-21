const fs = require("fs");

// Fix actions.ts
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");
// Since I probably appended it, I'll find the last occurrence of export async function updateAssignmentAction and remove the rest of the file or remove the first one if there are duplicates.
const parts = actions.split('export async function updateAssignmentAction');
if (parts.length > 2) {
  // It exists more than once. We just take everything before the second occurrence.
  const beforeSecond = parts[0] + 'export async function updateAssignmentAction' + parts[1];
  fs.writeFileSync("src/lib/actions.ts", beforeSecond, "utf8");
  console.log("Fixed actions.ts duplicates.");
}

// Fix AssignmentListClient.tsx
let client = fs.readFileSync("src/components/assignments/AssignmentListClient.tsx", "utf8");
client = client.replace(
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
                    )}
                    )}`,
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
                    </>`
);

// If there's an unmatched tag, wait, the original code had:
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

// My previous replacement:
/*
client = client.replace(
  '<Trash2 className="w-4 h-4" />\n                      </button>\n                    )}',
  `<button ... Pencil ... </button>\n                      <button ... Trash2 ... </button>\n                    )}`
)
*/
// Let's just fix it by reading it again and applying a clean string replacement.
