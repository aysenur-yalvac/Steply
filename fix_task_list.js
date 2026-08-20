const fs = require('fs');
let path = 'src/components/projects/ProjectTaskList.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add handleTaskClick
content = content.replace(
  /const router = useRouter\(\);/,
  `const router = useRouter();\n\n  const handleTaskClick = (task: ProjectTask) => {\n    console.log("👉 Görev kartına tıklandı, seçilen görev:", task);\n    setSelectedTask(task);\n  };`
);

// Update onClick on the map div
content = content.replace(
  /onClick=\{\(\) => setSelectedTask\(task\)\}/,
  `onClick={() => handleTaskClick(task)}`
);

// Update Modal render logic
// There's currently an onUpdate=... but the user wrote onSave=... let's keep onUpdate as it's defined in TaskDetailModal
content = content.replace(
  /\{selectedTask && \(\s*<TaskDetailModal[\s\S]*?\/>\s*\)\}/,
  `{selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={projectId}
          teamMembers={teamMembers}
          onUpdate={(updatedTask) => {
            handleUpdateTask(updatedTask);
            setSelectedTask(null);
          }}
        />
      )}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ProjectTaskList.tsx');
