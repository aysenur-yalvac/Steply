const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

// 1. Pass currentUserId to FileSection
content = content.replace(/<FileSection\s+projectId=\{project.id\}\s+initialFiles=\{\(project.files as ProjectFile\[\]\) \|\| \[\]\}\s+isOwner=\{isOwner\}\s+isCollaborator=\{isCollaborator\}\s+\/>/g, 
  `<FileSection
                  projectId={project.id}
                  initialFiles={(project.files as ProjectFile[]) || []}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
                  currentUserId={user.id}
                />`);

// 2. Add Private Project Protection early return
// Where do we check? We have `isOwner` and `isTeamMember`.
// The user says: "Eğer project.isPrivate === true ise ve oturum açan kullanıcı proje sahibi veya üyesi değilse:"
// Let's find where `isTeamMember` is defined:
// const isTeamMember = project.student_id === user.id || projectMembers.some(m => m.user_id === user.id);
// We can insert the check right after `isTeamMember` calculation.

const privateCheck = `  if ((project as any).is_private === true && !isTeamMember && !isTeacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Bu Proje Gizlidir</h1>
        <p className="text-slate-500 dark:text-zinc-400 max-w-md">
          Bu projenin içeriğini görüntülemek için proje sahibi veya proje üyesi olmalısınız.
        </p>
      </div>
    );
  }`;

const injectionPoint = `const isTeamMember =
    project.student_id === user.id ||
    projectMembers.some((m) => m.user_id === user.id);`;

content = content.replace(injectionPoint, injectionPoint + '\n\n' + privateCheck);

fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');
console.log("Updated page.tsx with privacy protection");
