const fs = require('fs');
let path = 'src/components/projects/ProjectTaskList.tsx';
let content = fs.readFileSync(path, 'utf8');

// The old task map looks like:
/*
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              task.is_completed ? "bg-emerald-50/60" : "bg-slate-50"
            }`}
          >
            ...
          </div>
        ))}
*/

const newTaskMap = `
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className={\`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer group \${
              task.is_completed ? "bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800"
            }\`}
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                type="button"
                disabled={(!canEdit && !task.is_completed) || pendingIds.has(task.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(task);
                }}
                className="shrink-0 text-slate-400 hover:text-indigo-500 disabled:opacity-40 transition-colors"
              >
                {pendingIds.has(task.id) ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                ) : task.is_completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1">
                <h4 className={\`text-sm font-medium transition-colors \${
                  task.is_completed
                    ? "line-through text-slate-400"
                    : "text-slate-700 dark:text-slate-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                }\`}>
                  {task.title}
                </h4>
                {(task.due_date || task.assigned_to) && (
                  <div className="flex gap-2 mt-1">
                    {task.due_date && <span className="text-[10px] text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 rounded">Tarih: {task.due_date}</span>}
                  </div>
                )}
              </div>
            </div>

            {canEdit && (
              <button
                type="button"
                disabled={pendingIds.has(task.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(task);
                }}
                className="shrink-0 p-1 text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors rounded-lg"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
`;

const oldTaskMapRegex = /\{tasks\.map\(\(task\) => \([\s\S]*?\}\)\}/;
content = content.replace(oldTaskMapRegex, newTaskMap.trim());

const modalJSX = `
      {/* Add task form \u2014 owner / collaborator only */}
`;

const modalEndJSX = `
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          teamMembers={teamMembers}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
`;

content = content.replace(/\{\/\* Add task form \u2014 owner \/ collaborator only \*\/\}/, modalJSX);
content = content.replace(/<\/form>\n\s*\)\}\n\s*<\/div>\n\s*\);\n\}/, `</form>\n      )}\n${modalEndJSX}\n}`);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ProjectTaskList JSX');
