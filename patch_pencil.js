const fs = require("fs");
let content = fs.readFileSync("src/components/assignments/AssignmentListClient.tsx", "utf8");

const oldBlock = `{isTeacher && (
                      <button
                        onClick={(e) => handleDelete(e, assignment.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}`;

const newBlock = `{isTeacher && (
                      <div className="flex items-center gap-1">
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
                      </div>
                    )}`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync("src/components/assignments/AssignmentListClient.tsx", content, "utf8");
console.log("Patched AssignmentListClient.tsx with Pencil icon block.");
