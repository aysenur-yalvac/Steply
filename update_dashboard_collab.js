const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. Pass collaboratorProjects to DashboardViewSwitcher

content = content.replace(
  /<DashboardViewSwitcher\s+projects=\{projects\}\s+isTeacher=\{isTeacher\}\s+isStudent=\{isStudent\}\s+watchedIds=\{watchedIds\}\s+projectNotes=\{projectNotes\}\s+currentUserId=\{user\?.id\}\s+\/>/g,
  `<DashboardViewSwitcher
            projects={projects}
            isTeacher={isTeacher}
            isStudent={isStudent}
            watchedIds={watchedIds}
            projectNotes={projectNotes}
            currentUserId={user?.id}
            collaboratorProjects={collaboratorProjects}
          />`
);

content = content.replace(
  /<DashboardViewSwitcher\s+projects=\{\[\]\}\s+isTeacher=\{isTeacher\}\s+isStudent=\{isStudent\}\s+watchedIds=\{watchedIds\}\s+projectNotes=\{projectNotes\}\s+currentUserId=\{user\?.id\}\s+\/>/g,
  `<DashboardViewSwitcher
              projects={[]}
              isTeacher={isTeacher}
              isStudent={isStudent}
              watchedIds={watchedIds}
              projectNotes={projectNotes}
              currentUserId={user?.id}
              collaboratorProjects={collaboratorProjects}
            />`
);

// 2. Remove collaboratorProjects from page.tsx entirely
const collabRegex = /\{collaboratorProjects\.length > 0 && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*\);\s*\}/;

const endBlock = `      </div>
    </div>
  );
}`;
content = content.replace(collabRegex, endBlock);

fs.writeFileSync('src/app/dashboard/page.tsx', content, 'utf8');
console.log("Updated page.tsx to pass collaboratorProjects to switcher");
