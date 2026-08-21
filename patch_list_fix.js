const fs = require("fs");
let client = fs.readFileSync("src/components/assignments/AssignmentListClient.tsx", "utf8");

// We need to replace the malformed `{isTeacher && (...` block.
// Let's use a regex that matches from `{isTeacher && (` up to `)}` before `<div className="w-8 h-8 rounded-full`

const correctBlock = `{isTeacher && (
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

const regex = /\{isTeacher\s*&&\s*\([\s\S]*?\}\)/g;
client = client.replace(regex, correctBlock);

fs.writeFileSync("src/components/assignments/AssignmentListClient.tsx", client, "utf8");
console.log("Fixed AssignmentListClient.tsx");
