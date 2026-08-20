const fs = require('fs');
let path = 'src/components/projects/ProjectTaskList.tsx';
let content = fs.readFileSync(path, 'utf8');

// Imports
content = content.replace(
  /import toast from "react-hot-toast";/,
  `import toast from "react-hot-toast";\nimport TaskDetailModal from "./TaskDetailModal";\nimport { TeamMember } from "./ProjectAnalyticsView";`
);

// Props
content = content.replace(
  /canEdit: boolean;\n\}/,
  `canEdit: boolean;\n  teamMembers: TeamMember[];\n}`
);

content = content.replace(
  /export default function ProjectTaskList\(\{ projectId, initialTasks, canEdit \}: Props\) \{/,
  `export default function ProjectTaskList({ projectId, initialTasks, canEdit, teamMembers }: Props) {`
);

// State
content = content.replace(
  /const inputRef = useRef<HTMLInputElement>\(null\);/,
  `const inputRef = useRef<HTMLInputElement>(null);\n  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);`
);

// handleUpdateTask
const handleUpdateTask = `
  const handleUpdateTask = (updatedTask: ProjectTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
`;
content = content.replace(
  /async function handleAdd/,
  `${handleUpdateTask}\n  async function handleAdd`
);

// Add click on title
content = content.replace(
  /<span\n\s*className=\{\`flex-1 text-sm leading-snug \$\{\n\s*task\.is_completed\n\s*\? "line-through text-slate-400"\n\s*: "text-slate-700 font-medium"\n\s*\}\`\}\n\s*>\n\s*\{task\.title\}\n\s*<\/span>/,
  `<button\n              type="button"\n              onClick={() => canEdit && setSelectedTask(task)}\n              className={\`flex-1 text-left text-sm leading-snug \${task.is_completed ? "line-through text-slate-400" : "text-slate-700 font-medium"} hover:text-indigo-600 transition-colors\`}\n            >\n              {task.title}\n            </button>`
);

// Modal
content = content.replace(
  /<\/div>\n  \);\n\}/,
  `      {selectedTask && (\n        <TaskDetailModal\n          task={selectedTask}\n          projectId={projectId}\n          teamMembers={teamMembers}\n          isOpen={true}\n          onClose={() => setSelectedTask(null)}\n          onUpdate={handleUpdateTask}\n        />\n      )}\n    </div>\n  );\n}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated ProjectTaskList.tsx');
