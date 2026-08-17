const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// The block:
/*
        {projects.length === 0 ? (
          <>
            <DashboardViewSwitcher
              projects={[]}
              isTeacher={isTeacher}
              isStudent={isStudent}
              watchedIds={watchedIds}
              projectNotes={projectNotes}
              currentUserId={user?.id}
            />
            <div className="flex justify-center mt-8">
              <EmptyState ... />
            </div>
          </>
        ) : ( ... )
*/

const oldRegex = /\{projects\.length === 0 \? \([\s\S]*?<\/>\s*\)\s*:\s*\(/;

const newBlock = `{projects.length === 0 ? (
          <>
            <DashboardViewSwitcher
              projects={[]}
              isTeacher={isTeacher}
              isStudent={isStudent}
              watchedIds={watchedIds}
              projectNotes={projectNotes}
              currentUserId={user?.id}
            />
            {!isTeacher && (
              <div className="flex justify-center mt-8">
                <EmptyState
                  icon={FolderOpen}
                  title="No active projects yet."
                  description="Every great project starts with a single step. Let's build something amazing."
                  action={
                    isStudent ? (
                      <Link
                        href="/dashboard/projects/new"
                        className="btn-aura inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl"
                      >
                        <Plus className="w-4 h-4" /> Start Your First Project
                      </Link>
                    ) : null
                  }
                />
              </div>
            )}
          </>
        ) : (`;

content = content.replace(oldRegex, newBlock);

fs.writeFileSync('src/app/dashboard/page.tsx', content, 'utf8');
console.log("Updated EmptyState rendering.");
