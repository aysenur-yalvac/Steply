const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

// Update Props
content = content.replace(
  `currentUserId?: string;
};`,
  `currentUserId?: string;
  collaboratorProjects?: any[];
};`
);

content = content.replace(
  `  currentUserId,
}: Props) {`,
  `  currentUserId,
  collaboratorProjects = [],
}: Props) {`
);

// We need to render the collaborative projects at the bottom of the switcher using the same viewMode.
const collabBlock = `
      {/* ── Ortak Olduğum Projeler ─────────────────────────────────────── */}
      {collaboratorProjects.length > 0 && (
        <div className="mt-8">
          {!isTeacher && <div className="h-px w-full bg-slate-100 mb-6" />}

          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-violet-50 border border-violet-200">
              <Users className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                Collaborative Projects
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Projects you've been added to — you can view and edit them.
              </p>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode + "-collab"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {viewMode === "kanban" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {collaboratorProjects.map((p: any) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        isTeacher={isTeacher}
                        currentUserId={currentUserId}
                        isWatched={watchedIds?.has(p.id)}
                        isFavorited={false}
                        isCollaborator
                      />
                    ))}
                  </div>
                ) : (
                  <ListView projects={collaboratorProjects} isTeacher={isTeacher} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
`;

content = content.replace(
  `    </>
  );
}`,
  collabBlock + `    </>\n  );\n}`
);

// Also need to import ProjectCard and Users in DashboardViewSwitcher
content = content.replace(
  `import { KanbanBoard } from "@/components/dashboard/KanbanBoard";`,
  `import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import ProjectCard from "@/app/dashboard/ProjectCard";
import { Users } from "lucide-react";`
);

fs.writeFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', content, 'utf8');
console.log("Updated DashboardViewSwitcher.tsx to handle collaboratorProjects");
