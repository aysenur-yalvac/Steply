const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

// Update Props
content = content.replace(
  `  currentUserId?: string;
}`,
  `  currentUserId?: string;
  collaboratorProjects?: any[];
}`
);

// We need to update the destructuring again if it wasn't successful previously.
if (!content.includes('collaboratorProjects = []')) {
  content = content.replace(
    `  currentUserId,
}: Props) {`,
    `  currentUserId,
  collaboratorProjects = [],
}: Props) {`
  );
}

fs.writeFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', content, 'utf8');
console.log("Updated DashboardViewSwitcher.tsx interface Props");
