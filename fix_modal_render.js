const fs = require('fs');
let path = 'src/components/projects/ProjectTaskList.tsx';
let content = fs.readFileSync(path, 'utf8');

const modalRenderJSX = `
      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={projectId}
          teamMembers={teamMembers}
          onUpdate={async (updatedTask) => {
            handleUpdateTask(updatedTask);
            setSelectedTask(null);
          }}
        />
      )}
`;

if (!content.includes('<TaskDetailModal')) {
  content = content.replace(
    /<\/form>\n\s*\)\}\n\s*<\/div>\n\s*\);\n\}/,
    `</form>\n      )}\n${modalRenderJSX}\n    </div>\n  );\n}`
  );
  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed missing modal render JSX');
} else {
  console.log('Modal render JSX already exists');
}
