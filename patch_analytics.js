const fs = require("fs");
let content = fs.readFileSync("src/components/projects/ProjectAnalyticsView.tsx", "utf8");

// Replace top metrics variables
content = content.replace(
  /\/\/ Since ProjectTask doesn't have status.*const inProgressTasks = 0; \s*const overdueTasks = 0;/gs,
  `const inProgressTasks = tasks.filter(t => !t.is_completed).length; // For now, anything not done is in progress
  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter(t => !t.is_completed && !!t.due_date && t.due_date < todayStr).length;`
);

// Replace table logic variables inside the members map
content = content.replace(
  /\/\/ Since tasks don't have assigned_to, we just show 0.*const memberTasks: ProjectTask\[\] = \[\];\s*const memberCompleted = 0;\s*const memberRate = 0;/gs,
  `const memberTasks = tasks.filter(t => t.assigned_to === member.id);
                const memberCompleted = memberTasks.filter(t => t.is_completed).length;
                const memberRate = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 0;`
);

fs.writeFileSync("src/components/projects/ProjectAnalyticsView.tsx", content, "utf8");
console.log("Analytics view made dynamic!");
